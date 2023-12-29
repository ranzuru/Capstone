// utils/setCookie.js
const setCookie = (res, name, value, options = {}) => {
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60 * 1000, // Default to 1 day
  };

  res.cookie(name, value, { ...defaultOptions, ...options });
};

export default setCookie;
