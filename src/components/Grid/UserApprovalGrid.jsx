import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Paper, TextField } from '@mui/material';

const UserApprovalGrid = () => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const columns = [
    { field: 'userId', headerName: 'User ID', width: 90 },
    {
      field: 'profile',
      headerName: 'Profile',
      width: 150,
      renderCell: (params) => (
        <div className="flex justify-center">
          <img
            src={params.value}
            alt="Profile"
            className="h-8 w-8 rounded-full"
          />
        </div>
      ),
    },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 150 },
    { field: 'role', headerName: 'Role', width: 130 },
    {
      field: 'action',
      headerName: 'Action',
      sortable: false,
      width: 150,
    },
  ];

  const rows = [];
  return (
    <div className="flex flex-col h-full">
      <div className="mx-auto px-8">
        <div className="mb-4 flex justify-end items-center">
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
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            pageSizeOptions={[10]}
            disableSelectionOnClick
            className="h-full"
          />
        </Paper>
      </div>
    </div>
  );
};

export default UserApprovalGrid;
