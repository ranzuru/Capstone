// react
import { useState, useCallback, useEffect } from 'react';
// axios
import axiosInstance from '../../config/axios-instance';
// mui
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField, Paper } from '@mui/material';
// others
import ActionMenu from '../../custom/CustomActionMenu.jsx';
import { statusColors } from '../../utils/statusColor.js';
import StatusCell from '../StatusCell.jsx';
import { formatYearFromDate } from '../../utils/formatDateFromYear.js';
// Form
import StudentProfileForm from '../Form/StudentProfileForm.jsx';

const StudentProfileGrid = () => {
  const [students, setStudents] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const mapRecord = (record) => {
    const academicYear = record.academicYear || {};

    const formattedName = `${record.lastName || ''}, ${record.firstName || ''}${
      record.middleName ? ` ${record.middleName.charAt(0)}.` : ''
    }${record.nameExtension ? ` ${record.nameExtension}` : ''}`.trim();

    return {
      id: record._id,
      lrn: record.lrn || 'N/A',
      firstName: record.firstName || 'N/A',
      middleName: record.middleName || '',
      lastName: record.lastName || 'N/A',
      nameExtension: record.nameExtension || '',
      name: formattedName,
      schoolYear: academicYear.schoolYear || 'N/A',
      grade: record.grade || 'N/A',
      section: record.section || 'N/A',
      gender: record.gender || 'N/A',
      dateOfBirth: record.dateOfBirth || 'N/A',
      age: record.age || 'N/A',
      is4p: record.is4p !== undefined ? record.is4p : 'N/A',
      parentContact1: record.parentContact1 || 'N/A',
      parentName1: record.parentName1 || 'N/A',
      parentName2: record.parentName2 || '',
      parentContact2: record.parentContact2 || '',
      address: record.address || 'N/A',
      status: record.status || 'N/A',
    };
  };

  const fetchRole = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('studentProfile/fetch');
      const updatedRecords = response.data.map(mapRecord);
      setStudents(updatedRecords);
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

  const addNewStudent = (newRecord) => {
    const mappedRecord = mapRecord(newRecord);
    setStudents((prevRecords) => [...prevRecords, mappedRecord]);
  };

  const updatedStudentProfile = (updatedStudentData) => {
    const mappedRecord = mapRecord(updatedStudentData);
    setStudents((prevRecords) =>
      prevRecords.map((record) =>
        record.id === mappedRecord.id ? mappedRecord : record
      )
    );
  };

  const columns = [
    { field: 'lrn', headerName: 'LRN', width: 150 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'gender', headerName: 'Gender', width: 100 },
    {
      field: 'dateOfBirth',
      headerName: 'Birthday',
      width: 100,
      valueGetter: (params) => formatYearFromDate(params.row.dateOfBirth),
    },
    { field: 'age', headerName: 'Age', width: 75 },
    { field: 'schoolYear', headerName: 'S.Y', width: 100 },
    { field: 'grade', headerName: 'Grade', width: 100 },
    { field: 'section', headerName: 'Section', width: 100 },
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
        <ActionMenu
          onEdit={() => handleEdit(params.row.id)}
          onDelete={() => handleDelete(params.row)}
        />
      ),
    },
  ];

  const handleEdit = (recordId) => {
    const studentToEdit = students.find((student) => student.id === recordId);
    setSelectedStudent(studentToEdit);
    setFormOpen(true);
  };

  const handleDelete = () => {
    console.log('delete');
  };

  const handleModalOpen = () => {
    setFormOpen(true);
  };

  const handleModalClose = () => {
    setFormOpen(false);
  };

  const filteredStudents = students.filter((student) =>
    Object.keys(student).some((key) => {
      const value = student[key]?.toString().toLowerCase();
      return value?.includes(searchValue.toLowerCase());
    })
  );
  return (
    <>
      <div className="flex flex-col h-full">
        <div className="w-full max-w-screen-xl mx-auto px-8">
          <div className="mb-4 flex justify-end items-center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleModalOpen}
            >
              New Record
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
              rows={filteredStudents}
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
              loading={isLoading}
            />
          </Paper>
        </div>
      </div>
      <StudentProfileForm
        open={formOpen}
        addNewStudent={addNewStudent}
        onUpdate={updatedStudentProfile}
        selectedStudent={selectedStudent}
        onClose={() => {
          setSelectedStudent(null);
          handleModalClose();
        }}
        onCancel={() => {
          setSelectedStudent(null);
          handleModalClose();
        }}
      />
    </>
  );
};

export default StudentProfileGrid;
