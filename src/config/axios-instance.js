import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Important for cookies to be sent with the request
});

let isRefreshing = false;
let subscribers = [];

function subscribeTokenRefresh(cb) {
  subscribers.push(cb);
}

function onRefreshed(token) {
  subscribers.forEach((cb) => cb(token));
}

function addSubscriber(token) {
  return new Promise((resolve) => {
    subscribeTokenRefresh((newToken) => {
      if (newToken) {
        // Replace the expired token and retry
        token.headers.Authorization = `Bearer ${newToken}`;
      }
      resolve(axios(token));
    });
  });
}

axiosInstance.interceptors.response.use(
  (response) => response, // If the response is successful, just return it
  (error) => {
    const {
      config,
      response: { status },
    } = error;
    const originalRequest = config;

    // If a refresh token call or not a 401, reject
    if (
      originalRequest.url.includes('/auth/refresh-token') ||
      status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (!isRefreshing) {
      isRefreshing = true;

      // Attempt to refresh token
      return axios
        .post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        )
        .then((response) => {
          if (response.status === 200 && response.data.accessToken) {
            axiosInstance.defaults.headers.common['Authorization'] =
              `Bearer ${response.data.accessToken}`;
            originalRequest.headers['Authorization'] =
              `Bearer ${response.data.accessToken}`;
            onRefreshed(response.data.accessToken);
            subscribers = [];
          }
          isRefreshing = false;
          return axios(originalRequest);
        })
        .catch((refreshError) => {
          isRefreshing = false;
          subscribers = [];
          window.location.href = '/'; // Redirect to login or a session expired page
          return Promise.reject(refreshError);
        });
    }

    return addSubscriber(originalRequest);
  }
);

export default axiosInstance;
