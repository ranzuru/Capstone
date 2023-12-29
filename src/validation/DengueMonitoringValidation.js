import * as Yup from 'yup';

const DengueValidation = Yup.object().shape({
  lrn: Yup.string().required('LRN is required'),
  lastName: Yup.string().required('Last name is required'),
  firstName: Yup.string().required('First name is required'),
  middleName: Yup.string().nullable(),
  nameExtension: Yup.string().nullable(),
  gender: Yup.string().required('Gender is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  age: Yup.number().integer().required('Age is required'),
  schoolYear: Yup.string().required('School year is required'),
  grade: Yup.string().required('Grade is required'),
  section: Yup.string().required('Section is required'),
  adviser: Yup.string().required('Adviser is required'),
  dateOfOnset: Yup.date().required('Date of onset is required'),
  dateOfAdmission: Yup.date().nullable(),
  hospitalAdmission: Yup.string().nullable(),
  dateOfDischarge: Yup.date().nullable(),
  address: Yup.string().required('Address is required'),
  remarks: Yup.string().nullable(),
});

export default DengueValidation;
