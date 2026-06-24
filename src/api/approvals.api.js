import axios from './axios';

export const approvalsApi = {
  // Get all approvals
  getAll: async (params) => {
    return axios.get('/approvals', { params });
  },

  // Get single approval
  getById: async (id) => {
    return axios.get(`/approvals/${id}`);
  },

  // Get pending approvals
  getPending: async (params) => {
    return axios.get('/approvals/pending', { params });
  },

  // Approve request
  approve: async (id, data) => {
    return axios.post(`/approvals/${id}/approve`, data);
  },

  // Reject request
  reject: async (id, data) => {
    return axios.post(`/approvals/${id}/reject`, data);
  },

  // Get my approval requests
  getMyRequests: async (params) => {
    return axios.get('/approvals/my-requests', { params });
  },

  // Get approvals requiring my action
  getRequiringMyAction: async (params) => {
    return axios.get('/approvals/requiring-action', { params });
  },

  // Get approval history
  getHistory: async (id) => {
    return axios.get(`/approvals/${id}/history`);
  },

  // Add comment
  addComment: async (id, comment) => {
    return axios.post(`/approvals/${id}/comments`, { comment });
  },

  // Escalate approval
  escalate: async (id, data) => {
    return axios.post(`/approvals/${id}/escalate`, data);
  },
};

export default approvalsApi;
