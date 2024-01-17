import { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Paper, TextField, Button } from '@mui/material';
import axiosInstance from '../../config/axios-instance.js';
import ManageUserForm from '../Form/ManageUserForm.jsx';
import StatusCell from '../../components/StatusCell.jsx';
import { statusColors } from '../../utils/statusColor.js';
import mapRecord from '../../utils/manageUserMapRecord.js';
import ActionMenu from '../../custom/CustomActionMenu.jsx';
import ConfirmationDialog from '../../custom/CustomConfirmDialog.jsx';
import CustomSnackbar from '../../custom/CustomSnackbar.jsx';
import RecordInfoDialog from '../Dialog/userInfoDialog.jsx';

const ManageUserGrid = () => {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [isInfoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedRecordInfo, setSelectedRecordInfo] = useState(null);
  const [recordIdToDelete, setRecordIdToDelete] = useState(null);
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

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleDialogOpen = (recordId) => {
    setRecordIdToDelete(recordId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setRecordIdToDelete(null);
    setDialogOpen(false);
  };

  const fetchRecord = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('user/fetch');
      const updatedRecords = response.data.map(mapRecord);
      setUsers(updatedRecords);
    } catch (error) {
      console.error('An error occurred while fetching roles:', error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const columns = [
    { field: 'userId', headerName: 'User ID', width: 120 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 150 },
    { field: 'roleName', headerName: 'Role', width: 130 },
    { field: 'phoneNumber', headerName: 'Contact', width: 130 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <StatusCell value={params.value} colorMapping={statusColors} />
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      sortable: false,
      width: 150,
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
    const recordInfo = users.find((user) => user.id === recordId);
    setSelectedRecordInfo(recordInfo);
    setInfoDialogOpen(true);
  };

  const handleInfoDialogClose = () => {
    setSelectedRecordInfo(null);
    setInfoDialogOpen(false);
  };

  const addNewUser = (newRecord) => {
    const mappedRecord = mapRecord(newRecord);
    setUsers((prevRecords) => [...prevRecords, mappedRecord]);
  };

  const handleEdit = (recordId) => {
    const recordToEdit = users.find((user) => user.id === recordId);
    setSelectedUser(recordToEdit);
    setFormOpen(true);
  };

  const updateUser = (updatedUser) => {
    const mappedRecord = mapRecord(updatedUser);
    setUsers((prevRecords) =>
      prevRecords.map((record) =>
        record.id === mappedRecord.id ? mappedRecord : record
      )
    );
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`user/delete/${recordIdToDelete}`);

      const updatedRecords = users.filter(
        (record) => record.id !== recordIdToDelete
      );
      setUsers(updatedRecords);
      showSnackbar('User successfully deleted.', 'success');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        showSnackbar(`Delete Error: ${error.response.data.error}`, 'error');
      } else {
        showSnackbar(
          'Failed to delete the User record. Please try again.',
          'error'
        );
      }
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

  const filteredUser = users.filter((user) =>
    Object.keys(user).some((key) => {
      const value = user[key]?.toString().toLowerCase();
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
        <div className="mx-auto px-8">
          <div className="mb-4 flex justify-end items-center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleModalOpen}
            >
              New User
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
              rows={filteredUser}
              columns={columns}
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
              disableSelectionOnClick
              loading={isLoading}
              style={{ height: 650 }}
            />
          </Paper>
          <ManageUserForm
            open={formOpen}
            addNewUser={addNewUser}
            selectedUser={selectedUser}
            onUpdate={updateUser}
            isEditMode={!!selectedUser}
            onClose={() => {
              setSelectedUser(null);
              handleModalClose();
            }}
            onCancel={() => {
              setSelectedUser(null);
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
        </div>
      </div>
    </>
  );
};

export default ManageUserGrid;
