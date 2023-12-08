import express from 'express';
import {
  createStudentMedical,
  getAllStudentMedicals,
  updateStudentMedical,
  deleteStudentMedical,
  bulkDeleteStudentMedical,
  importMedical,
} from '../controller/studentMedicalController.js';
import {
  getScreeningStatsBar,
  getHistogramData,
} from '../controller/analytics/medicalCharts.js';
import multer from 'multer';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', createStudentMedical);
router.get('/fetch', getAllStudentMedicals);
router.put('/update/:id', updateStudentMedical);
router.delete('/delete/:id', deleteStudentMedical);
router.delete('/bulkDelete', bulkDeleteStudentMedical);
router.post('/import', upload.single('file'), importMedical);

router.get('/fetchBar', getScreeningStatsBar);
router.get('/fetchBarTwo/:field', getHistogramData);

export default router;
