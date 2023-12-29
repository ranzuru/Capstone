import * as Yup from 'yup';

const Validation = Yup.object().shape({
  itemId: Yup.string().required('Item ID is required'),
  batchId: Yup.string().required('Batch ID is required'),
  receiptId: Yup.string().required('Receipt ID is required'),
  expirationDate: Yup.date().required('Expiration Date is required'),
  quantity: Yup.number().integer().required('Quantity is required'),
  notes: Yup.string().nullable(),
});

export default Validation;
