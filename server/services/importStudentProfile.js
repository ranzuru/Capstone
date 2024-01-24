import {
  validateStudentProfile,
  mapHeaderToSchemaKey,
} from '../schema/studentProfileValidation.js';
import StudentProfile from '../models/StudentProfile.js';
import AcademicYear from '../models/AcademicYear.js';
import parseExcelToJson from '../utils/importDataToExcel.js';

const importStudents = async (fileBuffer) => {
  const data = await parseExcelToJson(fileBuffer, mapHeaderToSchemaKey);

  const studentProfiles = [];
  const errors = [];

  for (let rowData of data) {
    rowData.lrn = rowData.lrn ? String(rowData.lrn) : null;

    // Convert parentContact1 and parentContact2 to strings, handling undefined or null
    rowData.parentContact1 = String(rowData.parentContact1 || '');
    rowData.parentContact2 = String(rowData.parentContact2 || '');

    // Convert 'Yes'/'No' to true/false for is4p field
    rowData.is4p = rowData.is4p.toLowerCase() === 'yes';
    rowData.grade =
      typeof rowData.grade === 'number'
        ? `Grade ${rowData.grade}`
        : rowData.grade;

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
  return { studentProfiles, errors: displayedErrors, hasMoreErrors };
};

export default importStudents;
