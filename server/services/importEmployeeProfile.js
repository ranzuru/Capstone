import {
  validateEmployeeProfile,
  mapHeaderToSchemaKey,
} from '../schema/employeeProfileValidation.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import AcademicYear from '../models/AcademicYear.js';
import parseExcelToJson from '../utils/importDataToExcel.js';

const importEmployees = async (fileBuffer) => {
  const data = await parseExcelToJson(fileBuffer, mapHeaderToSchemaKey);

  const employeeProfiles = [];
  const errors = [];

  for (let rowData of data) {
    rowData.employeeId = rowData.employeeId ? String(rowData.employeeId) : null;
    rowData.email = rowData.email ? String(rowData.email) : null;
    try {
      const { value, error } = validateEmployeeProfile(rowData, {
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

      employeeProfiles.push(value);
    } catch (validationError) {
      const detailedError = validationError.details
        ? validationError.details.map((detail) => detail.message).join('; ')
        : validationError.message;
      console.error(
        'Validation error for employee ID',
        rowData.employeeId,
        ':',
        detailedError
      );
      errors.push({
        employeeId: rowData.employeeId || 'Unknown Employee ID',
        errors: ['Validation error: ' + detailedError],
      });
      if (validationError.details) {
        errors.push({
          employeeId: rowData.employeeId || 'Unknown Employee ID',
          errors: validationError.details.map((detail) => detail.message),
        });
      } else {
        console.error(
          'Unexpected validation error structure:',
          validationError
        );
        errors.push({
          employeeId: rowData.employeeId || 'Unknown Employee ID',
          errors: ['Unexpected validation error.'],
        });
      }
    }
  }

  if (employeeProfiles.length > 0) {
    try {
      await EmployeeProfile.insertMany(employeeProfiles, { ordered: false });
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
  return { employeeProfiles, errors: displayedErrors, hasMoreErrors };
};

export default importEmployees;
