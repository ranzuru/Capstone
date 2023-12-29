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
                Item ID: <span className="text-gray-600">{record.itemId}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Product: <span className="text-gray-600">{record.product}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Quantity: <span className="text-gray-600">{record.quantity}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Dosage (Each/ Per): <span className="text-gray-600">{record.dosagePer}</span>
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
    itemId: PropTypes.string,
    product: PropTypes.string,
    quantity: PropTypes.string,
    dosagePer: PropTypes.string,
    description: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    status: PropTypes.string,
  }),
};

export default InfoDialog;
