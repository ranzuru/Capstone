import jwt from 'jsonwebtoken';

// Middleware to authenticate the user based on accessToken cookie
export const authenticateUser = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Error verifying access token:', err.message);

      // Distinguish between expired and invalid token
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Access token expired' });
      } else {
        return res.status(401).json({ message: 'Invalid access token' });
      }
    }

    req.user = decoded;
    next();
  });
};
