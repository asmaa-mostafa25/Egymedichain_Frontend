import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Filter,
  Download,
  Eye,
  MoreVertical,
  X,
  Check,
  ChevronDown,
  AlertTriangle,
  ScanLine,
  RefreshCw,
  Search,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { alertsService, fetchAllAlertsData, fetchAlertsCounts, updateAlertStatus } from '../../api/services/alertsService';

// ─── Shared badge colors ────────────────────────────────────────────────────

const BADGE_COLORS = {
  Open:        { bg: '#FEE2E2', color: '#DC2626' },
  'Under Review': { bg: '#FEF3C7', color: '#B45309' },
  Resolved:    { bg: '#D1FAE5', color: '#059669' },
  High:        { bg: '#FEE2E2', color: '#DC2626' },
  Medium:      { bg: '#FEF3C7', color: '#B45309' },
  Low:         { bg: '#F3F4F6', color: '#6B7280' },
  Valid:       { bg: '#D1FAE5', color: '#059669' },
  Suspicious:  { bg: '#FEE2E2', color: '#DC2626' },
  Blocked:     { bg: '#FEE2E2', color: '#DC2626' },
};
const Badge = ({ value }) => {
  const s = BADGE_COLORS[value] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ display: 'inline-block', padding: '3px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {value}
    </span>
  );
};

// ─── Static pill card (label + number + red circular icon) ────────────────

const StaticStatCard = ({ label, value, icon: Icon, loading }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 16,
      padding: '22px 26px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      border: '1px solid #F0F0F0',
      flex: 1,
      minWidth: 0,
    }}
  >
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 8, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{loading ? '—' : value}</div>
    </div>
    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 14 }}>
      <Icon size={24} color="#DC2626" />
    </div>
  </div>
);

// ─── Tab configuration — columns and row actions per tab ─────

const TAB_CONFIG = [
  {
    key: 'open',
    label: 'Open Alert',
    tableTitle: 'Alerts & Public Scans',
    columns: [
      { key: 'id',          label: 'Alert ID' },
      { key: 'alertType',   label: 'Alert Type' },
      { key: 'severity',    label: 'Severity', badge: true },
      { key: 'entityType',  label: 'Entity Type' },
      { key: 'entityName',  label: 'Entity Name' },
      { key: 'batchNumber', label: 'Batch Number' },
      { key: 'message',     label: 'Message' },
      { key: 'createdAt',   label: 'Created At' },
      { key: 'alertStatus', label: 'Alert Status', badge: true },
    ],
    filterFields: ['severity', 'alertStatus'],
    rowActions: [
      { key: 'view',    label: 'View Details',  icon: Eye,          color: '#374151' },
      { key: 'resolve', label: 'Mark Resolved', icon: CheckCircle2, color: '#059669' },
    ],
  },
  {
    key: 'scans',
    label: 'Public Scan Logs',
    tableTitle: 'Public Scan Logs',
    columns: [
      { key: 'id',                 label: 'Scan ID' },
      { key: 'scannedGTIN',        label: 'GTIN' },
      { key: 'scannedBatchNumber', label: 'Batch Number' },
      { key: 'productName',        label: 'Product Name' },
      { key: 'verificationResult', label: 'Result', badge: true },
      { key: 'governorate',        label: 'Governorate' },
      { key: 'city',               label: 'City' },
      { key: 'scannedAt',          label: 'Scanned At' },
    ],
    filterFields: ['verificationResult', 'governorate'],
    rowActions: [
      { key: 'view',        label: 'View Details', icon: Eye,         color: '#374151' },
      { key: 'createAlert', label: 'Create Alert', icon: ShieldAlert, color: '#DC2626' },
    ],
  },
  {
    key: 'recalls',
    label: 'Recall Alerts',
    tableTitle: 'Recall Alerts',
    columns: [
      { key: 'id',          label: 'Recall ID' },
      { key: 'alertType',   label: 'Alert Type' },
      { key: 'severity',    label: 'Severity', badge: true },
      { key: 'entityType',  label: 'Entity Type' },
      { key: 'entityName',  label: 'Entity Name' },
      { key: 'batchNumber', label: 'Batch Number' },
      { key: 'message',     label: 'Message' },
      { key: 'createdAt',   label: 'Created At' },
      { key: 'alertStatus', label: 'Alert Status', badge: true },
    ],
    filterFields: ['severity', 'alertStatus'],
    rowActions: [
      { key: 'view',    label: 'View Details',  icon: Eye,          color: '#374151' },
      { key: 'resolve', label: 'Mark Resolved', icon: CheckCircle2, color: '#059669' },
    ],
  },
];

const TAB_DATA_KEY = { open: 'openAlerts', scans: 'scanLogs', recalls: 'recallAlerts' };

// ─── Filter dropdown ────────────────────────────────────────────────────────

