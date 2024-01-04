import express from 'express';
import {
  sendPasswordResetEmail,
  resetPassword,
} from '../controller/resetPasswordController.js';

const router = express.Router();

router.post('/request-reset-email', sendPasswordResetEmail);
router.post('/resetPassword', resetPassword);

export default router;
