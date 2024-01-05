import express from 'express';
import {
  createStudentMedical,
  getAllStudentMedicals,
  updateStudentMedical,
  deleteStudentMedical,
  bulkDeleteStudentMedical,
  importMedical,
  getStudentMedicalById,
} from '../controller/studentMedicalController.js';
import {
  getScreeningStatsBar,
  getData,
  getGradeWiseScreeningIssues,
  getScreeningIssuesByDynamicAgeGroup,
  calculateComparisonStatistics,
} from '../controller/analytics/medicalCharts.js';
import multer from 'multer';
import { authenticateUser } from '../middleware/authenticateMiddleware.js';
import { logActionsMiddleware } from '../middleware/logActionMiddleware.js';
const router = express.Router();

router.use(authenticateUser);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', logActionsMiddleware, createStudentMedical);
router.get('/fetch', getAllStudentMedicals);
router.put('/update/:id', logActionsMiddleware, updateStudentMedical);
router.delete('/delete/:id', logActionsMiddleware, deleteStudentMedical);
router.delete('/bulkDelete', logActionsMiddleware, bulkDeleteStudentMedical);
router.post('/import', upload.single('file'), importMedical);

router.get('/fetchBar/:schoolYear', getScreeningStatsBar);
router.get('/fetchBarTwo/:field', getData);
router.get(
  '/fetchScreeningPerGrade/:schoolYear/:grade',
  getGradeWiseScreeningIssues
);
router.get(
  '/fetchScreeningPerAgeGroup/:screeningField',
  getScreeningIssuesByDynamicAgeGroup
);
router.get(
  '/fetchComparisonStatistics/:schoolYear',
  calculateComparisonStatistics
);

router.get('/fetchPDFReport/:id', getStudentMedicalById);

export default router;
