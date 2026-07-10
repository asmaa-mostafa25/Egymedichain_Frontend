import axios from 'axios';
import config from '../../config';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
axiosInstance.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem(config.TOKEN_KEY);
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh and errors
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    // Normalize response
    return {
      data: response.data?.data || response.data,
      success: response.data?.success ?? true,
      message: response.data?.message || 'Success',
      error: null,
      status: response.status,
    };
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(config.REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        // No refresh token - logout
        handleLogout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${config.API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem(config.TOKEN_KEY, newToken);
        if (newRefreshToken) {
          localStorage.setItem(config.REFRESH_TOKEN_KEY, newRefreshToken);
        }

        axiosInstance.defaults.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      window.dispatchEvent(
        new CustomEvent('app:unauthorized', {
          detail: { message: 'You do not have permission to perform this action' },
        })
      );
    }

    // Handle network errors
    if (!error.response) {
      window.dispatchEvent(
        new CustomEvent('app:network-error', {
          detail: { message: 'Network error. Please check your connection.' },
        })
      );
    }

    // Normalize error response
    return Promise.reject({
      data: null,
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred',
      error: error.response?.data?.error || error,
      status: error.response?.status || 0,
    });
  }
);

// Handle logout
const handleLogout = () => {
  localStorage.removeItem(config.TOKEN_KEY);
  localStorage.removeItem(config.REFRESH_TOKEN_KEY);
  localStorage.removeItem(config.USER_KEY);
  window.dispatchEvent(new CustomEvent('app:logout'));
  window.location.href = '/login';
};

export default axiosInstance;
