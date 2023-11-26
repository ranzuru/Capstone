import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { formatYearFromDate } from '../../utils/formatDateFromYear';
import { statusColors } from '../../utils/statusColor.js';

import StatusBadge from '../../custom/CustomStatusBadge';

const RecordInfoDialog = ({ open, onClose, record }) => {
  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle className="bg-gray-100 text-gray-800">
          Dengue Information
        </DialogTitle>
        <DialogContent className="divide-y divide-gray-200">
          {record ? (
            <div className="space-y-4 p-4">
              <Typography variant="subtitle1" className="font-semibold">
                LRN: <span className="text-gray-600">{record.lrn}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Name: <span className="text-gray-600">{record.name}</span>
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
                Date of Onset:{' '}
                <span className="text-gray-600">
                  {formatYearFromDate(record.dateOfOnset)}
                </span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Date of Admission:{' '}
                <span className="text-gray-600">
                  {formatYearFromDate(record.dateOfAdmission)}
                </span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Hospital Admission:{' '}
                <span className="text-gray-600">
                  {record.hospitalAdmission}
                </span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Date of Discharge:{' '}
                <span className="text-gray-600">
                  {formatYearFromDate(record.dateOfDischarge)}
                </span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Address: <span className="text-gray-600">{record.address}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Remarks: <span className="text-gray-600">{record.remarks}</span>
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

RecordInfoDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  record: PropTypes.shape({
    lrn: PropTypes.string,
    name: PropTypes.string,
    gender: PropTypes.string,
    dateOfBirth: PropTypes.string,
    age: PropTypes.number,
    schoolYear: PropTypes.string,
    grade: PropTypes.string,
    section: PropTypes.string,
    dateOfOnset: PropTypes.string,
    dateOfAdmission: PropTypes.string,
    hospitalAdmission: PropTypes.string,
    dateOfDischarge: PropTypes.string,
    remarks: PropTypes.string,
    address: PropTypes.string,
    status: PropTypes.string,
  }),
};

export default RecordInfoDialog;
