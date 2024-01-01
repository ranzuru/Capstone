import express from 'express';
import { getDashboardCounts } from '../controller/dashboardController.js';

const router = express.Router();

// Route for dashboard counts
router.get('/dashboard-counts', getDashboardCounts);

export default router;
