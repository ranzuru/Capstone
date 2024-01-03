// react
import { useState, useCallback, useEffect, useRef } from 'react';
// axios
import axiosInstance from '../../config/axios-instance';
// mui
import { DataGrid } from '@mui/x-data-grid';
import { TextField, Paper } from '@mui/material';
// others

import { formatYearFromDate } from '../../utils/formatDateFromYear.js';
import CustomGridToolbar from '../CustomGridToolbar2.jsx';

import InfoDialog from '../../components/Dialog/logDialog.jsx';

const Grid = () => {
  const [records, setRecords] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedRecordInfo, setSelectedRecordInfo] = useState(null);
  const dataGridRef = useRef(null);
  const [filterModel, setFilterModel] = useState({
    items: [],
  });


  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const mapRecord = (record) => {

    return {
      id: record._id,
      user: record.user || 'N/A',
      name: record.name || 'N/A',
      role: Array.isArray(record.role) && record.role.length > 0 ? record.role : 'N/A',
      section: record.section || 'N/A',
      action: record.action || 'N/A',
      description: record.description || '',
      createdAt: record.createdAt
        ? formatYearFromDate(record.createdAt)
        : null,
      updatedAt: record.updatedAt
        ? formatYearFromDate(record.updatedAt)
        : null,
    };
  };

  const fetchRecord = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('logs/getAll');
      const updatedRecords = response.data.map(mapRecord);
      setRecords(updatedRecords);
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
    { field: 'id', headerName: 'ID', width: 200 },
    { field: 'name', headerName: 'Name', width: 250 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'section', headerName: 'Section', width: 200 },
    { field: 'action', headerName: 'Action', width: 150,
    renderCell: (params) => {
      // Set color based on action
      let color;
      if (params.value === 'DELETE' || params.value === 'BULK DELETE' ) {
        color = 'red';
      } else if (params.value === 'CREATE/ POST') {
        color = 'green';
      } else if (params.value === 'UPDATE/ PUT') {
        color = 'blue';
      } else {
        color = 'black';
      } 

      return <div style={{ color }}>{params.value}</div>;
    }, },
    { field: 'createdAt', headerName: 'Created', width: 100 },
    {
      field: '',
      headerName: '',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <button
          onClick={() => handleInfoDialogOpen(params.row.id)}
          style={{ cursor: 'pointer' }}
        >
          View Log
        </button>
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
                  />
                ),
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
            />
          </Paper>
        </div>
      </div>
    </>
  );
};

export default Grid;
