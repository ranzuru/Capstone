// dropdownOptions.js

export const visionScreeningOptions = ['Normal', 'Failed'];
export const auditoryScreeningOptions = ['Normal', 'Failed'];
export const scalpScreeningOptions = ['Normal', 'Presence of Lice'];
export const skinScreeningOptions = [
  'Normal',
  'Redness of Skin',
  'White Spots',
  'Flaky Skin',
  'Impetigo/Boil',
  'Hematoma',
  'Bruises/Injuries',
  'Itchiness',
  'Skin Lesions',
  'Acne/Pimple',
];
export const eyesScreeningOptions = [
  'Normal',
  'Stye',
  'Eye Redness',
  'Ocular Misalignment',
  'Pale Conjunctive',
  'Eye Discharge',
  'Matted Eyelashes',
];
export const earScreeningOptions = [
  'Normal',
  'Ear Discharge',
  'Impacted Cerumen',
];
export const noseScreeningOptions = [
  'Normal',
  'Mucus Discharge',
  'Nose Bleeding',
];

export const mouthNeckThroatOptions = [
  'Normal',
  'Enlarged tonsils',
  'Presence of lesions',
  'Inflamed pharynx',
  'Enlarged lymphnodes',
];

export const lungsHeartOptions = [
  'Normal',
  'Rales',
  'Wheeze',
  'Murmur',
  'Irregular heart rate',
];

export const abdomenOptions = [
  'Normal',
  'Distended',
  'Abdominal Pain',
  'Tenderness',
  'Dysmenorrhea',
];

export const deformitiesOptions = ['Normal', 'Acquired', 'Congenital'];

export const ageMenarcheOptions = Array.from(
  { length: 7 },
  (_, i) => `${i + 10} years old`
);

export const monthOptions = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
].map((month) => ({ label: month, value: month }));

export const generateAcademicYearOptions = () => {
  const options = [];
  for (let year = 2021; year <= 2049; year++) {
    options.push({
      label: `${year}-${year + 1}`,
      value: `${year}-${year + 1}`,
    });
  }
  return options;
};

export const schoolYearOptions = generateAcademicYearOptions();

export const genderOption = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

export const typeOption = [
  { label: 'Student', value: 'Student' },
  { label: 'Faculty', value: 'Faculty' },
  { label: 'Other', value: 'Other' },
];

export const adjustmentTypeOption = [
  { label: 'Addition', value: 'Addition' },
  { label: 'Subtraction', value: 'Subtraction' },
];

export const nameExtensionOption = ['Jr.', 'Sr.', 'II', 'III', 'IV', 'V'].map(
  (ext) => ({ label: ext, value: ext })
);

export const gradeOptions = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
].map((grade) => ({ label: grade, value: grade }));

export const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Archived', value: 'Archived' },
];

export const employeeRolesOption = ['Teacher', 'Guidance'].map((empRoles) => ({
  label: empRoles,
  value: empRoles,
}));

export const measurementTypeOption = ['PRE', 'POST'].map((measType) => ({
  label: measType,
  value: measType,
}));

export const measurementTypeGraph = ['ALL', 'PRE', 'POST'].map((measType) => ({
  label: measType,
  value: measType,
}));

export const navigationItems = [
  { label: 'Dashboard', value: 'Dashboard' },
  { label: 'Users', value: 'Users' },
  { label: 'Roles', value: 'Roles' },
  { label: 'Academic Year', value: 'Academic Year' },
  { label: 'Clinic Records', value: 'Clinic Records' },
  { label: 'Medicine Inventory', value: 'Medicine Inventory' },
  { label: 'Events', value: 'Events' },
  { label: 'Profile', value: 'Profile' },
  { label: 'Programs', value: 'Programs' },
  { label: 'Analytics', value: 'Analytics' },
  { label: 'Logs', value: 'Logs' },
];
