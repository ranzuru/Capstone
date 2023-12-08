import express from 'express';
import { fetchDataForDataGrid } from '../controller/dewormingController.js';
import {
  getDewormingStats,
  getPieChartData,
} from '../controller/analytics/dewormingCharts.js';

const router = express.Router();

router.get('/fetch', fetchDataForDataGrid);
router.get('/fetchBar', getDewormingStats);
router.get('/fetchPie', getPieChartData);

export default router;
