import express from 'express';
import {
  createRole,
  getRole,
  updateRole,
  deleteRole,
} from '../controller/roleController.js';
const router = express.Router();

router.post('/create', createRole);
router.get('/fetch', getRole);
router.put('/update/:id', updateRole);
router.delete('/delete', deleteRole);

export default router;
