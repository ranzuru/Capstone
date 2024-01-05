import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
  {},
  { strict: false, collection: 'logs' }
);

const Log = mongoose.model('Log', logSchema);

export default Log;
