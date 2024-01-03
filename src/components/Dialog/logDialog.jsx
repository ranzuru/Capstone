import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { formatYearFromDate } from '../../utils/formatDateFromYear';

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
                Log ID: <span className="text-gray-600">{record.id}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                User ID: <span className="text-gray-600">{record.user}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Name: <span className="text-gray-600">{record.name}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Role: <span className="text-gray-600">{record.role}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Section: <span className="text-gray-600">{record.section}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Action: <span className="text-gray-600">{record.action}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Description: <span className="text-gray-600">{record.description}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Created :{' '}
                <span className="text-gray-600">
                  {formatYearFromDate(record.createdAt)}
                </span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Updated :{' '}
                <span className="text-gray-600">
                  {formatYearFromDate(record.updatedAt)}
                </span>
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
    user: PropTypes.string,
    name: PropTypes.string,
    role: PropTypes.string,
    section: PropTypes.string,
    action: PropTypes.string,
    description: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
};

export default InfoDialog;
