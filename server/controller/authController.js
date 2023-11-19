import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { sendOTP, verifyOTP } from './otpController.js';

// Controller to create a new user in MongoDB
export const register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      status: 'Active', // Assuming default status is 'Active'
    });

    // Save user
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.status !== 'Active') {
      return res
        .status(401)
        .json({ message: 'Authentication failed or account is inactive' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // If password match, proceed to send OTP
    const otpToken = await sendOTP(user.email); // Assuming sendOTP handles OTP sending and returns a token

    // Save relevant data in the session
    req.session.userId = user._id; // Save user ID in session
    req.session.isOTPRequested = true; // Flag to indicate that OTP has been requested
    req.session.otpToken = otpToken; // Save OTP token in session for later verification

    return res.status(200).json({ message: 'OTP sent, please verify' });
  } catch (error) {
    console.error('Login error:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};

export const verifyLoginOTP = async (req, res) => {
  const { otp } = req.body;

  try {
    // Check if an OTP request was made and an OTP token is stored in the session
    if (!req.session.isOTPRequested || !req.session.otpToken) {
      return res.status(401).json({ message: 'OTP verification failed' });
    }

    const isValid = verifyOTP(req.session.otpToken, otp);
    if (!isValid) {
      return res.status(401).json({ message: 'OTP verification failed' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the session to indicate the user is fully authenticated
    req.session.isAuthenticated = true;

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    // Check if a user ID is stored in the session
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No session found' });
    }

    // Find the user by the ID stored in the session
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Resend OTP
    const otpToken = await sendOTP(user.email);

    // Update the session with the new OTP token
    req.session.otpToken = otpToken;

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
};
