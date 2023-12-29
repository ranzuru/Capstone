import { useState } from 'react';
import axiosInstance from '../config/axios-instance';

const usePasswordReset = () => {
  const [status, setStatus] = useState(null);

  const sendPasswordResetEmail = async (email) => {
    try {
      const response = await axiosInstance.post(
        '/passwordReset/request-reset-email',
        { email }
      );
      setStatus({ type: 'success', message: response.data.message });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response.data.message || 'An error occurred.',
      });
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axiosInstance.post(
        '/passwordReset/resetPassword',
        { token, newPassword }
      );
      setStatus({ type: 'success', message: response.data.message });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response.data.message || 'An error occurred.',
      });
    }
  };

  return {
    sendPasswordResetEmail,
    resetPassword,
    status,
  };
};

export default usePasswordReset;
