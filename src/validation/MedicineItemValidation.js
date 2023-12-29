import * as Yup from 'yup';

const Validation = Yup.object().shape({
  product: Yup.string().required('Product is required'),
  quantity: Yup.number().integer().nullable(),
  dosagePer: Yup.string().required('Dosage (Each/ Per) is required'),
  description: Yup.string().nullable(),
});

export default Validation;
