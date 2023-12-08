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
    rowData.employeeId =
      rowData.employeeId && rowData.employeeId.result
        ? String(rowData.employeeId.result)
        : null;
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
      if (validationError.details && Array.isArray(validationError.details)) {
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
      if (dbError.name === 'BulkWriteError') {
        dbError.writeErrors.forEach((writeError) => {
          const errorField = writeError.err.keyPattern; // This will indicate which field caused the error
          const errorValue = writeError.err.op;
          let message;

          if (errorField.employeeId && errorField.academicYear) {
            // Error due to compound index violation
            message = `Duplicate record found for Employee ID '${errorValue.employeeId}' in Academic Year '${errorValue.academicYear}'.`;
          } else if (errorField.email) {
            // Error due to email uniqueness violation
            message = `Duplicate email found: '${errorValue.email}'.`;
          } else {
            // General error message for other duplicate key errors
            message = 'Duplicate record found with conflicting unique keys.';
          }

          errors.push({ employeeId: errorValue.employeeId, message });
        });
      } else {
        // Handle other types of database errors
        console.error('Database error:', dbError);
        errors.push({
          message: 'A database error occurred during the import process.',
        });
      }
    }
  }

  const displayedErrors = errors.slice(0, 5);
  const hasMoreErrors = errors.length > 5;
  return { employeeProfiles, errors: displayedErrors, hasMoreErrors };
};

export default importEmployees;
