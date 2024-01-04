// import
import StudentMedical from '../models/StudentMedical.js';
import AcademicYear from '../models/AcademicYear.js';
import parseExcelToJson from '../utils/importDataToExcel.js';
import {
  validateStudentMedical,
  mapHeaderToSchemaKey,
} from '../schema/studentMedicalValidation.js';
import { createLog } from '../controller/createLogController.js';
import { currentUserId } from '../auth/authenticateMiddleware.js';

const importStudentMedical = async (fileBuffer) => {
  const data = await parseExcelToJson(fileBuffer, mapHeaderToSchemaKey);

  const studentMedicalRecords = [];
  const errors = [];

  for (let rowData of data) {
    rowData.lrn = rowData.lrn != null ? String(rowData.lrn) : rowData.lrn;
    rowData.bloodPressure =
      rowData.bloodPressure != null
        ? String(rowData.bloodPressure)
        : rowData.bloodPressure;
    if (rowData.is4p) rowData.is4p = rowData.is4p.toLowerCase() === 'yes';
    if (rowData.ironSupplementation)
      rowData.ironSupplementation =
        rowData.ironSupplementation.toLowerCase() === 'yes';
    if (rowData.deworming)
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

      // LOG
    await createLog({
      user: `${currentUserId}`,
      section: 'Student Medical',
      action: 'IMPORT',
      description: JSON.stringify(value),
    });

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
      if (dbError.name === 'BulkWriteError') {
        dbError.writeErrors.forEach((writeError) => {
          const errorField = writeError.err.keyPattern; // This will indicate which field caused the error
          const errorValue = writeError.err.op;
          errors.push({
            lrn: errorValue.lrn || 'Unknown LRN',
            errors: [`Duplicate entry for ${errorField}`],
          });
        });
      } else {
        console.error('Unexpected DB error:', dbError);
        errors.push({
          lrn: 'Unknown LRN',
          errors: ['Unexpected DB error.'],
        });
      }
    }
  }

  const displayedErrors = errors.slice(0, 5);
  const hasMoreErrors = errors.length > 5;
  return { studentMedicalRecords, errors: displayedErrors, hasMoreErrors };
};

export default importStudentMedical;
