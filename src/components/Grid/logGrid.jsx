// react
import { useState, useCallback, useEffect } from 'react';
// axios
import axiosInstance from '../../config/axios-instance';
// mui
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { TextField, Paper } from '@mui/material';
// others
import ActionMenu from '../../custom/CustomActionMenu.jsx';
import InfoDialog from '../../components/Dialog/logDialog.jsx';

const Grid = () => {
  const [records, setRecords] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedRecordInfo, setSelectedRecordInfo] = useState(null);

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const mapRecord = (record) => {
    return {
      ID: record.ID,
      UserId: record.UserId || 'N/A',
      Name: record.Name || 'N/A',
      Role: record.Role || 'N/A',
      Section: record.Section || 'N/A',
      Action: record.Action || 'N/A',
      Method: record.Method || 'N/A',
      Timestamp: record.Timestamp || '',
    };
  };

  const fetchRecord = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('logs/fetchLogs');
      const updatedRecords = response.data.map(mapRecord);
      setRecords(updatedRecords);
    } catch (error) {
      console.error('An error occurred while fetching logs:', error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const columns = [
    { field: 'ID', headerName: 'ID', width: 250 },
    { field: 'Name', headerName: 'User', width: 150 },
    { field: 'Role', headerName: 'Role', width: 200 },
    { field: 'Section', headerName: 'Section', width: 150 },
    {
      field: 'Action',
      headerName: 'Activity',
      width: 100,
      renderCell: (params) => {
        let color;
        switch (params.value) {
          case 'CREATE':
            color = '#4CAF50';
            break;
          case 'UPDATE':
            color = 'orange';
            break;
          case 'DELETE':
            color = 'red';
            break;
          case 'SIGNED IN':
            color = '#2196F3';
            break;
          default:
            color = 'black';
        }

        return <span style={{ color: color }}>{params.value}</span>;
      },
    },
    { field: 'Timestamp', headerName: 'Timestamp', width: 200 },
    {
      field: 'action',
      headerName: 'Action',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      disableExport: true,
      renderCell: (params) => (
        <ActionMenu onView={() => handleInfoDialogOpen(params.row.ID)} />
      ),
    },
  ];

  const handleInfoDialogOpen = (recordID) => {
    const recordInfo = records.find((record) => record.ID === recordID);
    setSelectedRecordInfo(recordInfo);
    setInfoDialogOpen(true);
  };

  const handleInfoDialogClose = () => {
    setSelectedRecordInfo(null);
    setInfoDialogOpen(false);
  };

  const filteredRecords = records.filter((record) =>
    Object.keys(record).some((key) => {
      const value = record[key]?.toString().toLowerCase();
      return value?.includes(searchValue.toLowerCase());
    })
  );
  return (
    <>
      <InfoDialog
        open={isInfoDialogOpen}
        onClose={handleInfoDialogClose}
        record={selectedRecordInfo}
      />
      <div className="flex flex-col h-full">
        <div className="w-full max-w-screen-xl mx-auto px-8">
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
              rows={filteredRecords}
              columns={columns}
              getRowId={(row) => row.ID}
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
                toolbar: GridToolbar,
              }}
              pageSizeOptions={[10]}
              disableSelectionOnClick
              loading={isLoading}
            />
          </Paper>
        </div>
      </div>
    </>
  );
};

export default Grid;
