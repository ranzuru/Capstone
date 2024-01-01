import AcademicYear from '../models/AcademicYear.js'; // Import the AcademicYear model
import StudentProfile from '../models/StudentProfile.js';
import StudentMedical from '../models/StudentMedical.js';
import FeedingProgram from '../models/FeedingProgram.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import EmployeeMedical from '../models/EmployeeMedical.js';
import DengueMonitoring from '../models/DengueMonitoring.js';
import ClinicVisit from '../models/ClinicVisit.js';

const handleError = (error, res) => {
  console.error('An error occurred:', error.message);
  if (error.name === 'MongoError' && error.code === 11000) {
    return res.status(409).json({ error: 'Duplicate academic year' });
  } else if (error.message === 'There can only be one active AcademicYear.') {
    return res.status(400).json({ error: error.message });
  }
  return res.status(500).json({ error: 'Something went wrong' });
};

export const createAcademicYear = async (req, res) => {
  try {
    const newAcademicYear = new AcademicYear(req.body);
    const savedAcademicYear = await newAcademicYear.save();
    res.status(201).json(savedAcademicYear);
  } catch (error) {
    handleError(error, res);
  }
};

export const getAcademicYears = async (req, res) => {
  try {
    const academicYears = await AcademicYear.find();
    res.status(200).json(academicYears);
  } catch (error) {
    handleError(error, res);
  }
};

export const getSchoolYears = async (req, res) => {
  try {
    const schoolYears = await AcademicYear.find(
      {},
      { schoolYear: 1, status: 1, _id: 0 }
    );

    const schoolYearsWithActiveFlag = schoolYears.map((year) => ({
      ...year.toObject(),
      isActive: year.status === 'Active',
    }));

    res.status(200).json(schoolYearsWithActiveFlag);
  } catch (error) {
    handleError(error, res);
  }
};

export const getAcademicYear = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findById(req.params.id);
    if (!academicYear) {
      return res.status(404).json({ message: 'Academic Year not found' });
    }
    res.status(200).json(academicYear);
  } catch (error) {
    handleError(error, res);
  }
};

export const updateAcademicYear = async (req, res) => {
  try {
    const updatedAcademicYear = await AcademicYear.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAcademicYear) {
      return res.status(404).json({ message: 'Academic Year not found' });
    }
    res.status(200).json(updatedAcademicYear);
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteAcademicYear = async (req, res) => {
  try {
    const academicYearId = req.params.id;

    // First, check if the Academic Year exists
    const existingAcademicYear = await AcademicYear.findById(academicYearId);
    if (!existingAcademicYear) {
      return res.status(404).json({ message: 'Academic Year not found' });
    }

    // Delete related documents in other collections
    await Promise.all([
      StudentProfile.deleteMany({ academicYear: academicYearId }),
      StudentMedical.deleteMany({ academicYear: academicYearId }),
      FeedingProgram.deleteMany({ academicYear: academicYearId }),
      EmployeeProfile.deleteMany({ academicYear: academicYearId }),
      EmployeeMedical.deleteMany({ academicYear: academicYearId }),
      DengueMonitoring.deleteMany({ academicYear: academicYearId }),
      ClinicVisit.deleteMany({ academicYear: academicYearId }),
    ]);

    // Finally, delete the Academic Year
    await AcademicYear.findByIdAndDelete(academicYearId);

    res.status(200).json({ message: 'Academic Year deleted successfully' });
  } catch (error) {
    handleError(error, res);
  }
};

// Set Active:
export const setActiveAcademicYear = async (req, res) => {
  try {
    // Check if there's already an active academic year
    const existingActive = await AcademicYear.findOne({ status: 'Active' });
    if (existingActive && existingActive._id.toString() !== req.params.id) {
      return res.status(400).json({
        message:
          'An academic year is already marked as active. ' +
          'Please set the current active year to "Completed" before ' +
          'activating a new academic year.',
      });
    }
    // If not, proceed to set the requested academic year as active
    const activeAcademicYear = await AcademicYear.findByIdAndUpdate(
      req.params.id,
      { status: 'Active' },
      { new: true }
    );

    if (!activeAcademicYear) {
      return res.status(404).json({ message: 'Academic Year not found' });
    }

    res.status(200).json(activeAcademicYear);
  } catch (error) {
    handleError(error, res);
  }
};

// Set Completed

export const setCompletedAcademicYear = async (req, res) => {
  try {
    const academicYearId = req.params.id;

    // Update the status of the academic year to 'Completed'
    const completedAcademicYear = await AcademicYear.findByIdAndUpdate(
      academicYearId,
      { status: 'Completed' },
      { new: true }
    );

    if (!completedAcademicYear) {
      return res.status(404).json({ message: 'Academic Year not found' });
    }

    // Update related documents in other collections
    await Promise.all([
      StudentProfile.updateMany(
        { academicYear: academicYearId },
        { status: 'Archived' }
      ),
      StudentMedical.updateMany(
        { academicYear: academicYearId },
        { status: 'Archived' }
      ),
      FeedingProgram.updateMany(
        { academicYear: academicYearId },
        { status: 'Archived' }
      ),
      EmployeeProfile.updateMany(
        { academicYear: academicYearId },
        { status: 'Archived' }
      ),
      EmployeeMedical.updateMany(
        { academicYear: academicYearId },
        { status: 'Archived' }
      ),
      DengueMonitoring.updateMany(
        { academicYear: academicYearId },
        { status: 'Archived' }
      ),
      ClinicVisit.updateMany(
        { academicYear: academicYearId },
        { status: 'Archived' }
      ),
    ]);

    res.status(200).json(completedAcademicYear);
  } catch (error) {
    handleError(error, res);
  }
};
