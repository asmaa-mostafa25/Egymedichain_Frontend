import axios from './axios';

export const registrationRequestsApi = {
  // Fetch registration requests list
  getAll: async (params) => {
    return axios.get('/registration-requests', { params });
  },

  // Fetch single registration request details
  getById: async (id) => {
    return axios.get(`/registration-requests/${id}`);
  },

  // Approve registration request
  approve: async (id) => {
    return axios.post(`/registration-requests/${id}/approve`);
  },

  // Reject registration request
  reject: async (id, data) => {
    return axios.post(`/registration-requests/${id}/reject`, data);
  },

  // Request more documents for a registration request
  requestMoreDocuments: async (id, data) => {
    return axios.post(`/registration-requests/${id}/request-more-documents`, data);
  },
};

export default registrationRequestsApi;
