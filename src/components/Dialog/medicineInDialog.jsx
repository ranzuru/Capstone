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
                In ID: <span className="text-gray-600">{record.id}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Item ID: <span className="text-gray-600">{record.itemId}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Batch ID: <span className="text-gray-600">{record.batchId}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Product: <span className="text-gray-600">{record.product}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                receiptId: <span className="text-gray-600">{record.receiptId}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Expiration Date :{' '}
                <span className="text-gray-600">
                  {formatYearFromDate(record.expirationDate)}
                </span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Quantity: <span className="text-gray-600">{record.quantity}</span>
              </Typography>
              <Typography variant="subtitle1" className="font-semibold">
                Note/s: <span className="text-gray-600">{record.notes}</span>
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
    id: PropTypes.string,
    itemId: PropTypes.string,
    batchId: PropTypes.string,
    product: PropTypes.string,
    receiptId: PropTypes.string,
    expirationDate: PropTypes.string,
    quantity: PropTypes.string,
    notes: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    status: PropTypes.string,
  }),
};

export default InfoDialog;
