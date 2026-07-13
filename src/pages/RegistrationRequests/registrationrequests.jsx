import { useEffect, useState, useRef } from 'react';
import {
  Filter, Download, Eye, Edit, Trash2, MoreVertical, X, Check, ChevronDown,
  Package, ClipboardCheck, RefreshCw, AlertTriangle, Home, Clock, Truck, History,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { registrationRequestsApi, batchesApi, alertsApi, adminApi } from '../../api/services';
import { mapBatchRow, mapAlertRow, mapBatchDetails, mapAlertDetails } from '../../api/mappers';
import ReviewRequestModal from "./ReviewRequestModal";

// ─── Demo fallback data — used ONLY if the API errors or returns an empty list ──
const DEMO_REQUESTS = [
  { id: 'REQ-001', entityType: 'Warehouse',    entityName: 'Delta Medical Storage',        submittedBy: 'Ahmed',  submittedAt: 'May 16, 2024', status: 'Pending'      },
  { id: 'REQ-002', entityType: 'Manufacturer', entityName: 'Cairo Pharma Factory',         submittedBy: 'Mohamed',submittedAt: 'May 15, 2024', status: 'Under Review' },
  { id: 'REQ-003', entityType: 'Warehouse',    entityName: 'Alexandria Storage',           submittedBy: 'Saif',   submittedAt: 'May 15, 2024', status: 'Pending'      },
  { id: 'REQ-004', entityType: 'Pharmacy',     entityName: 'Alexandria Drug Store',        submittedBy: 'Yehia',  submittedAt: 'May 14, 2024', status: 'Under Review' },
  { id: 'REQ-005', entityType: 'Manufacturer', entityName: 'Upper Egypt Factory',          submittedBy: 'Mossad', submittedAt: 'May 14, 2024', status: 'Rejected'     },
  { id: 'REQ-006', entityType: 'Warehouse',    entityName: 'Portsaid Distribution Center', submittedBy: 'Nour',   submittedAt: 'May 14, 2024', status: 'Under Review' },
];

const DEMO_BATCHES = [
  { id: 'BAT-2024-001', productName: 'Antibiotics',         batchNumber: 'BAT-2024-001', factory: 'Eva Pharma',        batchStatus: 'In Supply Chain', lastUpdate: '2024-05-15' },
  { id: 'BAT-2024-002', productName: 'Pain Relief',         batchNumber: 'BAT-2024-002', factory: 'Pharco Industries', batchStatus: 'In Supply Chain', lastUpdate: '2024-05-15' },
  { id: 'BAT-2024-003', productName: 'Diabetes Medication', batchNumber: 'BAT-2024-003', factory: 'CID Pharma',        batchStatus: 'Quarantined',     lastUpdate: '2024-05-15' },
  { id: 'BAT-2024-004', productName: 'Capsules',            batchNumber: 'BAT-2024-004', factory: 'Memphis Pharma',    batchStatus: 'In Pharmacy',     lastUpdate: '2024-05-15' },
  { id: 'BAT-2024-005', productName: 'Cough Syrup',         batchNumber: 'BAT-2024-005', factory: 'Amoun Pharma',      batchStatus: 'Recalled',        lastUpdate: '2024-05-15' },
];

const DEMO_ALERTS = [
  { id: 'ALR-001', alertType: 'Cold Chain Issue',  severity: 'High',   entityType: 'Warehouse',    date: 'May 16, 2024', status: 'Open'         },
  { id: 'ALR-002', alertType: 'Duplicate Serial',  severity: 'High',   entityType: 'Pharmacy',     date: 'May 15, 2024', status: 'Open'         },
  { id: 'ALR-003', alertType: 'License Expiry',    severity: 'Medium', entityType: 'Manufacturer', date: 'May 15, 2024', status: 'Under Review' },
  { id: 'ALR-004', alertType: 'Quantity Mismatch', severity: 'High',   entityType: 'Warehouse',    date: 'May 14, 2024', status: 'Open'         },
  { id: 'ALR-005', alertType: 'Suspicious Scan',   severity: 'Medium', entityType: 'Pharmacy',     date: 'May 14, 2024', status: 'Open'         },
];

// ─── Shared badge colors (unchanged) ──────────────────────────────────────
const BADGE_COLORS = {
  Pending:          { bg: '#FEF3C7', color: '#B45309' },
  'Under Review':   { bg: '#DBEAFE', color: '#1D4ED8' },
  Approved:         { bg: '#D1FAE5', color: '#059669' },
  Rejected:         { bg: '#FEE2E2', color: '#DC2626' },
  Open:             { bg: '#FEE2E2', color: '#DC2626' },
  Critical:         { bg: '#FEE2E2', color: '#DC2626' },
  High:             { bg: '#FEF3C7', color: '#D97706' },
  Medium:           { bg: '#DBEAFE', color: '#2563EB' },
  Low:              { bg: '#D1FAE5', color: '#059669' },
  'In Supply Chain':{ bg: '#DBEAFE', color: '#2563EB' },
  Quarantined:      { bg: '#FEE2E2', color: '#DC2626' },
  'In Pharmacy':    { bg: '#D1FAE5', color: '#059669' },
  Recalled:         { bg: '#FEE2E2', color: '#991B1B' },
  'In Transit':     { bg: '#FEF3C7', color: '#B45309' },
  Delivered:        { bg: '#D1FAE5', color: '#059669' },
  Delayed:          { bg: '#FEE2E2', color: '#DC2626' },
};

const Badge = ({ value }) => {
  const s = BADGE_COLORS[value] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ display: 'inline-block', padding: '3px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {value}
    </span>
  );
};

