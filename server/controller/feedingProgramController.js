import FeedingProgram from '../models/FeedingProgram.js';
import AcademicYear from '../models/AcademicYear.js';
import { handleError } from '../utils/handleError.js';
import { validateFeeding } from '../schema/feedingProgramValidation.js';
import importFeeding from '../services/importFeedingProgram.js';
import moment from 'moment';
import { createLog } from './createLogController.js';

// Create
export const createFeeding = async (req, res) => {
  try {
    const { schoolYear, ...feedingData } = req.body;

    // Validate feeding data
    const { error } = validateFeeding({ schoolYear, ...feedingData });
    if (error) return res.status(400).send(error.details[0].message);

    // Find the academic year using the schoolYear field
    const academicYear = await AcademicYear.findOne({ schoolYear });
    if (!academicYear) return res.status(400).send('Invalid academic year.');

    // Create a new feeding profile with the academic year ObjectId
    const feedingProgram = new FeedingProgram({
      ...feedingData,
      academicYear: academicYear._id,
    });

    await feedingProgram.save();

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Feeding Program',
      action: 'CREATE/ POST',
      description: JSON.stringify(feedingProgram),
    });

    const populatedFeedingProgram = await FeedingProgram.findById(
      feedingProgram._id
    ).populate('academicYear');

    // Modify the response to include the schoolYear string instead of the ObjectId
    const response = populatedFeedingProgram.toObject(); // Convert to a plain JavaScript object
    response.schoolYear = academicYear.schoolYear; // Add the schoolYear string

    res.status(201).send(response);

  } catch (err) {
    handleError(res, err);
  }
};

// Read all
export const getAllFeedings = async (req, res) => {
  const { schoolYear } = req.query;
  const { type } = req.params;

  if (!['PRE', 'POST'].includes(type.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid measurement type.' });
  }

  try {
    let feedings;

    if (schoolYear) {
      // Use aggregation pipeline when schoolYear is provided
      const aggregation = [
        {
          $match: { measurementType: type.toUpperCase() },
        },
        {
          $lookup: {
            from: 'academicyears',
            localField: 'academicYear',
            foreignField: '_id',
            as: 'academicYearInfo',
          },
        },
        { $unwind: '$academicYearInfo' },
        { $match: { 'academicYearInfo.schoolYear': schoolYear } },
        {
          $addFields: {
            'academicYear.schoolYear': '$academicYearInfo.schoolYear',
          },
        },
        { $project: { academicYearInfo: 0 } },
      ];
      feedings = await FeedingProgram.aggregate(aggregation);
    } else {
      // Use find with populate when schoolYear is not provided
      feedings = await FeedingProgram.find({
        measurementType: type.toUpperCase(),
      }).populate({
        path: 'academicYear',
        select: 'schoolYear',
      });
    }

    res.send(feedings);
  } catch (err) {
    handleError(res, err);
  }
};

// Update
export const updateFeeding = async (req, res) => {
  try {
    const { schoolYear, ...updateData } = req.body;

    let updateObject = updateData;

    // Find the academic year using the schoolYear field
    if (schoolYear) {
      const academicYear = await AcademicYear.findOne({ schoolYear });
      if (!academicYear) return res.status(400).send('Invalid academic year.');

      updateObject = { ...updateData, academicYear: academicYear._id };
    }

    const updatedFeeding = await FeedingProgram.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    ).populate('academicYear');

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Feeding Program',
      action: 'UPDATE/ PUT',
      description: JSON.stringify(updatedFeeding),
    });

    // Modify the response to include the schoolYear string instead of the ObjectId
    const response = updatedFeeding.toObject(); // Convert to a plain JavaScript object
    response.schoolYear = updatedFeeding.academicYear.schoolYear; // Add the schoolYear string

    res.send(response);

  } catch (err) {
    handleError(res, err);
  }
};

// Delete
export const deleteFeeding = async (req, res) => {
  try {
    const feedingProgram = await FeedingProgram.findByIdAndDelete(
      req.params.id
    );
    res.send(feedingProgram);

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Feeding Program',
      action: 'DELETE',
      description: JSON.stringify(feedingProgram),
    });

  } catch (err) {
    handleError(res, err);
  }
};

