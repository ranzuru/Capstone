import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to authenticate the user based on accessToken cookie
export const authenticateUser = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decoded; // Save decoded JWT token payload to req.user

    const user = await User.findById(decoded.userId) // Use the userId from the token to fetch user details
      .populate('role', 'roleName') // Populate role details
      .exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.userResponse = {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
        ? {
            roleName: user.role.roleName,
          }
        : undefined,
    };

    next();
  } catch (err) {
    console.log('Error verifying access token:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired' });
    } else {
      return res.status(401).json({ message: 'Invalid access token' });
    }
  }
};
