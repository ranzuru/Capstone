import DengueMonitoring from '../models/DengueMonitoring.js';
import AcademicYear from '../models/AcademicYear.js';
import { handleError } from '../utils/handleError.js';
import { validateDengue } from '../schema/dengueMonitoringValidation.js';
import importDengue from '../services/importDengue.js';

// create
export const createDengueMonitoring = async (req, res) => {
  try {
    const { schoolYear, ...dengueData } = req.body;

    // validate dengue data
    const { error } = validateDengue({ schoolYear, ...dengueData });
    if (error) return res.status(400).send(error.details[0].message);

    // find the academic year using the schoolYear field
    const academicYear = await AcademicYear.findOne({ schoolYear });
    if (!academicYear) return res.status(400).send('Invalid academic year.');

    // create a new dengue monitoring with the academic year ObjectId
    const dengueMonitoring = new DengueMonitoring({
      ...dengueData,
      academicYear: academicYear._id,
    });

    await dengueMonitoring.save();
    const populatedDengueMonitoring = await DengueMonitoring.findById(
      dengueMonitoring._id
    ).populate('academicYear');

    // modify the response to include the schoolYear string instead of the ObjectId
    const response = populatedDengueMonitoring.toObject(); // convert to a plain javascript object
    response.schoolYear = academicYear.schoolYear; // add the schoolYear string

    res.status(201).send(response);
  } catch (err) {
    handleError(res, err);
  }
};

// read
export const getAllDengueMonitoring = async (req, res) => {
  try {
    const dengueMonitoring =
      await DengueMonitoring.find().populate('academicYear');
    res.send(dengueMonitoring);
  } catch (err) {
    handleError(res, err);
  }
};

// Update
export const updateDengueMonitoring = async (req, res) => {
  try {
    const { schoolYear, ...updateData } = req.body;

    let updateObject = updateData;

    // Update academicYear if schoolYear is provided
    if (schoolYear) {
      const academicYear = await AcademicYear.findOne({ schoolYear });
      if (!academicYear) return res.status(400).send('Invalid academic year.');
      updateObject.academicYear = academicYear._id;
    }

    const dengueMonitoring = await DengueMonitoring.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    ).populate('academicYear');

    if (!dengueMonitoring)
      return res.status(404).send('Student profile not found');

    const response = dengueMonitoring.toObject(); // Convert to a plain JavaScript object
    response.schoolYear = dengueMonitoring.academicYear.schoolYear; // Add the schoolYear string

    res.send(response);
  } catch (err) {
    handleError(res, err);
  }
};

// Delete
export const deleteDengueMonitoring = async (req, res) => {
  try {
    const dengueMonitoring = await DengueMonitoring.findByIdAndRemove(
      req.params.id
    );
    if (!dengueMonitoring)
      return res.status(404).send('Dengue monitoring not found');

    res.send(dengueMonitoring);
  } catch (err) {
    handleError(res, err);
  }
};

export const importDengueMonitoring = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const fileBuffer = req.file.buffer;
    const { dengueRecords, errors, hasMoreErrors } =
      await importDengue(fileBuffer);

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
      message: 'Dengue Monitoring Records imported successfully',
      count: dengueRecords.length,
    });
  } catch (err) {
    handleError(res, err);
  }
};
