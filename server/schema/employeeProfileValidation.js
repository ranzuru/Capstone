import Joi from 'joi';

const employeeProfileSchema = Joi.object({
  employeeId: Joi.string().required(),
  lastName: Joi.string().required(),
  firstName: Joi.string().required(),
  middleName: Joi.string().allow('', null), // Optional
  nameExtension: Joi.string().allow('', null), // Optional
  gender: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  age: Joi.number().integer().required(),
  schoolYear: Joi.string().required(),
  email: Joi.string().email().allow('', null),
  mobileNumber: Joi.number().required(),
  role: Joi.string().required(),
  address: Joi.string().required(),
  status: Joi.string().valid('Active', 'Archived', 'Inactive'),
});

export const validateEmployeeProfile = (data) => {
  return employeeProfileSchema.validate(data);
};

const headerMappings = {
  'Employee ID': 'employeeId',
  'Last Name': 'lastName',
  'First Name': 'firstName',
  'Middle Name': 'middleName',
  'Name Extension': 'nameExtension',
  Gender: 'gender',
  'Birth Date': 'dateOfBirth',
  Age: 'age',
  'School Year': 'schoolYear',
  Email: 'email',
  'Mobile Number': 'mobileNumber',
  Role: 'role',
  Address: 'address',
  Status: 'status',
};

export const mapHeaderToSchemaKey = (header) => {
  return headerMappings[header] || header;
};
