// Updated router file
import express from 'express';
import { fetchLogsController } from '../controller/logsController.js';
import { authenticateUser } from '../middleware/authenticateMiddleware.js';

const router = express.Router();

router.get('/fetchLogs', authenticateUser, fetchLogsController);

export default router;
