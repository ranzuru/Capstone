import express from 'express';
import { getDashboardCounts } from '../controller/dashboardController.js';
import { authenticateUser } from '../middleware/authenticateMiddleware.js';
const router = express.Router();

// Route for dashboard counts
router.get('/dashboard-counts', authenticateUser, getDashboardCounts);

export default router;
