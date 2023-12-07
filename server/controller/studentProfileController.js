import StudentProfile from '../models/StudentProfile.js';
import AcademicYear from '../models/AcademicYear.js';
import { handleError } from '../utils/handleError.js';
import { validateStudentProfile } from '../schema/studentProfileValidation.js';
import importStudents from '../services/importStudentProfile.js';

// Create
export const createStudentProfile = async (req, res) => {
  try {
    const { schoolYear, ...studentData } = req.body;

    // Validate student data
    const { error } = validateStudentProfile({ schoolYear, ...studentData });
    if (error) return res.status(400).send(error.details[0].message);

    // Find the academic year using the schoolYear field
    const academicYear = await AcademicYear.findOne({ schoolYear });
    if (!academicYear) return res.status(400).send('Invalid academic year.');

    // Create a new student profile with the academic year ObjectId
    const studentProfile = new StudentProfile({
      ...studentData,
      academicYear: academicYear._id,
    });

    await studentProfile.save();
    const populatedStudentProfile = await StudentProfile.findById(
      studentProfile._id
    ).populate('academicYear');

    // Modify the response to include the schoolYear string instead of the ObjectId
    const response = populatedStudentProfile.toObject(); // Convert to a plain JavaScript object
    response.schoolYear = academicYear.schoolYear; // Add the schoolYear string

    res.status(201).send(response);
  } catch (err) {
    handleError(res, err);
  }
};

// Read
export const getAllStudentProfiles = async (req, res) => {
  try {
    const studentProfiles =
      await StudentProfile.find().populate('academicYear');
    res.send(studentProfiles);
  } catch (err) {
    handleError(res, err);
  }
};

// Search profile
export const getStudentProfiles = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;

    // Building the search query with a condition for 'status' being 'Active'
    const searchQuery = {
      status: 'Active', // filtering for active students
      ...(search
        ? {
            $or: [
              { firstName: { $regex: search, $options: 'i' } },
              { lastName: { $regex: search, $options: 'i' } },
              { lrn: { $regex: search, $options: 'i' } },
            ],
          }
        : {}),
    };

    const total = await StudentProfile.countDocuments(searchQuery);
    const studentProfiles = await StudentProfile.find(
      searchQuery,
      'lrn lastName firstName middleName nameExtension gender dateOfBirth age grade section address'
    )
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ data: studentProfiles, total, page, limit });
  } catch (error) {
    res.status(500).send('Error fetching student profiles: ' + error.message);
  }
};

// Update
export const updateStudentProfile = async (req, res) => {
  try {
    const { schoolYear, ...updateData } = req.body;

    let updateObject = updateData;

    if (schoolYear) {
      const academicYear = await AcademicYear.findOne({ schoolYear });
      if (!academicYear) return res.status(400).send('Invalid academic year.');
      updateObject.academicYear = academicYear._id;
    }

    const studentProfile = await StudentProfile.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    ).populate('academicYear');

    if (!studentProfile)
      return res.status(404).send('Student profile not found');

    const response = studentProfile.toObject();
    response.schoolYear = studentProfile.academicYear.schoolYear;

    res.send(response);
  } catch (err) {
    handleError(res, err);
  }
};

// Delete
export const deleteStudentProfile = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findByIdAndRemove(
      req.params.id
    );
    if (!studentProfile)
      return res.status(404).send('Student profile not found');

    res.send(studentProfile);
  } catch (err) {
    handleError(res, err);
  }
};

//Bulk delete
export const bulkDeleteStudentProfiles = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res
        .status(400)
        .send('No student profile IDs provided for deletion');
    }

    const result = await StudentProfile.deleteMany({
      _id: { $in: ids },
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .send('No student profiles found for the provided IDs');
    }

    res.send({
      message: `Successfully deleted ${result.deletedCount} student records`,
    });
  } catch (err) {
    handleError(res, err);
  }
};

// import
export const importStudentProfiles = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const fileBuffer = req.file.buffer;
    const { studentProfiles, errors } = await importStudents(fileBuffer);

    if (errors.length > 0) {
      // Construct a detailed error message if there are errors
      const errorDetails = errors
        .map((error) => {
          if (error.lrn && error.message) {
            return `LRN ${error.lrn}: ${error.message}`;
          }
          return error.message || 'Unknown error';
        })
        .join('; ');

      return res.status(400).json({
        message: 'Some records have errors.',
        detailedErrors: errorDetails, // Include the detailed error messages
        errorCount: errors.length,
      });
    }

    res.status(201).json({
      message: 'Students imported successfully',
      count: studentProfiles.length,
    });
  } catch (err) {
    handleError(res, err);
  }
};
