import { useState, useEffect } from 'react';
import { TextField, Button, Paper, Typography, Alert } from '@mui/material';
import CustomSnackbar from '../custom/CustomSnackbar';
import { useNavigate } from 'react-router-dom';
import usePasswordReset from '../hooks/useResetPassword'; // Adjust the import path as needed

const PasswordResetPage = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const { resetPassword, status } = usePasswordReset();
  const [token, setToken] = useState('');

  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      // Redirect to login or other appropriate page
      setFormError('Password reset token is invalid or has expired.');
    }
  }, []);

  useEffect(() => {
    if (status) {
      setSnackbarOpen(true);
      if (status.type === 'success') {
        setTimeout(() => {
          navigate('/'); // Replace '/' with your login route
        }, 3000);
      }
    }
  }, [status, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      setFormError('Password reset token is invalid or has expired.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    await resetPassword(token, newPassword);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      {' '}
      <CustomSnackbar
        open={snackbarOpen}
        handleClose={handleSnackbarClose}
        severity={status?.type}
        message={status?.message}
      />
      <div className="flex justify-center items-center h-screen bg-custom-blue">
        <Paper className="w-full max-w-md p-8 space-y-6" elevation={5}>
          <Typography variant="h5" className="text-center mb-6">
            Reset your Password
          </Typography>
          {formError && (
            <Alert severity="error" onClose={() => setFormError('')}>
              {formError}
            </Alert>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <TextField
              label="New Password"
              variant="outlined"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mb-6"
              required
            />
            <TextField
              label="Confirm Password"
              variant="outlined"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className="mt-6"
            >
              Reset Password
            </Button>
          </form>
          {status && (
            <Typography
              color={status.type === 'error' ? 'error' : 'primary'}
              className="text-center"
            >
              {status.message}
            </Typography>
          )}
        </Paper>
      </div>
    </>
  );
};

export default PasswordResetPage;
