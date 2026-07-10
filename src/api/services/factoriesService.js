import { httpClient } from '../httpClient';
import { toQuery } from '../utils';

export const factoriesService = {
  getAll: (params) => httpClient.get(`/factories${toQuery(params)}`),
  getById: (id) => httpClient.get(`/factories/${id}`),
  suspend: (id) => httpClient.post(`/factories/${id}/suspend`),
  reactivate: (id) => httpClient.post(`/factories/${id}/reactivate`),
  setInactive: (id) => httpClient.post(`/factories/${id}/set-inactive`),
  getBatches: (id, params) => httpClient.get(`/factories/${id}/batches${toQuery(params)}`),
};

export const factoryDashboardService = {
  getOverview: (factoryId) => httpClient.get(`/factory-dashboard/${factoryId}/overview`),
  getBatches: (factoryId, params) =>
    httpClient.get(`/factory-dashboard/${factoryId}/batches${toQuery(params)}`),
  createBatch: (factoryId, payload) =>
    httpClient.post(`/factory-dashboard/${factoryId}/batches`, payload),
  getBatch: (factoryId, batchId) =>
    httpClient.get(`/factory-dashboard/${factoryId}/batches/${batchId}`),
  generateCodes: (factoryId, batchId) =>
    httpClient.post(`/factory-dashboard/${factoryId}/batches/${batchId}/generate-codes`),
  markReady: (factoryId, batchId) =>
    httpClient.post(`/factory-dashboard/${factoryId}/batches/${batchId}/mark-ready`),
  cancelDraft: (factoryId, batchId) =>
    httpClient.post(`/factory-dashboard/${factoryId}/batches/${batchId}/cancel-draft`),
  getShipmentsSummary: (factoryId) =>
    httpClient.get(`/factory-dashboard/${factoryId}/shipments/summary`),
  getShipments: (factoryId, params) =>
    httpClient.get(`/factory-dashboard/${factoryId}/shipments${toQuery(params)}`),
  createShipment: (factoryId, payload) =>
    httpClient.post(`/factory-dashboard/${factoryId}/shipments`, payload),
  getShipment: (factoryId, shipmentId) =>
    httpClient.get(`/factory-dashboard/${factoryId}/shipments/${shipmentId}`),
  getAlerts: (factoryId, params) =>
    httpClient.get(`/factory-dashboard/${factoryId}/alerts${toQuery(params)}`),
  getAlert: (factoryId, alertId) =>
    httpClient.get(`/factory-dashboard/${factoryId}/alerts/${alertId}`),
  getProfile: (factoryId) => httpClient.get(`/factory-dashboard/${factoryId}/profile`),
};