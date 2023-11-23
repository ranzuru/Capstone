// Updated router file
import express from 'express';
import {
  createEvent,
  fetchEvents,
  fetchEventById,
  updateEvent,
  deleteEvent,
} from '../controller/eventController.js';

const router = express.Router();

router.post('/createEvent', createEvent);
router.get('/fetchEvent', fetchEvents);
router.get('/fetchEvent/:eventId', fetchEventById);
router.put('/updateEvent/:eventId', updateEvent);
router.delete('/deleteEvent/:eventId', deleteEvent);

export default router;
