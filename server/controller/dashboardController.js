import User from '../models/User.js';
import Student from '../models/StudentProfile.js';
import ClinicVisit from '../models/ClinicVisit.js';
import FeedingProgram from '../models/FeedingProgram.js';
import AcademicYear from '../models/AcademicYear.js';
import MedicineItemSchema from '../models/MedicineItem.js';
import MedicineInSchema from '../models/MedicineIn.js';
import MedicineDispenseSchema from '../models/MedicineDispense.js';
import MedicineAdjustmentSchema from '../models/MedicineAdjustment.js';
import { handleError } from '../utils/handleError.js';

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

export const getAllBatchNearExpiry = async (req, res) => {
  try {
    // Calculate the date that is 2 months from now
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

    const data = await MedicineInSchema.find({
      expirationDate: { $lte: twoMonthsFromNow },
    }).sort({ expirationDate: 1 });

    const populatedData = await Promise.all(
      data.map(async (data) => {
        const itemId = data.itemId;
        const batchId = data.batchId;

        // Find related dispense data
        const itemData = await MedicineItemSchema.find({ itemId });

        // Find related dispense data
        const dispenseData = await MedicineDispenseSchema.find({
          itemId,
          batchId,
        });

        // Find related addition adjustment data
        const additionAdjustmentData = await MedicineAdjustmentSchema.find({
          itemId,
          batchId,
          type: 'Addition',
        });

        // Find related subtraction adjustment data
        const subtractionAdjustmentData = await MedicineAdjustmentSchema.find({
          itemId,
          batchId,
          type: 'Subtraction',
        });

        // Calculate total quantity by summing quantities from dispense, addition, and subtraction
        const totalBatchQuantity = Math.abs(
          data.quantity +
            additionAdjustmentData.reduce(
              (total, record) => total + record.quantity,
              0
            ) -
            subtractionAdjustmentData.reduce(
              (total, record) => total + record.quantity,
              0
            ) -
            dispenseData.reduce((total, record) => total + record.quantity, 0)
        );

        // Combine all data for the batch record
        return {
          ...data.toObject(),
          totalBatchQuantity: totalBatchQuantity || null,
          itemData: itemData,
        };
      })
    );

    res.send(populatedData);
  } catch (err) {
    handleError(res, err);
  }
};
