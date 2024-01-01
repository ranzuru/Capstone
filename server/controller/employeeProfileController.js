import EmployeeProfile from '../models/EmployeeProfile.js'; // Adjust the path as needed
import AcademicYear from '../models/AcademicYear.js';
import { handleError } from '../utils/handleError.js';
import { validateEmployeeProfile } from '../schema/employeeProfileValidation.js';
import importEmployees from '../services/importEmployeeProfile.js';

export const createEmployee = async (req, res) => {
  try {
    const { schoolYear, ...employeeData } = req.body;

    const { error } = validateEmployeeProfile({ schoolYear, ...employeeData });
    if (error) return res.status(400).send(error.details[0].message);

    const academicYear = await AcademicYear.findOne({ schoolYear });
    if (!academicYear) return res.status(400).send('Invalid academic year.');

    const employeeProfile = new EmployeeProfile({
      ...employeeData,
      academicYear: academicYear._id,
    });

    await employeeProfile.save();
    const populatedEmployeeProfile = await EmployeeProfile.findById(
      employeeProfile._id
    ).populate('academicYear');

    const response = populatedEmployeeProfile.toObject();
    response.schoolYear = academicYear.schoolYear;

    res.status(201).send(response);
  } catch (err) {
    handleError(res, err);
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const { schoolYear } = req.query;
    let employees;

    if (schoolYear) {
      // Use aggregation pipeline when schoolYear is provided
      const aggregation = [
        {
          $lookup: {
            from: 'academicyears', // Make sure this matches your collection name for academic years
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
      employees = await EmployeeProfile.aggregate(aggregation);
    } else {
      // Use find with populate when schoolYear is not provided
      employees = await EmployeeProfile.find().populate({
        path: 'academicYear',
        select: 'schoolYear',
      });
    }

    res.status(200).json(employees);
  } catch (err) {
    handleError(res, err);
  }
};

export const getEmployeeProfiles = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;

    // Building the search query with a condition for 'status' being 'Active'
    const searchQuery = {
      status: 'Active', // filtering for active students
      ...(search
        ? {
            $or: [
              { firstName: { $regex: search, $options: 'i' } },
              { lastName: { $regex: search, $options: 'i' } },
              { employeeId: { $regex: search, $options: 'i' } },
            ],
          }
        : {}),
    };

    const total = await EmployeeProfile.countDocuments(searchQuery);
    const employeeProfiles = await EmployeeProfile.find(
      searchQuery,
      'employeeId lastName firstName middleName nameExtension gender mobileNumber dateOfBirth age role '
    )
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ data: employeeProfiles, total, page, limit });
  } catch (error) {
    res.status(500).send('Error fetching employee profiles: ' + error.message);
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { schoolYear, ...updateData } = req.body;

    let updateObject = updateData;

    // Update academicYear if schoolYear is provided
    if (schoolYear) {
      const academicYear = await AcademicYear.findOne({ schoolYear });
      if (!academicYear) return res.status(400).send('Invalid academic year.');
      updateObject.academicYear = academicYear._id;
    }

    const updatedEmployee = await EmployeeProfile.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    ).populate('academicYear');

    if (!updatedEmployee) {
      return res.status(404).send('Employee not found');
    }

    const response = updatedEmployee.toObject();
    response.schoolYear = updatedEmployee.academicYear.schoolYear;

    res.status(200).send(response);
  } catch (err) {
    handleError(res, err);
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const deletedEmployee = await EmployeeProfile.findByIdAndDelete(
      req.params.id
    );
    if (!deletedEmployee) {
      return res.status(404).send('Employee not found');
    }
    res.status(200).send('Employee deleted successfully');
  } catch (err) {
    handleError(res, err);
  }
};

export const bulkDeleteEmployee = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res
        .status(400)
        .send('No employee profile IDs provided for deletion');
    }

    const result = await EmployeeProfile.deleteMany({
      _id: { $in: ids },
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .send('No employee profiles found for the provided IDs');
    }

    res.send({
      message: `Successfully deleted ${result.deletedCount} employee records`,
    });
  } catch (err) {
    handleError(res, err);
  }
};

export const importEmployeesProfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const fileBuffer = req.file.buffer;
    const { employeeProfiles, errors } = await importEmployees(fileBuffer);

    if (errors.length > 0) {
      // Construct a detailed error message if there are errors
      const errorDetails = errors
        .map((error) => {
          if (error.employeeId && error.message) {
            return `Employee ID ${error.employeeId}: ${error.message}`;
          }
          return error.message || 'Unknown error';
        })
        .join('; ');

      return res.status(400).json({
        message: 'Some records have errors.',
        detailedErrors: errorDetails, // Include the detailed error messages
        errorCount: errors.length,
      });
    }

    res.status(201).json({
      message: 'Employees imported successfully',
      count: employeeProfiles.length,
    });
  } catch (err) {
    handleError(res, err);
  }
};
