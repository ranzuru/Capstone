import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert'; // Import Alert component for error display

const OTPInput = ({ open, onClose, onVerify, onResend, error }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (!open) {
      setOtp(''); // Reset OTP input when dialog closes
      setTimer(60); // Reset the timer when dialog closes
    }
  }, [open]);

  useEffect(() => {
    let interval;
    if (open && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [open, timer]);

  const handleResend = () => {
    onResend();
    setTimer(60); // Reset the timer
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enter OTP</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" style={{ marginBottom: 10 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="OTP"
          variant="outlined"
          fullWidth
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          inputProps={{ maxLength: 6 }} // Assuming 6-digit OTP
          autoFocus
          margin="dense"
        />
        {timer > 0 ? (
          <Typography variant="body2" style={{ marginTop: 10 }}>
            Resend OTP in {timer} seconds
          </Typography>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleResend}
            style={{ marginTop: 10 }}
          >
            Resend OTP
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() => onVerify(otp)}
          color="primary"
          disabled={otp.length < 6}
        >
          Verify OTP
        </Button>
      </DialogActions>
    </Dialog>
  );
};

OTPInput.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onVerify: PropTypes.func.isRequired,
  onResend: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default OTPInput;
