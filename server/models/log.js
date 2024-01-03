import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  { 
    user: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },      
  },
  { timestamps: true }
);

const logSchema = mongoose.model('log', schema);

export default logSchema;
