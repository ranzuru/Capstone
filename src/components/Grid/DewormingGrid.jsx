import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../config/axios-instance.js';

const DewormingGrid = () => {
  const [gridData, setGridData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/deworming/fetch');
        setGridData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { field: 'grade', headerName: 'Grade', width: 150 },
    {
      field: 'enrolledIs4p',
      align: 'center',
      headerAlign: 'center',
      headerName: 'Enrolled (is4p)',
      width: 150,
    },
    {
      field: 'enrolledNot4p',
      align: 'center',
      headerAlign: 'center',
      headerName: 'Enrolled (Not is4p)',
      width: 150,
    },
    {
      field: 'totalEnrolled',
      headerName: 'Total Enrolled',
      align: 'center',
      headerAlign: 'center',
      width: 150,
      valueGetter: (params) =>
        params.row.enrolledIs4p + params.row.enrolledNot4p,
    },
    {
      field: 'dewormedIs4p',
      align: 'center',
      headerAlign: 'center',
      headerName: 'Dewormed (is4p)',
      width: 150,
    },
    {
      field: 'dewormedNot4p',
      align: 'center',
      headerAlign: 'center',
      headerName: 'Dewormed (Not is4p)',
      width: 150,
    },
    {
      field: 'totalDewormed',
      headerName: 'Total Dewormed',
      align: 'center',
      headerAlign: 'center',
      width: 150,
      valueGetter: (params) =>
        params.row.dewormedIs4p + params.row.dewormedNot4p,
    },
    {
      field: 'percentage',
      headerName: '%',
      align: 'center',
      headerAlign: 'center',
      width: 90,
      valueGetter: (params) => {
        const totalDewormed =
          params.row.dewormedIs4p + params.row.dewormedNot4p;
        const totalEnrolled =
          params.row.enrolledIs4p + params.row.enrolledNot4p;

        if (!totalEnrolled || totalEnrolled === 0) {
          return '0%';
        }

        const percentage = (totalDewormed / totalEnrolled) * 100;

        return `${Math.round(percentage * 100) / 100}%`;
      },
    },
  ];

  const rows = gridData.map((item, index) => ({
    id: index,
    grade: item.grade,
    enrolledIs4p: item.enrolled.is4p,
    enrolledNot4p: item.enrolled.not4p,
    dewormedIs4p: item.dewormed.is4p,
    dewormedNot4p: item.dewormed.not4p,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="w-full max-w-screen-xl mx-auto px-8">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center"></div>
        </div>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          sx={{
            '& .MuiDataGrid-row:nth-of-type(odd)': {
              backgroundColor: '#f3f4f6',
            },
          }}
          disableRowSelectionOnClick
        />
      </div>
    </div>
  );
};

export default DewormingGrid;
