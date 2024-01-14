import mongoose from 'mongoose';

const feedingProgramSchema = new mongoose.Schema(
  {
    dateMeasured: {
      type: Date,
      required: true,
    },
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
    weightKg: {
      type: Number,
      required: true,
    },
    heightCm: {
      type: Number,
      required: true,
    },
    bmi: {
      type: Number,
      required: true,
    },
    bmiClassification: {
      type: String,
      required: true,
    },
    heightForAge: {
      type: String,
      required: true,
    },
    beneficiaryOfSBFP: {
      type: Boolean,
      required: true,
    },
    measurementType: {
      type: String,
      enum: ['PRE', 'POST'],
      required: true,
    },
    remarks: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Archived', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

feedingProgramSchema.index(
  { lrn: 1, measurementType: 1, academicYear: 1 },
  { unique: true }
);

const FeedingProgramSchema = mongoose.model(
  'FeedingProgram',
  feedingProgramSchema
);
export default FeedingProgramSchema;
