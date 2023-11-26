import express from 'express';
import {
  createStudentProfile,
  getAllStudentProfiles,
  updateStudentProfile,
  deleteStudentProfile,
  getStudentProfiles,
  importStudentProfiles,
} from '../controller/studentProfileController.js';
import multer from 'multer';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', createStudentProfile);
router.get('/fetch', getAllStudentProfiles);
router.get('/fetchProfile', getStudentProfiles);
router.put('/update/:id', updateStudentProfile);
router.delete('/delete/:id', deleteStudentProfile);
router.post('/import', upload.single('file'), importStudentProfiles);

export default router;
