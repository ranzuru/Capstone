import User from '../models/User.js';
import Student from '../models/StudentProfile.js';
import ClinicVisit from '../models/ClinicVisit.js';
import FeedingProgram from '../models/FeedingProgram.js';
import AcademicYear from '../models/AcademicYear.js';

export const getDashboardCounts = async (req, res) => {
  try {
    const { schoolYear } = req.query; // get the schoolYear from query params
    let filter = {};

    if (schoolYear) {
      // Find the academic year document that matches the schoolYear
      const academicYear = await AcademicYear.findOne({ schoolYear });
      if (academicYear) {
        filter = { academicYear: academicYear._id }; // use the academicYear document _id in the filter
      }
    }

    // Fetch counts from different collections using the filter
    const userCount = await User.countDocuments(filter);
    const studentCount = await Student.countDocuments(filter);
    const clinicVisitCount = await ClinicVisit.countDocuments(filter);
    // Use the filter for the FeedingProgram count as well
    const feedingProgramCount = await FeedingProgram.countDocuments({
      ...filter,
      beneficiaryOfSBFP: true,
      measurementType: 'PRE',
    });

    // Send all counts in a single response
    res.json({
      userCount,
      studentCount,
      clinicVisitCount,
      feedingProgramCount,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching dashboard counts',
      error: error.message,
    });
  }
};
