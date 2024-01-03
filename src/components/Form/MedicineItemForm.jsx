// react
import { useState, useEffect, useRef } from 'react';
// RHF
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// props
import PropTypes from 'prop-types';
// custom
import CustomSnackbar from '../../custom/CustomSnackbar';
import FormInput from '../../custom/CustomIdTextField';
import FormSelect from '../../custom/CustomSelect';

// yup
import Validation from '../../validation/MedicineItemValidation.js';
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
import {
  statusOptions,
} from '../../others/dropDownOptions';


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
    product: '',
    quantity: 0,
    dosagePer: '300ml',
    description: '',
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

  // console.log(errors) 

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
        '/medicineInventory/postItem',
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
      handleError(error, 'adding record');
    }
  };

  const handleUpdateRecord = async (itemId, updatedData) => {
    try {
      const response = await axiosInstance.put(
        `/medicineInventory/updateItem/${itemId}`,
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

  useEffect(() => {
    if (selectedRecord) {
      // Regular fields
      const fields = [
        'product',
        'quantity',
        'dosagePer',
        'description',
        'status',
      ];

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
          {selectedRecord ? 'Edit Record' : 'Add Record'}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleSaveOrUpdate)}>
          <DialogContent>
            <DialogContentText>Enter record details:</DialogContentText>
            <Divider />
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <FormInput
                  control={control}
                  name="product"
                  label="Product"
                  textType="text"
                  error={errors.product}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <FormInput
                  control={control}
                  name="quantity"
                  label="Quantity"
                  textType="number"
                  error={errors.quantity}
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12} md={7}>
                <FormInput
                  control={control}
                  name="dosagePer"
                  label="Dosage (Each/ Per)"
                  textType="text"
                  error={errors.dosagePer}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
                <FormInput
                  control={control}
                  name="description"
                  label="Description"
                  textType="text"
                  error={errors.description}
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
