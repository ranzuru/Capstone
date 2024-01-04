import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import setCookie from '../utils/setCookie.js';
import { sendOTP, verifyOTP } from './otpController.js';

// Helper functions to generate tokens
const generateAccessToken = (user) =>
  jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
const generateRefreshToken = (user) =>
  jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '1d',
  });

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If password match, proceed to send OTP
    const otpToken = await sendOTP(user.email);
    return res
      .status(200)
      .json({ otpToken, userId: user._id, message: 'OTP sent, please verify' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyLoginOTP = async (req, res) => {
  const { otp, otpToken, userId } = req.body;

  try {
    const isValid = verifyOTP(otpToken, otp);
    if (!isValid) {
      return res.status(400).json({ message: 'OTP verification failed' });
    }

    const user = await User.findById(userId).populate(
      'role',
      'roleName navigationScopes'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = {
      // _id: user._id,
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: {
        roleName: user.role.roleName,
        navigationScopes: user.role.navigationScopes,
      },
    };

    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setCookie(res, 'accessToken', accessToken, { maxAge: 60 * 60 * 1000 });
    setCookie(res, 'refreshToken', refreshToken);

    res
      .status(200)
      .json({ message: 'OTP verified successfully', user: userResponse });
  } catch (error) {
    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError'
    ) {
      res
        .status(401)
        .json({ message: 'OTP verification failed or OTP expired' });
    } else {
      res
        .status(500)
        .json({ message: 'Internal server error', error: error.message });
    }
  }
};

export const resendOTP = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Resend OTP
    const otpToken = await sendOTP(user.email);

    res.status(200).json({ otpToken, message: 'OTP resent successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};

// Logout is handled client-side by discarding the JWT
export const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logout successful' });
};

// Refresh token
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user);

    const newRefreshToken = generateRefreshToken(user);

    setCookie(res, 'refreshToken', newRefreshToken);

    setCookie(res, 'accessToken', newAccessToken, { maxAge: 60 * 1000 });

    res.status(200).json({ message: 'Access token refreshed successfully' });
  } catch (error) {
    console.error('Error refreshing access token:', error);
    res.clearCookie('refreshToken');
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Invalid refresh token' });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

export const authenticate = async (req, res) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    // If token is valid, find the user by ID
    const user = await User.findById(decoded.userId).populate(
      'role',
      'roleName navigationScopes'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: {
        roleName: user.role.roleName,
        navigationScopes: user.role.navigationScopes,
      },
    };

    return res
      .status(200)
      .json({ user: userResponse, message: 'Authenticated successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else {
      return res
        .status(500)
        .json({ message: 'Internal server error', error: error.message });
    }
  }
};
