import express from 'express';
import {
  createAcademicYear,
  getAcademicYears,
  updateAcademicYear,
  deleteAcademicYear,
  getSchoolYears,
  setActiveAcademicYear,
  setCompletedAcademicYear,
} from '../controller/academicYearController.js';
const router = express.Router();

router.post('/create', createAcademicYear);
router.get('/fetch', getAcademicYears);
router.put('/update/:id', updateAcademicYear);
router.delete('/delete/:id', deleteAcademicYear);
router.get('/fetchSchoolYears', getSchoolYears);

router.put('/setActive/:id', setActiveAcademicYear);
router.put('/setCompleted/:id', setCompletedAcademicYear);

export default router;
