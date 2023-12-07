import FeedingProgram from '../models/FeedingProgram.js';
import AcademicYear from '../models/AcademicYear.js';
import { handleError } from '../utils/handleError.js';
import { validateFeeding } from '../schema/feedingProgramValidation.js';
import importFeeding from '../services/importFeedingProgram.js';
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
  const { type } = req.params;

  if (!['PRE', 'POST'].includes(type.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid measurement type.' });
  }

  try {
    // Adjust the query to filter by the measurement type.
    const feedings = await FeedingProgram.find({
      measurementType: type.toUpperCase(),
    }).populate('academicYear');
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
  } catch (err) {
    handleError(res, err);
  }
};
