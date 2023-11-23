import StudentProfile from '../models/StudentProfile.js'; // Adjust import path
import AcademicYear from '../models/AcademicYear.js'; // Adjust import path
import { handleError } from '../utils/handleError.js'; // Adjust import path
import { validateStudentProfile } from '../schema/studentProfileValidation.js'; // Adjust import path

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
export const getStudentProfile = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findById(
      req.params.id
    ).populate('academicYear');
    if (!studentProfile)
      return res.status(404).send('Student profile not found');
    res.send(studentProfile);
  } catch (err) {
    handleError(res, err);
  }
};

export const getAllStudentProfiles = async (req, res) => {
  try {
    const studentProfiles =
      await StudentProfile.find().populate('academicYear');
    res.send(studentProfiles);
  } catch (err) {
    handleError(res, err);
  }
};

// Update
export const updateStudentProfile = async (req, res) => {
  try {
    const { schoolYear, ...updateData } = req.body;

    let updateObject = updateData;

    // Update academicYear if schoolYear is provided
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

    const response = studentProfile.toObject(); // Convert to a plain JavaScript object
    response.schoolYear = studentProfile.academicYear.schoolYear; // Add the schoolYear string

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
