import Joi from 'joi';

const feedingProgramSchema = Joi.object({
  dateMeasured: Joi.date().required(),
  lrn: Joi.string().required(),
  lastName: Joi.string().required(),
  firstName: Joi.string().required(),
  middleName: Joi.string().allow('').default(''),
  nameExtension: Joi.string().allow('').default(''),
  gender: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  age: Joi.number().required(),
  schoolYear: Joi.string().required(),
  grade: Joi.string().required(),
  section: Joi.string().required(),
  weightKg: Joi.number().required(),
  heightCm: Joi.number().required(),
  bmi: Joi.number().required(),
  bmiClassification: Joi.string().required(),
  heightForAge: Joi.string().required(),
  beneficiaryOfSBFP: Joi.boolean().required(),
  measurementType: Joi.string().valid('PRE', 'POST').required(),
  remarks: Joi.string().allow('', null),
  status: Joi.string()
    .valid('Active', 'Archived', 'Inactive')
    .default('Active'),
});

export const validateFeeding = (data) => {
  return feedingProgramSchema.validate(data, { abortEarly: false });
};

const headerMappings = {
  'Date Measured': 'dateMeasured',
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
  'Weight (kg)': 'weightKg',
  'Height (cm)': 'heightCm',
  BMI: 'bmi',
  'BMI Classification': 'bmiClassification',
  'Height for Age': 'heightForAge',
  'Beneficiary of SBFP': 'beneficiaryOfSBFP',
  'Measurement Type': 'measurementType',
  Remarks: 'remarks',
  Status: 'status',
};

export const mapHeaderToSchemaKey = (header) => {
  return headerMappings[header] || header;
};
