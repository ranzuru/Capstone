// import
import StudentMedical from '../models/StudentMedical.js';
import AcademicYear from '../models/AcademicYear.js';
import parseExcelToJson from '../utils/importDataToExcel.js';
import {
  validateStudentMedical,
  mapHeaderToSchemaKey,
} from '../schema/studentMedicalValidation.js';

const importStudentMedical = async (fileBuffer) => {
  const data = await parseExcelToJson(fileBuffer, mapHeaderToSchemaKey);

  const studentMedicalRecords = [];
  const errors = [];

  for (let rowData of data) {
    rowData.lrn = rowData.lrn ? String(rowData.lrn) : null;
    rowData.bloodPressure = rowData.bloodPressure
      ? String(rowData.bloodPressure)
      : null;

    rowData.is4p = rowData.is4p.toLowerCase() === 'yes';
    rowData.ironSupplementation =
      rowData.ironSupplementation.toLowerCase() === 'yes';
    rowData.deworming = rowData.deworming.toLowerCase() === 'yes';

    try {
      const { value, error } = validateStudentMedical(rowData, {
        abortEarly: false,
      });
      if (error) throw error;

      const academicYear = await AcademicYear.findOne({
        schoolYear: value.schoolYear,
      });
      if (!academicYear) {
        errors.push({
          lrn: value.lrn,
          errors: ['Invalid academic year.'],
        });
        continue;
      }
      value.academicYear = academicYear._id;

      studentMedicalRecords.push(value);
    } catch (validationError) {
      if (validationError.details && Array.isArray(validationError.details)) {
        errors.push({
          lrn: rowData.lrn || 'Unknown LRN',
          errors: validationError.details.map((detail) => detail.message),
        });
      } else {
        console.error(
          'Unexpected validation error structure:',
          validationError
        );
        errors.push({
          lrn: rowData.lrn || 'Unknown LRN',
          errors: ['Unexpected validation error.'],
        });
      }
    }
  }

  if (studentMedicalRecords.length > 0) {
    try {
      await StudentMedical.insertMany(studentMedicalRecords, {
        ordered: false,
      });
    } catch (dbError) {
      if (dbError.name === 'BulkWriteError' && dbError.writeErrors) {
        dbError.writeErrors.forEach((writeError) => {
          const errMsg = writeError.errmsg || writeError.err.message;
          // Extract the duplicate key error details
          if (writeError.code === 11000) {
            const keyValueMatch = errMsg.match(/dup key: { : "(.+)" }/);
            const keyValue = keyValueMatch ? keyValueMatch[1] : 'unknown';
            errors.push(`Duplicate key error for value ${keyValue}`);
          } else {
            errors.push(`Write error: ${errMsg}`);
          }
        });
      } else {
        errors.push(`Non-bulk write error: ${dbError.message}`);
      }
    }
  }

  const displayedErrors = errors.slice(0, 5);
  const hasMoreErrors = errors.length > 5;
  return { studentMedicalRecords, errors: displayedErrors, hasMoreErrors };
};

export default importStudentMedical;
