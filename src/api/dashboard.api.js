import axios from './axios';

export const dashboardApi = {
  // Get dashboard overview
  getOverview: async () => {
    return axios.get('/dashboard/overview');
  },

  // Get KPIs
  getKPIs: async (params) => {
    return axios.get('/dashboard/kpis', { params });
  },

  // Get charts data
  getChartsData: async (params) => {
    return axios.get('/dashboard/charts', { params });
  },

  // Get recent activity
  getRecentActivity: async (params) => {
    return axios.get('/dashboard/activity', { params });
  },

  // Get alerts
  getAlerts: async (params) => {
    return axios.get('/dashboard/alerts', { params });
  },

  // Get system status
  getSystemStatus: async () => {
    return axios.get('/dashboard/system-status');
  },

  // Get statistics
  getStatistics: async (params) => {
    return axios.get('/dashboard/statistics', { params });
  },
};

export default dashboardApi;
