import express from 'express';
import {
  createStudentProfile,
  getAllStudentProfiles,
  updateStudentProfile,
  deleteStudentProfile,
} from '../controller/studentProfileController.js';
const router = express.Router();

router.post('/create', createStudentProfile);
router.get('/fetch', getAllStudentProfiles);
router.put('/update/:id', updateStudentProfile);
router.delete('/delete/:id', deleteStudentProfile);

export default router;