// Bulk delete
export const bulkDeleteFeedings = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res
        .status(400)
        .send('No feeding records IDs provided for deletion');
    }

    const result = await FeedingProgram.deleteMany({
      _id: { $in: ids },
    });

    if (result.deletedCount === 0) {
      return res.status(404).send('No records found for the provided IDs');
    }

    res.send({
      message: `Successfully deleted ${result.deletedCount} records`,
    });

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Feeding Program',
      action: 'BULK DELETE',
      description: `Feeding Program IDs: ${ids} \nNumber of IDs: ${result.deletedCount}`,
    });

  } catch (err) {
    handleError(res, err);
  }
};

export const importFeedingProgram = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const fileBuffer = req.file.buffer;
    const { feedingRecords, errors, hasMoreErrors } =
      await importFeeding(fileBuffer);

    if (errors.length > 0) {
      const errorDetails = errors
        .map((error) => {
          if (error.lrn && error.errors) {
            return `LRN ${error.lrn}: ${error.errors.join(', ')}`;
          }
          return error.message || 'Unknown error';
        })
        .join('; ');

      return res.status(400).json({
        message: `Some records have errors${
          hasMoreErrors ? ' (showing first 5)' : ''
        }.`,
        detailedErrors: errorDetails,
        errorCount: errors.length,
        ...(hasMoreErrors && {
          additionalErrors: 'Not all errors are displayed.',
        }),
      });
    }

    res.status(201).json({
      message: 'Nutritional Records imported successfully',
      count: feedingRecords.length,
    });

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Feeding Program',
      action: 'IMPORT',
      description: '',
    });

  } catch (err) {
    handleError(res, err);
  }
};

// PDF Report

export const getActiveSBFPBeneficiaries = async (req, res) => {
  try {
    const currentAcademicYear = await AcademicYear.findOne({
      status: 'Active',
    });

    // If the current academic year is not found, handle accordingly
    if (!currentAcademicYear) {
      return res
        .status(404)
        .json({ message: 'Active academic year not found.' });
    }

    const beneficiaries = await FeedingProgram.find({
      beneficiaryOfSBFP: true,
      status: 'Active',
      measurementType: 'PRE',
      academicYear: currentAcademicYear._id,
    });

    const formattedBeneficiaries = beneficiaries.map((beneficiary) => {
      // Format the name
      let fullName = `${beneficiary.lastName}, ${beneficiary.firstName}`;
      if (beneficiary.middleName) {
        fullName += ` ${beneficiary.middleName.charAt(0)}.`;
      }
      if (beneficiary.nameExtension && beneficiary.nameExtension.trim()) {
        fullName += ` ${beneficiary.nameExtension}`;
      }

      // Format dateOfBirth and dateMeasured
      const dobFormatted = moment(beneficiary.dateOfBirth).format('MM/DD/YYYY');
      const dateMeasuredFormatted = moment(beneficiary.dateMeasured).format(
        'MM/DD/YYYY'
      );

      // Calculate age in years and months
      const ageYears = moment().diff(moment(beneficiary.dateOfBirth), 'years');
      const ageMonths =
        moment().diff(moment(beneficiary.dateOfBirth), 'months') % 12;
      const ageFormatted = `${ageYears}/${ageMonths}`;
      const schoolYear = currentAcademicYear.schoolYear;
      const genderFormatted = beneficiary.gender === 'Male' ? 'M' : 'F';

      return {
        Name: fullName,
        Gender: genderFormatted,
        GradeSection: `${beneficiary.grade}/${beneficiary.section}`,
        DOB: dobFormatted,
        DateMeasured: dateMeasuredFormatted,
        Age: ageFormatted,
        Weight: beneficiary.weightKg,
        Height: beneficiary.heightCm,
        BMI: beneficiary.bmi,
        BMIClassification: beneficiary.bmiClassification,
        HeightForAge: beneficiary.heightForAge,
        SBFP: beneficiary.beneficiaryOfSBFP ? 'Yes' : 'No',
        Remarks: beneficiary.remarks || '',
        SchoolYear: schoolYear,
      };
    });

    res.json({
      SchoolYear: currentAcademicYear.schoolYear, // Provide the school year for the frontend to use
      Beneficiaries: formattedBeneficiaries,
    });

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Feeding Program',
      action: 'EXPORT',
      description: `School Year: ${currentAcademicYear.schoolYear} \nBeneficiaries: ${formattedBeneficiaries}`,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
