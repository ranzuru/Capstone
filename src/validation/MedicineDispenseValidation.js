import * as Yup from 'yup';

const Validation = Yup.object().shape({
  itemId: Yup.string().required('Item ID is required'),
  batchId: Yup.string().required('Batch ID is required'),
  quantity: Yup.number().integer().required('Quantity is required'),
  reason: Yup.string().required('Reason/s is required'),
});

export default Validation;
