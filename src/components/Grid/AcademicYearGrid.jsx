import { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';

import ActionMenu from '../../custom/CustomActionMenu';

import {
  Paper,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
} from '@mui/material';

import AcademicYearForm from '../Form/AcademicYearForm.jsx';
import axiosInstance from '../../config/axios-instance.js';
import StatusCell from '../StatusCell.jsx';
import CustomSnackbar from '../../custom/CustomSnackbar.jsx';

const AcademicYearGrid = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recordIdToDelete, setRecordIdToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [academicYearRecords, setAcademicYearRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarData, setSnackbarData] = useState({
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity) => {
    setSnackbarData({ message, severity });
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleDialogOpen = (recordId) => {
    setRecordIdToDelete(recordId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setRecordIdToDelete(null);
    setDialogOpen(false);
  };

  const academicYearStatusColor = {
    Active: {
      bgColor: '#DFF0D8',
      textColor: '#4CAF50',
      borderColor: '#4CAF50',
    },
    Completed: {
      bgColor: '#D9EDF7',
      textColor: '#2196F3',
      borderColor: '#2196F3',
    },
    Pending: {
      bgColor: '#EBDEF0',
      textColor: '#8E44AD',
      borderColor: '#8E44AD',
    },
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
        <StatusCell
          value={params.value}
          colorMapping={academicYearStatusColor}
        />
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
        />
      ),
    },
  ];

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`academicYear/delete/${recordIdToDelete}`);

      const updatedRecords = academicYearRecords.filter(
        (record) => record.id !== recordIdToDelete
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
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>Confirm Delete!</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this record?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDelete} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default AcademicYearGrid;
