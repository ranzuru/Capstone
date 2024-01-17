// react
import { useState, useCallback, useEffect, useRef } from 'react';
// axios
import axiosInstance from '../../config/axios-instance';
// mui
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField, Paper, Tabs, Tab } from '@mui/material';
// others
import ActionMenu from '../../custom/CustomActionMenu.jsx';
import { statusColors } from '../../utils/statusColor.js';
import StatusCell from '../StatusCell.jsx';
import CustomGridToolbar from '../CustomGridToolbar.jsx';
import CustomSnackbar from '../../custom/CustomSnackbar.jsx';
import exportDataToExcel from '../../utils/exportToExcel.js';
import feedingProgramHeader from '../../constant/feedingProgramHeaderMapping.js';
import ConfirmationDialog from '../../custom/CustomConfirmDialog.jsx';
import RecordInfoDialog from '../../components/Dialog/FeedingProgramDialog.jsx';
import FeedingProgramForm from '../Form/FeedingProgramForm.jsx';
import mapRecord from '../../utils/feedingProgramMapRecord.js';
import { formatYearFromDate } from '../../utils/formatDateFromYear.js';
import useSBFPReport from '../report/useSBFPReport.jsx';
import { useSchoolYear } from '../../hooks/useSchoolYear.js';

const FeedingProgramGrid = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirm, setOnConfirm] = useState(() => {});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isInfoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedRecordInfo, setSelectedRecordInfo] = useState(null);
  const [currentType, setCurrentType] = useState('PRE');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarData, setSnackbarData] = useState({
    message: '',
    severity: 'success',
  });
  const dataGridRef = useRef(null);
  const [filterModel, setFilterModel] = useState({
    items: [],
  });

  const { activeSchoolYear } = useSchoolYear();
  const { generatePdfDocument } = useSBFPReport();

  const handleGenerateReport = () => {
    generatePdfDocument(); // Call the function that opens the PDF
  };

  const showSnackbar = (message, severity) => {
    setSnackbarData({ message, severity });
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleDialogOpen = (recordId, isBulk = false) => {
    setConfirmMessage(
      isBulk
        ? 'Warning: This action will permanently delete all selected records and cannot be undone. Are you absolutely sure you want to proceed?'
        : 'Warning: This action will permanently delete this record and cannot be undone. Are you absolutely sure you want to proceed?'
    );
    setOnConfirm(
      () => () => (isBulk ? handleBulkDelete() : handleDelete(recordId))
    );
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const getFeedingStatus = (params) => {
    return params.row.beneficiaryOfSBFP ? 'Yes' : 'No';
  };

  const fetchRecord = useCallback(
    async (type = 'PRE') => {
      setIsLoading(true);
      try {
        // Include the school year in the request
        const response = await axiosInstance.get(
          `feedingProgram/fetch/${type}?schoolYear=${encodeURIComponent(
            activeSchoolYear
          )}`
        );
        const updatedRecords = response.data.map(mapRecord);
        setRecords(updatedRecords);
      } catch (error) {
        console.error('An error occurred while fetching records:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [activeSchoolYear]
  ); // Add activeSchoolYear as a dependency

  useEffect(() => {
    if (activeSchoolYear) {
      fetchRecord(currentType); // Pass the currentType to the fetchRecord function
    }
  }, [fetchRecord, currentType, activeSchoolYear]);

  const refreshStudents = () => {
    fetchRecord();
  };

  const addNewRecord = (newRecord) => {
    const mappedRecord = mapRecord(newRecord);
    setRecords((prevRecords) => [...prevRecords, mappedRecord]);
  };

  const updatedStudentProfile = (updatedStudentData) => {
    const mappedRecord = mapRecord(updatedStudentData);
    setRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.id === mappedRecord.id ? mappedRecord : record
      )
    );
  };

  const columns = [
    {
      field: 'dateMeasured',
      headerName: 'Date Of Measured',
      width: 150,
      valueGetter: (params) => formatYearFromDate(params.row.dateMeasured),
    },
    { field: 'lrn', headerName: 'LRN', width: 150 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'gender', headerName: 'Gender', width: 100 },
    { field: 'age', headerName: 'Age', width: 75 },
    { field: 'schoolYear', headerName: 'S.Y', width: 100 },
    { field: 'grade', headerName: 'Grade', width: 100 },
    { field: 'section', headerName: 'Section', width: 100 },
    { field: 'heightCm', headerName: 'Height (cm)', width: 100 },
    { field: 'weightKg', headerName: 'Weight (kg)', width: 100 },
    { field: 'bmiClassification', headerName: 'Classification', width: 120 },
    { field: 'heightForAge', headerName: 'Height For age', width: 120 },
    {
      field: 'beneficiaryOfSBFP',
      headerName: 'Feeding?',
      width: 100,
      valueGetter: getFeedingStatus,
    },
    { field: 'measurementType', headerName: 'Type', width: 100 },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <StatusCell value={params.value} colorMapping={statusColors} />
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <ActionMenu
          onEdit={() => handleEdit(params.row.id)}
          onDelete={() => handleDialogOpen(params.row.id)}
          onView={() => handleInfoDialogOpen(params.row.id)}
        />
      ),
    },
  ];

  const handleInfoDialogOpen = (recordId) => {
    const recordInfo = records.find((record) => record.id === recordId);
    setSelectedRecordInfo(recordInfo);
    setInfoDialogOpen(true);
  };

  const handleInfoDialogClose = () => {
    setSelectedRecordInfo(null);
    setInfoDialogOpen(false);
  };

  const handleEdit = (recordId) => {
    const recordToEdit = records.find((record) => record.id === recordId);
    setSelectedRecord(recordToEdit);
    setFormOpen(true);
  };

  const handleDelete = async (recordId) => {
    try {
      await axiosInstance.delete(`feedingProgram/delete/${recordId}`);

      const updatedRecords = records.filter((record) => record.id !== recordId);
      setRecords(updatedRecords);
      showSnackbar('Student record successfully deleted.', 'success');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        showSnackbar(`Delete Error: ${error.response.data.error}`, 'error');
      } else {
        showSnackbar(
          'Failed to delete the Student record. Please try again.',
          'error'
        );
      }
    }
    setSnackbarOpen(true); // Open the snackbar with the message
    handleDialogClose();
  };

  const handleBulkDelete = async () => {
    try {
      const recordIdsToDelete = selectedRows.map((row) => row.id);
      const response = await axiosInstance.delete('feedingProgram/bulkDelete', {
        data: { ids: recordIdsToDelete },
      });

      const updatedRecords = records.filter(
        (record) => !recordIdsToDelete.includes(record.id)
      );
      setRecords(updatedRecords);
      showSnackbar(response.data.message, 'success');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        showSnackbar(`Delete Error: ${error.response.data.error}`, 'error');
      } else {
        showSnackbar(
          'Failed to delete the Records. Please try again.',
          'error'
        );
      }
    }
    setSnackbarOpen(true);
    handleDialogClose();
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      showSnackbar('No file selected', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5 MB size limit
      showSnackbar('File size exceeds 5MB', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true); // Start the loading spinner

    try {
      const response = await axiosInstance.post(
        '/feedingProgram/import',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.errorCount && response.data.errorCount > 0) {
        // Show detailed error messages if available
        showSnackbar({
          message: `Import completed with some issues: ${response.data.detailedErrors}`,
          severity: 'warning',
        });
      } else {
        showSnackbar('Data imported successfully!', 'success');
        refreshStudents(); // Refresh or update the data grid
      }
    } catch (error) {
      console.error('API error:', error);
      let errorMessage = 'An error occurred during importing';
      if (error.response && error.response.data) {
        // Check for structured error response
        if (error.response.data.detailedErrors) {
          errorMessage = `Import failed: ${error.response.data.detailedErrors}`;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsLoading(false); // Stop the loading spinner
    }
  };

  const handleExport = () => {
    const activeFilterModel = filterModel;

    const filteredData = records.filter((record) => {
      return activeFilterModel.items.every((filterItem) => {
        if (!filterItem.field) {
          return true;
        }

        let cellValue;
        if (filterItem.field === 'beneficiaryOfSBFP') {
          cellValue = record[filterItem.field] ? 'yes' : 'no';
        } else {
          cellValue = (record[filterItem.field] ?? '')
            .toString()
            .toLowerCase()
            .trim();
        }
        const filterValues = Array.isArray(filterItem.value)
          ? filterItem.value.map((val) => val.toString().toLowerCase().trim())
          : [filterItem.value.toString().toLowerCase().trim()];

        switch (filterItem.operator) {
          case 'equals':
            return cellValue === filterValues[0];
          case 'contains':
            return filterValues.some((value) => cellValue.includes(value));
          case 'startsWith':
            return filterValues.some((value) => cellValue.startsWith(value));
          case 'endsWith':
            return filterValues.some((value) => cellValue.endsWith(value));
          case 'isAnyOf':
            return filterValues.includes(cellValue);
          default:
            console.log(
              `Unknown filter type '${filterItem.operator}', record included by default`
            );
            return true;
        }
      });
    });

    // Define excelHeaders based on the fields in transformedRecord
    const excelHeaders = Object.keys(records[0] || {})
      .filter((key) => key !== 'id') // This will exclude the 'id' field
      .map((key) => ({
        title: feedingProgramHeader[key] || key,
        key: key,
      }));

    exportDataToExcel(filteredData, excelHeaders, 'FeedingProgram', {
      dateFields: ['dateOfBirth', 'dateMeasured'], // adjust based on transformed data
      excludeColumns: [
        'action',
        'firstName',
        'lastName',
        'middleName',
        'nameExtension',
      ],
      booleanFields: ['beneficiaryOfSBFP'], // adjust as needed
    });
  };

  const handleModalOpen = () => {
    setFormOpen(true);
  };

  const handleModalClose = () => {
    setFormOpen(false);
  };

  const filteredRecords = records
    .filter((record) => record.measurementType === currentType)
    .filter((record) =>
      Object.keys(record).some((key) => {
        const value = record[key]?.toString().toLowerCase();
        return value?.includes(searchValue.toLowerCase());
      })
    );
  return (
    <>
      <CustomSnackbar
        open={snackbarOpen}
        handleClose={handleCloseSnackbar}
        severity={snackbarData.severity}
        message={snackbarData.message}
      />
      <RecordInfoDialog
        open={isInfoDialogOpen}
        onClose={handleInfoDialogClose}
        record={selectedRecordInfo}
      />
      <div className="flex flex-col h-full">
        <div className="w-full max-w-screen-xl mx-auto px-8">
          <div className="mb-4 flex justify-between items-center">
            <div className="flex">
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateReport}
              >
                GENERATE REPORT
              </Button>
              <div className="ml-2">
                <a
                  href="/template/Feeding_Template.xlsx"
                  download
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="contained" color="primary">
                    Download Template
                  </Button>
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleModalOpen}
              >
                New Record
              </Button>
              <div className="ml-2">
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  value={searchValue}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
          <Tabs
            value={currentType}
            onChange={(_, newValue) => setCurrentType(newValue)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="PRE-INTERVENTION" value="PRE" />
            <Tab label="POST-INTERVENTION" value="POST" />
          </Tabs>
          <Paper elevation={5} className="flex-grow">
            <DataGrid
              ref={dataGridRef}
              rows={filteredRecords}
              columns={columns}
              onFilterModelChange={(newModel) => setFilterModel(newModel)}
              getRowId={(row) => row.id}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              slots={{
                toolbar: () => (
                  <CustomGridToolbar
                    onExport={handleExport}
                    handleImport={handleImport}
                    selectedRows={selectedRows}
                    handleBulkDelete={() => handleDialogOpen(null, true)}
                  />
                ),
              }}
              onRowSelectionModelChange={(newSelection) => {
                const selectedRowsData = filteredRecords.filter((row) =>
                  newSelection.includes(row.id)
                );
                setSelectedRows(selectedRowsData);
              }}
              sx={{
                '& .MuiDataGrid-row:nth-of-type(odd)': {
                  backgroundColor: '#f3f4f6',
                },
              }}
              pageSizeOptions={[10]}
              disableSelectionOnClick
              checkboxSelection
              loading={isLoading}
              style={{ height: 650 }}
            />
          </Paper>
        </div>
      </div>
      <FeedingProgramForm
        open={formOpen}
        addNewRecord={addNewRecord}
        onUpdate={updatedStudentProfile}
        selectedRecord={selectedRecord}
        onClose={() => {
          setSelectedRecord(null);
          handleModalClose();
        }}
        onCancel={() => {
          setSelectedRecord(null);
          handleModalClose();
        }}
      />
      {onConfirm && (
        <ConfirmationDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          onConfirm={onConfirm}
          title="Confirm Delete!"
          message={confirmMessage}
        />
      )}
    </>
  );
};

export default FeedingProgramGrid;
