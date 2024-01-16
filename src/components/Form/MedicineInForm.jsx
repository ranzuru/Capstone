// react
import { useState, useEffect, useRef } from 'react';
// RHF
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// props
import PropTypes from 'prop-types';
// custom
import CustomSnackbar from '../../custom/CustomSnackbar';
import FormInput from '../../custom/CustomIdTextField2';
import FormSelect from '../../custom/CustomSelect';
import CustomDatePicker from '../../custom/CustomDatePicker';

// yup
import Validation from '../../validation/MedicineInValidation.js';
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
  statusOptions,
} from '../../others/dropDownOptions';
import AutoComplete from '../MedicineItemAutoComplete.jsx';

const Form = (props) => {
  const { open, onClose, initialData, addNewRecord, selectedRecord, onUpdate, } =
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
    receiptId: '',
    expirationDate: null,
    quantity: 1,
    notes: '',
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

  // console.log(errors);

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
      const responseIn = await axiosInstance.post(
        '/medicineInventory/postIn',
        data
      );

      if (responseIn.data && responseIn.data._id) {
        addNewRecord(responseIn.data);
        showSnackbar('Successfully added new record', 'success');
        handleClose();
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
        `/medicineInventory/updateIn/${id}`,
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

  const handleMedicineSelect = (data) => {
    if (!data) {
      reset(); // This assumes you've defined the default values at useForm hook initialization
      return;
    }
    setValue('itemId', data.itemId);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (selectedRecord) {
      // Regular fields
      const fields = [
        'itemId',
        'batchId',
        'receiptId',
        'expirationDate',
        'quantity',
        'notes',
        'status',
      ];

      fields.forEach((field) => {
        setValue(field, selectedRecord[field] || '');
      });

      // Date fields
      const dateFields = [
        'expirationDate',
      ];

      dateFields.forEach((field) => {
        const dateValue = selectedRecord[field]
          ? parseISO(selectedRecord[field])
          : null;
        setValue(field, dateValue);
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
          {selectedRecord ? 'Edit Record' : 'Add Record'}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleSaveOrUpdate) }>
          <DialogContent>
            <DialogContentText>Enter record details:</DialogContentText>
            <Divider />
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <AutoComplete onSelect={handleMedicineSelect} displayBatchOnly={false}/>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <FormInput
                  control={control}
                  name="itemId"
                  label="Item ID"
                  textType="text"
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
                  textType="text"
                  error={errors.batchId}
                  disabled={selectedRecord !== null}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <FormInput
                  control={control}
                  name="receiptId"
                  label="Receipt ID"
                  textType="text"
                  error={errors.receiptId}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <CustomDatePicker
                  control={control}
                  name="expirationDate"
                  label="Expiration Date"
                />
              </Grid>
              <Grid item xs={12} md={5}>
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
                  name="notes"
                  label="Notes/s"
                  textType="text"
                  error={errors.notes}
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
