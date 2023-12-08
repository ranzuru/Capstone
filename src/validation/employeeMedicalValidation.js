import * as yup from 'yup';

const employeeMedicalValidation = yup.object().shape({
  dateOfExamination: yup.date().required('Date of Examination is required'),
  employeeId: yup.string().required('Employee ID is required'),
  lastName: yup.string().required('Last Name is required'),
  firstName: yup.string().required('First Name is required'),
  middleName: yup.string(),
  nameExtension: yup.string(),
  gender: yup.string().required('Gender is required'),
  dateOfBirth: yup.date().required('Date of Birth is required'),
  age: yup.number().integer().required('Age is required'),
  schoolYear: yup.string().required('School Year is required'),
  role: yup.string().required('Role is required'),
  weightKg: yup.number().required('Weight (Kg) is required'),
  heightCm: yup.number().required('Height (Cm) is required'),
  temperature: yup.number().required('Temperature is required'),
  bloodPressure: yup.string().required('Blood Pressure is required'),
  heartRate: yup.number().required('Heart Rate is required'),
  pulseRate: yup.number().required('Pulse Rate is required'),
  respiratoryRate: yup.number().required('Respiratory Rate is required'),
  visionScreening: yup.string().required('Vision Screening is required'),
  auditoryScreening: yup.string().required('Auditory Screening is required'),
  skinScreening: yup.string().required('Skin Screening is required'),
  scalpScreening: yup.string().required('Scalp Screening is required'),
  eyesScreening: yup.string().required('Eyes Screening is required'),
  earScreening: yup.string().required('Ear Screening is required'),
  noseScreening: yup.string().required('Nose Screening is required'),
  mouthScreening: yup.string().required('Mouth Screening is required'),
  throatScreening: yup.string().required('Throat Screening is required'),
  neckScreening: yup.string().required('Neck Screening is required'),
  lungScreening: yup.string().required('Lung Screening is required'),
  heartScreening: yup.string().required('Heart Screening is required'),
  abdomen: yup.string().required('Abdomen is required'),
  deformities: yup.string().required('Deformities is required'),
  remarks: yup.string(),
  status: yup
    .string()
    .oneOf(['Active', 'Archived', 'Inactive'])
    .default('Active'),
});

export default employeeMedicalValidation;
