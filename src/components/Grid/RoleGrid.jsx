import { useState, useCallback, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../config/axios-instance';
import ActionMenu from '../../custom/CustomActionMenu';

import { Paper, TextField, Button } from '@mui/material';
import RoleForm from '../Form/RoleForm';

import CustomDeleteToolbar from '../CustomDeleteToolbar';
import ConfirmationDialog from '../../custom/CustomConfirmDialog.jsx';
import CustomSnackbar from '../../custom/CustomSnackbar.jsx';

const RoleGrid = () => {
  const [searchValue, setSearchValue] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [roles, setRole] = useState([]);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirm, setOnConfirm] = useState(() => {});
  const [selectedRows, setSelectedRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarData, setSnackbarData] = useState({
    message: '',
    severity: 'success',
  });

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarData({ message, severity });
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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

  const columns = [
    {
      field: 'roleName',
      headerName: 'Role',
      width: 150,
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 150,
    },
    {
      field: 'navigationScopes',
      headerName: 'Scope',
      width: 300,
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        return (
          <ActionMenu
            onEdit={() => handleEdit(params.row.id)}
            onDelete={() => handleDialogOpen(params.row.id)}
          />
        );
      },
    },
  ];

  const mapRecord = (record) => {
    return {
      id: record._id,
      roleName: record.roleName || 'N/A',
      description: record.description || 'N/A',
      navigationScopes:
        record.navigationScopes && record.navigationScopes.length > 0
          ? record.navigationScopes.join(', ')
          : 'N/A',
    };
  };

  const fetchRole = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('role/fetch');
      const updatedRecords = response.data.map(mapRecord);
      setRole(updatedRecords);
    } catch (error) {
      console.error('An error occurred while fetching roles:', error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const addNewRole = (newRecord) => {
    const mappedRecord = mapRecord(newRecord);
    setRole((prevRecords) => [...prevRecords, mappedRecord]);
  };

  const handleEdit = (recordId) => {
    const recordToEdit = roles.find((role) => role.id === recordId);
    setSelectedRecord(recordToEdit);
    setFormOpen(true);
  };

  const updateRole = (updatedRole) => {
    const mappedRecord = mapRecord(updatedRole);
    setRole((prevRecords) =>
      prevRecords.map((record) =>
        record.id === mappedRecord.id ? mappedRecord : record
      )
    );
  };

  const handleDelete = async (recordId) => {
    try {
      await axiosInstance.delete(`role/delete/${recordId}`);

      const updatedRecords = roles.filter((record) => record.id !== recordId);
      setRole(updatedRecords);
      showSnackbar('Role successfully deleted.', 'success');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        showSnackbar(`Delete Error: ${error.response.data.error}`, 'error');
      } else {
        showSnackbar('Failed to delete the Role. Please try again.', 'error');
      }
    }
    setSnackbarOpen(true);
    handleDialogClose();
  };

  const handleBulkDelete = async () => {
    try {
      const roleIdsToDelete = selectedRows.map((row) => row.id);
      await axiosInstance.delete('role/bulkDelete', {
        data: { ids: roleIdsToDelete },
      });

      const updatedRecords = roles.filter(
        (role) => !roleIdsToDelete.includes(role.id)
      );
      setRole(updatedRecords);
      showSnackbar('Roles successfully deleted.', 'success');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        showSnackbar(`Delete Error: ${error.response.data.error}`, 'error');
      } else {
        showSnackbar('Failed to delete the Roles. Please try again.', 'error');
      }
    }
    setSnackbarOpen(true);
    handleDialogClose();
  };

  const filteredRole = roles.filter((roles) =>
    Object.keys(roles).some((key) => {
      const value = roles[key]?.toString().toLowerCase();
      return value?.includes(searchValue.toLowerCase());
    })
  );

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
            <Button
              variant="contained"
              color="primary"
              onClick={handleModalOpen}
            >
              New Role
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
              rows={filteredRole}
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
              slots={{
                toolbar: () => (
                  <CustomDeleteToolbar
                    selectedRows={selectedRows}
                    handleBulkDelete={() => handleDialogOpen(null, true)}
                  />
                ),
              }}
              onRowSelectionModelChange={(newSelection) => {
                const selectedRowsData = filteredRole.filter((row) =>
                  newSelection.includes(row.id)
                );
                setSelectedRows(selectedRowsData);
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
      <RoleForm
        open={formOpen}
        addNewRole={addNewRole}
        selectedRole={selectedRecord}
        onUpdate={updateRole}
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

export default RoleGrid;
