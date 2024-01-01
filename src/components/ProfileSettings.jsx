import { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import { PhoneNumberField } from './PhoneNumberField';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../config/axios-instance';
import CustomSnackbar from '../custom/CustomSnackbar';

const ProfileSettings = () => {
  const [openFieldDialog, setOpenFieldDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: 'info',
    message: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    roleName: '',
  });

  const { user, setUser } = useAuth();

  const openSnackbar = (severity, message) => {
    setSnackbar({ open: true, severity, message });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const formatFieldName = (fieldName) => {
    switch (fieldName) {
      case 'firstName':
        return 'First Name';
      case 'lastName':
        return 'Last Name';
      default:
        return fieldName;
    }
  };

  const handleFieldChangeClick = (field, value) => {
    setCurrentField(field);
    setFieldValue(value);
    setOpenFieldDialog(true);
  };

  const handlePasswordChangeClick = () => {
    setOpenPasswordDialog(true);
  };

  const handleCloseFieldDialog = () => {
    setOpenFieldDialog(false);
    setCurrentField('');
    setFieldValue('');
  };

  const handleClosePasswordDialog = () => {
    console.log('Closing password dialog');
    setOpenPasswordDialog(false);
    setPasswordError('');
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user.userId) return;

      try {
        const response = await axiosInstance.get(
          `/user/user-profile/${user.userId}`
        );
        if (!response.data) {
          throw new Error('User profile data is empty.');
        }

        setProfileData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          roleName: response.data.roleName,
        });
      } catch (err) {
        console.error('Error fetching user profile:', err.message || err);
      }
    };

    fetchUserProfile();
  }, [user.userId]);

  const handleFieldSave = async () => {
    try {
      const updateData = { [currentField]: fieldValue };
      const response = await axiosInstance.put(
        `/user/user-settings/${user.userId}`,
        updateData
      );

      setProfileData((prevState) => ({
        ...prevState,
        [currentField]: fieldValue,
      }));
      openSnackbar('success', 'Profile updated successfully');

      setUser((user) => ({ ...user, [currentField]: fieldValue }));

      console.log(response.data.message);
    } catch (error) {
      openSnackbar('error', 'Error updating user profile');
      console.error(
        'Error updating user profile:',
        error.response?.data?.message || error.message
      );
    }
    setOpenFieldDialog(false);
  };

  const handlePasswordSave = async () => {
    if (passwords.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    try {
      const updateData = {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      };

      const response = await axiosInstance.put(
        `/user/user-settings/${user.userId}`,
        updateData
      );

      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordError('');
      setOpenPasswordDialog(false);
      openSnackbar('success', response.data.message);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setPasswordError('Current password is incorrect');

        return; // Add this line to prevent closing the dialog
      } else {
        openSnackbar(
          'error',
          error.response?.data?.message || 'Error updating password'
        );
      }
    }
  };

  return (
    <>
      <CustomSnackbar
        open={snackbar.open}
        handleClose={handleCloseSnackbar}
        severity={snackbar.severity}
        message={snackbar.message}
      />
      <Paper elevation={3} className="flex-1 m-10 p-10">
        <Grid container justifyContent="center" spacing={4}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              name="firstName"
              label="First Name"
              variant="outlined"
              autoComplete="off"
              disabled
              value={profileData.firstName}
              onChange={(e) => {
                setFieldValue(e.target.value);
              }}
            />
            <Typography
              onClick={() =>
                handleFieldChangeClick('firstName', profileData.firstName || '')
              }
              className="text-blue-500 cursor-pointer mt-2"
            >
              Change
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              name="lastName"
              label="Last Name"
              variant="outlined"
              autoComplete="off"
              disabled
              value={profileData.lastName}
              onChange={(e) =>
                setProfileData({ ...profileData, lastName: e.target.value })
              }
            />
            <Typography
              onClick={() =>
                handleFieldChangeClick('lastName', profileData.lastName || '')
              }
              className="text-blue-500 cursor-pointer mt-2"
            >
              Change
            </Typography>
          </Grid>

          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              name="password"
              label="Password"
              type="password"
              variant="outlined"
              disabled
              defaultValue="123456789"
            />
            <Typography
              onClick={() => handlePasswordChangeClick('password')}
              className="text-blue-500 cursor-pointer mt-2"
            >
              Change
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              name="email"
              label="Email"
              variant="outlined"
              autoComplete="off"
              disabled
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <PhoneNumberField
              name="phoneNumber"
              disabled
              value={profileData.phoneNumber}
              onChange={(e) =>
                setProfileData({ ...profileData, phoneNumber: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              name="roleName"
              label="Role"
              variant="outlined"
              disabled
              value={profileData.roleName}
              onChange={(e) =>
                setProfileData({ ...profileData, roleName: e.target.value })
              }
            />
          </Grid>
        </Grid>
      </Paper>
      <Dialog open={openFieldDialog} onClose={handleCloseFieldDialog} fullWidth>
        <DialogTitle>Change {formatFieldName(currentField)}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={`New ${formatFieldName(currentField)}`}
            type="text"
            fullWidth
            variant="outlined"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFieldDialog}>Cancel</Button>
          <Button onClick={handleFieldSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" style={{ marginBottom: '16px' }}>
              {passwordError}
            </Alert>
          )}
          <TextField
            margin="dense"
            name="currentPassword"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            autoComplete="no"
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, currentPassword: e.target.value })
            }
          />
          {/* New Password */}
          <TextField
            margin="dense"
            name="newPassword"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            autoComplete="no"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, newPassword: e.target.value })
            }
          />
          {/* Confirm New Password */}
          <TextField
            margin="dense"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            autoComplete="no"
            value={passwords.confirmPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, confirmPassword: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Cancel</Button>
          <Button onClick={handlePasswordSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileSettings;
