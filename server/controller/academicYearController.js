import AcademicYear from '../models/AcademicYear.js'; // Import the AcademicYear model
import { createLog } from './createLogController.js';

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

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Academic Year',
      action: 'CREATE/ POST',
      description: JSON.stringify(savedAcademicYear),
    });
    
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

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Academic Year',
      action: 'UPDATE/ PUT',
      description: JSON.stringify(updatedAcademicYear),
    });
    
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteAcademicYear = async (req, res) => {
  try {
    const deletedAcademicYear = await AcademicYear.findByIdAndDelete(
      req.params.id
    );
    if (!deletedAcademicYear) {
      return res.status(404).json({ message: 'Academic Year not found' });
    }
    res.status(200).json({ message: 'Academic Year deleted successfully' });

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Academic Year',
      action: 'DELETE',
      description: deletedAcademicYear,
    });
    
  } catch (error) {
    handleError(error, res);
  }
};
