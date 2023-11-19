import { createContext, useState } from 'react';
import axiosInstance from '../config/axios-instance';
import PropTypes from 'prop-types';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      await axiosInstance.post('/auth/login', { email, password });
      // Handle any necessary state updates or actions post-login
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const verifyOTP = async (otp) => {
    try {
      const response = await axiosInstance.post('/auth/verifyLoginOTP', {
        otp,
      });
      setUser(response.data); // Set user data on successful OTP verification
    } catch (error) {
      console.error('OTP Verification error:', error);
    }
  };

  const resendOTP = async () => {
    try {
      await axiosInstance.post('/auth/resendOTP');
    } catch (error) {
      console.error('Resend OTP error:', error);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      setUser(null); // Clear user state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <AuthContext.Provider value={{ user, login, verifyOTP, resendOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
