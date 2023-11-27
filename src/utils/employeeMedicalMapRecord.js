const mapRecord = (record) => {
  const academicYear = record.academicYear || {};

  const formattedName = `${record.lastName || ''}, ${record.firstName || ''}${
    record.middleName ? ` ${record.middleName.charAt(0)}.` : ''
  }${record.nameExtension ? ` ${record.nameExtension}` : ''}`.trim();

  return {
    id: record._id,
    dateOfExamination: record.dateOfExamination || 'N/A',
    employeeId: record.employeeId || 'N/A',
    firstName: record.firstName || 'N/A',
    middleName: record.middleName || '',
    lastName: record.lastName || 'N/A',
    nameExtension: record.nameExtension || '',
    name: formattedName,
    schoolYear: academicYear.schoolYear || 'N/A',
    role: record.role || 'N/A',
    gender: record.gender || 'N/A',
    dateOfBirth: record.dateOfBirth || 'N/A',
    age: record.age || 'N/A',
    heightCm: record.heightCm || 'N/A',
    weightKg: record.weightKg || 'N/A',
    temperature: record.temperature || 'N/A',
    pulseRate: record.pulseRate || 'N/A',
    bloodPressure: record.bloodPressure || 'N/A',
    heartRate: record.heartRate || 'N/A',
    respiratoryRate: record.respiratoryRate || 'N/A',
    visionScreening: record.visionScreening || 'N/A',
    auditoryScreening: record.auditoryScreening || 'N/A',
    scalpScreening: record.scalpScreening || 'N/A',
    skinScreening: record.skinScreening || 'N/A',
    eyesScreening: record.eyesScreening || 'N/A',
    earScreening: record.earScreening || 'N/A',
    noseScreening: record.noseScreening || 'N/A',
    mouthScreening: record.mouthScreening || 'N/A',
    neckScreening: record.neckScreening || 'N/A',
    throatScreening: record.throatScreening || 'N/A',
    lungScreening: record.lungScreening || 'N/A',
    heartScreening: record.heartScreening || 'N/A',
    abdomen: record.abdomen || 'N/A',
    deformities: record.deformities || 'N/A',
    remarks: record.remarks || 'N/A',
    status: record.status || 'N/A',
  };
};

export default mapRecord;
