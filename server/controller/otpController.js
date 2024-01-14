import { totp, authenticator } from 'otplib';
import User from '../models/User.js';

import jwt from 'jsonwebtoken';

const generateOTP = (userSecret) => {
  return totp.generate(userSecret);
};

export const sendOTP = async (userEmail) => {
  console.log(`sendOTP called for email: ${userEmail}`);
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    console.error(`User not found for email: ${userEmail}`);
    throw new Error('User not found');
  }

  const OTP_JWT_SECRET = process.env.OTP_SECRET;
  const userSecret = authenticator.generateSecret();
  console.log(`Generated user secret for ${userEmail}: ${userSecret}`);

  totp.options = { step: 60, window: 1, digits: 6 };
  console.log(`TOTP options at generation: ${JSON.stringify(totp.options)}`);

  const otp = generateOTP(userSecret);
  console.log(`Generated OTP for ${userEmail}: ${otp}`);

  const token = jwt.sign({ userSecret, id: user._id }, OTP_JWT_SECRET, {
    expiresIn: '15m',
  });

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