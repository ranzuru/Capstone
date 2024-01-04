import express from 'express';
import {
  createUser,
  getUser,
  updateUserProfile,
  deleteUser,
  getUserProfile,
  updateUserProfileSettings,
} from '../controller/userController.js';
import { authenticateUser } from '../middleware/authenticateMiddleware.js';
const router = express.Router();
router.use(authenticateUser);
router.post('/create', createUser);
router.get('/fetch', getUser);
router.put('/update/:id', updateUserProfile);
router.delete('/delete/:id', deleteUser);

router.get('/user-profile/:userId', getUserProfile);
router.put('/user-settings/:userId', updateUserProfileSettings);

export default router;
