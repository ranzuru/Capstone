import mongoose from 'mongoose';

// Define a schema for calendar events
const event = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  startDateTime: {
    type: Date,
    required: true,
  },
  endDateTime: {
    type: Date,
    required: true,
  },
});

// Create a model for calendar events using the schema
const Event = mongoose.model('Event', event);

export default Event;
