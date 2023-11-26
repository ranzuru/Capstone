import StudentMedical from '../models/StudentMedical.js';
import AcademicYear from '../models/AcademicYear.js';
import { handleError } from '../utils/handleError.js';
import { validateStudentMedical } from '../schema/studentMedicalValidation.js';

// Create
export const createStudentMedical = async (req, res) => {
  try {
    const { schoolYear, ...studentData } = req.body;

    // Validate student data
    const { error } = validateStudentMedical({ schoolYear, ...studentData });
    if (error) return res.status(400).send(error.details[0].message);

    // Find the academic year using the schoolYear field
    const academicYear = await AcademicYear.findOne({ schoolYear });
    if (!academicYear) return res.status(400).send('Invalid academic year.');

    // Create a new student profile with the academic year ObjectId
    const studentMedical = new StudentMedical({
      ...studentData,
      academicYear: academicYear._id,
    });

    await studentMedical.save();
    const populatedStudentMedical = await StudentMedical.findById(
      studentMedical._id
    ).populate('academicYear');

    // Modify the response to include the schoolYear string instead of the ObjectId
    const response = populatedStudentMedical.toObject(); // Convert to a plain JavaScript object
    response.schoolYear = academicYear.schoolYear; // Add the schoolYear string

    res.status(201).send(response);
  } catch (err) {
    handleError(res, err);
  }
};

// Read all
export const getAllStudentMedicals = async (req, res) => {
  try {
    const studentMedicals =
      await StudentMedical.find().populate('academicYear');
    res.send(studentMedicals);
  } catch (err) {
    handleError(res, err);
  }
};

// Update
export const updateStudentMedical = async (req, res) => {
  try {
    const { schoolYear, ...updateData } = req.body;

    let updateObject = updateData;

    // Find the academic year using the schoolYear field
    if (schoolYear) {
      const academicYear = await AcademicYear.findOne({ schoolYear });
      if (!academicYear) return res.status(400).send('Invalid academic year.');
      updateObject.academicYear = academicYear._id;
    }

    const studentMedical = await StudentMedical.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    ).populate('academicYear');

    // Modify the response to include the schoolYear string instead of the ObjectId
    const response = studentMedical.toObject(); // Convert to a plain JavaScript object
    response.schoolYear = studentMedical.academicYear.schoolYear; // Add the schoolYear string

    res.send(response);
  } catch (err) {
    handleError(res, err);
  }
};

// Delete
export const deleteStudentMedical = async (req, res) => {
  try {
    const studentMedical = await StudentMedical.findByIdAndDelete(
      req.params.id
    );
    if (!studentMedical)
      return res.status(404).send('Student record not found');

    res.send(studentMedical);
  } catch (err) {
    handleError(res, err);
  }
};
