import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    patientId: {
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
    grade: {
      type: String,
    },
    section: {
      type: String,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    medicine: {
      type: String,
      ref: 'medicineIn',
    },
    quantity: {
      type: Number,
    },
    malady: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
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

const ClinicVisitSchema = mongoose.model('clinicVisit', schema);

export default ClinicVisitSchema;