const FilterDropdown = ({ tab, data, activeFilters, onApply, onClear }) => {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(activeFilters);
  const ref = useRef(null);

  useEffect(() => { setLocal(activeFilters); }, [activeFilters]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const fieldLabels = Object.fromEntries(tab.columns.map(c => [c.key, c.label]));
  const optionsFor = (field) => ['All', ...Array.from(new Set(data.map(r => r[field]).filter(Boolean)))];

  const hasActive = Object.values(activeFilters).some(v => v && v !== 'All');
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

// ─── Row menu (kebab) ──

const RowMenu = ({ actions, onAction }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(p => !p); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: open ? '#004399' : '#9CA3AF', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}>
        <MoreVertical size={16} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 180, overflow: 'hidden' }}>
          {actions.map(({ key, label, icon: Icon, color }, i) => (
            <button key={key}
              onClick={(e) => { e.stopPropagation(); onAction(key); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', border: 'none', borderTop: i > 0 ? '1px solid #F3F4F6' : 'none', background: 'none', fontSize: 13, color, cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Details drawer ─────────────────────────────────────────────────────────

const DetailsDrawer = ({ tab, item, onClose }) => {
  if (!item) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 380, background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', padding: 24, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{tab.label} Details</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            <X size={15} />
          </button>
        </div>
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
      </div>
    </div>
  );
};

// ─── Confirm modal ─────

const ConfirmModal = ({ title, message, confirmLabel, confirmColor, submitting, onClose, onConfirm }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.50)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={submitting ? undefined : onClose}>
    <div onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: 400, background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)', padding: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 10 }}>{title}</div>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 20 }}>{message}</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button disabled={submitting} onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>Cancel</button>
        <button disabled={submitting} onClick={onConfirm} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: confirmColor, color: '#fff', fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
          {submitting ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Toast ──────────────────────────────────────────────────────────────────

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

// ─── Main component ─────────────────────────────────────────────────────────

const EMPTY_FILTERS = Object.fromEntries(TAB_CONFIG.map(t => [t.key, Object.fromEntries(t.filterFields.map(f => [f, 'All']))]));

const AlertsPublicScans = () => {
  const [activeTabKey, setActiveTabKey] = useState('open');
  const [allData, setAllData] = useState({ openAlerts: [], scanLogs: [], recallAlerts: [] });
  const [counts, setCounts] = useState(null);
  const [countsLoading, setCountsLoading] = useState(true);
  const [filtersByTab, setFiltersByTab] = useState(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [drawerItem, setDrawerItem] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});
  const [allChecked, setAllChecked] = useState(false);

  const activeTab = TAB_CONFIG.find(t => t.key === activeTabKey);
  const activeData = allData[TAB_DATA_KEY[activeTabKey]];
  const filters = filtersByTab[activeTabKey];

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const showError = (msg) => showToast(msg, 'error');

  // ── Fetchers ──
  // FIX: both fetchers now wrapped in try/catch so a network/API failure surfaces
  // a toast instead of leaving the page stuck on "Loading…" / "—" forever.
  const fetchCounts = useCallback(async () => {
    setCountsLoading(true);
    try {
      const res = await fetchAlertsCounts();
      setCounts(res || {});
    } catch (err) {
      showError(err?.message || 'Failed to load alert counts');
      setCounts({});
    } finally {
      setCountsLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllAlertsData();
      setAllData({
        openAlerts: res?.openAlerts || [],
        scanLogs: res?.scanLogs || [],
        recallAlerts: res?.recallAlerts || [],
      });
      setDemoMode(!!res?.demoMode);
    } catch (err) {
      showError(err?.message || 'Failed to load alerts data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCounts(); fetchData(); }, [fetchCounts, fetchData]);

  useEffect(() => { setSearch(''); setCheckedRows({}); setAllChecked(false); }, [activeTabKey]);

  // FIX: selections are now also cleared whenever the active filters change,
  // so a stale "select all" checkbox can't stay checked against rows that are
  // no longer part of the filtered view.
  useEffect(() => { setCheckedRows({}); setAllChecked(false); }, [JSON.stringify(filters)]);

  const filteredData = activeData
    .filter(row => activeTab.filterFields.every(f => !filters[f] || filters[f] === 'All' || row[f] === filters[f]))
    .filter(row => !search || Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase())));

  const checkedCount = Object.values(checkedRows).filter(Boolean).length;

  const toggleAll = () => {
    if (allChecked) { setCheckedRows({}); setAllChecked(false); }
    else { const all = {}; filteredData.forEach(r => { all[r.id] = true; }); setCheckedRows(all); setAllChecked(true); }
  };
  const toggleRow = (id) => setCheckedRows(p => ({ ...p, [id]: !p[id] }));

  const handleExport = (rows) => {
    try {
      let dataToExport = rows;
      if (!dataToExport) {
        const checkedIds = Object.keys(checkedRows).filter(id => checkedRows[id]);
        dataToExport = checkedIds.length > 0 ? filteredData.filter(r => checkedIds.includes(String(r.id))) : filteredData;
      }
      if (!dataToExport.length) { showError('No data to export'); return; }
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, activeTab.label);
      XLSX.writeFile(wb, `${activeTab.key}_export.xlsx`);
      showToast('Report exported successfully');
    } catch (err) { showError('Export failed'); }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchCounts(), fetchData()]);
      showToast('Data refreshed');
    } finally {
      setLoading(false);
    }
  };

  // ── Row action dispatch ──
  const handleRowAction = (key, row) => {
    if (key === 'view') { setDrawerItem(row); return; }
    if (key === 'resolve') { setPendingAction({ key, row }); return; }
    if (key === 'createAlert') { setPendingAction({ key, row }); return; }
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) return;
    const { key, row } = pendingAction;
    setActionSubmitting(true);
    try {
      if (key === 'resolve') {
        await updateAlertStatus(activeTabKey, row.id, 'Resolved');
        setAllData(prev => ({
          ...prev,
          [TAB_DATA_KEY[activeTabKey]]: prev[TAB_DATA_KEY[activeTabKey]].map(a =>
            a.id === row.id ? { ...a, alertStatus: 'Resolved' } : a
          ),
        }));
        showToast(`${row.id} marked as resolved`);
      } else if (key === 'createAlert') {
        await alertsService.createAlertFromPublicScan(row.id, { severity: 'High' });
        showToast(`Alert created from ${row.id}`);
      }
      fetchCounts();
      setPendingAction(null);
    } catch (err) {
      // FIX: fallback message is now in English to match the rest of the UI
      // (was previously a hardcoded Arabic string, inconsistent with the page).
      showError(err?.message || 'An error occurred while performing this action');
    } finally {
      setActionSubmitting(false);
    }
  };

  const confirmCopy = {
    resolve:     { title: 'Mark as Resolved', message: `Mark ${pendingAction?.row?.id} as resolved? This closes the alert.`, confirmLabel: 'Mark Resolved', confirmColor: '#059669' },
    createAlert: { title: 'Create Alert',     message: `Create a new alert from scan ${pendingAction?.row?.id}?`,             confirmLabel: 'Create Alert',  confirmColor: '#DC2626' },
  };

  const statCards = [
    { label: 'Open Alerts',      value: counts?.openAlerts ?? 0,     icon: AlertTriangle },
    { label: 'Public Scan Logs', value: counts?.publicScanLogs ?? 0, icon: ScanLine },
    { label: 'Recall Alerts',    value: counts?.recallAlerts ?? 0,   icon: ShieldAlert },
  ];

  return (
    <div style={{ fontFamily: 'Inter, SF Pro, -apple-system, sans-serif', padding: '28px 32px', boxSizing: 'border-box', background: '#F8F9FB', minHeight: '100vh' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#004399' }}>Alerts & </span>
            <span style={{ color: '#111827' }}>Public Scans</span>
          </h1>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 14, color: '#9CA3AF', fontWeight: 400 }}>
            Monitor and manage the pharmaceutical supply chain across Egypt
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {demoMode && (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#B45309', background: '#FEF3C7', padding: '5px 10px', borderRadius: 20 }}>
              Demo Data
            </span>
          )}
          <button onClick={handleRefresh} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
            <RefreshCw size={14} color="#6B7280" style={loading ? { animation: 'spin 0.8s linear infinite' } : undefined} />
            Refresh
          </button>
        </div>
      </div>
      <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
        {statCards.map(c => (
          <StaticStatCard key={c.label} label={c.label} value={c.value} icon={c.icon} loading={countsLoading} />
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #E5E7EB' }}>
        {TAB_CONFIG.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTabKey(tab.key)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: tab.key === activeTabKey ? 600 : 400,
              color: tab.key === activeTabKey ? '#004399' : '#9CA3AF',
              borderBottom: tab.key === activeTabKey ? '2px solid #004399' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Table card ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 14px', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{activeTab.tableTitle}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                style={{ padding: '8px 12px 8px 32px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', outline: 'none', width: 200 }}
              />
            </div>
            <FilterDropdown
              tab={activeTab}
              data={activeData}
              activeFilters={filters}
              onApply={f => setFiltersByTab(p => ({ ...p, [activeTabKey]: { ...p[activeTabKey], ...f } }))}
              onClear={f => setFiltersByTab(p => ({ ...p, [activeTabKey]: { ...p[activeTabKey], ...f } }))}
            />
            <button onClick={() => handleExport()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
              <Download size={13} />
              {checkedCount > 0 ? `Export (${checkedCount})` : 'Export'}
            </button>
          </div>
        </div>

        {/* Table */}
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
                <th style={{ padding: '10px 12px', width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
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
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <RowMenu actions={activeTab.rowActions} onAction={(key) => handleRowAction(key, row)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: 12, color: '#9CA3AF' }}>
          Showing {filteredData.length} of {activeData.length} records
        </div>
      </div>

      {/* ── Details drawer ── */}
      {drawerItem && <DetailsDrawer tab={activeTab} item={drawerItem} onClose={() => setDrawerItem(null)} />}

      {/* ── Confirm modal (Mark Resolved / Create Alert) ── */}
      {pendingAction && (
        <ConfirmModal
          {...confirmCopy[pendingAction.key]}
          submitting={actionSubmitting}
          onClose={() => !actionSubmitting && setPendingAction(null)}
          onConfirm={confirmPendingAction}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default AlertsPublicScans;