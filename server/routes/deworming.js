import express from 'express';
import {
  fetchDataForDataGrid,
  getDewormReport,
} from '../controller/dewormingController.js';
import {
  getDewormingStats,
  getPieChartData,
} from '../controller/analytics/dewormingCharts.js';

const router = express.Router();

router.get('/fetch', fetchDataForDataGrid);
router.get('/fetchBar/:schoolYear', getDewormingStats);
router.get('/fetchPie/:schoolYear', getPieChartData);

router.get('/fetchPDFReport', getDewormReport);

export default router;
