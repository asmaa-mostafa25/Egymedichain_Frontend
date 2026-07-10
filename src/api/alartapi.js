/**
 * ─────────────────────────────────────────────────────────────────────────
 *  Alerts & Public Scans — API service layer
 * ─────────────────────────────────────────────────────────────────────────
 *  Every network call the page needs lives here. The component never calls
 *  fetch() directly — it only calls the functions exported below.
 *
 *  HOW TO CONNECT THE REAL API
 *  1. Set BASE_URL to your backend's root (or read it from an env var).
 *  2. Flip USE_MOCK_DATA to false.
 *  3. If your backend's field names differ from the ones used in the UI,
 *     adjust the `mapXxx` functions at the bottom of each fetch — that's
 *     the only place shaping needs to happen, so the rest of the app never
 *     has to change.
 *  4. If your API needs auth, add the header inside `request()`.
 * ─────────────────────────────────────────────────────────────────────────
 */

const BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'https://api.example.com';

// Flip this to false once the real backend is ready.
const USE_MOCK_DATA = true;

// Simulated network latency for mock mode, so loading states are visible.
const MOCK_DELAY_MS = 500;

/* ------------------------------------------------------------------ */
/*  Low-level request helper                                          */
/* ------------------------------------------------------------------ */

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? window.localStorage?.getItem('auth_token') : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json())?.message; } catch { /* ignore */ }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  if (res.status === 204) return null;
  return res.json();
}

function mockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/* ------------------------------------------------------------------ */
/*  Mock fixtures — used only while USE_MOCK_DATA is true              */
/* ------------------------------------------------------------------ */

const MOCK_OPEN_ALERTS = [
  { id: 'ALERT-2024-0091', type: 'Cold Chain Issue',   severity: 'High',   entityType: 'Warehouse',   entityName: 'Cairo Medical Storage',    batch: 'BAT-2024-001', message: 'Message', createdAt: 'May 16, 2024', status: 'Open' },
  { id: 'ALERT-2024-0090', type: 'Quantity Mismatch',  severity: 'Medium', entityType: 'Pharmacy',    entityName: 'Alexandria Drug Store',    batch: 'BAT-2024-001', message: 'Message', createdAt: 'May 13, 2024', status: 'Under Review' },
  { id: 'ALERT-2024-0089', type: 'Suspicious Scan',    severity: 'High',   entityType: 'Public Scan', entityName: 'Public User',              batch: 'BAT-2024-001', message: 'Message', createdAt: 'May 11, 2024', status: 'Open' },
  { id: 'ALERT-2024-0088', type: 'License Expiry',     severity: 'Medium', entityType: 'Factory',     entityName: 'Upper Egypt Factory',      batch: 'BAT-2024-001', message: 'Message', createdAt: 'May 10, 2024', status: 'Open' },
  { id: 'ALERT-2024-0087', type: 'Blocked Unit Scan',  severity: 'High',   entityType: 'Public Scan', entityName: 'Public User',              batch: 'BAT-2024-001', message: 'Message', createdAt: 'Apr 28, 2024', status: 'Open' },
];

const MOCK_PUBLIC_SCAN_LOGS = [
  { id: 'SCAN-15021-1', scanId: 'SCAN-15021', gtin: '062221', serial: 'SN-0012345', batch: 'BAT-2024-001', product: 'Panadol Extra',      result: 'Authentic',      reason: 'Valid Product',              governorate: 'Alexandria', city: '6th of October', scannedAt: 'May 16, 2024' },
  { id: 'SCAN-15021-2', scanId: 'SCAN-15021', gtin: '062221', serial: 'SN-0012345', batch: 'BAT-2024-001', product: 'Flagyl 500mg',       result: 'Recalled',       reason: 'Batch has been recalled',    governorate: 'Port Said',  city: 'Cairo',          scannedAt: 'May 13, 2024' },
  { id: 'SCAN-15021-3', scanId: 'SCAN-15021', gtin: '062221', serial: 'SN-0012345', batch: 'BAT-2024-001', product: 'Cipro 500mg',        result: 'Suspicious',     reason: 'Multiple scan locations',    governorate: 'Sohkna',     city: 'Giza',           scannedAt: 'May 11, 2024' },
  { id: 'SCAN-15021-4', scanId: 'SCAN-15021', gtin: '062221', serial: 'SN-0012345', batch: 'BAT-2024-001', product: 'Diclofenac 50mg',    result: 'Duplicate Scan', reason: 'Abnormal scan pattern',      governorate: 'Damietta',   city: 'Assiut',         scannedAt: 'May 10, 2024' },
  { id: 'SCAN-15021-5', scanId: 'SCAN-15021', gtin: '-----',  serial: 'SN-0012345', batch: '----------',   product: '-------------',      result: 'Not Found',      reason: 'Serial number not registered', governorate: 'Alexandria', city: 'Alexandria',  scannedAt: 'Apr 28, 2024' },
];

