import express from 'express';
import {
  createEmployee,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  importEmployeesProfile,
  getEmployeeProfiles,
} from '../controller/employeeProfileController.js';
import multer from 'multer';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', createEmployee);
router.get('/fetch', getAllEmployees);
router.get('/fetchEmployee', getEmployeeProfiles);
router.put('/update/:id', updateEmployee);
router.delete('/delete/:id', deleteEmployee);
router.post('/import', upload.single('file'), importEmployeesProfile);

export default router;
