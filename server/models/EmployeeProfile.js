import mongoose from 'mongoose';

const employeeProfileSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
    },
    nameExtension: {
      type: String,
    },
    gender: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    mobileNumber: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Archived', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

employeeProfileSchema.index(
  { employeeId: 1, academicYear: 1 },
  { unique: true }
);

const EmployeeProfileSchema = mongoose.model(
  'EmployeeProfile',
  employeeProfileSchema
);

export default EmployeeProfileSchema;
