import axios from './axios';

export const shipmentsApi = {
  // Get all shipments
  getAll: async (params) => {
    return axios.get('/shipments', { params });
  },

  // Get single shipment
  getById: async (id) => {
    return axios.get(`/shipments/${id}`);
  },

  // Create shipment
  create: async (data) => {
    return axios.post('/shipments', data);
  },

  // Update shipment
  update: async (id, data) => {
    return axios.put(`/shipments/${id}`, data);
  },

  // Delete shipment
  delete: async (id) => {
    return axios.delete(`/shipments/${id}`);
  },

  // Get shipment tracking
  getTracking: async (id) => {
    return axios.get(`/shipments/${id}/tracking`);
  },

  // Update shipment status
  updateStatus: async (id, status) => {
    return axios.patch(`/shipments/${id}/status`, { status });
  },

  // Get shipments by status
  getByStatus: async (status, params) => {
    return axios.get(`/shipments/status/${status}`, { params });
  },

  // Get pending shipments
  getPending: async (params) => {
    return axios.get('/shipments/pending', { params });
  },

  // Get in-transit shipments
  getInTransit: async (params) => {
    return axios.get('/shipments/in-transit', { params });
  },

  // Confirm delivery
  confirmDelivery: async (id, data) => {
    return axios.post(`/shipments/${id}/confirm-delivery`, data);
  },

  // Cancel shipment
  cancel: async (id, reason) => {
    return axios.post(`/shipments/${id}/cancel`, { reason });
  },

  // Get shipment documents
  getDocuments: async (id) => {
    return axios.get(`/shipments/${id}/documents`);
  },

  // Upload shipment document
  uploadDocument: async (id, formData) => {
    return axios.post(`/shipments/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default shipmentsApi;
