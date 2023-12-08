const mapRecord = (record) => {
  const academicYear = record.academicYear || {};

  const formattedName = `${record.lastName || ''}, ${record.firstName || ''}${
    record.middleName ? ` ${record.middleName.charAt(0)}` : ''
  }${record.nameExtension ? ` ${record.nameExtension}` : ''}`.trim();

  return {
    id: record._id,
    dateMeasured: record.dateMeasured || 'N/A',
    lrn: record.lrn || 'N/A',
    firstName: record.firstName || 'N/A',
    middleName: record.middleName || '',
    lastName: record.lastName || 'N/A',
    nameExtension: record.nameExtension || '',
    name: formattedName,
    schoolYear: academicYear.schoolYear || 'N/A',
    grade: record.grade || 'N/A',
    section: record.section || 'N/A',
    gender: record.gender || 'N/A',
    dateOfBirth: record.dateOfBirth || 'N/A',
    age: record.age || 'N/A',
    heightCm: record.heightCm || 'N/A',
    weightKg: record.weightKg || 'N/A',
    bmi: record.bmi || 'N/A',
    bmiClassification: record.bmiClassification || 'N/A',
    heightForAge: record.heightForAge || 'N/A',
    measurementType: record.measurementType || 'N/A',
    beneficiaryOfSBFP:
      record.beneficiaryOfSBFP !== undefined ? record.beneficiaryOfSBFP : 'N/A',
    remarks: record.remarks || '',
    status: record.status || 'N/A',
  };
};

export default mapRecord;
