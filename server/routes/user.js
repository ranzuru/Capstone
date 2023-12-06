import express from 'express';
import {
  createUser,
  getUser,
  updateUserProfile,
  deleteUser,
} from '../controller/userController.js';
const router = express.Router();

router.post('/create', createUser);
router.get('/fetch', getUser);
router.put('/update/:id', updateUserProfile);
router.delete('/delete/:id', deleteUser);

export default router;
