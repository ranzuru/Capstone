import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://sthealth-backend.onrender.com',
  withCredentials: true,
});

let isRefreshing = false;

axiosInstance.interceptors.response.use(
  (response) => response, // Return the response if successful
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for login or specific URLs
    if (['/auth/login', '/auth/verify-otp'].includes(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return Promise.reject(error);
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await axiosInstance.post('/auth/refresh-token');
        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        console.error('Error refreshing access token:', refreshError);
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
