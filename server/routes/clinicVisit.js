import express from 'express';
import {
  post,
  getAll,
  update,
  deleteData,
} from '../controller/clinicVisitController.js';
import {
  getVisitCount,
  getGradeLevelDemographics,
  getMaladyDistribution,
  calculateComparisonStatistics,
} from '../controller/analytics/clinicVisitCharts.js';
const router = express.Router();

router.post('/post', post);
router.get('/getAll', getAll);
router.put('/update/:id', update);
router.delete('/deleteData/:id', deleteData);

// Analytics
router.get('/fetchLineChart/:schoolYear', getVisitCount);
router.get('/fetchPieChart/:schoolYear', getGradeLevelDemographics);
router.get('/fetchBarChart/:schoolYear', getMaladyDistribution);

// Comparison
router.get('/fetchSummary/:schoolYear', calculateComparisonStatistics);

export default router;
