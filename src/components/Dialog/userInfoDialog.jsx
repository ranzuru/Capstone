import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { statusColors } from '../../utils/statusColor.js';

import StatusBadge from '../../custom/CustomStatusBadge';

const RecordInfoDialog = ({ open, onClose, record }) => {
  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle className="bg-gray-100 text-gray-800">
          User Information
        </DialogTitle>
        <DialogContent className="divide-y divide-gray-200">
          {record ? (
            <div className="space-y-4 p-4">
              <Typography variant="subtitle1" className="font-semibold">
                USER ID: <span className="text-gray-600">{record.userId}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Name: <span className="text-gray-600">{record.name}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Gender: <span className="text-gray-600">{record.gender}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Email: <span className="text-gray-600">{record.email}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Contact:{' '}
                <span className="text-gray-600">{record.phoneNumber}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Role: <span className="text-gray-600">{record.roleName}</span>
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
    userId: PropTypes.string,
    name: PropTypes.string,
    gender: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
    roleName: PropTypes.string,
    status: PropTypes.string,
  }),
};

export default RecordInfoDialog;
