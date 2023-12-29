import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography } from '@mui/material';
import schoolLogo from '/assets/DonjuanTransparent.webp';
import { useAuth } from '../hooks/useAuth';
import OtpInput from './OtpInput';
import CustomSnackbar from '../custom/CustomSnackbar';
import usePasswordReset from '../hooks/useResetPassword';
import EmailDialog from './EmailDialog';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otpError, setOtpError] = useState('');
  const navigate = useNavigate();
  const { sendPasswordResetEmail, status } = usePasswordReset();

  const { user, login, verifyOTP, resendOTP, error, otpDetails } = useAuth();

  const handleEmailDialogOpen = () => {
    setEmailDialogOpen(true);
  };

  const handleEmailDialogClose = () => {
    setEmailDialogOpen(false);
  };
  useEffect(() => {
    if (user) {
      navigate('/app/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (otpDetails.otpToken && !error) {
      setShowOTPDialog(true);
    }
  }, [otpDetails, error]);

  useEffect(() => {
    if (error) {
      // If the error is related to OTP, show it in the OTP dialog
      if (showOTPDialog) {
        setOtpError(error); // Set OTP-specific error
        setSnackbarOpen(false); // Do not show the snackbar if OTP dialog is active
      } else {
        // If the error is not related to OTP, show the snackbar
        setSnackbarMessage(error);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setShowOTPDialog(false); // Close the OTP dialog if open
        setOtpError(''); // Clear OTP-specific error
      }
    }
  }, [error, showOTPDialog]);

  useEffect(() => {
    if (status) {
      setSnackbarMessage(status.message);
      setSnackbarSeverity(status.type);
      setSnackbarOpen(true);
    }
  }, [status]);

  const handleOTPDialogClose = () => {
    setShowOTPDialog(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleOTPVerification = async (otp) => {
    await verifyOTP(otp);
    setOtpError('');
  };

  const handleResendOTP = async () => {
    await resendOTP();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleEmailSubmit = async (email) => {
    await sendPasswordResetEmail(email);
    // Check the status and set snackbar properties accordingly
    if (status && status.type === 'success') {
      setSnackbarMessage(status.message);
      setSnackbarSeverity('success');
    } else if (status && status.type === 'error') {
      setSnackbarMessage(status.message);
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true); // Show the snackbar
    handleEmailDialogClose(); // Close the dialog
  };

  return (
    <>
      <EmailDialog
        open={emailDialogOpen}
        handleClose={handleEmailDialogClose}
        onEmailSubmit={handleEmailSubmit}
      />
      <CustomSnackbar
        open={snackbarOpen}
        handleClose={handleSnackbarClose}
        severity={snackbarSeverity}
        message={snackbarMessage}
      />
      {showOTPDialog ? (
        <OtpInput
          open={showOTPDialog}
          error={otpError}
          onClose={handleOTPDialogClose}
          onVerify={handleOTPVerification}
          onResend={handleResendOTP}
        />
      ) : (
        <div className="flex justify-center items-center h-screen bg-custom-blue">
          <div className="w-full max-w-md px-4 sm:px-6 md:px-8">
            <div className="flex flex-col items-center">
              <img
                src={schoolLogo}
                alt="schoolLogo"
                className="w-28 h-28 mb-2"
              />
              <Paper
                elevation={5}
                className="p-8 flex flex-col items-center w-full max-w-md bg-white"
              >
                <Typography variant="h4" style={{ marginBottom: '16px' }}>
                  Welcome Back
                </Typography>
                <form className="w-full mb-6 space-y-6" onSubmit={handleLogin}>
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="flex flex-col items-center">
                    <Button type="submit" variant="contained" color="primary">
                      Sign In
                    </Button>
                  </div>
                </form>
                <Button
                  color="primary"
                  className="mt-6"
                  onClick={handleEmailDialogOpen}
                >
                  Forgot your password? Reset Password
                </Button>
              </Paper>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginForm;
