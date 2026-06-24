import axios from './axios';

export const monitoringApi = {
  // Get monitoring overview
  getOverview: async () => {
    return axios.get('/monitoring/overview');
  },

  // Get alerts
  getAlerts: async (params) => {
    return axios.get('/monitoring/alerts', { params });
  },

  // Get alert by id
  getAlertById: async (id) => {
    return axios.get(`/monitoring/alerts/${id}`);
  },

  // Acknowledge alert
  acknowledgeAlert: async (id) => {
    return axios.post(`/monitoring/alerts/${id}/acknowledge`);
  },

  // Resolve alert
  resolveAlert: async (id, data) => {
    return axios.post(`/monitoring/alerts/${id}/resolve`, data);
  },

  // Get supply chain status
  getSupplyChainStatus: async () => {
    return axios.get('/monitoring/supply-chain');
  },

  // Get facility status
  getFacilityStatus: async (facilityId) => {
    return axios.get(`/monitoring/facilities/${facilityId}`);
  },

  // Get all facilities status
  getAllFacilitiesStatus: async (params) => {
    return axios.get('/monitoring/facilities', { params });
  },

  // Get temperature logs
  getTemperatureLogs: async (facilityId, params) => {
    return axios.get(`/monitoring/facilities/${facilityId}/temperature`, { params });
  },

  // Get compliance status
  getComplianceStatus: async () => {
    return axios.get('/monitoring/compliance');
  },

  // Get real-time metrics
  getRealTimeMetrics: async () => {
    return axios.get('/monitoring/metrics/realtime');
  },

  // Get health check
  getHealthCheck: async () => {
    return axios.get('/monitoring/health');
  },
};

export default monitoringApi;
