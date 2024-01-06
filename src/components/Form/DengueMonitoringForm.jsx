// react
import { useState, useEffect, useRef } from 'react';
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

// yup
import DengueValidation from '../../validation/DengueMonitoringValidation.js';
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
  Divider,
} from '@mui/material';
// others
import { parseISO } from 'date-fns';
import {
  genderOption,
  nameExtensionOption,
  statusOptions,
  gradeOptions,
} from '../../others/dropDownOptions';
import useFetchSchoolYears from '../../hooks/useFetchSchoolYears.js';
import { calculateAge } from '../../utils/calculateAge.js';
import StudentAutoComplete from '../StudentAutoComplete.jsx';

const DengueMonitoringForm = (props) => {
  const { open, onClose, initialData, addNewRecord, selectedRecord, onUpdate } =
    props;
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

  const defaultValuesRef = useRef({
    lrn: '',
    lastName: '',
    firstName: '',
    middleName: '',
    nameExtension: '',
    gender: '',
    dateOfBirth: null,
    age: '',
    schoolYear: '',
    grade: '',
    section: '',
    adviser: '',
    dateOfOnset: null,
    dateOfAdmission: null,
    hospitalAdmission: '',
    dateOfDischarge: null,
    address: '',
    remarks: '',
    status: 'Active',
  }).current;

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || defaultValuesRef,
    resolver: yupResolver(DengueValidation),
  });

  useEffect(() => {
    if (activeSchoolYear) {
      reset({
        ...defaultValuesRef,
        ...initialData,
        schoolYear: activeSchoolYear,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchoolYear, reset, initialData]);

  const handleError = (error, context = 'operation') => {
    console.error(`An error occurred during ${context}:`, error);
    if (error.response && error.response.data && error.response.data.error) {
      showSnackbar(error.response.data.error, 'error');
    } else {
      showSnackbar(`An error occurred during ${context}`, 'error');
    }
  };

  const handleCreateRecord = async (data) => {
    try {
      const response = await axiosInstance.post(
        '/dengueMonitoring/create',
        data
      );
      if (response.data && response.data._id) {
        addNewRecord(response.data);
        showSnackbar('Successfully added new record', 'success');
        handleClose();
      } else {
        showSnackbar('Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error adding record:', error);
      if (error.response && error.response.status === 409) {
        showSnackbar('LRN with this schoolYear already exists', 'error');
      } else {
        handleError(error, 'adding record');
      }
    }
  };

  const handleUpdateRecord = async (id, updatedData) => {
    try {
      const response = await axiosInstance.put(
        `/dengueMonitoring/update/${id}`,
        updatedData
      );
      if (response.data) {
        onUpdate(response.data);
        showSnackbar('Record successfully updated', 'success');
        handleClose();
      } else {
        showSnackbar('Update operation failed', 'error');
      }
    } catch (error) {
      handleError(error, 'updating record');
    }
  };

  const handleSaveOrUpdate = async (data) => {
    try {
      if (selectedRecord && selectedRecord.id) {
        await handleUpdateRecord(selectedRecord.id, data);
      } else {
        await handleCreateRecord(data);
      }
    } catch (error) {
      handleError(error, 'add or updating');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleStudentSelect = (studentProfile) => {
    if (!studentProfile) {
      reset(); // This assumes you've defined the default values at useForm hook initialization
      return;
    }
    setValue('lrn', studentProfile.lrn);
    setValue('firstName', studentProfile.firstName);
    setValue('lastName', studentProfile.lastName);
    setValue('middleName', studentProfile.middleName);
    setValue('nameExtension', studentProfile.nameExtension);
    setValue('gender', studentProfile.gender);

    // Check if dateOfBirth is a valid string and then parse and format
    if (typeof studentProfile.dateOfBirth === 'string') {
      const parsedDate = parseISO(studentProfile.dateOfBirth);
      setValue('dateOfBirth', parsedDate);
    }

    setValue('age', studentProfile.age);
    setValue('grade', studentProfile.grade);
    setValue('section', studentProfile.section);
    setValue('address', studentProfile.address);
  };

  const watchDOB = watch('dateOfBirth');

  useEffect(() => {
    if (watchDOB) {
      const age = calculateAge(watchDOB);
      setValue('age', age);
    }
  }, [watchDOB, setValue]);

  useEffect(() => {
    if (selectedRecord) {
      // Regular fields
      const fields = [
        'lrn',
        'firstName',
        'lastName',
        'middleName',
        'nameExtension',
        'gender',
        'age',
        'grade',
        'section',
        'adviser',
        'hospitalAdmission',
        'address',
        'status',
        'remarks',
      ];

      fields.forEach((field) => {
        setValue(field, selectedRecord[field] || '');
      });

      // Date fields
      const dateFields = [
        'dateOfBirth',
        'dateOfOnset',
        'dateOfAdmission',
        'dateOfDischarge',
      ];

      dateFields.forEach((field) => {
        const dateValue = selectedRecord[field]
          ? parseISO(selectedRecord[field])
          : null;
        setValue(field, dateValue);
      });

      // School year field
      const schoolYearExists = schoolYears.some(
        (sy) => sy.value === selectedRecord['schoolYear']
      );
      const schoolYearValue = schoolYearExists
        ? selectedRecord['schoolYear']
        : '';
      setValue('schoolYear', schoolYearValue);
    }
  }, [selectedRecord, setValue, schoolYears]);

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
        maxWidth="lg"
        className="overflow-auto"
      >
        <DialogTitle>
          {selectedRecord ? 'Edit Record' : 'Add Record'}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleSaveOrUpdate)}>
          <DialogContent>
            <DialogContentText>Enter record details:</DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <StudentAutoComplete onSelect={handleStudentSelect} />
              </Grid>
            </Grid>
            <Divider />
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormInput
                  control={control}
                  name="lrn"
                  label="LRN"
                  error={errors.lrn}
                />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <FormInput
                  control={control}
                  name="firstName"
                  label="First Name"
                  textType="text"
                  error={errors.firstName}
                />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <FormInput
                  control={control}
                  name="lastName"
                  label="Last Name"
                  textType="text"
                  error={errors.lastName}
                />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <FormInput
                  control={control}
                  name="middleName"
                  label="Middle Name"
                  textType="text"
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <FormSelect
                  control={control}
                  name="nameExtension"
                  label="N.E."
                  options={nameExtensionOption}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={1.5}>
                <FormSelect
                  control={control}
                  name="gender"
                  label="Gender"
                  options={genderOption}
                  errors={errors}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <CustomDatePicker
                  control={control}
                  name="dateOfBirth"
                  label="Birthday"
                  maxDate={new Date()}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <FormInput
                  control={control}
                  name="age"
                  label="Age"
                  textType="number"
                  error={errors.age}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormInput
                  control={control}
                  name="section"
                  label="Section"
                  textType="text"
                  error={errors.section}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormSelect
                  control={control}
                  name="grade"
                  label="Grade level"
                  options={gradeOptions}
                  errors={errors}
                />
              </Grid>
              <Grid item xs={12} md={1.8}>
                <FormSelect
                  control={control}
                  name="schoolYear"
                  label="School Year"
                  options={schoolYears}
                  errors={errors}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormInput
                  control={control}
                  name="adviser"
                  label="Adviser"
                  textType="combine"
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
                <FormInput
                  control={control}
                  name="hospitalAdmission"
                  label="Hospital Admission"
                  textType="combine"
                  multiline
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <CustomDatePicker
                  control={control}
                  name="dateOfOnset"
                  label="Date of Onset"
                  maxDate={new Date()}
                />
              </Grid>
              <Grid item xs={12} md={2.2}>
                <CustomDatePicker
                  control={control}
                  name="dateOfAdmission"
                  label="Date of Admission"
                  maxDate={new Date()}
                />
              </Grid>
              <Grid item xs={12} md={2.2}>
                <CustomDatePicker
                  control={control}
                  name="dateOfDischarge"
                  label="Date of Discharge"
                  maxDate={new Date()}
                />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <FormInput
                  control={control}
                  name="remarks"
                  label="Remarks"
                  textType="combine"
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
              {selectedRecord ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

DengueMonitoringForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  addNewRecord: PropTypes.func.isRequired,
  selectedRecord: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
};

export default DengueMonitoringForm;
