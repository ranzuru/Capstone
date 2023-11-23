import express from 'express';
import {
  createAcademicYear,
  getAcademicYears,
  updateAcademicYear,
  deleteAcademicYear,
  getSchoolYears,
} from '../controller/academicYearController.js';
const router = express.Router();

router.post('/create', createAcademicYear);
router.get('/fetch', getAcademicYears);
router.put('/update/:id', updateAcademicYear);
router.delete('/delete/:id', deleteAcademicYear);
router.get('/fetchSchoolYears', getSchoolYears);

export default router;
