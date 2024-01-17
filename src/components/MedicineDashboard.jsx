import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import axiosInstance from '../config/axios-instance'; // adjust the import path as per your project structure
import { formatYearFromDate } from '../utils/formatDateFromYear.js';

const MedicineDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const mapRecord = (record) => {
    return {
      itemId: record.itemId || 'N/A',
      product: record.itemData?.[0]?.product || 'N/A',
      batchId: record.batchId || 'N/A',
      receiptId: record.receiptId || 'N/A',
      totalBatchQuantity: record.totalBatchQuantity || '0',
      expirationDate: record.expirationDate
        ? formatYearFromDate(record.expirationDate)
        : 'N/A',
    };
  };

  const isExpired = (expirationDate) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    return expDate < today;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          '/medicineInventory/medicineDashboard'
        );
        const updatedRecords = response.data.map(mapRecord);
        setData(updatedRecords);
      } catch (error) {
        console.error('Error fetching data: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (data.length === 0) {
    return <div>No data available</div>;
  }

  // Remove 'id' from headers
  const headers = [
    'Item ID',
    'Product',
    'Batch ID',
    'Receipt ID',
    'Total Batch Quantity',
    'Expiration Date',
  ];

  return (
    <TableContainer
      component={Paper}
      style={{ maxHeight: '400px', overflow: 'auto' }}
    >
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            {headers.map((header, index) => (
              <TableCell key={index} align={index === 0 ? 'inherit' : 'right'}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              style={{ backgroundColor: rowIndex % 2 ? '#FFFFFF' : '#F7F7F7' }}
            >
              <TableCell align="left">{row.itemId}</TableCell>
              <TableCell align="right">{row.product}</TableCell>
              <TableCell align="right">{row.batchId}</TableCell>
              <TableCell align="right">{row.receiptId}</TableCell>
              <TableCell align="right">{row.totalBatchQuantity}</TableCell>
              <TableCell
                align="right"
                style={{
                  color: isExpired(row.expirationDate) ? 'red' : 'blue',
                }}
              >
                {row.expirationDate}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MedicineDashboard;
