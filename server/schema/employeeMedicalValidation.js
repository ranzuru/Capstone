import Joi from 'joi';

const employeeMedicalValidationSchema = Joi.object({
  dateOfExamination: Joi.date().required(),
  employeeId: Joi.string().required(),
  lastName: Joi.string().required(),
  firstName: Joi.string().required(),
  middleName: Joi.string().allow('', null),
  nameExtension: Joi.string().allow('', null),
  gender: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  age: Joi.number().integer().required(),
  schoolYear: Joi.string().required(),
  role: Joi.string().required(),
  weightKg: Joi.number().required(),
  heightCm: Joi.number().required(),
  temperature: Joi.number().required(),
  bloodPressure: Joi.string().required(),
  heartRate: Joi.number().required(),
  pulseRate: Joi.number().required(),
  respiratoryRate: Joi.number().required(),
  visionScreening: Joi.string().required(),
  auditoryScreening: Joi.string().required(),
  skinScreening: Joi.string().required(),
  scalpScreening: Joi.string().required(),
  eyesScreening: Joi.string().required(),
  earScreening: Joi.string().required(),
  noseScreening: Joi.string().required(),
  mouthScreening: Joi.string().required(),
  throatScreening: Joi.string().required(),
  neckScreening: Joi.string().required(),
  lungScreening: Joi.string().required(),
  heartScreening: Joi.string().required(),
  abdomen: Joi.string().required(),
  deformities: Joi.string().required(),
  remarks: Joi.string().allow('', null),
  status: Joi.string()
    .valid('Active', 'Archived', 'Inactive')
    .default('Active'),
});

export const validateEmployeeMedical = (data) => {
  return employeeMedicalValidationSchema.validate(data, { abortEarly: false });
};

const headerMappings = {
  'Date of Examination': 'dateOfExamination',
  'Employee ID': 'employeeId',
  'Last Name': 'lastName',
  'First Name': 'firstName',
  'Middle Name': 'middleName',
  'Name Extension': 'nameExtension',
  Gender: 'gender',
  'Date of Birth': 'dateOfBirth',
  Age: 'age',
  'School Year': 'schoolYear',
  Role: 'role',
  'Weight (Kg)': 'weightKg',
  'Height (Cm)': 'heightCm',
  Temperature: 'temperature',
  'Blood Pressure': 'bloodPressure',
  'Heart Rate': 'heartRate',
  'Pulse Rate': 'pulseRate',
  'Respiratory Rate': 'respiratoryRate',
  'Vision Screening': 'visionScreening',
  'Auditory Screening': 'auditoryScreening',
  'Skin Screening': 'skinScreening',
  'Scalp Screening': 'scalpScreening',
  'Eyes Screening': 'eyesScreening',
  'Ear Screening': 'earScreening',
  'Nose Screening': 'noseScreening',
  'Mouth Screening': 'mouthScreening',
  'Throat Screening': 'throatScreening',
  'Neck Screening': 'neckScreening',
  'Lung Screening': 'lungScreening',
  'Heart Screening': 'heartScreening',
  Abdomen: 'abdomen',
  Deformities: 'deformities',
  Remarks: 'remarks',
  Status: 'status',
};

export const mapHeaderToSchemaKey = (header) => {
  return headerMappings[header] || header;
};
