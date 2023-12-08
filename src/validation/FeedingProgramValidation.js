import * as yup from 'yup';

const feedingProgramValidation = yup.object().shape({
  dateMeasured: yup.date().required('Date measured is required'),
  lrn: yup.string().required('LRN is required'),
  lastName: yup.string().required('Last name is required'),
  firstName: yup.string().required('First name is required'),
  middleName: yup.string().default(''),
  nameExtension: yup.string().default(''),
  gender: yup.string().required('Gender is required'),
  dateOfBirth: yup.date().required('Date of birth is required'),
  age: yup.number().required('Age is required'),
  schoolYear: yup.string().required('School year is required'),
  grade: yup.string().required('Grade is required'),
  section: yup.string().required('Section is required'),
  weightKg: yup.number().required('Weight (kg) is required'),
  heightCm: yup.number().required('Height (cm) is required'),
  bmi: yup.number().required('BMI is required'),
  bmiClassification: yup.string().required('BMI classification is required'),
  heightForAge: yup.string().required('Height for age is required'),
  beneficiaryOfSBFP: yup.boolean().required('Beneficiary of SBFP is required'),
  measurementType: yup
    .string()
    .oneOf(['PRE', 'POST'], 'Invalid measurement type')
    .required('Measurement type is required'),
  remarks: yup.string(),
  status: yup
    .string()
    .oneOf(['Active', 'Archived', 'Inactive'], 'Invalid status')
    .default('Active'),
});

export default feedingProgramValidation;
