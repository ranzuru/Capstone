import express from 'express';
import {
  createDengueMonitoring,
  getAllDengueMonitoring,
  updateDengueMonitoring,
  deleteDengueMonitoring,
  importDengueMonitoring,
} from '../controller/dengueMonitoringController.js';
import multer from 'multer';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', createDengueMonitoring);
router.get('/fetch', getAllDengueMonitoring);
router.put('/update/:id', updateDengueMonitoring);
router.delete('/delete/:id', deleteDengueMonitoring);
router.post('/import', upload.single('file'), importDengueMonitoring);

export default router;
