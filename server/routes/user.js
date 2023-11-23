import express from 'express';
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from '../controller/userController.js';
const router = express.Router();

router.post('/create', createUser);
router.get('/fetch', getUser);
router.put('/update', updateUser);
router.delete('/delete', deleteUser);

export default router;
