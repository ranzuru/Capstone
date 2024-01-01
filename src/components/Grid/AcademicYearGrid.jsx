import { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { statusColors } from '../../utils/statusColor.js';
import ActionMenu from '../../custom/CustomActionMenu';

import { Paper, Button } from '@mui/material';

import AcademicYearForm from '../Form/AcademicYearForm.jsx';
import axiosInstance from '../../config/axios-instance.js';
import StatusCell from '../StatusCell.jsx';
import CustomSnackbar from '../../custom/CustomSnackbar.jsx';
import ConfirmationDialog from '../../custom/CustomConfirmDialog.jsx';

const AcademicYearGrid = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [academicYearRecords, setAcademicYearRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarData, setSnackbarData] = useState({
    message: '',
    severity: 'success',
  });
  const [confirmAction, setConfirmAction] = useState(() => () => {});

  const openSetActiveDialog = (recordId) => {
    setDialogTitle('Set Academic Year Active');
    setDialogMessage(
      'Are you sure you want to set this academic year as active?'
    );
    setConfirmAction(() => () => handleSetActive(recordId));
    setDialogOpen(true);
  };

  const openSetCompletedDialog = (recordId) => {
    setDialogTitle('Set Academic Year Completed');
    setDialogMessage(
      'Are you sure you want to set this academic year as completed?'
    );
    setConfirmAction(() => () => handleSetCompleted(recordId));
    setDialogOpen(true);
  };

  const openDeleteDialog = (recordId) => {
    setDialogTitle('Delete Academic Year');
    setDialogMessage('Are you sure you want to delete this academic year?');
    setConfirmAction(() => () => handleDelete(recordId));
    setDialogOpen(true);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarData({ message, severity });
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const mapRecord = (record) => {
    return {
      id: record._id,
      schoolYear: record.schoolYear || 'N/A',
      monthFrom: record.monthFrom || 'N/A',
      monthTo: record.monthTo || 'N/A',
      status: record.status || 'N/A',
    };
  };

  const fetchAcademicYearRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('academicYear/fetch');
      const updatedRecords = response.data.map(mapRecord);
      setAcademicYearRecords(updatedRecords);
    } catch (error) {
      console.error(
        'An error occurred while fetching medical checkups:',
        error
      );
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAcademicYearRecords();
  }, [fetchAcademicYearRecords]);

  const addNewAcademicYear = (newRecord) => {
    const mappedRecord = mapRecord(newRecord);
    setAcademicYearRecords((prevRecords) => [...prevRecords, mappedRecord]);
  };

  const handleEdit = (recordId) => {
    const recordToEdit = academicYearRecords.find(
      (academicYearRecord) => academicYearRecord.id === recordId
    );
    setSelectedRecord(recordToEdit);
    setFormOpen(true);
  };

  const updatedAcademicYear = (updatedRecord) => {
    const mappedRecord = mapRecord(updatedRecord);
    setAcademicYearRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.id === mappedRecord.id ? mappedRecord : record
      )
    );
  };

  const columns = [
    { field: 'schoolYear', headerName: 'School Year', width: 125 },
    { field: 'monthFrom', headerName: 'Month From', width: 100 },
    { field: 'monthTo', headerName: 'Month To', width: 100 },
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
          onDelete={() => openDeleteDialog(params.row.id)}
          onActive={
            params.row.status === 'Pending'
              ? () => openSetActiveDialog(params.row.id)
              : null
          }
          OnComplete={
            params.row.status === 'Active'
              ? () => openSetCompletedDialog(params.row.id)
              : null
          }
        />
      ),
    },
  ];

  const handleDelete = async (academicYearId) => {
    try {
      await axiosInstance.delete(`academicYear/delete/${academicYearId}`);

      const updatedRecords = academicYearRecords.filter(
        (record) => record.id !== academicYearId
      );
      setAcademicYearRecords(updatedRecords);
      showSnackbar('Academic year successfully deleted.', 'success');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        showSnackbar(`Delete Error: ${error.response.data.error}`, 'error');
      } else {
        showSnackbar(
          'Failed to delete the academic year. Please try again.',
          'error'
        );
      }
      console.error('Error deleting the record:', error);
    }
    setSnackbarOpen(true); // Open the snackbar with the message
    handleDialogClose();
  };

  const handleSetActive = async (academicYearId) => {
    try {
      await axiosInstance.put(`academicYear/setActive/${academicYearId}`);

      const updatedRecords = academicYearRecords.map((record) =>
        record.id === academicYearId ? { ...record, status: 'Active' } : record
      );
      setAcademicYearRecords(updatedRecords);
      showSnackbar('Academic year set to active.', 'success');
    } catch (error) {
      console.error('Error setting the academic year active:', error);
      let errorMessage =
        'Failed to set the academic year active. Please try again.';
      // The server might send the detailed message in 'error.response.data.message'
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      showSnackbar(errorMessage, 'error');
    }
    setSnackbarOpen(true);
    handleDialogClose();
  };
  const handleSetCompleted = async (academicYearId) => {
    try {
      await axiosInstance.put(`academicYear/setCompleted/${academicYearId}`);

      // Update the state to reflect the changes
      const updatedRecords = academicYearRecords.map((record) =>
        record.id === academicYearId
          ? { ...record, status: 'Completed' }
          : record
      );
      setAcademicYearRecords(updatedRecords);
      showSnackbar('Academic year set to completed.', 'success');
    } catch (error) {
      // Handle error
      console.error('Error setting the academic year completed:', error);
      showSnackbar(
        'Failed to set the academic year completed. Please try again.',
        'error'
      );
    }
    setSnackbarOpen(true);
    handleDialogClose();
  };

  const handleModalOpen = () => {
    setFormOpen(true);
  };

  const handleModalClose = () => {
    setFormOpen(false);
  };

  return (
    <>
      <CustomSnackbar
        open={snackbarOpen}
        handleClose={handleCloseSnackbar}
        severity={snackbarData.severity}
        message={snackbarData.message}
      />

      <ConfirmationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmAction}
        title={dialogTitle}
        message={dialogMessage}
      />

      <div className="flex flex-col h-full">
        <div className="w-full max-w-screen-xl mx-auto px-8">
          <div className="mb-4 flex justify-end items-center">
            <div className="ml-2">
              <Button
                variant="contained"
                color="primary"
                onClick={handleModalOpen}
              >
                Add Record
              </Button>
            </div>
          </div>
          <Paper elevation={5} className="flex-grow">
            <DataGrid
              rows={academicYearRecords}
              columns={columns}
              getRowId={(row) => row.id}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              sx={{
                '& .MuiDataGrid-row:nth-of-type(odd)': {
                  backgroundColor: '#f3f4f6',
                },
              }}
              pageSizeOptions={[10]}
              disableRowSelectionOnClick
              loading={isLoading}
              style={{ height: 650 }}
            />
            <AcademicYearForm
              open={formOpen}
              addNewAcademicYear={addNewAcademicYear}
              selectedAcademicYear={selectedRecord}
              onUpdate={updatedAcademicYear}
              onClose={() => {
                setSelectedRecord(null);
                handleModalClose();
              }}
              onCancel={() => {
                setSelectedRecord(null);
                handleModalClose();
              }}
            />
          </Paper>
        </div>
      </div>
    </>
  );
};

export default AcademicYearGrid;
