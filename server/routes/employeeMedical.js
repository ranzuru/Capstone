import express from 'express';
import {
  createEmployeeMedical,
  getAllEmployeeMedicals,
  updateEmployeeMedical,
  deleteEmployeeMedical,
  bulkDeleteEmployeeMedical,
  importMedical,
} from '../controller/employeeMedicalController.js';
import multer from 'multer';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', createEmployeeMedical);
router.get('/fetch', getAllEmployeeMedicals);
router.put('/update/:id', updateEmployeeMedical);
router.delete('/delete/:id', deleteEmployeeMedical);
router.delete('/bulkDelete', bulkDeleteEmployeeMedical);
router.post('/import', upload.single('file'), importMedical);

export default router;
