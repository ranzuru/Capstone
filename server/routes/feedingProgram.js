import express from 'express';
import {
  createFeeding,
  getAllFeedings,
  updateFeeding,
  deleteFeeding,
  bulkDeleteFeedings,
  importFeedingProgram,
} from '../controller/feedingProgramController.js';
import {
  getBmiClassificationCountsByYear,
  getPrePostComparison,
  getSBFPBeneficiariesPerGrade,
} from '../controller/analytics/feedingChart.js';
import multer from 'multer';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', createFeeding);
router.get('/fetch/:type', getAllFeedings);
router.put('/update/:id', updateFeeding);
router.delete('/delete/:id', deleteFeeding);
router.delete('/bulkDelete', bulkDeleteFeedings);
router.post('/import', upload.single('file'), importFeedingProgram);

router.get('/fetchBMIClassification', getBmiClassificationCountsByYear);
router.get('/fetchComparisonPREAndPOST', getPrePostComparison);
router.get('/fetchSBFP', getSBFPBeneficiariesPerGrade);

export default router;
