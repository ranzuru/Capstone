import express from 'express';
import {
  createFeeding,
  getAllFeedings,
  updateFeeding,
  deleteFeeding,
  importFeedingProgram,
} from '../controller/feedingProgramController.js';
import multer from 'multer';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', createFeeding);
router.get('/fetch/:type', getAllFeedings);
router.put('/update/:id', updateFeeding);
router.delete('/delete/:id', deleteFeeding);
router.post('/import', upload.single('file'), importFeedingProgram);

export default router;
