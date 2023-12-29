import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateNewAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateNewRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '1d',
  });
};

const authenticateMiddleware = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authorizationHeader.split(' ')[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = (await User.findById(decodedToken.userId)).toObject();
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const refreshToken = req.headers['x-refresh-token'];
      if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided' });
      }

      try {
        const decodedRefreshToken = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        const newAccessToken = generateNewAccessToken(
          decodedRefreshToken.userId
        );
        const newRefreshToken = generateNewRefreshToken(
          decodedRefreshToken.userId
        );

        res.setHeader('x-new-access-token', newAccessToken);
        res.setHeader('x-new-refresh-token', newRefreshToken);
        req.user = (await User.findById(decodedRefreshToken.userId)).toObject();

        next();
      } catch (refreshTokenError) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export default authenticateMiddleware;
