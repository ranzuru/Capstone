import * as yup from 'yup';

const StudentProfileValidation = yup.object().shape({
  lrn: yup.string().required('LRN is required'),
  lastName: yup.string().required('Last name is required'),
  firstName: yup.string().required('First name is required'),
  middleName: yup.string().nullable(),
  nameExtension: yup.string().nullable(),
  gender: yup
    .string()
    .required('Gender is required')
    .oneOf(['Male', 'Female', 'Other']),
  dateOfBirth: yup.date().required('Birth date is required'),
  age: yup.number().required('Age is required').positive().integer(),
  schoolYear: yup.string().required('Academic Year is required'),
  grade: yup.string().required('Grade is required'),
  section: yup.string().required('Section is required'),
  is4p: yup.bool().required('4P status is required'),
  parentName1: yup.string().required('First parent name is required'),
  parentContact1: yup.string().required('First parent contact is required'),
  parentName2: yup.string().nullable(),
  parentContact2: yup.string().nullable(),
  address: yup.string().required('Address is required'),
});

export default StudentProfileValidation;
