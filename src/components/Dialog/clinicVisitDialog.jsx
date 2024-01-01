import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { formatYearFromDate } from '../../utils/formatDateFromYear';
import { statusColors } from '../../utils/statusColor.js';

import StatusBadge from '../../custom/CustomStatusBadge';

const InfoDialog = ({ open, onClose, record }) => {
  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle className="bg-gray-100 text-gray-800">
          Clinic Visit Information
        </DialogTitle>
        <DialogContent className="divide-y divide-gray-200">
          {record ? (
            <div className="space-y-4 p-4">
              <Typography variant="subtitle1" className="font-semibold">
                Record ID: <span className="text-gray-600">{record.id}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Name: <span className="text-gray-600">{record.name}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Type: <span className="text-gray-600">{record.type}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Patient ID (LRN/ Employee ID):{' '}
                <span className="text-gray-600">{record.patientId}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Gender: <span className="text-gray-600">{record.gender}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Birthday:{' '}
                <span className="text-gray-600">
                  {formatYearFromDate(record.dateOfBirth)}
                </span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Age: <span className="text-gray-600">{record.age}</span>
              </Typography>

              <Typography variant="subtitle1" className="font-semibold">
                School Year:{' '}
                <span className="text-gray-600">{record.schoolYear}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Grade: <span className="text-gray-600">{record.grade}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Section: <span className="text-gray-600">{record.section}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Contact Number:{' '}
                <span className="text-gray-600">{record.mobileNumber}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Address: <span className="text-gray-600">{record.address}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Issue Date:{' '}
                <span className="text-gray-600">
                  {formatYearFromDate(record.issueDate)}
                </span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Malady: <span className="text-gray-600">{record.malady}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Reason/s: <span className="text-gray-600">{record.reason}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Medicine (Quantity):{' '}
                <span className="text-gray-600">
                  {record.product} ({record.quantity})
                </span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Remarks: <span className="text-gray-600">{record.remarks}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Created:{' '}
                <span className="text-gray-600">
                  {formatYearFromDate(record.createdAt)}
                </span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Updated:{' '}
                <span className="text-gray-600">
                  {formatYearFromDate(record.updatedAt)}
                </span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Status:{' '}
                <StatusBadge
                  value={record.status}
                  colorMapping={statusColors}
                />
              </Typography>
            </div>
          ) : (
            <Typography className="py-4 text-center text-gray-600">
              No record data available.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

InfoDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  record: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    name: PropTypes.string,
    patientId: PropTypes.string,
    gender: PropTypes.string,
    dateOfBirth: PropTypes.string,
    age: PropTypes.number,
    schoolYear: PropTypes.string,
    grade: PropTypes.string,
    section: PropTypes.string,
    mobileNumber: PropTypes.string,
    address: PropTypes.string,
    issueDate: PropTypes.string,
    malady: PropTypes.string,
    reason: PropTypes.string,
    product: PropTypes.arrayOf(PropTypes.string),
    quantity: PropTypes.number,
    remarks: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    status: PropTypes.string,
  }),
};

export default InfoDialog;
