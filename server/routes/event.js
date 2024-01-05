// Updated router file
import express from 'express';
import {
  createEvent,
  fetchEvents,
  fetchEventById,
  updateEvent,
  deleteEvent,
} from '../controller/eventController.js';
import { authenticateUser } from '../middleware/authenticateMiddleware.js';
import { logActionsMiddleware } from '../middleware/logActionMiddleware.js';
const router = express.Router();

router.use(authenticateUser);

router.post('/createEvent', logActionsMiddleware, createEvent);
router.get('/fetchEvent', fetchEvents);
router.get('/fetchEvent/:eventId', fetchEventById);
router.put('/updateEvent/:eventId', logActionsMiddleware, updateEvent);
router.delete('/deleteEvent/:eventId', logActionsMiddleware, deleteEvent);

export default router;
