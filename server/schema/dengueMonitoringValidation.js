import Joi from 'joi';

const dengueMonitoringValidationSchema = Joi.object({
  lrn: Joi.string().required(),
  lastName: Joi.string().required(),
  firstName: Joi.string().required(),
  middleName: Joi.string().allow('', null),
  nameExtension: Joi.string().allow('', null),
  gender: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  age: Joi.number().integer().required(),
  schoolYear: Joi.string().required(),
  grade: Joi.string().required(),
  section: Joi.string().required(),
  adviser: Joi.string().required(),
  dateOfOnset: Joi.date().required(),
  dateOfAdmission: Joi.date().allow('', null),
  hospitalAdmission: Joi.string().allow('', null),
  dateOfDischarge: Joi.date().allow('', null),
  address: Joi.string().required(),
  status: Joi.string()
    .valid('Active', 'Archived', 'Inactive')
    .default('Active'),
  remarks: Joi.string().allow('', null),
});
export const validateDengue = (data) => {
  return dengueMonitoringValidationSchema.validate(data);
};

const headerMappings = {
  LRN: 'lrn',
  'Last Name': 'lastName',
  'First Name': 'firstName',
  'Middle Name': 'middleName',
  'Name Extension': 'nameExtension',
  Gender: 'gender',
  'Date of Birth': 'dateOfBirth',
  Age: 'age',
  'School Year': 'schoolYear',
  Grade: 'grade',
  Section: 'section',
  Adviser: 'adviser',
  'Date of Onset': 'dateOfOnset',
  'Date of Admission': 'dateOfAdmission',
  'Hospital Admission': 'hospitalAdmission',
  'Date of Discharge': 'dateOfDischarge',
  Address: 'address',
  Status: 'status',
  Remarks: 'remarks',
};

export const mapHeaderToSchemaKey = (header) => {
  return headerMappings[header] || header;
};
