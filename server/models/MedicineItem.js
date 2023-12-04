import mongoose from 'mongoose';
import { nanoid  } from 'nanoid';


const schema = new mongoose.Schema(
  { 
    itemId: {
      type: String,
      required: true,
      default: () => nanoid(5),
      index: { unique: true },
    },
    product: {
      type: String,
      required: true,
      unique: true,
    },   
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    dosagePer: {
      type: String,
      required: true,
    },
    description: {
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

const MedicineItemSchema = mongoose.model('medicineItem', schema);

export default MedicineItemSchema;
