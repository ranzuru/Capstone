import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    lrn: {
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
      default: '',
    },
    nameExtension: {
      type: String,
      default: '',
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
    grade: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    is4p: {
      type: Boolean,
      required: true,
    },
    parentName1: {
      type: String,
      required: true,
    },
    parentContact1: {
      type: String,
      required: true,
    },
    parentName2: {
      type: String,
    },
    parentContact2: {
      type: String,
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

studentProfileSchema.index({ lrn: 1, academicYear: 1 }, { unique: true });

const StudentProfileSchema = mongoose.model(
  'StudentProfile',
  studentProfileSchema
);
export default StudentProfileSchema;