const StaticStatCard = ({ label, value, icon: Icon, loading }) => (
  <div
    style={{
      background: '#fff', borderRadius: 16, padding: '16px 18px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F0F0F0',
      flex: 1, minWidth: 0,
    }}
  >
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 6, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{loading ? '—' : value}</div>
    </div>
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 10 }}>
      <Icon size={18} color="#DC2626" />
    </div>
  </div>
);

// ─── Tab configuration (unchanged) ─────────────────────────────────────────
const TAB_CONFIG = [
  {
    key: 'requests', label: 'Request', icon: ClipboardCheck, iconBg: '#EFF6FF', iconColor: '#3B82F6',
    tableTitle: 'Recent Registration Requests',
    columns: [
      { key: 'entityType',  label: 'Entity Type' },
      { key: 'entityName',  label: 'Entity Name' },
      { key: 'submittedBy', label: 'Submitted By' },
      { key: 'submittedAt', label: 'Submitted At' },
      { key: 'status',      label: 'Status', badge: true },
    ],
    filterFields: ['entityType', 'status'],
    showViewRequest: true,
    actionLabel: 'View Request',
  },
  {
    key: 'batches', label: 'Batch', icon: Package, iconBg: '#ECFDF5', iconColor: '#059669',
    tableTitle: 'Recent Batch Activity',
    columns: [
      { key: 'productName',  label: 'Product Name' },
      { key: 'batchNumber',  label: 'Batch Number' },
      { key: 'factory',      label: 'Factory' },
      { key: 'batchStatus',  label: 'Batch Status', badge: true },
      { key: 'lastUpdate',   label: 'Last Update' },
    ],
    filterFields: ['batchStatus', 'factory'],
  },
  {
    key: 'alerts', label: 'Alert', icon: AlertTriangle, iconBg: '#FEF2F2', iconColor: '#EF4444',
    tableTitle: 'Recent Compliance Alerts',
    columns: [
      { key: 'alertType',  label: 'Alert Type' },
      { key: 'severity',   label: 'Severity', badge: true },
      { key: 'entityType', label: 'Entity Type' },
      { key: 'date',       label: 'Date' },
      { key: 'status',     label: 'Status', badge: true },
    ],
    filterFields: ['severity', 'entityType'],
  },
];

const INITIAL_DATA = { requests: [], batches: [], alerts: [] };

