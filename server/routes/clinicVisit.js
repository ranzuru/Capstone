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
import { authenticateUser } from '../middleware/authenticateMiddleware.js';
import { logActionsMiddleware } from '../middleware/logActionMiddleware.js';
const router = express.Router();

router.use(authenticateUser);

router.post('/post', logActionsMiddleware, post);
router.get('/getAll', getAll);
router.put('/update/:id', logActionsMiddleware, update);
router.delete('/deleteData/:id', logActionsMiddleware, deleteData);

// Analytics
router.get('/fetchLineChart/:schoolYear', getVisitCount);
router.get('/fetchPieChart/:schoolYear', getGradeLevelDemographics);
router.get('/fetchBarChart/:schoolYear', getMaladyDistribution);

// Comparison
router.get('/fetchSummary/:schoolYear', calculateComparisonStatistics);

export default router;
