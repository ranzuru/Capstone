import DengueMonitoring from '../models/DengueMonitoring.js';
import AcademicYear from '../models/AcademicYear.js';
import { handleError } from '../utils/handleError.js';
import { validateDengue } from '../schema/dengueMonitoringValidation.js';
import importDengue from '../services/importDengue.js';
import moment from 'moment';
import { createLog } from './createLogController.js';

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

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Dengue Monitoring',
      action: 'CREATE/ POST',
      description: JSON.stringify(dengueMonitoring),
    });

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

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Dengue Monitoring',
      action: 'UPDATE/ PUT',
      description: JSON.stringify(dengueMonitoring),
    });

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

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Dengue Monitoring',
      action: 'DELETE',
      description: JSON.stringify(dengueMonitoring),
    });

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

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Dengue Monitoring',
      action: 'BULK DELETE',
      description: `Dengue Monitoring IDs: ${ids} \nNumber of IDs: ${result.deletedCount}`,
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

// PDF Report
export const getDengueCasesForActiveYear = async (req, res) => {
  try {
    const currentAcademicYear = await AcademicYear.findOne({
      status: 'Active',
    });
    if (!currentAcademicYear) {
      return res
        .status(404)
        .json({ message: 'Active academic year not found.' });
    }

    const cases = await DengueMonitoring.find({
      status: 'Active',
      academicYear: currentAcademicYear._id,
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
      SchoolYear: currentAcademicYear.schoolYear,
      DengueCases: formattedCases,
    });

    // LOG
    await createLog({
      user: 'n/a',
      section: 'Dengue Monitoring',
      action: 'EXPORT',
      description: `School Year: ${currentAcademicYear.schoolYear} \nDengue Cases: ${formattedCases}`,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
