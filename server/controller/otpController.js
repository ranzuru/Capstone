import { totp, authenticator } from 'otplib';
import { createLog } from './createLogController.js';
import { sendOtpEmail } from '../utils/emailService.js';
import jwt from 'jsonwebtoken';

const generateOTP = (userSecret) => {
  return totp.generate(userSecret);
};

export const sendOTP = async (userEmail) => {
  const OTP_JWT_SECRET = process.env.OTP_SECRET;
  const userSecret = authenticator.generateSecret();
  totp.options = { step: 60, window: 1, digits: 6 };

  const otp = generateOTP(userSecret);
  const token = jwt.sign({ userSecret }, OTP_JWT_SECRET, {
    expiresIn: '5m',
  });

  // LOG
  await createLog({
    user: 'N/A',
    section: 'One-Time Password (OTP)',
    action: 'CREATE/ POST',
    description: `Generate OTP for User Email ${userEmail}`,
  });

  await sendOtpEmail(userEmail, otp);
  return token;
};

export const verifyOTP = (userToken, otp) => {
  try {
    const OTP_JWT_SECRET = process.env.OTP_SECRET;
    const decoded = jwt.verify(userToken, OTP_JWT_SECRET);

    totp.options = { step: 60, window: 1, digits: 6 };

    const isValid = totp.verify({ token: otp, secret: decoded.userSecret });

    return isValid;
  } catch (error) {
    console.error(`Error verifying OTP: ${error.message}`);
    return false;
  }
};
