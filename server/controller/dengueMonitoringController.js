import DengueMonitoring from '../models/DengueMonitoring.js';
import AcademicYear from '../models/AcademicYear.js';
import { handleError } from '../utils/handleError.js';
import { validateDengue } from '../schema/dengueMonitoringValidation.js';
import importDengue from '../services/importDengue.js';
import moment from 'moment';

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
    const { schoolYear } = req.query;
    let dengueMonitoring;

    if (schoolYear) {
      // Use aggregation pipeline when schoolYear is provided
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
      dengueMonitoring = await DengueMonitoring.aggregate(aggregation);
    } else {
      dengueMonitoring = await DengueMonitoring.find().populate({
        path: 'academicYear',
        select: 'schoolYear',
      });
    }

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

// Bulk delete
export const bulkDeleteDengueMonitoring = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res
        .status(400)
        .send('No dengue monitoring IDs provided for deletion');
    }

    const result = await DengueMonitoring.deleteMany({
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

export const importDengueMonitoring = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const fileBuffer = req.file.buffer;
    const { dengueRecords, errors, hasMoreErrors } =
      await importDengue(fileBuffer);

    if (errors.length > 0) {
      const parsedErrors = errors.map((error) => {
        // Check if the error is a MongoDB duplicate key error
        if (error.includes('E11000 duplicate key error')) {
          // Extract the relevant parts of the error message
          const matches = error.match(/dup key: { (.+?) }/);
          const keyValue = matches ? matches[1] : 'unknown';
          return `Duplicate entry detected for: ${keyValue.replace(/"/g, '')}`;
        }
        return error; // If it's not a duplicate key error, return it as is
      });

      return res.status(400).json({
        message: `Some records have errors.`,
        detailedErrors: parsedErrors,
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

// PDF Report
export const getDengueCasesForActiveYear = async (req, res) => {
  try {
    const { schoolYear } = req.query;

    if (!schoolYear) {
      return res
        .status(400)
        .json({ message: 'School year query is required.' });
    }

    const academicYear = await AcademicYear.findOne({
      schoolYear: schoolYear,
    });

    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }
    const cases = await DengueMonitoring.find({
      academicYear: academicYear._id,
    });

    const formattedCases = cases.map((caseItem) => {
      let fullName = `${caseItem.lastName}, ${caseItem.firstName}`;
      if (caseItem.middleName) {
        fullName += ` ${caseItem.middleName.charAt(0)}.`;
      }
      if (caseItem.nameExtension && caseItem.nameExtension.trim()) {
        fullName += ` ${caseItem.nameExtension}`;
      }
      const genderFormatted = caseItem.gender === 'Male' ? 'M' : 'F';
      return {
        Name: fullName,
        Gender: genderFormatted,
        Age: caseItem.age,
        GradeSection: `${caseItem.grade}/${caseItem.section}`,
        Adviser: caseItem.adviser,
        Address: caseItem.address,
        DateOfOnset: moment(caseItem.dateOfOnset).format('MM/DD/YYYY'),
        DateOfAdmission: caseItem.dateOfAdmission
          ? moment(caseItem.dateOfAdmission).format('MM/DD/YYYY')
          : '',
        HospitalOfAdmission: caseItem.hospitalAdmission || '',
        DateOfDischarge: caseItem.dateOfDischarge
          ? moment(caseItem.dateOfDischarge).format('MM/DD/YYYY')
          : '',
      };
    });

    res.json({
      SchoolYear: academicYear.schoolYear,
      DengueCases: formattedCases,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
