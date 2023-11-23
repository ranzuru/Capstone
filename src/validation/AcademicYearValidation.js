import * as yup from 'yup';

const AcademicYearValidation = yup.object().shape({
  schoolYear: yup.string().required('School Year is required'),
  monthFrom: yup.string().required('Month From is required'),
  monthTo: yup.string().required('Month To is required'),
});

export default AcademicYearValidation;
