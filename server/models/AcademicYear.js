import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const academicYearSchema = new Schema(
  {
    schoolYear: {
      type: String,
      required: true,
      match: /^\d{4}-\d{4}$/,
    },
    monthFrom: {
      type: String,
      required: true,
    },
    monthTo: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Pending'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

academicYearSchema.index({ status: 1, schoolYear: 1 }, { unique: true });

academicYearSchema.pre('save', async function (next) {
  if (this.status === 'Active') {
    const existingActive = await this.constructor.findOne({ status: 'Active' });
    if (
      existingActive &&
      existingActive._id.toString() !== this._id.toString()
    ) {
      throw new Error('There can only be one active AcademicYear.');
    }
  }
  next();
});

export default model('AcademicYear', academicYearSchema);
