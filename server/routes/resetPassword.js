import express from 'express';
import {
  sendPasswordResetEmail,
  resetPassword,
} from '../controller/resetPasswordController.js';
import { authenticateUser } from '../middleware/authenticateMiddleware.js';
const router = express.Router();

router.use(authenticateUser);

router.post('/request-reset-email', sendPasswordResetEmail);
router.post('/resetPassword', resetPassword);

export default router;
