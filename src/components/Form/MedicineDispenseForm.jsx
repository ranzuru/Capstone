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

// yup
import Validation from '../../validation/MedicineDispenseValidation.js';
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
import { statusOptions } from '../../others/dropDownOptions';
import AutoComplete from '../MedicineAutoComplete.jsx';

const Form = (props) => {
  const { open, onClose, initialData, addNewRecord, selectedRecord, onUpdate } =
    props;
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

  const defaultValuesRef = useRef({
    itemId: '',
    batchId: '',
    quantity: 1,
    reason: '',
    status: 'Active',
  }).current;

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || defaultValuesRef,
    resolver: yupResolver(Validation),
  });

  useEffect(() => {
    reset({
      ...defaultValuesRef,
      ...initialData,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset, initialData]);

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
        '/medicineInventory/postDispense',
        data
      );
      if (response.data && response.data._id) {
        addNewRecord(response.data);
        showSnackbar('Successfully dispensed', 'success');
        handleClose();
      } else {
        showSnackbar('Operation failed', 'error');
      }
    } catch (error) {
      handleError(error, 'adding dispense');
    }
  };

  const handleUpdateRecord = async (id, updatedData) => {
    try {
      const response = await axiosInstance.put(
        `/medicineInventory/updateDispense/${id}`,
        updatedData
      );
      if (response.data) {
        onUpdate(response.data);
        showSnackbar('Dispense successfully updated', 'success');
        handleClose();
      } else {
        showSnackbar('Update operation failed', 'error');
      }
    } catch (error) {
      handleError(error, 'updating dispense');
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

  const handleMedicineSelect = (data) => {
    if (!data) {
      reset(); // This assumes you've defined the default values at useForm hook initialization
      return;
    }
    setValue('itemId', data.itemId);
    setValue('batchId', data.batchId);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (selectedRecord) {
      // Regular fields
      const fields = ['itemId', 'batchId', 'quantity', 'reason', 'status'];

      fields.forEach((field) => {
        setValue(field, selectedRecord[field] || '');
      });
    }
  }, [selectedRecord, setValue]);

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
        maxWidth="xs"
        className="overflow-auto"
      >
        <DialogTitle>
          {selectedRecord ? 'Edit Dispense' : 'Add Dispense'}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleSaveOrUpdate)}>
          <DialogContent>
            <DialogContentText>Enter Dispense details:</DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <AutoComplete onSelect={handleMedicineSelect} />
              </Grid>
            </Grid>
            <Divider />
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <FormInput
                  control={control}
                  name="itemId"
                  label="Item ID"
                  error={errors.itemId}
                  disabled={selectedRecord !== null}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <FormInput
                  control={control}
                  name="batchId"
                  label="Batch ID"
                  error={errors.batchId}
                  disabled={selectedRecord !== null}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <FormInput
                  control={control}
                  name="quantity"
                  label="Quantity"
                  textType="number"
                  error={errors.quantity}
                  disabled={selectedRecord !== null}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <FormInput
                  control={control}
                  name="reason"
                  label="Reason/s"
                  error={errors.reason}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
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
