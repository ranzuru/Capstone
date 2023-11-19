import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography } from '@mui/material';
import schoolLogo from '/assets/DonjuanTransparent.webp';
import { useAuth } from '../hooks/useAuth';
import OtpInput from './OtpInput';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const navigate = useNavigate();

  const { login, verifyOTP, resendOTP } = useAuth();

  const handleOTPDialogClose = () => {
    setShowOTPDialog(false); // Close the OTP dialog
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      setShowOTPDialog(true);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleOTPVerification = async (otp) => {
    try {
      await verifyOTP(otp);
      navigate('/app/dashboard');
    } catch (error) {
      console.error('OTP Verification error:', error);
      setShowOTPDialog(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP();
    } catch (error) {
      console.error('Resend OTP error:', error);
    }
  };

  return (
    <>
      {showOTPDialog ? (
        <OtpInput
          open={showOTPDialog}
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
                <Button color="primary" className="mt-6">
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
