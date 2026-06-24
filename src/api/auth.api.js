import axios from './axios';

export const authApi = {
  // Login
  login: async (credentials) => {
    return axios.post('/auth/login', credentials);
  },

  // Refresh token
  refresh: async (refreshToken) => {
    return axios.post('/auth/refresh', { refreshToken });
  },

  // Logout
  logout: async () => {
    return axios.post('/auth/logout');
  },

  // Get current user
  getCurrentUser: async () => {
    return axios.get('/auth/me');
  },

  // Change password
  changePassword: async (data) => {
    return axios.post('/auth/change-password', data);
  },

  // Forgot password
  forgotPassword: async (email) => {
    return axios.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (data) => {
    return axios.post('/auth/reset-password', data);
  },
};

export default authApi;
