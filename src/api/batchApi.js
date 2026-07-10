// batchApi.js
// Thin service layer between the React dashboard and the .NET Web API.
// Replace BASE_URL with your real API root (from appsettings / launchSettings).

const BASE_URL = 'https://localhost:5001/api'; // TODO: replace with your real API base URL

// If your API uses JWT/cookie auth, wire it in here once and every call uses it.
async function request(path, options = {}) {
  const token = localStorage.getItem('authToken'); // TODO: adjust to however you store the token
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  // 204 No Content (common on PUT/DELETE) has no body to parse
  if (res.status === 204) return null;
  return res.json();
}

// ── Batches list (Medicine & Batch Monitoring table) ─────────────────────────
// GET /api/batches?supplyChainStage=&batchStatus=&dosageForm=&search=
export function getBatches(filters = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v && v !== 'All')
  ).toString();
  return request(`/batches${params ? `?${params}` : ''}`);
}

// GET /api/batches/{id} — used to fill the details modal (Overview tab)
export function getBatch(id) {
  return request(`/batches/${id}`);
}

// PUT /api/batches/{id}/freeze — Freeze Batch action
export function freezeBatch(id) {
  return request(`/batches/${id}/freeze`, { method: 'PUT' });
}

// POST /api/batches/{id}/recall — Create Recall Alert action
export function recallBatch(id, reason) {
  return request(`/batches/${id}/recall`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// ── Sub-resources shown inside the details modal ─────────────────────────────

// GET /api/batches/{id}/unit-codes/summary
export function getUnitCodesSummary(id) {
  return request(`/batches/${id}/unit-codes/summary`);
}

// GET /api/batches/{id}/shipments
export function getBatchShipments(id) {
  return request(`/batches/${id}/shipments`);
}

// GET /api/batches/{id}/inventory
export function getBatchInventory(id) {
  return request(`/batches/${id}/inventory`);
}

// GET /api/batches/{id}/alerts
export function getBatchAlerts(id) {
  return request(`/batches/${id}/alerts`);
}

// ── Export (if you want the .xlsx built server-side instead of xlsx.js) ─────
// GET /api/batches/export?ids=BAT001,BAT002  -> returns a file stream
export async function exportBatches(ids = []) {
  const params = ids.length ? `?ids=${ids.join(',')}` : '';
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${BASE_URL}/batches/export${params}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'medicine_batch_export.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}