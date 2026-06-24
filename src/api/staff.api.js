import axios from './axios';

export const staffApi = {
  // Get all staff
  getAll: async (params) => {
    return axios.get('/staff', { params });
  },

  // Get single staff member
  getById: async (id) => {
    return axios.get(`/staff/${id}`);
  },

  // Create staff member
  create: async (data) => {
    return axios.post('/staff', data);
  },

  // Update staff member
  update: async (id, data) => {
    return axios.put(`/staff/${id}`, data);
  },

  // Delete staff member
  delete: async (id) => {
    return axios.delete(`/staff/${id}`);
  },

  // Get staff by role
  getByRole: async (role, params) => {
    return axios.get(`/staff/role/${role}`, { params });
  },

  // Get staff by department
  getByDepartment: async (departmentId, params) => {
    return axios.get(`/staff/department/${departmentId}`, { params });
  },

  // Update staff role
  updateRole: async (id, role) => {
    return axios.patch(`/staff/${id}/role`, { role });
  },

  // Activate staff member
  activate: async (id) => {
    return axios.post(`/staff/${id}/activate`);
  },

  // Deactivate staff member
  deactivate: async (id) => {
    return axios.post(`/staff/${id}/deactivate`);
  },

  // Get staff activity log
  getActivityLog: async (id, params) => {
    return axios.get(`/staff/${id}/activity`, { params });
  },

  // Reset staff password
  resetPassword: async (id) => {
    return axios.post(`/staff/${id}/reset-password`);
  },
};

export default staffApi;
