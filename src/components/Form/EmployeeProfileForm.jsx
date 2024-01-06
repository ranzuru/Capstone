// react
import { useState, useEffect } from 'react';
// RHF
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// props
import PropTypes from 'prop-types';
// custom
import CustomSnackbar from '../../custom/CustomSnackbar';
import FormInput from '../../custom/CustomTextField';
import FormSelect from '../../custom/CustomSelect';
import CustomDatePicker from '../../custom/CustomDatePicker';
import CustomPhoneNumberField from '../../custom/CustomPhoneNumberField.jsx';

// yup
import EmployeeValidation from '../../validation/EmployeeProfileValidation.js';
// axios
import axiosInstance from '../../config/axios-instance.js';
// MUI
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Grid,
} from '@mui/material';
// others
import { parseISO } from 'date-fns';
import {
  genderOption,
  nameExtensionOption,
  statusOptions,
  employeeRolesOption,
} from '../../others/dropDownOptions';
import useFetchSchoolYears from '../../hooks/useFetchSchoolYears.js';
import { calculateAge } from '../../utils/calculateAge.js';

const EmployeeProfileForm = (props) => {
  const {
    open,
    onClose,
    initialData,
    addNewEmployee,
    selectedEmployee,
    onUpdate,
  } = props;
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarData, setSnackbarData] = useState({
    message: '',
    severity: 'success',
  });

  const { schoolYears, activeSchoolYear } = useFetchSchoolYears();

  const showSnackbar = (message, severity) => {
    setSnackbarData({ message, severity });
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      employeeId: '',
      lastName: '',
      firstName: '',
      middleName: '',
      nameExtension: '',
      gender: '',
      dateOfBirth: null,
      age: '',
      schoolYear: activeSchoolYear,
      email: '',
      mobileNumber: '',
      role: '',
      address: '',
      status: 'Active',
    },
    resolver: yupResolver(EmployeeValidation),
  });

  const handleError = (error, context = 'operation') => {
    console.error(`An error occurred during ${context}:`, error);
    if (error.response && error.response.data && error.response.data.error) {
      showSnackbar(error.response.data.error, 'error');
    } else {
      showSnackbar(`An error occurred during ${context}`, 'error');
    }
  };

  const handleCreateEmployee = async (data) => {
    try {
      const response = await axiosInstance.post(
        '/employeeProfile/create',
        data
      );
      if (response.data && response.data._id) {
        addNewEmployee(response.data);
        showSnackbar('Successfully added new employee', 'success');
        handleClose();
      } else {
        showSnackbar('Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      if (error.response && error.response.status === 409) {
        showSnackbar('EmployeeId with this schoolYear already exists', 'error');
      } else {
        handleError(error, 'adding employee');
      }
    }
  };

  const handleUpdateEmployee = async (id, updatedData) => {
    try {
      const response = await axiosInstance.put(
        `/employeeProfile/update/${id}`,
        updatedData
      );
      if (response.data) {
        onUpdate(response.data);
        showSnackbar('Employee successfully updated', 'success');
        handleClose();
      } else {
        showSnackbar('Update operation failed', 'error');
      }
    } catch (error) {
      handleError(error, 'updating employee');
    }
  };

  const handleSaveOrUpdate = async (data) => {
    try {
      if (selectedEmployee && selectedEmployee.id) {
        await handleUpdateEmployee(selectedEmployee.id, data);
      } else {
        await handleCreateEmployee(data);
      }
    } catch (error) {
      handleError(error, 'add or updating');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const watchDOB = watch('dateOfBirth');

  useEffect(() => {
    if (watchDOB) {
      const age = calculateAge(watchDOB);
      setValue('age', age);
    }
  }, [watchDOB, setValue]);

  useEffect(() => {
    if (selectedEmployee) {
      // Regular fields
      const fields = [
        'employeeId',
        'firstName',
        'lastName',
        'middleName',
        'nameExtension',
        'gender',
        'age',
        'email',
        'mobileNumber',
        'role',
        'address',
        'status',
      ];

      fields.forEach((field) => {
        setValue(field, selectedEmployee[field] || '');
      });

      // Date field
      const dateField = 'dateOfBirth';
      const parsedDate = selectedEmployee[dateField]
        ? parseISO(selectedEmployee[dateField])
        : null;
      setValue(dateField, parsedDate);

      const schoolYearExists = schoolYears.some(
        (sy) => sy.value === selectedEmployee['schoolYear']
      );
      const schoolYearValue = schoolYearExists
        ? selectedEmployee['schoolYear']
        : '';
      setValue('schoolYear', schoolYearValue);
    }
  }, [selectedEmployee, setValue, schoolYears]);

  return (
    <>
      <CustomSnackbar
        open={snackbarOpen}
        handleClose={handleCloseSnackbar}
        severity={snackbarData.severity}
        message={snackbarData.message}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        className="overflow-auto"
      >
        <DialogTitle>
          {selectedEmployee ? 'Edit Employee' : 'Add Employee'}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleSaveOrUpdate)}>
          <DialogContent>
            <DialogContentText>
              Enter employee profile details:
            </DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormInput
                  control={control}
                  name="employeeId"
                  label="Employee Id"
                  error={errors.employeeId}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3.5}>
                <FormInput
                  control={control}
                  name="firstName"
                  label="First Name"
                  textType="text"
                  error={errors.firstName}
                />
              </Grid>
              <Grid item xs={12} md={3.5}>
                <FormInput
                  control={control}
                  name="lastName"
                  label="Last Name"
                  textType="text"
                  error={errors.lastName}
                />
              </Grid>
              <Grid item xs={12} md={3.5}>
                <FormInput
                  control={control}
                  name="middleName"
                  label="Middle Name"
                  textType="text"
                />
              </Grid>
              <Grid item xs={12} md={1.5}>
                <FormSelect
                  control={control}
                  name="nameExtension"
                  label="N.E."
                  options={nameExtensionOption}
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
              <Grid item xs={12} md={2.5}>
                <CustomDatePicker
                  control={control}
                  name="dateOfBirth"
                  label="Birthday"
                  maxDate={new Date()}
                />
              </Grid>
              <Grid item xs={12} md={1.5}>
                <FormInput
                  control={control}
                  name="age"
                  label="Age"
                  textType="number"
                  error={errors.age}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormSelect
                  control={control}
                  name="schoolYear"
                  label="School Year"
                  options={schoolYears}
                  errors={errors}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormSelect
                  control={control}
                  name="role"
                  label="Role"
                  options={employeeRolesOption}
                  errors={errors}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormInput
                  control={control}
                  name="email"
                  label="Email"
                  error={errors.email}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <CustomPhoneNumberField
                  name="mobileNumber"
                  control={control}
                  label="Mobile Number"
                  maxLength={10}
                  adornment="+63"
                  placeholder="995 215 5436"
                  errors={errors}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormInput
                  control={control}
                  name="address"
                  label="Address"
                  textType="combine"
                  error={errors.address}
                  multiline
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormSelect
                  control={control}
                  name="status"
                  label="Status"
                  options={statusOptions}
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
              {selectedEmployee ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

EmployeeProfileForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  addNewEmployee: PropTypes.func.isRequired,
  selectedEmployee: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
};

export default EmployeeProfileForm;
