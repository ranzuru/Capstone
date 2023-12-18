import mongoose from 'mongoose';

const dengueMonitoringSchema = new mongoose.Schema(
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
    adviser: {
      type: String,
      required: true,
    },
    dateOfOnset: {
      type: Date,
      required: true,
    },
    dateOfAdmission: {
      type: Date,
    },
    hospitalAdmission: {
      type: String,
    },
    dateOfDischarge: {
      type: Date,
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
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

dengueMonitoringSchema.index({ lrn: 1, academicYear: 1 }, { unique: true });

const DengueMonitoringSchema = mongoose.model(
  'DengueMonitoring',
  dengueMonitoringSchema
);
export default DengueMonitoringSchema;
