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
import { authenticateUser } from '../middleware/authenticateMiddleware.js';

const router = express.Router();

router.get('/fetchSchoolYears', getSchoolYears);
router.use(authenticateUser);
router.post('/create', createAcademicYear);
router.get('/fetch', getAcademicYears);
router.put('/update/:id', updateAcademicYear);
router.delete('/delete/:id', deleteAcademicYear);

router.put('/setActive/:id', setActiveAcademicYear);
router.put('/setCompleted/:id', setCompletedAcademicYear);

export default router;
