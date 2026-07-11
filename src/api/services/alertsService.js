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

// ─── Demo fallback data ─────────────────────────────────────────────────
// Matches the columns shown on the Alerts & Public Scans page. Used if the
// API fails OR responds successfully but with no usable items, so the page
// never looks empty or broken during a demo.

const DEMO_COUNTS = { openAlerts: 18, publicScanLogs: 2532, recallAlerts: 28 };

const DEMO_OPEN_ALERTS = [
  { id: 'ALERT-2024-0091', alertType: 'Cold Chain Issue', severity: 'High', entityType: 'Warehouse', entityName: 'Cairo Medical Storage', batchNumber: 'BAT-2024-001', message: 'Message', createdAt: 'May 16, 2024', alertStatus: 'Open' },
  { id: 'ALERT-2024-0090', alertType: 'Quantity Mismatch', severity: 'Medium', entityType: 'Pharmacy', entityName: 'Alexandria Drug Store', batchNumber: 'BAT-2024-001', message: 'Message', createdAt: 'May 13, 2024', alertStatus: 'Under Review' },
  { id: 'ALERT-2024-0089', alertType: 'Suspicious Scan', severity: 'High', entityType: 'Public Scan', entityName: 'Public User', batchNumber: 'BAT-2024-001', message: 'Message', createdAt: 'May 11, 2024', alertStatus: 'Open' },
  { id: 'ALERT-2024-0088', alertType: 'License Expiry', severity: 'Medium', entityType: 'Factory', entityName: 'Upper Egypt Factory', batchNumber: 'BAT-2024-001', message: 'Message', createdAt: 'May 10, 2024', alertStatus: 'Open' },
  { id: 'ALERT-2024-0087', alertType: 'Blocked Unit Scan', severity: 'High', entityType: 'Public Scan', entityName: 'Public User', batchNumber: 'BAT-2024-001', message: 'Message', createdAt: 'Apr 28, 2024', alertStatus: 'Open' },
];

const DEMO_SCAN_LOGS = [
  { id: 'SCAN-2024-0512', scannedGTIN: '6285123456781', scannedBatchNumber: 'BAT-2024-001', productName: 'Amoxicillin 500mg', verificationResult: 'Valid', governorate: 'Cairo', city: 'Nasr City', scannedAt: 'May 16, 2024' },
  { id: 'SCAN-2024-0511', scannedGTIN: '6285123456782', scannedBatchNumber: 'BAT-2024-002', productName: 'Paracetamol 500mg', verificationResult: 'Suspicious', governorate: 'Giza', city: 'Dokki', scannedAt: 'May 15, 2024' },
  { id: 'SCAN-2024-0510', scannedGTIN: '6285123456783', scannedBatchNumber: 'BAT-2024-001', productName: 'Amoxicillin 500mg', verificationResult: 'Valid', governorate: 'Alexandria', city: 'Smouha', scannedAt: 'May 14, 2024' },
];

const DEMO_RECALL_ALERTS = [
  { id: 'RECALL-2024-0028', alertType: 'Product Recall', severity: 'High', entityType: 'Factory', entityName: 'Cairo Pharma Factory', batchNumber: 'BAT-2024-004', message: 'Message', createdAt: 'May 12, 2024', alertStatus: 'Open' },
  { id: 'RECALL-2024-0027', alertType: 'Product Recall', severity: 'Medium', entityType: 'Warehouse', entityName: 'Delta Medical Storage', batchNumber: 'BAT-2024-002', message: 'Message', createdAt: 'May 9, 2024', alertStatus: 'Resolved' },
];

export async function fetchAllAlertsData() {
  try {
    const [alertsResult, scansResult, recallsResult] = await Promise.all([
      alertsService.getAll({ page: 1, pageSize: PAGE_SIZE }),
      alertsService.getPublicScans({ page: 1, pageSize: PAGE_SIZE }),
      alertsService.getRecalls({ page: 1, pageSize: PAGE_SIZE }),
    ]);

    const openAlertsItems = alertsResult?.items || [];
    const scanLogsItems = scansResult?.items || [];
    const recallAlertsItems = recallsResult?.items || [];

    // If ALL three came back empty, treat it like a failed load and fall back to demo
    // (partial emptiness — e.g. genuinely zero recalls — is left as real data)
    if (!openAlertsItems.length && !scanLogsItems.length && !recallAlertsItems.length) {
      return {
        openAlerts: DEMO_OPEN_ALERTS,
        scanLogs: DEMO_SCAN_LOGS,
        recallAlerts: DEMO_RECALL_ALERTS,
        demoMode: true,
      };
    }

    return {
      openAlerts: openAlertsItems.map(mapAlertRow),
      scanLogs: scanLogsItems.map(mapScanRow),
      recallAlerts: recallAlertsItems.map(mapRecallAlertRow),
      demoMode: false,
    };
  } catch (err) {
    console.error(err);
    return {
      openAlerts: DEMO_OPEN_ALERTS,
      scanLogs: DEMO_SCAN_LOGS,
      recallAlerts: DEMO_RECALL_ALERTS,
      demoMode: true,
    };
  }
}

export async function fetchAlertsCounts() {
  try {
    const res = await alertsService.getCounts();
    if (!res || Object.keys(res).length === 0) return DEMO_COUNTS;
    return res;
  } catch (err) {
    console.error(err);
    return DEMO_COUNTS;
  }
}

export async function updateAlertStatus(_entity, id, newStatus) {
  return alertsService.updateStatus(id, { status: newStatus });
}