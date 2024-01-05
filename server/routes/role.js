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
import { logActionsMiddleware } from '../middleware/logActionMiddleware.js';
const router = express.Router();

router.use(authenticateUser);

router.post('/create', logActionsMiddleware, createRole);
router.get('/fetch', getRole);
router.get('/fetchRoleNames', getAllRoleNames);
router.put('/update/:id', logActionsMiddleware, updateRole);
router.delete('/delete/:id', logActionsMiddleware, deleteRole);
router.delete('/bulkDelete', logActionsMiddleware, deleteBulkRoles);

export default router;
