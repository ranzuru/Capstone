// authenticateMiddleware.js

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authenticateMiddleware = async (req, res, next) => {
  const token = req.cookies.session_token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(401).json({ error: 'User does not exist' });
    }

    req.user = user.toObject();
    next();
  } catch (error) {
    res.clearCookie('session_token');
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default authenticateMiddleware;
