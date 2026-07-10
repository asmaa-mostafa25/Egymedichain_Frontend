import { httpClient } from '../httpClient';
import { toQuery } from '../utils';

export const adminService = {
  getUsersSummary: () => httpClient.get('/admin/users/summary'),
  getUsers: (params) => httpClient.get(`/admin/users${toQuery(params)}`),
  createUser: (payload) => httpClient.post('/admin/users', payload),
  activateUser: (id) => httpClient.post(`/admin/users/${id}/activate`),
  deactivateUser: (id) => httpClient.post(`/admin/users/${id}/deactivate`),
  revokeSessions: (id) => httpClient.post(`/admin/users/${id}/revoke-sessions`),
  getAuditLogs: (params) => httpClient.get(`/admin/audit-logs${toQuery(params)}`),
  getAuditLogById: (id) => httpClient.get(`/admin/audit-logs/${id}`),
};

export const overviewService = {
  getOverview: () => httpClient.get('/overview'),
};