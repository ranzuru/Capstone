import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  navigationScopes: [String],
});

const Role = mongoose.model('Role', roleSchema);

export default Role;
