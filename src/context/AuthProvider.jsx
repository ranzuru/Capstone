import { createContext, useState, useCallback, useEffect } from 'react';
import axiosInstance from '../config/axios-instance';
import PropTypes from 'prop-types';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [otpDetails, setOtpDetails] = useState({ otpToken: '', userId: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  const checkAuth = useCallback(async () => {
    setLoading(true); // Start loading
    setError(null);
    try {
      const response = await axiosInstance.get('/auth/authenticate');
      setUser(response.data.user);
      setLoading(false); // Stop loading after successful check
    } catch (error) {
      setUser(null);
      setLoading(false); // Stop loading also in case of an error
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    setError(null); // Reset errors on new login attempt
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      const { otpToken, userId } = response.data;
      setOtpDetails({ otpToken, userId });
    } catch (error) {
      setError(error.response?.data?.message || 'An unknown error occurred'); // Store the error message
    }
  }, []);

  const verifyOTP = useCallback(
    async (otp) => {
      setError(null); // Reset errors on new OTP attempt
      try {
        const response = await axiosInstance.post('/auth/verify-otp', {
          otp,
          otpToken: otpDetails.otpToken,
          userId: otpDetails.userId,
        });
        setUser(response.data.user);
        setOtpDetails({ otpToken: '', userId: '' }); // Clear OTP details after successful verification
      } catch (error) {
        let errorMessage = 'OTP verification failed';
        if (error.response) {
          if (error.response.status === 400) {
            errorMessage = 'Invalid OTP. Please try again.';
          } else if (error.response.status === 401) {
            errorMessage = 'Session expired. Please login again.';
          } else {
            errorMessage = error.response.data.message || errorMessage;
          }
        }
        setError(errorMessage);
      }
    },
    [otpDetails]
  );

  const resendOTP = useCallback(async () => {
    setError(null); // It might not be necessary to reset errors here
    try {
      const response = await axiosInstance.post('/auth/resend-otp', {
        userId: otpDetails.userId,
      });
      const { otpToken } = response.data;
      setOtpDetails((prevDetails) => ({ ...prevDetails, otpToken }));
    } catch (error) {
      setError(error.response?.data?.message || 'An unknown error occurred'); // Store the error message
    }
  }, [otpDetails.userId]);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/auth/logout');
      setUser(null); // Clear user state
      setError(null); // Reset errors on logout
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.response?.data?.message || 'An unknown error occurred'); // Store the error message
    }
  }, []);

  AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        verifyOTP,
        resendOTP,
        logout,
        checkAuth,
        error,
        otpDetails,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
