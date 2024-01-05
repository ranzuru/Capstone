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
import { authenticateUser } from '../middleware/authenticateMiddleware.js';
import { logActionsMiddleware } from '../middleware/logActionMiddleware.js';
const router = express.Router();

router.use(authenticateUser);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', logActionsMiddleware, createEmployeeMedical);
router.get('/fetch', getAllEmployeeMedicals);
router.put('/update/:id', logActionsMiddleware, updateEmployeeMedical);
router.delete('/delete/:id', logActionsMiddleware, deleteEmployeeMedical);
router.delete('/bulkDelete', logActionsMiddleware, bulkDeleteEmployeeMedical);
router.post('/import', upload.single('file'), importMedical);

export default router;
