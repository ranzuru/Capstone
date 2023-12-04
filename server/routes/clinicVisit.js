import express from 'express';
import {
  post,
  getAll,
  update,
  deleteData,
} from '../controller/clinicVisitController.js';
const router = express.Router();

router.post('/post', post);
router.get('/getAll', getAll);
router.put('/update/:id', update);
router.delete('/deleteData/:id', deleteData);

export default router;
