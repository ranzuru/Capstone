import * as Yup from 'yup';

const EmployeeValidation = Yup.object().shape({
  employeeId: Yup.string().required('Employee ID is required'),
  lastName: Yup.string().required('Last name is required'),
  firstName: Yup.string().required('First name is required'),
  middleName: Yup.string().nullable(),
  nameExtension: Yup.string().nullable(),
  gender: Yup.string().required('Gender is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  age: Yup.number().integer().required('Age is required'),
  schoolYear: Yup.string().required('School year is required'),
  email: Yup.string().email('Invalid email format').nullable(),
  mobileNumber: Yup.string().required('Mobile number is required'),
  role: Yup.string().required('Role is required'),
  address: Yup.string().required('Address is required'),
});

export default EmployeeValidation;
