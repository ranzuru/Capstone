import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

import StatusBadge from '../../custom/CustomStatusBadge';

const StudentInfoDialog = ({ open, onClose, student }) => {
  const studentStatusColors = {
    Active: {
      bgColor: '#DFF0D8',
      textColor: '#4CAF50',
      borderColor: '#4CAF50',
    },
    Archived: {
      bgColor: '#FEEBC8',
      textColor: '#FF9800',
      borderColor: '#FF9800',
    },
    Inactive: {
      bgColor: '#EBDEF0',
      textColor: '#8E44AD',
      borderColor: '#8E44AD',
    },
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle className="bg-gray-100 text-gray-800">
          Student Information
        </DialogTitle>
        <DialogContent className="divide-y divide-gray-200">
          {student ? (
            <div className="space-y-4 p-4">
              <Typography variant="subtitle1" className="font-semibold">
                LRN: <span className="text-gray-600">{student.lrn}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Name: <span className="text-gray-600">{student.name}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Gender: <span className="text-gray-600">{student.gender}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Birthday:{' '}
                <span className="text-gray-600">
                  {formatDate(student.dateOfBirth)}
                </span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Age: <span className="text-gray-600">{student.age}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                School Year:{' '}
                <span className="text-gray-600">{student.schoolYear}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Grade: <span className="text-gray-600">{student.grade}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Section:{' '}
                <span className="text-gray-600">{student.section}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                4Ps Member:{' '}
                <span className="text-gray-600">
                  {student.is4p ? 'Yes' : 'No'}
                </span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Parent/Guardian Name:{' '}
                <span className="text-gray-600">{student.parentName1}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Parent/Guardian Contact:{' '}
                <span className="text-gray-600">{student.parentContact1}</span>
              </Typography>
              {student.parentName2 && (
                <Typography variant="subtitle1" className="font-semibold">
                  Parent/Guardian Name2:{' '}
                  <span className="text-gray-600">{student.parentName2}</span>
                </Typography>
              )}
              {student.parentContact2 && (
                <Typography variant="subtitle1" className="font-semibold">
                  Parent/Guardian Contact2:{' '}
                  <span className="text-gray-600">
                    {student.parentContact2}
                  </span>
                </Typography>
              )}
              <Typography variant="subtitle1" className="font-semibold">
                Address:{' '}
                <span className="text-gray-600">{student.address}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Status:{' '}
                <StatusBadge
                  value={student.status}
                  colorMapping={studentStatusColors}
                />
              </Typography>
            </div>
          ) : (
            <Typography className="py-4 text-center text-gray-600">
              No student data available.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

StudentInfoDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  student: PropTypes.shape({
    lrn: PropTypes.string,
    name: PropTypes.string,
    gender: PropTypes.string,
    dateOfBirth: PropTypes.string,
    age: PropTypes.number,
    schoolYear: PropTypes.string,
    grade: PropTypes.string,
    section: PropTypes.string,
    is4p: PropTypes.bool,
    parentName1: PropTypes.string,
    parentContact1: PropTypes.string,
    parentName2: PropTypes.string,
    parentContact2: PropTypes.string,
    address: PropTypes.string,
    status: PropTypes.string,
  }),
};

export default StudentInfoDialog;
