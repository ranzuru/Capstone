// import
import EmployeeMedical from '../models/EmployeeMedical.js';
import AcademicYear from '../models/AcademicYear.js';
import parseExcelToJson from '../utils/importDataToExcel.js';
import {
  validateEmployeeMedical,
  mapHeaderToSchemaKey,
} from '../schema/employeeMedicalValidation.js';
import { createLog } from '../controller/createLogController.js';
import { currentUserId } from '../auth/authenticateMiddleware.js';

const importEmployeeMedical = async (fileBuffer) => {
  const data = await parseExcelToJson(fileBuffer, mapHeaderToSchemaKey);

  const employeeMedicalRecords = [];
  const errors = [];

  for (let rowData of data) {
    rowData.employeeId =
      rowData.employeeId && rowData.employeeId.result
        ? String(rowData.employeeId.result)
        : null;

    rowData.bloodPressure =
      rowData.bloodPressure != null
        ? String(rowData.bloodPressure)
        : rowData.bloodPressure;
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

      // LOG
    await createLog({
      user: `${currentUserId}`,
      section: 'Employee Medical',
      action: 'IMPORT',
      description: JSON.stringify(value),
    });

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
      if (dbError.name === 'BulkWriteError') {
        dbError.writeErrors.forEach((writeError) => {
          const errorField = writeError.err.keyPattern; // This will indicate which field caused the error
          const errorValue = writeError.err.op;
          errors.push({
            employeeId: errorValue.employeeId || 'Unknown Employee Id',
            errors: [`Duplicate entry for ${errorField}`],
          });
        });
      } else {
        console.error('Unexpected DB error:', dbError);
        errors.push({
          employeeId: 'Unknown Employee Id',
          errors: ['Unexpected DB error.'],
        });
      }
    }
  }

  const displayedErrors = errors.slice(0, 5);
  const hasMoreErrors = errors.length > 5;
  return { employeeMedicalRecords, errors: displayedErrors, hasMoreErrors };
};

export default importEmployeeMedical;
