// react
import { useState, useCallback, useEffect, useRef } from 'react';
// axios
import axiosInstance from '../../config/axios-instance';
// mui
import { DataGrid } from '@mui/x-data-grid';
import { TextField, Paper } from '@mui/material';
// others
import ActionMenu from '../../custom/CustomActionMenu.jsx';
import { statusColors } from '../../utils/statusColor.js';
import StatusCell from '../StatusCell.jsx';
import { formatYearFromDate } from '../../utils/formatDateFromYear.js';
import CustomGridToolbar from '../CustomGridToolbar2.jsx';
import exportDataToExcel from '../../utils/exportToExcel.js';

import headerMapping from '../../constant/medicineBatchHeaderMapping.js';
import InfoDialog from '../../components/Dialog/medicineBatchDialog.jsx';

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
      itemId: record.itemId || 'N/A',
      product: record.itemData?.[0]?.product || 'N/A',
      batchId: record.batchId || 'N/A',
      receiptId: record.receiptId || 'N/A',
      totalBatchQuantity: record.totalBatchQuantity || 'N/A',
      reason: record.reason || '',
      expirationDate: record.expirationDate
        ? formatYearFromDate(record.expirationDate)
        : null,
      createdAt: record.createdAt ? formatYearFromDate(record.createdAt) : null,
      updatedAt: record.updatedAt ? formatYearFromDate(record.updatedAt) : null,
      status: record.status || 'N/A',
    };
  };

  const fetchRecord = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('medicineInventory/getAllBatch');
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
    { field: 'id', headerName: 'ID', width: 150 },
    { field: 'itemId', headerName: 'Item ID', width: 150 },
    { field: 'product', headerName: 'Product', width: 200 },
    { field: 'batchId', headerName: 'Batch ID', width: 150 },
    {
      field: 'expirationDate',
      headerName: 'Expiration',
      width: 100,
      renderCell: (params) => {
        const expirationDate = params.value;
        const currentDate = new Date();

        // Calculate the difference in milliseconds between expirationDate and currentDate
        const timeDiff = new Date(expirationDate) - currentDate;

        // Calculate the difference in years
        const yearsDiff = timeDiff / (1000 * 60 * 60 * 24 * 365);

        // Set color based on expiration date
        let color;
        if (timeDiff < 0) {
          color = 'red'; // Expired
        } else if (yearsDiff <= 1) {
          color = 'blue'; // Less than or equal to 1 year
        } else {
          color = 'green'; // More than 1 year
        }

        return (
          <div style={{ color }}>{formatYearFromDate(expirationDate)}</div>
        );
      },
    },
    { field: 'totalBatchQuantity', headerName: 'Quantity', width: 100 },
    { field: 'createdAt', headerName: 'Created', width: 100 },
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
        <ActionMenu onView={() => handleInfoDialogOpen(params.row.id)} />
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

    // Define excelHeaders based on the fields in transformedRecord
    const excelHeaders = Object.keys(records[0] || {})
      .filter((key) => key !== 'id') // This will exclude the 'id' field
      .map((key) => ({
        title: headerMapping[key] || key,
        key: key,
      }));

    exportDataToExcel(filteredData, excelHeaders, 'MedicineBatch', {
      dateFields: ['expirationDate'], // adjust based on transformed data
      excludeColumns: ['action', 'updatedAt', 'createdAt'], // adjust based on transformed data
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
            />
          </Paper>
        </div>
      </div>
    </>
  );
};

export default Grid;