// ─── FilterDropdown (unchanged) ─────────────────────────────────────────────
const FilterDropdown = ({ tab, data, activeFilters, onApply, onClear }) => {
  const [open, setOpen]   = useState(false);
  const [local, setLocal] = useState(activeFilters);
  const ref               = useRef(null);

  useEffect(() => { setLocal(activeFilters); }, [activeFilters]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const fieldLabels = Object.fromEntries(tab.columns.map(c => [c.key, c.label]));
  const optionsFor = (field) => ['All', ...Array.from(new Set(data.map(r => r[field]).filter(Boolean)))];

  const hasActive   = Object.values(activeFilters).some(v => v && v !== 'All');
  const activeCount = Object.values(activeFilters).filter(v => v && v !== 'All').length;

  const handleApply = () => { onApply(local); setOpen(false); };
  const handleClear = () => {
    const r = Object.fromEntries(tab.filterFields.map(k => [k, 'All']));
    setLocal(r); onClear(r); setOpen(false);
  };

  const selectStyle = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none' };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: hasActive ? '1.5px solid #004399' : '1px solid #E5E7EB', background: hasActive ? '#EFF6FF' : '#fff', fontSize: 13, color: hasActive ? '#004399' : '#374151', cursor: 'pointer', fontWeight: 500 }}>
        <Filter size={13} />
        Filters
        {activeCount > 0 && (
          <span style={{ background: '#004399', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '1px 7px' }}>{activeCount}</span>
        )}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 12px 32px rgba(0,0,0,0.13)', zIndex: 200, width: 280, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Filter by</span>
            {hasActive && (
              <button onClick={handleClear} style={{ fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                <X size={11} /> Clear all
              </button>
            )}
          </div>
          {tab.filterFields.map(key => (
            <div key={key} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{fieldLabels[key] || key}</label>
              <div style={{ position: 'relative' }}>
                <select value={local[key] || 'All'} onChange={e => setLocal(p => ({ ...p, [key]: e.target.value }))} style={selectStyle}>
                  {optionsFor(key).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={() => setOpen(false)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
            <button onClick={handleApply} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#004399', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Check size={13} /> Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── DetailsDrawer (unchanged, now also shows a small inline loading row) ──
const DetailsDrawer = ({ tab, item, loading, onClose }) => {
  if (!item && !loading) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 380, background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', padding: 24, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{tab.label} Details</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            <X size={15} />
          </button>
        </div>
        {loading ? (
          <div style={{ color: '#9CA3AF', fontSize: 13, padding: '20px 0' }}>Loading…</div>
        ) : (
          <>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>ID</div>
              <div style={{ fontSize: 14, color: '#111827' }}>{item.id}</div>
            </div>
            {tab.columns.map(({ key, label, badge }) => item[key] && (
              <div key={key} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{label}</div>
                {badge ? <Badge value={item[key]} /> : <div style={{ fontSize: 14, color: '#111827' }}>{item[key]}</div>}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Toast / ConfirmDialog (unchanged) ─────────────────────────────────────
const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, background: type === 'error' ? '#FEE2E2' : '#D1FAE5', color: type === 'error' ? '#DC2626' : '#065F46', padding: '12px 18px', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: 13, fontWeight: 500, maxWidth: 320 }}>
      {message}
    </div>
  );
};

const ConfirmDialog = ({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'rgba(17,24,39,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onCancel}>
    <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 24, width: 360, boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: danger ? '#FEE2E2' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AlertTriangle size={18} color={danger ? '#DC2626' : '#3B82F6'} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{title}</div>
      </div>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20, lineHeight: 1.6 }}>{message}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
          {cancelLabel || 'إلغاء'}
        </button>
        <button onClick={onConfirm} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: danger ? '#DC2626' : '#004399', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
          {confirmLabel || 'تأكيد'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Main component ─────────────────────────────────────────────────────────

const WarehouseDashboard = () => {
  const [activeTabKey, setActiveTabKey] = useState('requests');
  const [allData, setAllData]           = useState(INITIAL_DATA);
  const [filtersByTab, setFiltersByTab] = useState(
    Object.fromEntries(TAB_CONFIG.map(t => [t.key, Object.fromEntries(t.filterFields.map(f => [f, 'All']))]))
  );

  const [reviewItem, setReviewItem]     = useState(null);
  const [reviewDocuments, setReviewDocuments] = useState([]);
  const [drawerItem, setDrawerItem]     = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [checkedRows, setCheckedRows]   = useState({});
  const [allChecked, setAllChecked]     = useState(false);
  const [toast, setToast]               = useState(null);
  const [loading, setLoading]           = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [alertsLoading, setAlertsLoading]   = useState(false);
  const [requestDetailsLoading, setRequestDetailsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    requests: { page: 1, pageSize: 10, totalCount: 0 },
    batches:  { page: 1, pageSize: 10, totalCount: 0 },
    alerts:   { page: 1, pageSize: 5,  totalCount: 0 },
  });
  const [isHover, setIsHover]           = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // ── Top stat cards (real counts where an endpoint exists) ──────────────
  const [statCounts, setStatCounts] = useState({ requests: 0, batches: 0, alerts: 0, auditLogs: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const SHIPMENTS_STAT_PLACEHOLDER = 11; // No national shipments-count endpoint exists in Swagger — see report Section 1.

  const activeTab  = TAB_CONFIG.find(t => t.key === activeTabKey);
  const activeData = allData[activeTabKey];
  const filters     = filtersByTab[activeTabKey];
  const activePagination = pagination[activeTabKey];

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const showError = (msg) => showToast(msg, 'error');

  const setPageFor = (tabKey, updates) =>
    setPagination(prev => ({ ...prev, [tabKey]: { ...prev[tabKey], ...updates } }));

  // ── Requests tab ─────────────────────────────────────────────────────
  const fetchRegistrationRequests = async () => {
    try {
      setRequestLoading(true);
      const { page, pageSize } = pagination.requests;
      const params = { page, pageSize };
      if (filtersByTab.requests?.status && filtersByTab.requests.status !== 'All') {
        params.status = filtersByTab.requests.status;
      }
      const response = await registrationRequestsApi.getAll(params);
      if (response.success) {
        const data = response.data || {};
        const items = Array.isArray(data.items) ? data.items : [];
        setAllData(prev => ({ ...prev, requests: items.length ? items : DEMO_REQUESTS }));
        setPageFor('requests', { totalCount: data.totalCount ?? items.length });
      }
    } catch (err) {
      showError(err.message || 'Failed to load registration requests');
      setAllData(prev => ({ ...prev, requests: DEMO_REQUESTS }));
    } finally {
      setRequestLoading(false);
    }
  };

  // ── Batches tab ──────────────────────────────────────────────────────
  const fetchBatches = async () => {
    try {
      setBatchesLoading(true);
      const { page, pageSize } = pagination.batches;
      const params = { page, pageSize };
      if (filtersByTab.batches?.batchStatus && filtersByTab.batches.batchStatus !== 'All') {
        params.batchStatus = filtersByTab.batches.batchStatus;
      }
      if (filtersByTab.batches?.factory && filtersByTab.batches.factory !== 'All') {
        params.factory = filtersByTab.batches.factory;
      }
      const response = await batchesApi.getAll(params);
      if (response.success) {
        const data = response.data || {};
        const items = Array.isArray(data.items) ? data.items.map(mapBatchRow) : [];
        setAllData(prev => ({ ...prev, batches: items.length ? items : DEMO_BATCHES }));
        setPageFor('batches', { totalCount: data.totalCount ?? items.length });
      }
    } catch (err) {
      showError(err.message || 'Failed to load batches');
      setAllData(prev => ({ ...prev, batches: DEMO_BATCHES }));
    } finally {
      setBatchesLoading(false);
    }
  };

  // ── Alerts tab ───────────────────────────────────────────────────────
  const fetchAlerts = async () => {
    try {
      setAlertsLoading(true);
      const { page, pageSize } = pagination.alerts;
      const params = { page, pageSize };
      // NOTE: /api/alerts only supports `status` and `severity` query params in Swagger —
      // there is no `entityType` filter param, so entityType filtering is applied
      // client-side below on the fetched page only.
      if (filtersByTab.alerts?.severity && filtersByTab.alerts.severity !== 'All') {
        params.severity = filtersByTab.alerts.severity;
      }
      const response = await alertsApi.getAll(params);
      if (response.success) {
        const data = response.data || {};
        const items = Array.isArray(data.items) ? data.items.map(mapAlertRow) : [];
        setAllData(prev => ({ ...prev, alerts: items.length ? items : DEMO_ALERTS }));
        setPageFor('alerts', { totalCount: data.totalCount ?? items.length });
      }
    } catch (err) {
      showError(err.message || 'Failed to load alerts');
      setAllData(prev => ({ ...prev, alerts: DEMO_ALERTS }));
    } finally {
      setAlertsLoading(false);
    }
  };

  const fetchActiveTabData = async () => {
    if (activeTabKey === 'requests') return fetchRegistrationRequests();
    if (activeTabKey === 'batches')  return fetchBatches();
    if (activeTabKey === 'alerts')   return fetchAlerts();
  };

  useEffect(() => { fetchActiveTabData(); /* eslint-disable-next-line */ }, [
    activeTabKey,
    filtersByTab.requests?.status,
    filtersByTab.batches?.batchStatus,
    filtersByTab.batches?.factory,
    filtersByTab.alerts?.severity,
    pagination[activeTabKey]?.page,
  ]);

  // ── Top stat cards: fetch real counts on mount ─────────────────────────
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const [reqCounts, batchSummary, alertCounts, auditLogs] = await Promise.allSettled([
          registrationRequestsApi.getCounts(),
          batchesApi.getSummary(),
          alertsApi.getCounts(),
          adminApi.getAuditLogs({ page: 1, pageSize: 1 }),
        ]);

        setStatCounts({
          requests: reqCounts.status === 'fulfilled' ? (reqCounts.value?.data?.totalCount ?? reqCounts.value?.data?.total ?? 0) : 0,
          batches: batchSummary.status === 'fulfilled' ? (batchSummary.value?.data?.totalCount ?? batchSummary.value?.data?.total ?? 0) : 0,
          alerts: alertCounts.status === 'fulfilled' ? (alertCounts.value?.data?.totalCount ?? alertCounts.value?.data?.open ?? 0) : 0,
          auditLogs: auditLogs.status === 'fulfilled' ? (auditLogs.value?.data?.totalCount ?? 0) : 0,
        });
      } catch (err) {
        showError('Failed to load summary counts');
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  const openRequestDetails = async (row) => {
    setReviewItem(row);
    setReviewDocuments([]);
    try {
      setRequestDetailsLoading(true);
      const response = await registrationRequestsApi.getById(row.id);
      if (response.success) {
        const details = response.data || {};
        setReviewItem(details);
        const documents = Array.isArray(details.documents) ? details.documents.map((doc) => ({
          id: doc.id,
          name: doc.fileName || doc.documentType || 'Document',
          type: doc.documentType || 'FILE',
          size: doc.size || '',
          date: doc.uploadedAt ? doc.uploadedAt.split('T')[0] : '',
          url: doc.fileUrl,
        })) : [];
        setReviewDocuments(documents);
      }
    } catch (err) {
      showError(err.message || 'Failed to load request details');
    } finally {
      setRequestDetailsLoading(false);
    }
  };

  // ── Batch / Alert detail drawer — now pulls real detail data ──────────
  const openDetailsDrawer = async (row) => {
    setDrawerItem(row); // show cached row immediately
    setDrawerLoading(true);
    try {
      if (activeTabKey === 'batches') {
        const response = await batchesApi.getById(row.id);
        if (response.success) setDrawerItem(mapBatchDetails(response.data || {}));
      } else if (activeTabKey === 'alerts') {
        const response = await alertsApi.getById(row.id);
        if (response.success) setDrawerItem(mapAlertDetails(response.data || {}));
      }
    } catch (err) {
      showError(err.message || 'Failed to load details');
      // keep the cached row already shown
    } finally {
      setDrawerLoading(false);
    }
  };

  // ── Filtering (client-side pass, e.g. entityType for alerts) ──────────
  const filteredData = activeData.filter(row =>
    activeTab.filterFields.every(f => !filters[f] || filters[f] === 'All' || row[f] === filters[f])
  );

  useEffect(() => { setCheckedRows({}); setAllChecked(false); }, [activeTabKey]);

  const checkedCount = Object.values(checkedRows).filter(Boolean).length;

  const handleExport = () => {
    try {
      const checkedIds   = Object.keys(checkedRows).filter(id => checkedRows[id]);
      const dataToExport = checkedIds.length > 0 ? filteredData.filter(r => checkedIds.includes(String(r.id))) : filteredData;
      if (!dataToExport.length) { showError('No data to export'); return; }
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, activeTab.label);
      XLSX.writeFile(wb, `${activeTab.key}_export.xlsx`);
      showToast('Report exported successfully');
    } catch (err) { showError('Export failed'); }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(async () => {
      await fetchActiveTabData();
      setFiltersByTab(Object.fromEntries(TAB_CONFIG.map(t => [t.key, Object.fromEntries(t.filterFields.map(f => [f, 'All']))])));
      setCheckedRows({});
      setAllChecked(false);
      setLoading(false);
      showToast('Data refreshed');
    }, 400);
  };

  const performReviewAction = async (action, item) => {
    if (!item?.id) return;
    try {
      setRequestDetailsLoading(true);
      if (action === 'approve') {
        const response = await registrationRequestsApi.approve(item.id);
        if (response.success) showToast(`Approved ${item.id}`);
      } else if (action === 'reject') {
        const response = await registrationRequestsApi.reject(item.id, { reason: 'Rejected by regulator' });
        if (response.success) showToast(`Rejected ${item.id}`, 'error');
      } else if (action === 'inspection') {
        const response = await registrationRequestsApi.requestMoreDocuments(item.id, { message: 'Please provide additional documents for inspection' });
        if (response.success) showToast(`Inspection requested for ${item.id}`);
      }
      await fetchRegistrationRequests();
    } catch (err) {
      showError(err.message || 'Failed to process request action');
    } finally {
      setRequestDetailsLoading(false);
      setReviewItem(null);
    }
  };

  const handleReviewAction = (action, item) => {
    if (action === 'reject') { setPendingAction({ action, item }); return; }
    performReviewAction(action, item);
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) return;
    const { action, item } = pendingAction;
    setPendingAction(null);
    await performReviewAction(action, item);
  };

  const cancelPendingAction = () => setPendingAction(null);

  const toggleAll = () => {
    if (allChecked) { setCheckedRows({}); setAllChecked(false); }
    else { const all = {}; filteredData.forEach(r => { all[r.id] = true; }); setCheckedRows(all); setAllChecked(true); }
  };
  const toggleRow = (id) => setCheckedRows(p => ({ ...p, [id]: !p[id] }));

  const isTableLoading = activeTabKey === 'requests' ? requestLoading : activeTabKey === 'batches' ? batchesLoading : alertsLoading;

  return (
    <div style={{ fontFamily: 'Inter, SF Pro, -apple-system, sans-serif', padding: '28px 32px', boxSizing: 'border-box', background: '#F8F9FB', minHeight: '100vh' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 38, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#004399' }}>National </span>
            <span style={{ color: '#111827' }}>Monitoring Overview</span>
          </h1>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 14, color: '#9CA3AF', fontWeight: 400 }}>
            Monitor and manage the pharmaceutical supply chain across Egypt
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleRefresh}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', fontWeight: 500, cursor: 'pointer' }}>
            <RefreshCw size={14} color="#6B7280" style={loading ? { animation: 'spin 0.8s linear infinite' } : undefined} />
            Refresh
          </button>

          <button
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, border: 'none', background: '#004399', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: isHover ? '0 6px 18px rgba(0,67,153,0.35)' : '0 2px 8px rgba(0,0,0,0.12)', transform: isHover ? 'translateY(-1px)' : 'none', transition: 'all 0.2s' }}>
            <Download size={15} />
            Download Report
          </button>
        </div>
      </div>

      <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
        <StaticStatCard label="Request"  value={statCounts.requests}  icon={ClipboardCheck} loading={statsLoading} />
        <StaticStatCard label="Batch"    value={statCounts.batches}   icon={Package}        loading={statsLoading} />
        <StaticStatCard label="Shipment" value={SHIPMENTS_STAT_PLACEHOLDER} icon={Truck}     loading={false} />
        <StaticStatCard label="Alert"    value={statCounts.alerts}    icon={AlertTriangle}  loading={statsLoading} />
        <StaticStatCard label="AuditLog" value={statCounts.auditLogs} icon={History}        loading={statsLoading} />
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 14px', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {TAB_CONFIG.map((tab, i) => (
              <span key={tab.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ color: '#D1D5DB', fontSize: 13 }}>|</span>}
                <button
                  onClick={() => setActiveTabKey(tab.key)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: 15, fontWeight: tab.key === activeTabKey ? 600 : 400, color: tab.key === activeTabKey ? '#111827' : '#9CA3AF' }}
                >
                  {tab.tableTitle}
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <FilterDropdown
              tab={activeTab}
              data={activeData}
              activeFilters={filters}
              onApply={f => { setFiltersByTab(p => ({ ...p, [activeTabKey]: f })); setPageFor(activeTabKey, { page: 1 }); }}
              onClear={f => { setFiltersByTab(p => ({ ...p, [activeTabKey]: f })); setPageFor(activeTabKey, { page: 1 }); }}
            />
            <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
              <Download size={13} />
              {checkedCount > 0 ? `Export (${checkedCount})` : 'Export'}
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
                <th style={{ padding: '10px 16px', width: 40, textAlign: 'left' }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: 'pointer' }} />
                </th>
                {activeTab.columns.map(col => (
                  <th key={col.key} style={{ padding: '10px 12px', textAlign: 'left', color: '#6B7280', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }}>{col.label}</th>
                ))}
                <th style={{ padding: '10px 12px', width: 130, textAlign: 'left', color: '#6B7280', fontWeight: 500, fontSize: 12 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isTableLoading ? (
                <tr><td colSpan={activeTab.columns.length + 2} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>Loading…</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={activeTab.columns.length + 2} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No records found</td></tr>
              ) : (
                filteredData.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F3F4F6', background: checkedRows[row.id] ? '#F0F7FF' : '#fff' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input type="checkbox" checked={!!checkedRows[row.id]} onChange={() => toggleRow(row.id)} style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: 'pointer' }} />
                    </td>
                    {activeTab.columns.map((col, i) => (
                      <td key={col.key} style={{ padding: '12px 12px', color: i === 0 ? '#111827' : '#374151', fontWeight: i === 0 ? 500 : 400, whiteSpace: 'nowrap' }}>
                        {col.badge ? <Badge value={row[col.key]} /> : row[col.key]}
                      </td>
                    ))}
                    <td style={{ padding: '12px 12px' }}>
                      <button
                        onClick={() => (activeTab.key === 'requests' ? openRequestDetails(row) : openDetailsDrawer(row))}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #BFDBFE', background: '#EFF6FF', fontSize: 12, color: '#1D4ED8', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <Eye size={12} /> {activeTab.actionLabel || 'View Request'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: 12, color: '#9CA3AF' }}>
          Showing {filteredData.length} of {activePagination.totalCount} records
        </div>
      </div>

      {activeTabKey !== 'requests' && (
        <DetailsDrawer tab={activeTab} item={drawerItem} loading={drawerLoading} onClose={() => setDrawerItem(null)} />
      )}

      <ReviewRequestModal
        open={!!reviewItem}
        item={reviewItem}
        onClose={() => setReviewItem(null)}
        showError={showError}
        headerTitle="Warehouse Monitoring Request"
        entityLabel={reviewItem?.entityType || 'Request'}
        requestFields={[
          ['Request ID',   reviewItem?.id],
          ['Entity Name',  reviewItem?.entityName],
          ['Entity Type',  reviewItem?.entityType],
          ['Submitted By', reviewItem?.submittedBy],
          ['Submitted At', reviewItem?.submittedAt],
          ['Status',       reviewItem?.status],
        ]}
        documents={reviewDocuments}
        onAction={handleReviewAction}
      />

      {pendingAction?.action === 'reject' && (
        <ConfirmDialog
          title="تأكيد الرفض"
          message={`هل أنت متأكد من رفض الطلب ${pendingAction.item?.id}؟ لا يمكن التراجع عن هذا الإجراء.`}
          confirmLabel="نعم، رفض"
          cancelLabel="إلغاء"
          danger
          onConfirm={confirmPendingAction}
          onCancel={cancelPendingAction}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default WarehouseDashboard;