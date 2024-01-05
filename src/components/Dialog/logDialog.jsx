import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

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
                Log ID: <span className="text-gray-600">{record.ID}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                User ID: <span className="text-gray-600">{record.UserId}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Name: <span className="text-gray-600">{record.Name}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Role: <span className="text-gray-600">{record.Role}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Section: <span className="text-gray-600">{record.Section}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Action: <span className="text-gray-600">{record.Action}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                TimeStamp:{' '}
                <span className="text-gray-600">{record.Timestamp}</span>
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
    ID: PropTypes.string,
    UserId: PropTypes.string,
    Name: PropTypes.string,
    Role: PropTypes.string,
    Section: PropTypes.string,
    Action: PropTypes.string,
    Timestamp: PropTypes.string,
  }),
};

export default InfoDialog;
