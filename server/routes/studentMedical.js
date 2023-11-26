import express from 'express';
import {
  createStudentMedical,
  getAllStudentMedicals,
  updateStudentMedical,
  deleteStudentMedical,
} from '../controller/studentMedicalController.js';
// import multer from 'multer';
const router = express.Router();

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

router.post('/create', createStudentMedical);
router.get('/fetch', getAllStudentMedicals);
router.put('/update/:id', updateStudentMedical);
router.delete('/delete/:id', deleteStudentMedical);
// router.post('/import', upload.single('file'), importDengueMonitoring);

export default router;
