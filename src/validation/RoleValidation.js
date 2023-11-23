import * as yup from 'yup';

const RoleValidation = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string(),
  navigationScopes: yup
    .array()
    .of(yup.string())
    .required('Navigation scopes are required'),
});

export default RoleValidation;
