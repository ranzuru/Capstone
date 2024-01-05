import express from 'express';
import {
  createDengueMonitoring,
  getAllDengueMonitoring,
  updateDengueMonitoring,
  deleteDengueMonitoring,
  importDengueMonitoring,
  bulkDeleteDengueMonitoring,
  getDengueCasesForActiveYear,
} from '../controller/dengueMonitoringController.js';
import {
  getGroupedDengueData,
  getMonthlyDengueCases,
  getCasesPerGrade,
  calculateComparisonStatistics,
} from '../controller/analytics/dengueCharts.js';
import { authenticateUser } from '../middleware/authenticateMiddleware.js';
import { logActionsMiddleware } from '../middleware/logActionMiddleware.js';

import multer from 'multer';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(authenticateUser);
router.post('/create', logActionsMiddleware, createDengueMonitoring);
router.get('/fetch', getAllDengueMonitoring);
router.put('/update/:id', logActionsMiddleware, updateDengueMonitoring);
router.delete('/delete/:id', logActionsMiddleware, deleteDengueMonitoring);
router.delete('/bulkDelete', logActionsMiddleware, bulkDeleteDengueMonitoring);
router.post('/import', upload.single('file'), importDengueMonitoring);

router.get('/fetchBar/:schoolYear', getGroupedDengueData);
router.get('/fetchLine/:schoolYear', getMonthlyDengueCases);
router.get('/fetchPie/:schoolYear', getCasesPerGrade);

router.get(
  '/fetchComparisonAnalytics/:schoolYear',
  calculateComparisonStatistics
);

router.get('/fetchPDFReport', getDengueCasesForActiveYear);

export default router;
