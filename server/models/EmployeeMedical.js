import mongoose from 'mongoose';

const employeeMedicalSchema = new mongoose.Schema(
  {
    dateOfExamination: {
      type: Date,
      required: true,
    },
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
    role: {
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
    temperature: { type: Number, required: true },
    bloodPressure: { type: String, required: true },
    heartRate: { type: Number, required: true },
    pulseRate: { type: Number, required: true },
    respiratoryRate: { type: Number, required: true },
    visionScreening: { type: String, required: true },
    auditoryScreening: { type: String, required: true },
    skinScreening: { type: String, required: true },
    scalpScreening: { type: String, required: true },
    eyesScreening: { type: String, required: true },
    earScreening: { type: String, required: true },
    noseScreening: { type: String, required: true },
    mouthScreening: { type: String, required: true },
    throatScreening: { type: String, required: true },
    neckScreening: { type: String, required: true },
    lungScreening: { type: String, required: true },
    heartScreening: { type: String, required: true },
    abdomen: { type: String, required: true },
    deformities: { type: String, required: true },
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

employeeMedicalSchema.index(
  { employeeId: 1, academicYear: 1 },
  { unique: true }
);

const EmployeeMedicalSchema = mongoose.model(
  'EmployeeMedical',
  employeeMedicalSchema
);

export default EmployeeMedicalSchema;
