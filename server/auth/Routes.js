import express from 'express';
import {
  register,
  login,
  verifyLoginOTP,
  resendOTP,
  logout,
} from '../controller/authController.js';
const router = express.Router();
import isAuthenticated from './isAuthenticated.js';

router.post('/register', isAuthenticated, register);
router.post('/login', login);
router.post('/verify-otp', verifyLoginOTP);
router.post('/resend-otp', resendOTP);
router.post('/logout', isAuthenticated, logout);

export default router;
