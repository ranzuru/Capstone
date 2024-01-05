import express from 'express';
import {
  createFeeding,
  getAllFeedings,
  updateFeeding,
  deleteFeeding,
  bulkDeleteFeedings,
  importFeedingProgram,
  getActiveSBFPBeneficiaries,
} from '../controller/feedingProgramController.js';
import {
  getPrePostComparison,
  getSBFPBeneficiariesPerGrade,
  getBeneficiaryImpact,
  calculateComparisonStatistics,
} from '../controller/analytics/feedingChart.js';
import multer from 'multer';
import { authenticateUser } from '../middleware/authenticateMiddleware.js';
import { logActionsMiddleware } from '../middleware/logActionMiddleware.js';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(authenticateUser);
router.post('/create', logActionsMiddleware, createFeeding);
router.get('/fetch/:type', getAllFeedings);
router.put('/update/:id', logActionsMiddleware, updateFeeding);
router.delete('/delete/:id', logActionsMiddleware, deleteFeeding);
router.delete('/bulkDelete', logActionsMiddleware, bulkDeleteFeedings);
router.post('/import', upload.single('file'), importFeedingProgram);

router.get('/fetchComparisonPREAndPOST/:schoolYear', getPrePostComparison);
router.get('/fetchSBFP/:schoolYear', getSBFPBeneficiariesPerGrade);

router.get('/fetchBeneficiaryImpact/:schoolYear', getBeneficiaryImpact);
router.get(
  '/fetchComparisonStatistics/:schoolYear',
  calculateComparisonStatistics
);

router.get('/fetchPDF', getActiveSBFPBeneficiaries);

export default router;
