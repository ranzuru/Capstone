import { useState, useEffect } from 'react';
// axios-instance import
import axiosInstance from '../../config/axios-instance.js';
// MUI imports
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
// Yup & RHF imports
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// others import
import PropTypes from 'prop-types';
import { monthOptions, schoolYearOptions } from '../../others/dropDownOptions';
import FormSelect from '../../custom/CustomSelect';
import AcademicYearValidation from '../../validation/AcademicYearValidation';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 3 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const AcademicYearForm = (props) => {
  const {
    open,
    onClose,
    initialData,
    addNewAcademicYear,
    selectedAcademicYear,
    onUpdate,
  } = props;
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

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      schoolYear: '',
      monthFrom: '',
      monthTo: '',
    },
    resolver: yupResolver(AcademicYearValidation),
  });

  const handleError = (error, context = 'operation') => {
    console.error(`An error occurred during ${context}:, error`);
    if (error.response && error.response.data && error.response.data.error) {
      showSnackbar(error.response.data.error, 'error');
    } else {
      showSnackbar(`An error occurred during ${context}`, 'error');
    }
  };

  const handleCreateAcademicYear = async (data) => {
    try {
      const response = await axiosInstance.post('/academicYear/create', data);
      if (response.data && response.data._id) {
        addNewAcademicYear(response.data);
        showSnackbar('Successfully added academic year', 'success');
        handleClose();
      } else {
        showSnackbar('Operation failed', 'error');
      }
    } catch (error) {
      console.error('An error occurred during adding academic year:', error);
      handleError(error, 'adding Academic Year');
    }
  };

  const handleEditAcademicYear = async (id, data) => {
    try {
      const response = await axiosInstance.put(
        `/academicYear/update/${id}`,
        data
      );

      if (response.data) {
        onUpdate(response.data);
        showSnackbar('Successfully updated academic year', 'success');
        handleClose();
      } else {
        showSnackbar('Operation failed', 'error');
      }
    } catch (error) {
      console.error('An error occurred during updating academic year:', error);
      handleError(error, 'updating Academic Year');
    }
  };

  const handleSaveOrUpdate = async (data) => {
    try {
      if (selectedAcademicYear && selectedAcademicYear.id) {
        await handleEditAcademicYear(selectedAcademicYear.id, data);
      } else {
        await handleCreateAcademicYear(data);
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
    if (selectedAcademicYear) {
      const keys = ['schoolYear', 'monthFrom', 'monthTo'];
      keys.forEach((key) => setValue(key, selectedAcademicYear[key] || ''));
    }
  }, [selectedAcademicYear, setValue]);

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarData.severity}>
          {snackbarData.message}
        </Alert>
      </Snackbar>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>
          {selectedAcademicYear ? 'Edit Academic Year' : 'Add Academic Year'}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleSaveOrUpdate)}>
          <DialogContent>
            <DialogContentText>Enter academic year details:</DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormSelect
                  control={control}
                  name="schoolYear"
                  label="Academic Year"
                  options={schoolYearOptions}
                  errors={errors}
                  MenuProps={MenuProps}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormSelect
                  control={control}
                  name="monthFrom"
                  label="Month From"
                  options={monthOptions}
                  errors={errors}
                  MenuProps={MenuProps}
                />
              </Grid>
              <Grid item xs={6}>
                <FormSelect
                  control={control}
                  name="monthTo"
                  label="Month To"
                  options={monthOptions}
                  errors={errors}
                  MenuProps={MenuProps}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              {selectedAcademicYear ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

AcademicYearForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  addNewAcademicYear: PropTypes.func.isRequired,
  selectedAcademicYear: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
};

export default AcademicYearForm;
