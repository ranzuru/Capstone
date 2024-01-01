import StudentMedical from '../models/StudentMedical.js';
import AcademicYear from '../models/AcademicYear.js';
import { handleError } from '../utils/handleError.js';
import { validateStudentMedical } from '../schema/studentMedicalValidation.js';
import importStudentMedical from '../services/importStudentMedical.js';
import moment from 'moment';

// Create
export const createStudentMedical = async (req, res) => {
  try {
    const { schoolYear, ...studentData } = req.body;

    // Validate student data
    const { error } = validateStudentMedical({ schoolYear, ...studentData });
    if (error) return res.status(400).send(error.details[0].message);

    // Find the academic year using the schoolYear field
    const academicYear = await AcademicYear.findOne({ schoolYear });
    if (!academicYear) return res.status(400).send('Invalid academic year.');

    // Create a new student profile with the academic year ObjectId
    const studentMedical = new StudentMedical({
      ...studentData,
      academicYear: academicYear._id,
    });

    await studentMedical.save();
    const populatedStudentMedical = await StudentMedical.findById(
      studentMedical._id
    ).populate('academicYear');

    // Modify the response to include the schoolYear string instead of the ObjectId
    const response = populatedStudentMedical.toObject(); // Convert to a plain JavaScript object
    response.schoolYear = academicYear.schoolYear; // Add the schoolYear string

    res.status(201).send(response);
  } catch (err) {
    handleError(res, err);
  }
};

// Read all
export const getAllStudentMedicals = async (req, res) => {
  try {
    const { schoolYear } = req.query;
    let studentMedicals;

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
      studentMedicals = await StudentMedical.aggregate(aggregation);
    } else {
      studentMedicals = await StudentMedical.find().populate({
        path: 'academicYear',
        select: 'schoolYear',
      });
    }

    res.send(studentMedicals);
  } catch (err) {
    handleError(res, err);
  }
};

// Update
export const updateStudentMedical = async (req, res) => {
  try {
    const { schoolYear, ...updateData } = req.body;

    let updateObject = updateData;

    // Find the academic year using the schoolYear field
    if (schoolYear) {
      const academicYear = await AcademicYear.findOne({ schoolYear });
      if (!academicYear) return res.status(400).send('Invalid academic year.');
      updateObject.academicYear = academicYear._id;
    }

    const studentMedical = await StudentMedical.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    ).populate('academicYear');

    // Modify the response to include the schoolYear string instead of the ObjectId
    const response = studentMedical.toObject(); // Convert to a plain JavaScript object
    response.schoolYear = studentMedical.academicYear.schoolYear; // Add the schoolYear string

    res.send(response);
  } catch (err) {
    handleError(res, err);
  }
};

// Delete
export const deleteStudentMedical = async (req, res) => {
  try {
    const studentMedical = await StudentMedical.findByIdAndDelete(
      req.params.id
    );
    if (!studentMedical)
      return res.status(404).send('Student record not found');

    res.send(studentMedical);
  } catch (err) {
    handleError(res, err);
  }
};

// Bulk delete
export const bulkDeleteStudentMedical = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res
        .status(400)
        .send('No student medical IDs provided for deletion');
    }

    const result = await StudentMedical.deleteMany({
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

// import
export const importMedical = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const fileBuffer = req.file.buffer;
    const { studentMedicalRecords, errors, hasMoreErrors } =
      await importStudentMedical(fileBuffer);

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
      message: 'Student Medical Records imported successfully',
      count: studentMedicalRecords.length,
    });
  } catch (err) {
    handleError(res, err);
  }
};

// Fetch each health record
export const getStudentMedicalById = async (req, res) => {
  try {
    const { id } = req.params;
    const { schoolYear } = req.query;

    if (!schoolYear) {
      return res
        .status(400)
        .json({ message: 'School year query is required.' });
    }

    const academicYear = await AcademicYear.findOne({ schoolYear });
    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    const studentMedical = await StudentMedical.findOne({
      _id: id,
      academicYear: academicYear._id, // Ensure the record is linked to the correct academic year
    });

    if (!studentMedical) {
      return res
        .status(404)
        .send(
          'Student medical record not found for the specified academic year.'
        );
    }

    // Formatting the single studentMedical record
    let fullName = `${studentMedical.lastName}, ${studentMedical.firstName}`;
    if (studentMedical.middleName) {
      fullName += ` ${studentMedical.middleName.charAt(0)}.`;
    }
    if (studentMedical.nameExtension && studentMedical.nameExtension.trim()) {
      fullName += ` ${studentMedical.nameExtension}`;
    }
    const dobFormatted = moment(studentMedical.dateOfBirth).format(
      'MMMM D, YYYY'
    );
    const dateMeasuredFormatted = moment(studentMedical.dateMeasured).format(
      'MM/DD/YYYY'
    );

    const formattedRecord = {
      Name: fullName,
      LRN: studentMedical.lrn,
      Age: studentMedical.age.toString(),
      DOB: dobFormatted,
      GradeSection: `${studentMedical.grade}/${studentMedical.section}`,
      DateOfExamination: dateMeasuredFormatted,
      Temperature: `${studentMedical.temperature}°C`,
      BloodPressure: `${studentMedical.bloodPressure} mmHg`,
      HeartRate: `${studentMedical.heartRate} bpm`,
      PulseRate: `${studentMedical.pulseRate} bpm`,
      RespiratoryRate: `${studentMedical.respiratoryRate} bpm`,
      WeightKg: `${studentMedical.weightKg} kg`,
      HeightCm: `${studentMedical.heightCm} cm`,
      BMI: studentMedical.bmi.toString(),
      BMIClassification: studentMedical.bmiClassification,
      HeightForAge: studentMedical.heightForAge,
      VisionScreening: studentMedical.visionScreening,
      AuditoryScreening: studentMedical.auditoryScreening,
      SkinScreening: studentMedical.skinScreening,
      ScalpScreening: studentMedical.scalpScreening,
      EyesScreening: studentMedical.eyesScreening,
      EarScreening: studentMedical.earScreening,
      NoseScreening: studentMedical.noseScreening,
      MouthScreening: studentMedical.mouthScreening,
      ThroatScreening: studentMedical.throatScreening,
      NeckScreening: studentMedical.neckScreening,
      LungScreening: studentMedical.lungScreening,
      HeartScreening: studentMedical.heartScreening,
      Abdomen: studentMedical.abdomen,
      Deformities: studentMedical.deformities,
      IronSupplementation: studentMedical.ironSupplementation ? 'Yes' : 'No',
      Deworming: studentMedical.deworming ? 'Yes' : 'No',
      Menarche: studentMedical.menarche || '',
      Remarks: studentMedical.remarks || '',
    };

    res.json({
      SchoolYear: academicYear.schoolYear,
      HealthRecord: formattedRecord,
    });
  } catch (err) {
    handleError(res, err);
  }
};
