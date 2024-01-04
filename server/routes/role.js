import express from 'express';
import {
  createRole,
  getRole,
  updateRole,
  deleteRole,
  getAllRoleNames,
  deleteBulkRoles,
} from '../controller/roleController.js';
import { authenticateUser } from '../middleware/authenticateMiddleware.js';
const router = express.Router();

router.use(authenticateUser);

router.post('/create', createRole);
router.get('/fetch', getRole);
router.get('/fetchRoleNames', getAllRoleNames);
router.put('/update/:id', updateRole);
router.delete('/delete/:id', deleteRole);
router.delete('/bulkDelete', deleteBulkRoles);

export default router;
