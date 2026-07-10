import { httpClient } from '../httpClient';
import { toQuery } from '../utils';

export const warehousesService = {
  getAll: (params) => httpClient.get(`/warehouses${toQuery(params)}`),
  getById: (id) => httpClient.get(`/warehouses/${id}`),
  suspend: (id) => httpClient.post(`/warehouses/${id}/suspend`),
  reactivate: (id) => httpClient.post(`/warehouses/${id}/reactivate`),
  setInactive: (id) => httpClient.post(`/warehouses/${id}/set-inactive`),
  getInventory: (id, params) => httpClient.get(`/warehouses/${id}/inventory${toQuery(params)}`),
  getShipments: (id, params) => httpClient.get(`/warehouses/${id}/shipments${toQuery(params)}`),
};

export const warehouseDashboardService = {
  getOverview: (warehouseId) => httpClient.get(`/warehouse-dashboard/${warehouseId}/overview`),
  getInventorySummary: (warehouseId) =>
    httpClient.get(`/warehouse-dashboard/${warehouseId}/inventory/summary`),
  getShipmentsSummary: (warehouseId) =>
    httpClient.get(`/warehouse-dashboard/${warehouseId}/shipments/summary`),
  getIncomingShipments: (warehouseId, params) =>
    httpClient.get(`/warehouse-dashboard/${warehouseId}/shipments/incoming${toQuery(params)}`),
  getOutgoingShipments: (warehouseId, params) =>
    httpClient.get(`/warehouse-dashboard/${warehouseId}/shipments/outgoing${toQuery(params)}`),
  getShipment: (warehouseId, shipmentId) =>
    httpClient.get(`/warehouse-dashboard/${warehouseId}/shipments/${shipmentId}`),
  receiveShipment: (warehouseId, shipmentId, payload) =>
    httpClient.post(`/warehouse-dashboard/${warehouseId}/shipments/${shipmentId}/receive`, payload),
  getInventory: (warehouseId, params) =>
    httpClient.get(`/warehouse-dashboard/${warehouseId}/inventory${toQuery(params)}`),
  getInventoryItem: (warehouseId, inventoryId) =>
    httpClient.get(`/warehouse-dashboard/${warehouseId}/inventory/${inventoryId}`),
  dispatchToPharmacy: (warehouseId, inventoryId, payload) =>
    httpClient.post(
      `/warehouse-dashboard/${warehouseId}/inventory/${inventoryId}/dispatch-to-pharmacy`,
      payload
    ),
  moveToQuarantine: (warehouseId, inventoryId, payload) =>
    httpClient.post(
      `/warehouse-dashboard/${warehouseId}/inventory/${inventoryId}/move-to-quarantine`,
      payload
    ),
  reportIssue: (warehouseId, payload) =>
    httpClient.post(`/warehouse-dashboard/${warehouseId}/report-issue`, payload),
  getAlerts: (warehouseId, params) =>
    httpClient.get(`/warehouse-dashboard/${warehouseId}/alerts${toQuery(params)}`),
  getProfile: (warehouseId) => httpClient.get(`/warehouse-dashboard/${warehouseId}/profile`),
};