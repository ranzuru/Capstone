import {
  validateStudentProfile,
  mapHeaderToSchemaKey,
} from '../schema/studentProfileValidation.js';
import StudentProfile from '../models/StudentProfile.js';
import AcademicYear from '../models/AcademicYear.js';
import parseExcelToJson from '../utils/importDataToExcel.js';
import { createLog } from '../controller/createLogController.js';
import { currentUserId } from '../auth/authenticateMiddleware.js';

const importStudents = async (fileBuffer) => {
  const data = await parseExcelToJson(fileBuffer, mapHeaderToSchemaKey);

  const studentProfiles = [];
  const errors = [];

  for (let rowData of data) {
    rowData.lrn =
      rowData.lrn && rowData.lrn.result ? String(rowData.lrn.result) : null;
    if (rowData.is4p) rowData.is4p = rowData.is4p.toLowerCase() === 'yes';

    try {
      const { value, error } = validateStudentProfile(rowData, {
        abortEarly: false,
      });
      if (error) throw error;

      // Find the academic year using the schoolYear field
      const academicYear = await AcademicYear.findOne({
        schoolYear: value.schoolYear,
      });
      if (!academicYear) {
        errors.push({ lrn: value.lrn, errors: ['Invalid academic year.'] });
        continue;
      }

      value.academicYear = academicYear._id;

      studentProfiles.push(value);

      // LOG
    await createLog({
      user: `${currentUserId}`,
      section: 'Student Profile',
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
        // Handle case where validationError.details is not as expected
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

  if (studentProfiles.length > 0) {
    try {
      await StudentProfile.insertMany(studentProfiles, { ordered: false });
    } catch (dbError) {
      if (dbError.name === 'BulkWriteError' && dbError.code === 11000) {
        // Handle duplicate key errors without logging them to the terminal
        dbError.writeErrors.forEach((writeError) => {
          const duplicateValue = writeError.err.op;
          errors.push({
            lrn: duplicateValue.lrn,
            academicYear: duplicateValue.academicYear,
            message: `Duplicate record with LRN '${duplicateValue.lrn}' for academic year already exists.`,
          });
        });
      } else {
        errors.push({
          message: 'A database error occurred during the import process.',
        });
      }
    }
  }

  const displayedErrors = errors.slice(0, 5);
  const hasMoreErrors = errors.length > 5;
  return { studentProfiles, errors: displayedErrors, hasMoreErrors };
};

export default importStudents;
