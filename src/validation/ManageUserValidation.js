import * as yup from 'yup';

const userValidationSchema = (isCreatingUser = true) =>
  yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    gender: yup.string().required('Gender is required'),
    email: yup
      .string()
      .email('Invalid email format')
      .required('Email is required'),
    phoneNumber: yup.string().required('Phone number is required'),
    password: isCreatingUser
      ? yup
          .string()
          .min(6, 'Must be at least 6 characters')
          .required('Password is required')
      : yup.string().notRequired(),
    confirmPassword: isCreatingUser
      ? yup
          .string()
          .oneOf([yup.ref('password'), null], 'Passwords must match')
          .required('Confirm Password is required')
      : yup.string().notRequired(),
    roleName: yup.string().required('Role is required'),
  });

export default userValidationSchema;
