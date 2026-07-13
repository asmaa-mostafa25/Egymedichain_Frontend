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

// ── Factories ─────────────────────────────────────────────────────────────
export const factoryService = {
  getAll: (params) => httpClient.get(`/factories${toQuery(params)}`),
  getById: (id) => httpClient.get(`/factories/${id}`),
  // Richer profile (account, licenses, documents, registrationInfo) — used for the Review Request workaround
  getFullProfile: (id) => httpClient.get(`/factory-dashboard/${id}/profile`),
  suspend: (id, reason) => httpClient.post(`/factories/${id}/suspend`, { reason }),
  reactivate: (id) => httpClient.post(`/factories/${id}/reactivate`),
  setInactive: (id) => httpClient.post(`/factories/${id}/set-inactive`),
  getBatches: (id, params) => httpClient.get(`/factories/${id}/batches${toQuery(params)}`),
};

// ── Warehouses ────────────────────────────────────────────────────────────
export const warehouseService = {
  getAll: (params) => httpClient.get(`/warehouses${toQuery(params)}`),
  getById: (id) => httpClient.get(`/warehouses/${id}`),
  suspend: (id, reason) => httpClient.post(`/warehouses/${id}/suspend`, { reason }),
  reactivate: (id) => httpClient.post(`/warehouses/${id}/reactivate`),
  setInactive: (id) => httpClient.post(`/warehouses/${id}/set-inactive`),
  getInventory: (id, params) => httpClient.get(`/warehouses/${id}/inventory${toQuery(params)}`),
  getShipments: (id, params) => httpClient.get(`/warehouses/${id}/shipments${toQuery(params)}`),
};

// ── Pharmacies ────────────────────────────────────────────────────────────
export const pharmacyService = {
  getAll: (params) => httpClient.get(`/pharmacies${toQuery(params)}`),
  getById: (id) => httpClient.get(`/pharmacies/${id}`),
  suspend: (id, reason) => httpClient.post(`/pharmacies/${id}/suspend`, { reason }),
  reactivate: (id) => httpClient.post(`/pharmacies/${id}/reactivate`),
  setInactive: (id) => httpClient.post(`/pharmacies/${id}/set-inactive`),
  getInventory: (id, params) => httpClient.get(`/pharmacies/${id}/inventory${toQuery(params)}`),
  getShipments: (id, params) => httpClient.get(`/pharmacies/${id}/shipments${toQuery(params)}`),
};

// ── Registration requests ────────────────────────────────────────────────
// Used by the "Review Request" action. NOTE: the Swagger has no endpoint
// that returns "the registration request for entity X" directly — see the
// integration report for the backend gap this works around.
export const registrationRequestService = {
  getAll: (params) => httpClient.get(`/registration-requests${toQuery(params)}`),
  getById: (id) => httpClient.get(`/registration-requests/${id}`),
  approve: (id) => httpClient.post(`/registration-requests/${id}/approve`),
  reject: (id, rejectionReason) =>
    httpClient.post(`/registration-requests/${id}/reject`, { rejectionReason }),
  requestMoreDocuments: (id, adminNotes, documentIdsNeedingReplacement) =>
    httpClient.post(`/registration-requests/${id}/request-more-documents`, {
      adminNotes,
      documentIdsNeedingReplacement,
    }),
};