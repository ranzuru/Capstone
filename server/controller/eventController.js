// eventController.js
import Event from '../models/Event.js';
import moment from 'moment-timezone';

export const createEvent = async (req, res) => {
  try {
    const { title, description, startDateTime, endDateTime } = req.body;
    const event = new Event({ title, description, startDateTime, endDateTime });
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Unable to create event' });
  }
};

export const fetchEvents = async (req, res) => {
  try {
    const events = await Event.find();
    const eventsInTaiwanTime = events.map((event) => ({
      ...event.toObject(),
      startDateTime: moment(event.startDateTime).tz('Asia/Taipei').format(),
      endDateTime: moment(event.endDateTime).tz('Asia/Taipei').format(),
    }));
    res.json(eventsInTaiwanTime);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Unable to fetch events' });
  }
};

export const fetchEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Unable to fetch event' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { title, description, startDateTime, endDateTime } = req.body;
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      { title, description, startDateTime, endDateTime },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Unable to update event' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndRemove(req.params.eventId);
    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(deletedEvent);
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Unable to delete event' });
  }
};
