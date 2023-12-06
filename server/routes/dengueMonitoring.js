import express from 'express';
import {
  createDengueMonitoring,
  getAllDengueMonitoring,
  updateDengueMonitoring,
  deleteDengueMonitoring,
  importDengueMonitoring,
} from '../controller/dengueMonitoringController.js';
import {
  getGroupedDengueData,
  calculateStatisticsByAcademicYear,
  getMonthlyDengueCases,
  getCasesPerGrade,
} from '../controller/analytics/dengueBarCharts.js';

import multer from 'multer';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', createDengueMonitoring);
router.get('/fetch', getAllDengueMonitoring);
router.put('/update/:id', updateDengueMonitoring);
router.delete('/delete/:id', deleteDengueMonitoring);
router.post('/import', upload.single('file'), importDengueMonitoring);

router.get('/fetchBar/:schoolYear', getGroupedDengueData);
router.get('/fetchLine/:schoolYear', getMonthlyDengueCases);
router.get('/fetchPie/:schoolYear', getCasesPerGrade);
router.get('/fetchStatistics', calculateStatisticsByAcademicYear);

export default router;
