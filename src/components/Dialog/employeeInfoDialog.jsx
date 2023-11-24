import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

import StatusBadge from '../../custom/CustomStatusBadge';

const EmployeeInfoDialog = ({ open, onClose, employee }) => {
  const employeeStatusColors = {
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
          Employee Information
        </DialogTitle>
        <DialogContent className="divide-y divide-gray-200">
          {employee ? (
            <div className="space-y-4 p-4">
              <Typography variant="subtitle1" className="font-semibold">
                employeeId:{' '}
                <span className="text-gray-600">{employee.employeeId}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Name: <span className="text-gray-600">{employee.name}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Gender: <span className="text-gray-600">{employee.gender}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Birthday:{' '}
                <span className="text-gray-600">
                  {formatDate(employee.dateOfBirth)}
                </span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Age: <span className="text-gray-600">{employee.age}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                School Year:{' '}
                <span className="text-gray-600">{employee.schoolYear}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Email: <span className="text-gray-600">{employee.email}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Mobile Number:{' '}
                <span className="text-gray-600">{employee.mobileNumber}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Role: <span className="text-gray-600">{employee.role}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Address:{' '}
                <span className="text-gray-600">{employee.address}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Status:{' '}
                <StatusBadge
                  value={employee.status}
                  colorMapping={employeeStatusColors}
                />
              </Typography>
            </div>
          ) : (
            <Typography className="py-4 text-center text-gray-600">
              No employee data available.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

EmployeeInfoDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  employee: PropTypes.shape({
    employeeId: PropTypes.string,
    name: PropTypes.string,
    gender: PropTypes.string,
    dateOfBirth: PropTypes.string,
    age: PropTypes.number,
    schoolYear: PropTypes.string,
    email: PropTypes.string,
    mobileNumber: PropTypes.string,
    role: PropTypes.bool,
    address: PropTypes.string,
    status: PropTypes.string,
  }),
};

export default EmployeeInfoDialog;
