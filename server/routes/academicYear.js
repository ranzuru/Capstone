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
import { logActionsMiddleware } from '../middleware/logActionMiddleware.js';

const router = express.Router();

router.get('/fetchSchoolYears', getSchoolYears);
router.use(authenticateUser);
router.post('/create', logActionsMiddleware, createAcademicYear);
router.get('/fetch', getAcademicYears);
router.put('/update/:id', logActionsMiddleware, updateAcademicYear);
router.delete('/delete/:id', logActionsMiddleware, deleteAcademicYear);

router.put('/setActive/:id', logActionsMiddleware, setActiveAcademicYear);
router.put('/setCompleted/:id', logActionsMiddleware, setCompletedAcademicYear);

export default router;
