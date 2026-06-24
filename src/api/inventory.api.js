import axios from './axios';

export const inventoryApi = {
  // Get all inventory items
  getAll: async (params) => {
    return axios.get('/inventory', { params });
  },

  // Get single inventory item
  getById: async (id) => {
    return axios.get(`/inventory/${id}`);
  },

  // Create inventory item
  create: async (data) => {
    return axios.post('/inventory', data);
  },

  // Update inventory item
  update: async (id, data) => {
    return axios.put(`/inventory/${id}`, data);
  },

  // Delete inventory item
  delete: async (id) => {
    return axios.delete(`/inventory/${id}`);
  },

  // Get inventory by location
  getByLocation: async (locationId, params) => {
    return axios.get(`/inventory/location/${locationId}`, { params });
  },

  // Get low stock items
  getLowStock: async (params) => {
    return axios.get('/inventory/low-stock', { params });
  },

  // Get expiring items
  getExpiring: async (params) => {
    return axios.get('/inventory/expiring', { params });
  },

  // Adjust stock
  adjustStock: async (id, data) => {
    return axios.post(`/inventory/${id}/adjust`, data);
  },

  // Transfer stock
  transferStock: async (data) => {
    return axios.post('/inventory/transfer', data);
  },

  // Get inventory history
  getHistory: async (id, params) => {
    return axios.get(`/inventory/${id}/history`, { params });
  },

  // Export inventory
  export: async (params) => {
    return axios.get('/inventory/export', { params, responseType: 'blob' });
  },
};

export default inventoryApi;
