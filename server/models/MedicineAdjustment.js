import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  { 
    itemId: {
      type: String,
      required: true,
    }, 
    batchId: {
      type: String,
      required: true,
    }, 
    type: {
      type: String,
      required: true,
    }, 
    quantity: {
      type: Number,
      required: true,
    },
    reason: {
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

const MedicineAdjustmentSchema = mongoose.model('medicineAdjustment', schema);

export default MedicineAdjustmentSchema;
