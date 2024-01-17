// react
import { useState, useCallback, useEffect, useRef } from 'react';
// axios
import axiosInstance from '../../config/axios-instance';
// mui
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField, Paper } from '@mui/material';
// others
import ActionMenu from '../../custom/CustomActionMenu.jsx';
import { statusColors } from '../../utils/statusColor.js';
import StatusCell from '../StatusCell.jsx';
import { formatYearFromDate } from '../../utils/formatDateFromYear.js';
import CustomGridToolbar from '../CustomGridToolbar2.jsx';
import exportDataToExcel from '../../utils/exportToExcel.js';
import ConfirmationDialog from '../../custom/CustomConfirmDialog.jsx';
import CustomSnackbar from '../../custom/CustomSnackbar.jsx';
import headerMapping from '../../constant/medicineItemHeaderMapping.js';
import InfoDialog from '../../components/Dialog/medicineItemDialog.jsx';
import Form from '../Form/MedicineItemForm.jsx';

const Grid = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordIdToDelete, setRecordIdToDelete] = useState(null);
  const [isInfoDialogOpen, setInfoDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecordInfo, setSelectedRecordInfo] = useState(null);
  const dataGridRef = useRef(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarData, setSnackbarData] = useState({
    message: '',
    severity: 'success',
  });
  const [filterModel, setFilterModel] = useState({
    items: [],
  });

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

  const mapRecord = (record) => {
    return {
      id: record._id,
      itemId: record.itemId || 'N/A',
      product: record.product || 'N/A',
      quantity:
        record.quantity !== undefined && record.quantity !== null
          ? record.quantity
          : '0',
      dosagePer: record.dosagePer || 'N/A',
      description: record.description || '',
      createdAt: record.createdAt ? formatYearFromDate(record.createdAt) : null,
      updatedAt: record.updatedAt ? formatYearFromDate(record.updatedAt) : null,
      status: record.status || 'N/A',
    };
  };

  const fetchRecord = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('medicineInventory/getAllItem');
      const updatedRecords = response.data.map(mapRecord);
      setRecords(updatedRecords);
    } catch (error) {
      console.error('An error occurred while fetching data:', error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const handleDialogOpen = (recordId) => {
    setRecordIdToDelete(recordId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setRecordIdToDelete(null);
    setDialogOpen(false);
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
    { field: 'itemId', headerName: 'Item ID', width: 150 },
    { field: 'product', headerName: 'Product', width: 300 },
    { field: 'quantity', headerName: 'Quantity', width: 150 },
    { field: 'createdAt', headerName: 'Created', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
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
          onView={() => handleInfoDialogOpen(params.row.id)}
          onEdit={() => handleEdit(params.row.id)}
          onDelete={() => handleDialogOpen(params.row.id)}
        />
      ),
    },
  ];

  const handleInfoDialogOpen = (recordId) => {
    const recordInfo = records.find((record) => record.id === recordId);
    setSelectedRecordInfo(recordInfo);
    setInfoDialogOpen(true);
  };

  const handleEdit = (recordId) => {
    const recordToEdit = records.find((record) => record.id === recordId);
    setSelectedRecord(recordToEdit);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(
        `medicineInventory/deleteItem/${recordIdToDelete}`
      );

      const updatedRecords = records.filter(
        (record) => record.id !== recordIdToDelete
      );
      setRecords(updatedRecords);
      showSnackbar('record successfully deleted.', 'success');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        showSnackbar(`Delete Error: ${error.response.data.error}`, 'error');
      } else {
        showSnackbar('Failed to delete the record. Please try again.', 'error');
      }
    }
    setSnackbarOpen(true); // Open the snackbar with the message
    handleDialogClose();
  };

  const handleInfoDialogClose = () => {
    setSelectedRecordInfo(null);
    setInfoDialogOpen(false);
  };

  const handleExport = () => {
    const activeFilterModel = filterModel;

    const filteredData = records.filter((record) => {
      return activeFilterModel.items.every((filterItem) => {
        if (!filterItem.field) {
          return true;
        }

        let cellValue = (record[filterItem.field] ?? '')
          .toString()
          .toLowerCase()
          .trim();

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
        title: headerMapping[key] || key,
        key: key,
      }));

    exportDataToExcel(filteredData, excelHeaders, 'Medicine Item', {
      excludeColumns: ['action', 'updatedAt', 'createdAt'], // adjust based on transformed data
    });
  };

  const handleModalOpen = () => {
    setFormOpen(true);
  };

  const handleModalClose = () => {
    setFormOpen(false);
  };

  const filteredRecords = records.filter((record) =>
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
      <InfoDialog
        open={isInfoDialogOpen}
        onClose={handleInfoDialogClose}
        record={selectedRecordInfo}
      />
      <div className="flex flex-col h-full">
        <div className="w-full max-w-screen-xl mx-auto px-8">
          <div className="mb-4 flex justify-end items-center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleModalOpen}
            >
              New Item
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
                toolbar: () => <CustomGridToolbar onExport={handleExport} />,
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
      <Form
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
      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDelete}
        title="Confirm Delete!"
        message="Are you sure you want to delete this record?"
      />
    </>
  );
};

export default Grid;
