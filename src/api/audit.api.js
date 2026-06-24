import axios from './axios';

export const auditApi = {
  // Get all audit logs
  getAll: async (params) => {
    return axios.get('/audit', { params });
  },

  // Get audit log by id
  getById: async (id) => {
    return axios.get(`/audit/${id}`);
  },

  // Get audit logs by entity
  getByEntity: async (entityType, entityId, params) => {
    return axios.get(`/audit/entity/${entityType}/${entityId}`, { params });
  },

  // Get audit logs by user
  getByUser: async (userId, params) => {
    return axios.get(`/audit/user/${userId}`, { params });
  },

  // Get audit logs by action
  getByAction: async (action, params) => {
    return axios.get(`/audit/action/${action}`, { params });
  },

  // Get audit summary
  getSummary: async (params) => {
    return axios.get('/audit/summary', { params });
  },

  // Export audit logs
  export: async (params) => {
    return axios.get('/audit/export', { params, responseType: 'blob' });
  },

  // Get suspicious activities
  getSuspiciousActivities: async (params) => {
    return axios.get('/audit/suspicious', { params });
  },

  // Flag audit entry
  flagEntry: async (id, reason) => {
    return axios.post(`/audit/${id}/flag`, { reason });
  },
};

export default auditApi;
