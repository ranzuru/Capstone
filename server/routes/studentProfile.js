import express from 'express';
import {
  createStudentProfile,
  getAllStudentProfiles,
  updateStudentProfile,
  deleteStudentProfile,
  getStudentProfiles,
  importStudentProfiles,
  bulkDeleteStudentProfiles,
} from '../controller/studentProfileController.js';
import multer from 'multer';
import { authenticateUser } from '../middleware/authenticateMiddleware.js';
import { logActionsMiddleware } from '../middleware/logActionMiddleware.js';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(authenticateUser);
router.post('/create', logActionsMiddleware, createStudentProfile);
router.get('/fetch', getAllStudentProfiles);
router.get('/fetchProfile', getStudentProfiles);
router.put('/update/:id', logActionsMiddleware, updateStudentProfile);
router.delete('/delete/:id', logActionsMiddleware, deleteStudentProfile);
router.delete('/bulkDelete', logActionsMiddleware, bulkDeleteStudentProfiles);
router.post('/import', upload.single('file'), importStudentProfiles);

export default router;
