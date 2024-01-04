import { useState, useEffect } from 'react';
import RoleValidation from '../../validation/RoleValidation.js';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  FormLabel,
} from '@mui/material';
import FormInput from '../../custom/CustomTextField';
import axiosInstance from '../../config/axios-instance';
import CustomSnackbar from '../../custom/CustomSnackbar';
import PropTypes from 'prop-types';
import FormCheckbox from '../../custom/CustomCheckbox';
import { navigationItems } from '../../others/dropDownOptions';

const RoleForm = (props) => {
  const { open, onClose, initialData, addNewRole, selectedRole, onUpdate } =
    props;
  const [scopesArray, setScopesArray] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarData, setSnackbarData] = useState({
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity) => {
    setSnackbarData({ message, severity });
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const defaultNavigationScopes = initialData
    ? initialData.navigationScopes
    : [];

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      roleName: '',
      description: '',
      navigationScopes: defaultNavigationScopes,
    },
    resolver: yupResolver(RoleValidation),
  });

  const handleError = (error, context = 'operation') => {
    console.error(`An error occurred during ${context}:`, error);
    if (error.response && error.response.data && error.response.data.error) {
      showSnackbar(error.response.data.error, 'error');
    } else {
      showSnackbar(`An error occurred during ${context}`, 'error');
    }
  };

  const handleCreateRole = async (data) => {
    try {
      const response = await axiosInstance.post('/role/create', data);
      if (response.data && response.data._id) {
        addNewRole(response.data);
        showSnackbar('Successfully added role', 'success');
        handleClose();
      } else {
        showSnackbar('Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error adding role:', error);
      handleError(error, 'adding role');
    }
  };

  const handleUpdateRole = async (id, updatedData) => {
    try {
      const response = await axiosInstance.put(
        `/role/update/${id}`,
        updatedData
      );
      if (response.data) {
        onUpdate(response.data);
        showSnackbar('Role successfully updated', 'success');
        handleClose(); // Assuming you have a function to close a modal or similar
      } else {
        showSnackbar('Update operation failed', 'error');
      }
    } catch (error) {
      handleError(error, 'updating role');
    }
  };

  const handleSaveOrUpdate = async (data) => {
    try {
      if (selectedRole && selectedRole.id) {
        await handleUpdateRole(selectedRole.id, data);
      } else {
        await handleCreateRole(data);
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
    if (selectedRole) {
      setValue('roleName', selectedRole.roleName || '');
      setValue('description', selectedRole.description || '');

      // Convert the string to an array and update the state
      const newScopesArray = selectedRole.navigationScopes.split(', ');
      setScopesArray(newScopesArray);
      setValue('navigationScopes', newScopesArray);
    } else {
      setValue('navigationScopes', []);
      setScopesArray([]); // Reset the scopes array state when there's no selected role
    }
  }, [selectedRole, setValue]);

  return (
    <>
      <CustomSnackbar
        open={snackbarOpen}
        handleClose={handleCloseSnackbar}
        severity={snackbarData.severity}
        message={snackbarData.message}
      />
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>{selectedRole ? 'Edit ROLE' : 'Add ROLE'}</DialogTitle>
        <form onSubmit={handleSubmit(handleSaveOrUpdate)}>
          <DialogContent>
            <DialogContentText>Enter role details:</DialogContentText>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormInput
                  name="roleName"
                  control={control}
                  label="Name"
                  textType="text"
                  error={errors.roleName}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormInput
                  name="description"
                  control={control}
                  label="Description"
                  textType="combine"
                  error={errors.description}
                  multiline
                />
              </Grid>
            </Grid>
            <FormControl margin="normal" fullWidth component="fieldset">
              <FormLabel component="legend">Select Navigation Scopes</FormLabel>
              <Grid container spacing={2}>
                {navigationItems.map((item) => (
                  <Grid item xs={6} key={item.value}>
                    <FormCheckbox
                      name={`navigationScopes.${item.value}`}
                      control={control}
                      label={item.label}
                      onChange={(e) => {
                        const currentScopes =
                          getValues('navigationScopes') || [];

                        let newScopes;
                        if (e.target.checked) {
                          newScopes = [...currentScopes, item.value]; // Add to array if checked
                        } else {
                          newScopes = currentScopes.filter(
                            (scope) => scope !== item.value
                          );
                        }

                        setValue('navigationScopes', newScopes, {
                          shouldValidate: true,
                        });
                        setScopesArray(newScopes); // Update the scopesArray state as well
                      }}
                      checked={scopesArray.includes(item.value)}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              {selectedRole ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

RoleForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  addNewRole: PropTypes.func.isRequired,
  selectedRole: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
};

export default RoleForm;
