import * as Yup from 'yup';

const Validation = Yup.object().shape({
  type: Yup.string().required('Type is required'),
  name: Yup.string().required('Name is required'),
  patientId: Yup.string().nullable(),
  gender: Yup.string().required('Gender is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  age: Yup.number().integer().required('Age is required'),
  schoolYear: Yup.string().required('School year is required'),
  grade: Yup.string().nullable(),
  section: Yup.string().nullable(),
  mobileNumber: Yup.string().required('Contact Number is required'),
  address: Yup.string().required('Address is required'),
  issueDate: Yup.date().required('Issue Date is required'),
  malady: Yup.string().required('Malady is required'),
  reason: Yup.string().required('Reason/s is required'),
  medicine: Yup.string().nullable(),
  quantity: Yup.number().integer().required('Quantity is required'),
  remarks: Yup.string().nullable(),
});

export default Validation;
