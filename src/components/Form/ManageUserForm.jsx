import { useState, useEffect } from 'react';
import userValidationSchema from '../../validation/ManageUserValidation';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import CustomSnackbar from '../../custom/CustomSnackbar';
import axiosInstance from '../../config/axios-instance';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import FormInput from '../../custom/CustomTextField';
import FormSelect from '../../custom/CustomSelect';
import { genderOption } from '../../others/dropDownOptions';
import {
  PhoneNumberField,
  PasswordField,
  EmailField,
} from '../../custom/CustomRegisterInput';
import useFetchRole from '../../hooks/useFetchRole';

const ManageUserForm = (props) => {
  const {
    open,
    onClose,
    initialData,
    addNewUser,
    selectedUser,
    onUpdate,
    isEditMode,
  } = props;
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbarData, setSnackbarData] = useState({
    message: '',
    severity: 'success',
  });
  const { roleOptions, error: fetchError } = useFetchRole();

  const showSnackbar = (message, severity) => {
    setSnackbarData({ message, severity });
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleShowPasswordClick = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleShowConfirmPasswordClick = () => {
    setShowConfirmPassword(
      (prevShowConfirmPassword) => !prevShowConfirmPassword
    );
  };

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: '',
      roleName: '',
    },
    resolver: yupResolver(userValidationSchema(!isEditMode)),
  });

  const handleError = (error, context = 'operation') => {
    console.error(`An error occurred during ${context}:`, error);
    if (error.response && error.response.data && error.response.data.error) {
      showSnackbar(error.response.data.error, 'error');
    } else {
      showSnackbar(`An error occurred during ${context}`, 'error');
    }
  };

  const handleCreateUser = async (data) => {
    try {
      const response = await axiosInstance.post('/user/create', data);
      if (response.data && response.data._id) {
        addNewUser(response.data);
        showSnackbar('Successfully added user', 'success');
        handleClose();
      } else {
        showSnackbar('Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      handleError(error, 'adding user');
    }
  };

  const handleUpdateUser = async (id, updatedData) => {
    try {
      const response = await axiosInstance.put(
        `/user/update/${id}`,
        updatedData
      );
      if (response.data) {
        onUpdate(response.data);
        showSnackbar('User successfully updated', 'success');
        handleClose();
      } else {
        showSnackbar('Update operation failed', 'error');
      }
    } catch (error) {
      handleError(error, 'updating user');
    }
  };

  const handleSaveOrUpdate = async (data) => {
    try {
      if (selectedUser && selectedUser.id) {
        await handleUpdateUser(selectedUser.id, data);
      } else {
        await handleCreateUser(data);
      }
    } catch (error) {
      handleError(error, 'add or updating');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (selectedUser) {
      setValue('lastName', selectedUser.lastName || '');
      setValue('firstName', selectedUser.firstName || '');
      setValue('gender', selectedUser.gender || '');
      setValue('phoneNumber', selectedUser.phoneNumber || '');
      setValue('email', selectedUser.email || '');
      setValue('roleName', selectedUser.roleName || '');
    }
  }, [selectedUser, setValue]);

  return (
    <>
      <CustomSnackbar
        open={snackbarOpen}
        handleClose={handleCloseSnackbar}
        severity={snackbarData.severity}
        message={snackbarData.message}
      />
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{selectedUser ? 'Edit USER' : 'Add USER'}</DialogTitle>
        <form onSubmit={handleSubmit(handleSaveOrUpdate)}>
          <DialogContent>
            <DialogContentText>Enter user details:</DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormInput
                  name="firstName"
                  control={control}
                  label="First Name"
                  textType="text"
                  error={errors.firstName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormInput
                  name="lastName"
                  control={control}
                  label="Last Name"
                  textType="text"
                  error={errors.lastName}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <FormSelect
                  control={control}
                  name="gender"
                  label="Gender"
                  options={genderOption}
                  errors={errors}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <PhoneNumberField control={control} errors={errors} />
              </Grid>
              <Grid item xs={12} md={6}>
                <EmailField name="email" control={control} errors={errors} />
              </Grid>
            </Grid>
            {!selectedUser && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <PasswordField
                    name="password"
                    control={control}
                    errors={errors}
                    showPassword={showPassword}
                    handleShowPasswordClick={handleShowPasswordClick}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PasswordField
                    name="confirmPassword"
                    control={control}
                    errors={errors}
                    showPassword={showConfirmPassword}
                    handleShowPasswordClick={handleShowConfirmPasswordClick}
                  />
                </Grid>
              </Grid>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormSelect
                  name="roleName"
                  label="Role"
                  control={control}
                  options={
                    fetchError
                      ? [{ label: 'Error loading roles', value: '' }]
                      : roleOptions
                  }
                  errors={errors}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              {selectedUser ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

ManageUserForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  addNewUser: PropTypes.func.isRequired,
  selectedUser: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool,
};

export default ManageUserForm;
