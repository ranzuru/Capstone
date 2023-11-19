// isAuthenticated.js

const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next();
  }
  return res.status(401).json({ message: 'Not authenticated' });
};

export default isAuthenticated;
