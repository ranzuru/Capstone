// utils/setCookie.js
const setCookie = (res, name, value, options = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const defaultOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    path: '/',
    ...(isProduction && { domain: '.onrender.com' }), // Include the domain only in production
  };

  res.cookie(name, value, { ...defaultOptions, ...options });
};

export default setCookie;
