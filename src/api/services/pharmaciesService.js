import { httpClient } from '../httpClient';
import { toQuery } from '../utils';

export const pharmaciesService = {
  getAll: (params) => httpClient.get(`/pharmacies${toQuery(params)}`),
  getById: (id) => httpClient.get(`/pharmacies/${id}`),
  suspend: (id) => httpClient.post(`/pharmacies/${id}/suspend`),
  reactivate: (id) => httpClient.post(`/pharmacies/${id}/reactivate`),
  setInactive: (id) => httpClient.post(`/pharmacies/${id}/set-inactive`),
  getInventory: (id, params) => httpClient.get(`/pharmacies/${id}/inventory${toQuery(params)}`),
  getShipments: (id, params) => httpClient.get(`/pharmacies/${id}/shipments${toQuery(params)}`),
};

export const pharmacyDashboardService = {
  getOverview: (pharmacyId) => httpClient.get(`/pharmacy-dashboard/${pharmacyId}/overview`),
  getShipments: (pharmacyId, params) =>
    httpClient.get(`/pharmacy-dashboard/${pharmacyId}/shipments${toQuery(params)}`),
  getShipment: (pharmacyId, shipmentId) =>
    httpClient.get(`/pharmacy-dashboard/${pharmacyId}/shipments/${shipmentId}`),
  receiveShipment: (pharmacyId, shipmentId, payload) =>
    httpClient.post(`/pharmacy-dashboard/${pharmacyId}/shipments/${shipmentId}/receive`, payload),
  getInventory: (pharmacyId, params) =>
    httpClient.get(`/pharmacy-dashboard/${pharmacyId}/inventory${toQuery(params)}`),
  getInventoryItem: (pharmacyId, inventoryId) =>
    httpClient.get(`/pharmacy-dashboard/${pharmacyId}/inventory/${inventoryId}`),
  reportIssue: (pharmacyId, payload) =>
    httpClient.post(`/pharmacy-dashboard/${pharmacyId}/report-issue`, payload),
  getAlerts: (pharmacyId, params) =>
    httpClient.get(`/pharmacy-dashboard/${pharmacyId}/alerts${toQuery(params)}`),
  getProfile: (pharmacyId) => httpClient.get(`/pharmacy-dashboard/${pharmacyId}/profile`),
};