const MOCK_RECALL_ALERTS = [
  { id: 'ALERT-0075-1', alertId: 'ALERT-0075', product: 'Flagyl 500mg',      batch: 'BAT-005', factory: 'Delta Pharma Factory', severity: 'Critical', message: 'Message', status: 'Active', scannedAt: 'May 16, 2024' },
  { id: 'ALERT-0075-2', alertId: 'ALERT-0075', product: 'Voltaren 75mg',     batch: 'BAT-005', factory: 'EIPICO Factory',       severity: 'Critical', message: 'Message', status: 'Active', scannedAt: 'May 13, 2024' },
  { id: 'ALERT-0075-3', alertId: 'ALERT-0075', product: 'Flagyl 500mg',      batch: 'BAT-005', factory: 'Upper Egypt Factory',  severity: 'Critical', message: 'Message', status: 'Active', scannedAt: 'May 11, 2024' },
  { id: 'ALERT-0075-4', alertId: 'ALERT-0075', product: 'Amoxicillin 500mg', batch: 'BAT-005', factory: 'Delta Pharma Factory', severity: 'Critical', message: 'Message', status: 'Active', scannedAt: 'May 10, 2024' },
  { id: 'ALERT-0075-5', alertId: 'ALERT-0075', product: 'Voltaren 75mg',     batch: 'BAT-005', factory: 'EIPICO Factory',       severity: 'Critical', message: 'Message', status: 'Active', scannedAt: 'Apr 28, 2024' },
];

// In-memory copies so mock "writes" (status updates) persist for the session.
let mockOpenAlerts = MOCK_OPEN_ALERTS.map((r) => ({ ...r }));
let mockRecallAlerts = MOCK_RECALL_ALERTS.map((r) => ({ ...r }));

/* ------------------------------------------------------------------ */
/*  Reads                                                              */
/* ------------------------------------------------------------------ */

/** GET /alerts/open — list of currently open (non-recall) alerts */
export async function fetchOpenAlerts() {
  if (USE_MOCK_DATA) return mockDelay(mockOpenAlerts.map((r) => ({ ...r })));
  return request('/alerts/open');
}

/** GET /public-scan-logs — list of public verification scans */
export async function fetchPublicScanLogs() {
  if (USE_MOCK_DATA) return mockDelay(MOCK_PUBLIC_SCAN_LOGS.map((r) => ({ ...r })));
  return request('/public-scan-logs');
}

/** GET /alerts/recall — list of recall alerts */
export async function fetchRecallAlerts() {
  if (USE_MOCK_DATA) return mockDelay(mockRecallAlerts.map((r) => ({ ...r })));
  return request('/alerts/recall');
}

/**
 * Loads all three tabs' data in one call. The page calls this on mount
 * and on refresh so the three requests fire in parallel.
 */
export async function fetchAllAlertsData() {
  const [openAlerts, scanLogs, recallAlerts] = await Promise.all([
    fetchOpenAlerts(),
    fetchPublicScanLogs(),
    fetchRecallAlerts(),
  ]);
  return { openAlerts, scanLogs, recallAlerts };
}

/* ------------------------------------------------------------------ */
/*  Writes                                                             */
/* ------------------------------------------------------------------ */

/**
 * PATCH /alerts/:id/status — used for Mark Under Review / Resolve / Dismiss
 * @param {'openAlert'|'recallAlert'} entity which list the row belongs to
 * @param {string} id the row's internal id
 * @param {'Under Review'|'Resolved'|'Dismissed'} status
 */
export async function updateAlertStatus(entity, id, status) {
  if (USE_MOCK_DATA) {
    const list = entity === 'recallAlert' ? mockRecallAlerts : mockOpenAlerts;
    const row = list.find((r) => r.id === id);
    if (row) row.status = status;
    return mockDelay(row ? { ...row } : null);
  }
  const path = entity === 'recallAlert' ? `/alerts/recall/${id}/status` : `/alerts/open/${id}/status`;
  return request(path, { method: 'PATCH', body: JSON.stringify({ status }) });
}

/**
 * POST /alerts/:id/recall — used for the "Create Recall Alert" action
 * @param {string} sourceId id of the alert / scan / batch the recall originates from
 * @param {string} reason optional free-text reason entered in the confirm modal
 */
export async function createRecallAlert(sourceId, reason) {
  if (USE_MOCK_DATA) {
    return mockDelay({ id: `ALERT-${Math.floor(Math.random() * 9000 + 1000)}`, sourceId, reason, status: 'Active' });
  }
  return request('/alerts/recall', { method: 'POST', body: JSON.stringify({ sourceId, reason }) });
}

/**
 * GET /alerts/export — optional server-side export. If the backend can
 * generate the spreadsheet itself, call this instead of the client-side
 * XLSX export currently used in the page, and open/download `url`.
 */
export async function requestServerExport(entity, ids) {
  if (USE_MOCK_DATA) return mockDelay({ url: null });
  return request('/alerts/export', { method: 'POST', body: JSON.stringify({ entity, ids }) });
}