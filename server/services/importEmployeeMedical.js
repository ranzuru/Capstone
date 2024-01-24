// import
import EmployeeMedical from '../models/EmployeeMedical.js';
import AcademicYear from '../models/AcademicYear.js';
import parseExcelToJson from '../utils/importDataToExcel.js';
import {
  validateEmployeeMedical,
  mapHeaderToSchemaKey,
} from '../schema/employeeMedicalValidation.js';

const importEmployeeMedical = async (fileBuffer) => {
  const data = await parseExcelToJson(fileBuffer, mapHeaderToSchemaKey);

  const employeeMedicalRecords = [];
  const errors = [];

  for (let rowData of data) {
    rowData.employeeId = rowData.employeeId ? String(rowData.employeeId) : null;
    rowData.bloodPressure = rowData.bloodPressure
      ? String(rowData.bloodPressure)
      : null;
    try {
      const { value, error } = validateEmployeeMedical(rowData, {
        abortEarly: false,
      });
      if (error) throw error;

      const academicYear = await AcademicYear.findOne({
        schoolYear: value.schoolYear,
      });
      if (!academicYear) {
        errors.push({
          employeeId: value.employeeId,
          errors: ['Invalid academic year.'],
        });
        continue;
      }
      value.academicYear = academicYear._id;

      employeeMedicalRecords.push(value);
    } catch (validationError) {
      if (validationError.details && Array.isArray(validationError.details)) {
        errors.push({
          employeeId: rowData.employeeId || 'Unknown Employee Id',
          errors: validationError.details.map((detail) => detail.message),
        });
      } else {
        console.error(
          'Unexpected validation error structure:',
          validationError
        );
        errors.push({
          employeeId: rowData.employeeId || 'Unknown Employee Id',
          errors: ['Unexpected validation error.'],
        });
      }
    }
  }

  if (employeeMedicalRecords.length > 0) {
    try {
      await EmployeeMedical.insertMany(employeeMedicalRecords, {
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
  return { employeeMedicalRecords, errors: displayedErrors, hasMoreErrors };
};

export default importEmployeeMedical;
