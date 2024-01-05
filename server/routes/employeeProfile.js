import express from 'express';
import {
  createEmployee,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  importEmployeesProfile,
  getEmployeeProfiles,
  bulkDeleteEmployee,
} from '../controller/employeeProfileController.js';
import multer from 'multer';
import { authenticateUser } from '../middleware/authenticateMiddleware.js';
import { logActionsMiddleware } from '../middleware/logActionMiddleware.js';
const router = express.Router();

router.use(authenticateUser);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', logActionsMiddleware, createEmployee);
router.get('/fetch', getAllEmployees);
router.get('/fetchEmployee', getEmployeeProfiles);
router.put('/update/:id', logActionsMiddleware, updateEmployee);
router.delete('/delete/:id', logActionsMiddleware, deleteEmployee);
router.delete('/bulkDelete', logActionsMiddleware, bulkDeleteEmployee);
router.post('/import', upload.single('file'), importEmployeesProfile);

export default router;
