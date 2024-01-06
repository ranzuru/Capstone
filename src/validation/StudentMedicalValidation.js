import * as Yup from 'yup';

const studentMedicalValidation = Yup.object().shape({
  dateOfExamination: Yup.date().required('Date of Examination is required'),
  lrn: Yup.string().required('LRN is required'),
  lastName: Yup.string().required('Last Name is required'),
  firstName: Yup.string().required('First Name is required'),
  middleName: Yup.string(),
  nameExtension: Yup.string(),
  gender: Yup.string().required('Gender is required'),
  dateOfBirth: Yup.date().required('Date of Birth is required'),
  age: Yup.number().required('Age is required'),
  schoolYear: Yup.string().required('School Year is required'),
  grade: Yup.string().required('Grade is required'),
  section: Yup.string().required('Section is required'),
  is4p: Yup.boolean().required('4P status is required'),
  weightKg: Yup.number().required('Weight (kg) is required'),
  heightCm: Yup.number().required('Height (cm) is required'),
  bmi: Yup.number().required('BMI is required'),
  bmiClassification: Yup.string().required('BMI Classification is required'),
  heightForAge: Yup.string().required('Height for Age is required'),
  temperature: Yup.number().required('Temperature is required'),
  bloodPressure: Yup.string().required('Blood Pressure is required'),
  heartRate: Yup.number().required('Heart Rate is required'),
  pulseRate: Yup.number().required('Pulse Rate is required'),
  respiratoryRate: Yup.number().required('Respiratory Rate is required'),
  visionScreening: Yup.string().required('Vision Screening is required'),
  auditoryScreening: Yup.string().required('Auditory Screening is required'),
  skinScreening: Yup.string().required('Skin Screening is required'),
  scalpScreening: Yup.string().required('Scalp Screening is required'),
  eyesScreening: Yup.string().required('Eyes Screening is required'),
  earScreening: Yup.string().required('Ear Screening is required'),
  noseScreening: Yup.string().required('Nose Screening is required'),
  mouthScreening: Yup.string().required('Mouth Screening is required'),
  throatScreening: Yup.string().required('Throat Screening is required'),
  neckScreening: Yup.string().required('Neck Screening is required'),
  lungScreening: Yup.string().required('Lung Screening is required'),
  heartScreening: Yup.string().required('Heart Screening is required'),
  abdomen: Yup.string().required('Abdomen is required'),
  deformities: Yup.string().required('Deformities is required'),
  ironSupplementation: Yup.boolean().required(
    'Iron Supplementation status is required'
  ),
  deworming: Yup.boolean().required('Deworming status is required'),
  menarche: Yup.string(),
  remarks: Yup.string(),
  status: Yup.string()
    .oneOf(['Active', 'Archived', 'Inactive'])
    .default('Active'),
});

export default studentMedicalValidation;
