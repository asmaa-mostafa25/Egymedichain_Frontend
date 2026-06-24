import axios from './axios';

export const settingsApi = {
  // Get all settings
  getAll: async () => {
    return axios.get('/settings');
  },

  // Update settings
  update: async (data) => {
    return axios.put('/settings', data);
  },

  // Get user preferences
  getUserPreferences: async () => {
    return axios.get('/settings/preferences');
  },

  // Update user preferences
  updateUserPreferences: async (data) => {
    return axios.put('/settings/preferences', data);
  },

  // Get notification settings
  getNotificationSettings: async () => {
    return axios.get('/settings/notifications');
  },

  // Update notification settings
  updateNotificationSettings: async (data) => {
    return axios.put('/settings/notifications', data);
  },

  // Get system configuration
  getSystemConfig: async () => {
    return axios.get('/settings/system');
  },

  // Update system configuration
  updateSystemConfig: async (data) => {
    return axios.put('/settings/system', data);
  },

  // Get locations
  getLocations: async () => {
    return axios.get('/settings/locations');
  },

  // Get departments
  getDepartments: async () => {
    return axios.get('/settings/departments');
  },

  // Get product categories
  getProductCategories: async () => {
    return axios.get('/settings/product-categories');
  },
};

export default settingsApi;
