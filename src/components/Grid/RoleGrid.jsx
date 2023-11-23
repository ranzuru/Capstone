import { useState, useCallback, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../config/axios-instance';
import ActionMenu from '../../custom/CustomActionMenu';

import { Paper, TextField, Button } from '@mui/material';
import RoleForm from '../Form/RoleForm';

const RoleGrid = () => {
  const [searchValue, setSearchValue] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [roles, setRole] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const columns = [
    {
      field: 'name',
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
      width: 150,
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
          onDelete={() => handleDelete(params.row)}
        />
      ),
    },
  ];

  const mapRecord = (record) => {
    return {
      id: record._id,
      name: record.name || 'N/A',
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

  const handleBulkDelete = () => {
    console.log('Deleting roles with IDs:', selectedRows);
    setRole((prevRoles) =>
      prevRoles.filter((role) => !selectedRows.includes(role.id))
    );
    setSelectedRows([]);
  };

  const handleDelete = (row) => {
    console.log('Delete:', row);
  };

  const filteredRole = roles.filter((roles) =>
    Object.keys(roles).some((key) => {
      const value = roles[key]?.toString().toLowerCase();
      return value?.includes(searchValue.toLowerCase());
    })
  );

  const onSelectionModelChange = (newSelection) => {
    const selectedIDs = newSelection
      .map(
        (selectionId) =>
          filteredRole.find((role) => role.id === selectionId)?.id
      )
      .filter((id) => id !== undefined);
    setSelectedRows(selectedIDs);
  };

  const handleModalOpen = () => {
    setFormOpen(true);
  };

  const handleModalClose = () => {
    setFormOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="w-full max-w-screen-xl mx-auto px-8">
        <div className="mb-4 flex justify-end items-center">
          <Button
            variant="contained"
            color="secondary"
            onClick={handleBulkDelete}
          >
            Delete Selected
          </Button>
          <Button variant="contained" color="primary" onClick={handleModalOpen}>
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
            pageSizeOptions={[10]}
            disableSelectionOnClick
            checkboxSelection
            onSelectionModelChange={onSelectionModelChange}
            loading={isLoading}
            style={{ height: 650 }}
          />
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
        </Paper>
      </div>
    </div>
  );
};

export default RoleGrid;
