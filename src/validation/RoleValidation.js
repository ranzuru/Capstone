import * as yup from 'yup';

const RoleValidation = yup.object().shape({
  roleName: yup.string().required('Role Name is required'),
  description: yup.string(),
  navigationScopes: yup
    .array()
    .of(yup.string())
    .required('Navigation scopes are required'),
});

export default RoleValidation;
