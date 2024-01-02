// utils/setCookie.js
const setCookie = (res, name, value, options = {}) => {
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds for both production and development
    // ... add the domain option if needed for production
  };

  res.cookie(name, value, { ...defaultOptions, ...options });
};

export default setCookie;
