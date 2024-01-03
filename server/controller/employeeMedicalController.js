import EmployeeMedical from '../models/EmployeeMedical.js';
import AcademicYear from '../models/AcademicYear.js';
import { handleError } from '../utils/handleError.js';
import { validateEmployeeMedical } from '../schema/employeeMedicalValidation.js';
import importEmployeeMedical from '../services/importEmployeeMedical.js';
import { createLog } from './createLogController.js';

// Create
export const createEmployeeMedical = async (req, res) => {
  try {
    const { schoolYear, ...employeeData } = req.body;

    // Validate employee data
    const { error } = validateEmployeeMedical({ schoolYear, ...employeeData });
    if (error) return res.status(400).send(error.details[0].message);

    // Find the academic year using the schoolYear field
    const academicYear = await AcademicYear.findOne({ schoolYear });
    if (!academicYear) return res.status(400).send('Invalid academic year.');

    // Create a new employee profile with the academic year ObjectId
    const employeeMedical = new EmployeeMedical({
      ...employeeData,
      academicYear: academicYear._id,
    });

    await employeeMedical.save();

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Employee Medical',
      action: 'CREATE/ POST',
      description: JSON.stringify(employeeMedical),
    });

    const populatedEmployeeMedical = await EmployeeMedical.findById(
      employeeMedical._id
    ).populate('academicYear');

    // Modify the response to include the schoolYear string instead of the ObjectId
    const response = populatedEmployeeMedical.toObject(); // Convert to a plain JavaScript object
    response.schoolYear = academicYear.schoolYear; // Add the schoolYear string

    res.status(201).send(response);


  } catch (err) {
    handleError(res, err);
  }
};

// Read all
export const getAllEmployeeMedicals = async (req, res) => {
  try {
    const { schoolYear } = req.query;
    let employeeMedicals;

    if (schoolYear) {
      const aggregation = [
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
      employeeMedicals = await EmployeeMedical.aggregate(aggregation);
    } else {
      employeeMedicals = await EmployeeMedical.find().populate({
        path: 'academicYear',
        select: 'schoolYear',
      });
    }

    res.send(employeeMedicals);
  } catch (err) {
    handleError(res, err);
  }
};

// Update
export const updateEmployeeMedical = async (req, res) => {
  try {
    const { schoolYear, ...updateData } = req.body;

    let updateObject = updateData;

    // Find the academic year using the schoolYear field
    if (schoolYear) {
      const academicYear = await AcademicYear.findOne({ schoolYear });
      if (!academicYear) return res.status(400).send('Invalid academic year.');

      updateObject = { ...updateData, academicYear: academicYear._id };
    }

    const employeeMedical = await EmployeeMedical.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    ).populate('academicYear');

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Employee Medical',
      action: 'UPDATE/ PUT',
      description: JSON.stringify(employeeMedical),
    });

    // Modify the response to include the schoolYear string instead of the ObjectId
    const response = employeeMedical.toObject(); // Convert to a plain JavaScript object
    response.schoolYear = employeeMedical.academicYear.schoolYear; // Add the schoolYear string

    res.send(response);

  } catch (err) {
    handleError(res, err);
  }
};

// Delete
export const deleteEmployeeMedical = async (req, res) => {
  try {
    const employeeMedical = await EmployeeMedical.findByIdAndDelete(
      req.params.id
    );
    res.send(employeeMedical);

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Employee Medical',
      action: 'DELETE',
      description: JSON.stringify(employeeMedical),
    });

  } catch (err) {
    handleError(res, err);
  }
};

// Bulk delete
export const bulkDeleteEmployeeMedical = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res
        .status(400)
        .send('No employee medical IDs provided for deletion');
    }

    const result = await EmployeeMedical.deleteMany({
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
      section: 'Employee Medical',
      action: 'BULK DELETE',
      description: `Employee Medical IDs: ${ids} \nNumber of IDs: ${result.deletedCount}`,
    });

  } catch (err) {
    handleError(res, err);
  }
};

export const importMedical = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const fileBuffer = req.file.buffer;
    const { employeeMedicalRecords, errors, hasMoreErrors } =
      await importEmployeeMedical(fileBuffer);

    if (errors.length > 0) {
      const errorDetails = errors
        .map((error) => {
          if (error.employeeId && error.errors) {
            return `Employee Id ${error.employeeId}: ${error.errors.join(
              ', '
            )}`;
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
      message: 'Employee Medical Records imported successfully',
      count: employeeMedicalRecords.length,
    });

  } catch (err) {
    handleError(res, err);
  }
};
