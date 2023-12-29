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
    receiptId: {
      type: String,
      required: true,
    },
    expirationDate: {
      type: Date,
      required: true,
    },   
    quantity: {
      type: Number,
      required: true,
    },
    notes: {
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

const MedicineInSchema = mongoose.model('medicineIn', schema);

export default MedicineInSchema;
