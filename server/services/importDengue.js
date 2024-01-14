import DengueMonitoring from '../models/DengueMonitoring.js';
import AcademicYear from '../models/AcademicYear.js';
import parseExcelToJson from '../utils/importDataToExcel.js';
import {
  validateDengue,
  mapHeaderToSchemaKey,
} from '../schema/dengueMonitoringValidation.js';

const importDengue = async (fileBuffer) => {
  const data = await parseExcelToJson(fileBuffer, mapHeaderToSchemaKey);

  const dengueRecords = [];
  const errors = [];

  for (let rowData of data) {
    rowData.lrn = rowData.lrn ? String(rowData.lrn) : null;
    try {
      const { value, error } = validateDengue(rowData, { abortEarly: false });
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

      dengueRecords.push(value);
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

  if (dengueRecords.length > 0) {
    try {
      await DengueMonitoring.insertMany(dengueRecords, { ordered: false });
    } catch (dbError) {
      if (dbError.name === 'BulkWriteError') {
        dbError.writeErrors.forEach((writeError) => {
          const errorField = writeError.err.keyPattern; // This will indicate which field caused the error
          const errorValue = writeError.err.op;
          let message = 'Duplicate record found with conflicting unique keys.';

          if (errorField.lrn && errorField.academicYear) {
            message = `Duplicate record found for LRN '${errorValue.lrn}' in Academic Year '${errorValue.academicYear}'.`;
          }

          errors.push({ lrn: errorValue.lrn, message });
        });
      } else {
        console.error('Database error:', dbError);
        errors.push({
          message: 'A database error occurred during the import process.',
        });
      }
    }
  }

  const displayedErrors = errors.slice(0, 5);
  const hasMoreErrors = errors.length > 5;
  return { dengueRecords, errors: displayedErrors, hasMoreErrors };
};

export default importDengue;
