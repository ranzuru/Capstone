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
} from '../controller/analytics/dengueBarCharts.js';

import multer from 'multer';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', createDengueMonitoring);
router.get('/fetch', getAllDengueMonitoring);
router.put('/update/:id', updateDengueMonitoring);
router.delete('/delete/:id', deleteDengueMonitoring);
router.delete('/bulkDelete', bulkDeleteDengueMonitoring);
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
