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
import Validation from '../../validation/ClinicVisitValidation.js';
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
  typeOption,
  genderOption,
  statusOptions,
  gradeOptions,
} from '../../others/dropDownOptions';
import useFetchSchoolYears from '../../hooks/useFetchSchoolYears.js';
import { calculateAge } from '../../utils/calculateAge.js';
import AutoComplete from '../StudFacAutoComplete.jsx';

const Form = (props) => {
  const { open, onClose, initialData, addNewRecord, selectedRecord, onUpdate } =
    props;
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarData, setSnackbarData] = useState({
    message: '',
    severity: 'success',
  });
  const [medicineOptions, setMedicineOptions] = useState([]);
  const { schoolYears, activeSchoolYear } = useFetchSchoolYears();

  const showSnackbar = (message, severity) => {
    setSnackbarData({ message, severity });
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const defaultValuesRef = useRef({
    type: 'Student',
    name: '',
    patientId: '',
    gender: '',
    dateOfBirth: null,
    age: '',
    schoolYear: '',
    grade: '',
    section: '',
    mobileNumber: '',
    address: '',
    issueDate: new Date(),
    medicine: '',
    quantity: 0,
    malady: '',
    reason: '',
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
    resolver: yupResolver(Validation),
  });

  // Fetch medicine options
  const fetchMedicineOptions = async () => {
    try {
      const response = await axiosInstance.get(
        '/medicineInventory/getAllBatchNotExpired'
      );
      const options = response.data.map((data) => {
        // Format the expiration date to show only the year, month, and day
        const formattedExpirationDate = new Date(
          data.expirationDate
        ).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });

        return {
          value: data._id,
          label: `${
            data.itemData[0].product || 'Unknown Product'
          } | Exp: ${formattedExpirationDate} | Qty: (${
            data.totalBatchQuantity
          })`,
        };
      });
      setMedicineOptions(options);
    } catch (error) {
      handleError(error, 'fetching medicine options');
    }
  };

  useEffect(() => {
    if (activeSchoolYear) {
      reset({
        ...defaultValuesRef,
        ...initialData,
        schoolYear: activeSchoolYear,
      });
    }

    fetchMedicineOptions();
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
      // Make the first request
      const responseClinicVisit = await axiosInstance.post(
        '/clinicVisit/post',
        data
      );

      // Check if the first request was successful
      if (responseClinicVisit.data && responseClinicVisit.data._id) {
        // Check if the medicine field is not empty
        if (data.medicine) {
          // Pass the clinic visit ID to the second request
          const responseDispense = await axiosInstance.post(
            '/medicineInventory/postDispenseClinicVisit',
            { ...data, clinicVisitId: responseClinicVisit.data._id }
          );

          // Check if the second request was successful
          if (responseDispense.data && responseDispense.data._id) {
            // Update the UI or state as needed
            addNewRecord(responseClinicVisit.data);
            showSnackbar('Successfully added new record', 'success');
            handleClose();
          } else {
            showSnackbar('Operation failed', 'error');
          }
        } else {
          // Update the UI or state as needed
          addNewRecord(responseClinicVisit.data);
          showSnackbar('Successfully added new record', 'success');
          handleClose();
        }
      } else {
        showSnackbar('Operation failed', 'error');
      }
    } catch (error) {
      handleError(error, 'adding record');
    }
  };

  const handleUpdateRecord = async (id, updatedData) => {
    try {
      const response = await axiosInstance.put(
        `/clinicVisit/update/${id}`,
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

  const handleSelect = (data) => {
    if (!data) {
      reset(); // This assumes you've defined the default values at useForm hook initialization
      return;
    }
    setValue(
      'name',
      ` ${data.lastName}, ${data.firstName} ${data.middleName} ${
        data.nameExtension || ''
      }`
    );
    setValue('patientId', data.employeeId || data.lrn || '');
    setValue('gender', data.gender);

    // Check if dateOfBirth is a valid string and then parse and format
    if (typeof data.dateOfBirth === 'string') {
      const parsedDate = parseISO(data.dateOfBirth);
      setValue('dateOfBirth', parsedDate);
    }

    setValue('age', data.age);
    setValue('mobileNumber', data.mobileNumber || data.parentContact1 || '');
    setValue('grade', data.grade);
    setValue('section', data.section);
    setValue('address', data.address);
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
        'type',
        'name',
        'patientId',
        'gender',
        'age',
        'grade',
        'section',
        'mobileNumber',
        'address',
        'medicine',
        'quantity',
        'malady',
        'reason',
        'remarks',
      ];

      fields.forEach((field) => {
        setValue(field, selectedRecord[field] || '');
      });

      // Date fields
      const dateFields = ['dateOfBirth', 'issueDate'];

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

  const isTypeOther = watch('type') === 'Other';
  const isTypeFaculty = watch('type') === 'Faculty';

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
                <AutoComplete
                  onSelect={handleSelect}
                  type={
                    isTypeOther
                      ? 'Other'
                      : isTypeFaculty
                        ? 'Faculty'
                        : 'Student'
                  }
                  isTypeOther={isTypeOther}
                />
              </Grid>
            </Grid>
            <Divider />
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <FormSelect
                  control={control}
                  name="type"
                  label="Type"
                  options={typeOption}
                  errors={errors}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <FormInput
                  control={control}
                  name="name"
                  label="Name (Last, First Middle Extension)"
                  textType="text"
                  error={errors.name}
                />
              </Grid>
              <Grid item xs={12} md={3.5}>
                <FormInput
                  control={control}
                  name="patientId"
                  label="ID (LRN/ Employee ID)"
                  error={errors.patientId}
                  isDisabled={isTypeOther}
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
                  isDisabled={isTypeOther}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormSelect
                  control={control}
                  name="grade"
                  label="Grade level"
                  options={gradeOptions}
                  errors={errors}
                  isDisabled={isTypeOther}
                />
              </Grid>
              <Grid item xs={12} md={2}>
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
              <Grid item xs={12} md={4}>
                <FormInput
                  control={control}
                  name="mobileNumber"
                  label="Contact Number"
                  error={errors.mobileNumber}
                  textType="combine"
                />
              </Grid>
              <Grid item xs={12} md={6.5}>
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
              <Grid item xs={12} md={2}>
                <CustomDatePicker
                  control={control}
                  name="issueDate"
                  label="Issue Date"
                  maxDate={new Date()}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormInput
                  control={control}
                  name="malady"
                  label="Malady"
                  error={errors.malady}
                  textType="combine"
                  multiline
                />
              </Grid>
              <Grid item xs={12} md={5.5}>
                <FormInput
                  control={control}
                  name="reason"
                  label="Reason/s"
                  error={errors.reason}
                  textType="text"
                  multiline
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3.5}>
                <FormSelect
                  control={control}
                  name="medicine"
                  label="Medicine"
                  options={medicineOptions}
                  errors={errors}
                  disabled={selectedRecord !== null}
                />
              </Grid>
              <Grid item xs={12} md={1.5}>
                <FormInput
                  control={control}
                  name="quantity"
                  label="Quantity"
                  textType="number"
                  type="number"
                  error={errors.quantity}
                  disabled={!watch('medicine') || selectedRecord !== null}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormInput
                  control={control}
                  name="remarks"
                  label="Remark/s"
                  textType="text"
                  multiline
                />
              </Grid>
              <Grid item xs={12} md={1.5}>
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

Form.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  addNewRecord: PropTypes.func.isRequired,
  selectedRecord: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
};

export default Form;
