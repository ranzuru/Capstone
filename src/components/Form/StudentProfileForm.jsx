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
import CustomRadioGroup from '../../custom/CustomRadioButton.jsx';
// yup
import StudentProfileValidation from '../../validation/StudentProfileValidation';
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
} from '@mui/material';
// others
import { parseISO } from 'date-fns';
import {
  genderOption,
  nameExtensionOption,
  gradeOptions,
} from '../../others/dropDownOptions';
import useFetchSchoolYears from '../../hooks/useFetchSchoolYears.js';
import { calculateAge } from '../../utils/calculateAge.js';

const StudentProfileForm = (props) => {
  const {
    open,
    onClose,
    initialData,
    addNewStudent,
    selectedStudent,
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
      lrn: '',
      lastName: '',
      firstName: '',
      middleName: '',
      nameExtension: '',
      gender: '',
      dateOfBirth: null,
      age: '',
      schoolYear: activeSchoolYear,
      grade: '',
      section: '',
      is4p: false,
      parentName1: '',
      parentContact1: '',
      parentName2: '',
      parentContact2: '',
      address: '',
    },
    resolver: yupResolver(StudentProfileValidation),
  });

  const handleError = (error, context = 'operation') => {
    console.error(`An error occurred during ${context}:`, error);
    if (error.response && error.response.data && error.response.data.error) {
      showSnackbar(error.response.data.error, 'error');
    } else {
      showSnackbar(`An error occurred during ${context}`, 'error');
    }
  };

  const handleCreateStudent = async (data) => {
    try {
      const response = await axiosInstance.post('/studentProfile/create', data);
      if (response.data && response.data._id) {
        addNewStudent(response.data); // Pass the entire role object to addNewRole
        showSnackbar('Successfully added new student', 'success');
        handleClose();
      } else {
        showSnackbar('Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      handleError(error, 'adding student');
    }
  };

  const handleUpdateStudent = async (id, updatedData) => {
    try {
      const response = await axiosInstance.put(
        `/studentProfile/update/${id}`,
        updatedData
      );
      if (response.data) {
        onUpdate(response.data);
        showSnackbar('Student successfully updated', 'success');
        handleClose();
      } else {
        showSnackbar('Update operation failed', 'error');
      }
    } catch (error) {
      handleError(error, 'updating student');
    }
  };

  const handleSaveOrUpdate = async (data) => {
    try {
      if (selectedStudent && selectedStudent.id) {
        await handleUpdateStudent(selectedStudent.id, data);
      } else {
        await handleCreateStudent(data);
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
    if (selectedStudent) {
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
        'parentName1',
        'parentContact1',
        'parentName2',
        'parentContact2',
        'address',
      ];

      fields.forEach((field) => {
        setValue(field, selectedStudent[field] || '');
      });

      // Boolean field
      setValue('is4p', !!selectedStudent['is4p']);

      // Date field
      const dateField = 'dateOfBirth';
      const parsedDate = selectedStudent[dateField]
        ? parseISO(selectedStudent[dateField])
        : null;
      setValue(dateField, parsedDate);

      const schoolYearExists = schoolYears.some(
        (sy) => sy.value === selectedStudent['schoolYear']
      );
      const schoolYearValue = schoolYearExists
        ? selectedStudent['schoolYear']
        : '';
      setValue('schoolYear', schoolYearValue);
    }
  }, [selectedStudent, setValue, schoolYears]);

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
          {selectedStudent ? 'Edit Student' : 'Add Student'}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleSaveOrUpdate)}>
          <DialogContent>
            <DialogContentText>
              Enter student profile details:
            </DialogContentText>
            <FormInput
              control={control}
              name="lrn"
              label="LRN"
              textType="combine"
              error={errors.lrn}
            />
            <FormInput
              control={control}
              name="firstName"
              label="First Name"
              textType="text"
              error={errors.firstName}
            />
            <FormInput
              control={control}
              name="lastName"
              label="Last Name"
              textType="text"
              error={errors.lastName}
            />
            <FormInput
              control={control}
              name="middleName"
              label="Middle Name"
              textType="text"
            />
            <FormSelect
              control={control}
              name="nameExtension"
              label="N.E."
              options={nameExtensionOption}
            />
            <FormSelect
              control={control}
              name="gender"
              label="Gender"
              options={genderOption}
              errors={errors}
            />
            <CustomRadioGroup
              control={control}
              name="is4p"
              label="4p's Member?"
            />
            <CustomDatePicker
              control={control}
              name="dateOfBirth"
              label="Birthday"
              maxDate={new Date()}
            />
            <FormInput
              control={control}
              name="age"
              label="Age"
              textType="number"
              error={errors.age}
            />
            <FormSelect
              control={control}
              name="schoolYear"
              label="School Year"
              options={schoolYears}
              errors={errors}
            />
            <FormSelect
              control={control}
              name="grade"
              label="Grade level"
              options={gradeOptions}
              errors={errors}
            />
            <FormInput
              control={control}
              name="section"
              label="Section"
              textType="text"
              error={errors.section}
            />
            <FormInput
              control={control}
              name="parentName1"
              label="Parent Name"
              textType="text"
              error={errors.parentName1}
            />
            <CustomPhoneNumberField
              name="parentContact1"
              control={control}
              label="Parent Contact"
              maxLength={10}
              adornment="+63"
              placeholder="995 215 5436"
              errors={errors}
            />
            <FormInput
              control={control}
              name="parentName2"
              label="Parent Name2 (Optional)"
              textType="text"
            />
            <CustomPhoneNumberField
              name="parentContact2"
              control={control}
              label="Parent Contact2 (Optional)"
              maxLength={10}
              adornment="+63"
              placeholder="995 215 5436"
              errors={errors}
            />
            <FormInput
              control={control}
              name="address"
              label="Address"
              textType="combine"
              error={errors.address}
              multiline
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              {selectedStudent ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

StudentProfileForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  addNewStudent: PropTypes.func.isRequired,
  selectedStudent: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
};

export default StudentProfileForm;
