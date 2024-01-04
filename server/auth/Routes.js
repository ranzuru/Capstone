import express from 'express';
import {
  login,
  verifyLoginOTP,
  resendOTP,
  logout,
  refreshAccessToken,
  authenticate,
} from '../controller/authController.js';

const router = express.Router();

router.post('/refresh-token', refreshAccessToken);
router.post('/login', login);
router.get('/authenticate', authenticate);
router.post('/verify-otp', verifyLoginOTP);
router.post('/resend-otp', resendOTP);
router.post('/logout', logout);

export default router;
