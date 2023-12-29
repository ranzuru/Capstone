import express from 'express';
import {
  fetchDataForDataGrid,
  getDewormReport,
} from '../controller/dewormingController.js';
import {
  getDewormingStats,
  getPieChartData,
  calculateComparisonStatistics,
} from '../controller/analytics/dewormingCharts.js';

const router = express.Router();

router.get('/fetch', fetchDataForDataGrid);
router.get('/fetchBar/:schoolYear', getDewormingStats);
router.get('/fetchPie/:schoolYear', getPieChartData);
router.get('/fetchSummary/:schoolYear', calculateComparisonStatistics);

router.get('/fetchPDFReport', getDewormReport);

export default router;
