import { httpClient } from '../httpClient';
import { toQuery } from '../utils';
import { mapAlertRow, mapRecallAlertRow, mapScanRow } from '../mappers';

export const alertsService = {
  getCounts: () => httpClient.get('/alerts/counts'),
  getAll: (params) => httpClient.get(`/alerts${toQuery(params)}`),
  getRecalls: (params) => httpClient.get(`/alerts/recalls${toQuery(params)}`),
  getById: (id) => httpClient.get(`/alerts/${id}`),
  updateStatus: (id, payload) => httpClient.post(`/alerts/${id}/status`, payload),
  getPublicScans: (params) => httpClient.get(`/alerts/public-scans${toQuery(params)}`),
  getPublicScanById: (id) => httpClient.get(`/alerts/public-scans/${id}`),
  createAlertFromPublicScan: (id, payload) =>
    httpClient.post(`/alerts/public-scans/${id}/create-alert`, payload),
};

const PAGE_SIZE = 100;

export async function fetchAllAlertsData() {
  const [alertsResult, scansResult, recallsResult] = await Promise.all([
    alertsService.getAll({ page: 1, pageSize: PAGE_SIZE }),
    alertsService.getPublicScans({ page: 1, pageSize: PAGE_SIZE }),
    alertsService.getRecalls({ page: 1, pageSize: PAGE_SIZE }),
  ]);

  return {
    openAlerts: (alertsResult?.items || []).map(mapAlertRow),
    scanLogs: (scansResult?.items || []).map(mapScanRow),
    recallAlerts: (recallsResult?.items || []).map(mapRecallAlertRow),
  };
}

export async function updateAlertStatus(_entity, id, newStatus) {
  return alertsService.updateStatus(id, { status: newStatus });
}
