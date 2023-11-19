import { useState, useEffect } from 'react';
import { TextField, Button, Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const OTPInput = ({ onVerify, onResend }) => {
  const [otp, setOtp] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval;
    if (showResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setShowResend(false);
      setTimer(60);
    }
    return () => clearInterval(interval);
  }, [showResend, timer]);

  const handleResend = () => {
    onResend();
    setShowResend(true);
    setTimer(60); // Reset the timer
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Paper
        elevation={5}
        className="p-8 flex flex-col items-center w-full max-w-md"
      >
        <Typography variant="h5" className="mb-4">
          Enter OTP
        </Typography>
        <TextField
          label="OTP"
          variant="outlined"
          fullWidth
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          inputProps={{ maxLength: 6 }} // Assuming 6-digit OTP
          className="mb-4"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => onVerify(otp)}
          disabled={otp.length < 6} // Disable until complete OTP is entered
        >
          Verify OTP
        </Button>

        {showResend ? (
          <Typography variant="body2" className="mt-4">
            Resend OTP in {timer} seconds
          </Typography>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleResend}
            className="mt-4"
            disabled={showResend}
          >
            Resend OTP
          </Button>
        )}
      </Paper>
    </div>
  );
};

OTPInput.propTypes = {
  onVerify: PropTypes.func.isRequired,
  onResend: PropTypes.func.isRequired,
};

export default OTPInput;
