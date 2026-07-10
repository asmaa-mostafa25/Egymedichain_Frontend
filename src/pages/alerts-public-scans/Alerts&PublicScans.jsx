import { useEffect, useState, useRef, useMemo } from 'react';
import {
  Filter,
  Download,
  Eye,
  MoreVertical,
  X,
  Check,
  ChevronDown,
  Search,
  ShieldAlert,
  ScanLine,
  AlertTriangle,
  AlertOctagon,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fetchAllAlertsData, updateAlertStatus, createRecallAlert } from './../../api/alartapi';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  Open:            { bg: '#FEE2E2', color: '#DC2626' },
  'Under Review':  { bg: '#FEF3C7', color: '#B45309' },
  Resolved:        { bg: '#D1FAE5', color: '#059669' },
  Dismissed:       { bg: '#F3F4F6', color: '#374151' },
  Active:          { bg: '#FEE2E2', color: '#DC2626' },
  Critical:        { bg: '#FEE2E2', color: '#DC2626' },
  High:            { bg: '#FEE2E2', color: '#DC2626' },
  Medium:          { bg: '#FEF3C7', color: '#B45309' },
  Low:             { bg: '#D1FAE5', color: '#059669' },
  Authentic:       { bg: '#D1FAE5', color: '#059669' },
  Recalled:        { bg: '#FEE2E2', color: '#DC2626' },
  Suspicious:      { bg: '#FEF3C7', color: '#B45309' },
  'Duplicate Scan':{ bg: '#FFEDD5', color: '#C2410C' },
  'Not Found':     { bg: '#F3F4F6', color: '#374151' },
};

const FILTER_OPTIONS = {
  severity: ['All', 'Critical', 'High', 'Medium', 'Low'],
  status:   ['All', 'Open', 'Under Review', 'Resolved', 'Dismissed', 'Active'],
  result:   ['All', 'Authentic', 'Recalled', 'Suspicious', 'Duplicate Scan', 'Not Found'],
};

// Row data now comes from the API service (see api.js). These arrays are gone —
// the page loads everything through fetchAllAlertsData() below.

// column + filter configuration per tab
const TAB_CONFIG = {
  'Open Alert': {
    icon: ShieldAlert,
    statusKey: 'status',
    searchKeys: ['id', 'type', 'entityName', 'batch'],
    filters: [{ key: 'severity', label: 'Severity' }, { key: 'status', label: 'Alert Status' }],
    columns: [
      { key: 'id',         label: 'Alert ID' },
      { key: 'type',       label: 'Alert Type' },
      { key: 'severity',   label: 'Severity',   badge: true },
      { key: 'entityType', label: 'Entity Type' },
      { key: 'entityName', label: 'Entity Name' },
      { key: 'batch',      label: 'Batch Number' },
      { key: 'message',    label: 'Message' },
      { key: 'createdAt',  label: 'Created At' },
      { key: 'status',     label: 'Alert Status', badge: true },
    ],
  },
  'Public Scan Logs': {
    icon: ScanLine,
    statusKey: null,
    searchKeys: ['scanId', 'product', 'serial', 'batch'],
    filters: [{ key: 'result', label: 'Verification Result' }],
    columns: [
      { key: 'scanId',      label: 'Scan ID' },
      { key: 'gtin',        label: 'Scanned GTIN' },
      { key: 'serial',      label: 'Scanned Serial Number' },
      { key: 'batch',       label: 'Scanned Batch Number' },
      { key: 'product',     label: 'Product Name' },
      { key: 'result',      label: 'Verification Result', badge: true },
      { key: 'reason',      label: 'Reason' },
      { key: 'governorate', label: 'Governorate' },
      { key: 'city',        label: 'City' },
      { key: 'scannedAt',   label: 'Scanned At' },
    ],
  },
  'Recall Alerts': {
    icon: AlertTriangle,
    statusKey: 'status',
    searchKeys: ['alertId', 'product', 'batch', 'factory'],
    filters: [{ key: 'severity', label: 'Severity' }, { key: 'status', label: 'Alert Status' }],
    columns: [
      { key: 'alertId',   label: 'Alert ID' },
      { key: 'product',   label: 'Product Name' },
      { key: 'batch',     label: 'Batch Number' },
      { key: 'factory',   label: 'Factory Name' },
      { key: 'severity',  label: 'Severity', badge: true },
      { key: 'message',   label: 'Message' },
      { key: 'status',    label: 'Alert Status', badge: true },
      { key: 'scannedAt', label: 'Scanned At' },
    ],
  },
};

const TABS = ['Open Alert', 'Public Scan Logs', 'Recall Alerts'];

const ROW_ACTIONS = [
  { key: 'view',          label: 'View Details',       icon: Eye,           color: '#374151' },
  { key: 'under_review',  label: 'Mark Under Review',  icon: Clock,         color: '#B45309' },
  { key: 'resolve',       label: 'Resolve',            icon: CheckCircle2,  color: '#059669' },
  { key: 'dismiss',       label: 'Dismiss',            icon: XCircle,       color: '#6B7280' },
  { key: 'create_recall', label: 'Create Recall Alert',icon: AlertOctagon,  color: '#EF4444' },
];

// ─── Small UI Atoms ───────────────────────────────────────────────────────────

const Pill = ({ label }) => {
  const s = STATUS_COLORS[label] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
};

const StatCard = ({ label, value, icon: Icon }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F0F0F0', flex: 1, minWidth: 0 }}>
    <div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</div>
    </div>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color="#DC2626" />
    </div>
  </div>
);

// ─── Filter Dropdown ──────────────────────────────────────────────────────────

const FilterDropdown = ({ fields, activeFilters, onApply, onClear }) => {
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

  const hasActive = Object.values(activeFilters).some(v => v && v !== 'All');
  const activeCount = Object.values(activeFilters).filter(v => v && v !== 'All').length;

  const handleApply = () => { onApply(local); setOpen(false); };
  const handleClear = () => {
    const r = {}; fields.forEach(f => r[f.key] = 'All');
    setLocal(r); onClear(r); setOpen(false);
  };

  const selectStyle = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none' };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: hasActive ? '1.5px solid #004399' : '1px solid #E5E7EB', background: hasActive ? '#EFF6FF' : '#fff', fontSize: 13, color: hasActive ? '#004399' : '#374151', cursor: 'pointer', fontWeight: 500 }}
      >
        <Filter size={13} />
        Filters
        {activeCount > 0 && (
          <span style={{ background: '#004399', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '1px 7px' }}>{activeCount}</span>
        )}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 12px 32px rgba(0,0,0,0.13)', zIndex: 200, width: 260, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Filter by</span>
            {hasActive && (
              <button onClick={handleClear} style={{ fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                <X size={11} /> Clear all
              </button>
            )}
          </div>
          {fields.map(({ key, label }) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <select value={local[key] || 'All'} onChange={e => setLocal(p => ({ ...p, [key]: e.target.value }))} style={selectStyle}>
                  {FILTER_OPTIONS[key].map(opt => <option key={opt} value={opt}>{opt}</option>)}
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

// ─── Row Menu ─────────────────────────────────────────────────────────────────

const RowMenu = ({ row, onAction }) => {
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
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 200, overflow: 'hidden' }}>
          {ROW_ACTIONS.map(({ key, label, icon: Icon, color }, i) => (
            <button key={key} onClick={() => { onAction(key, row); setOpen(false); }}
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

// ─── Create Recall Alert Confirm Modal ─────────────────────────────────────────

const RecallModal = ({ item, idField, labelField, onClose, onConfirm }) => {
  const [message, setMessage] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.50)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: 420, background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertOctagon size={18} color="#DC2626" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Create Recall Alert</div>
        </div>
        <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 14 }}>
          This will create a recall alert for <strong>{item?.[idField]}</strong> ({item?.[labelField]}) and notify all holders in the supply chain.
        </p>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Reason (optional)</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="e.g. Reported adverse reactions, quality deviation..."
          rows={3}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', boxSizing: 'border-box', outline: 'none', resize: 'vertical', marginBottom: 18, fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onConfirm(message)} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Confirm Recall</button>
        </div>
      </div>
    </div>
  );
};

// ─── View Details Modal ────────────────────────────────────────────────────────

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #F0F0F0' }}>
    {children}
  </div>
);

const InfoField = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 14, color: '#111827' }}>{value === undefined || value === null || value === '' ? '—' : value}</div>
  </div>
);

const DetailsModal = ({ item, columns, idField, onClose }) => {
  if (!item) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, maxHeight: '85vh', background: '#fff', borderRadius: 20, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '22px 26px 18px', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>Details</div>
            <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 5 }}>{item[idField]}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 26px 26px' }}>
          <SectionTitle>Record Information</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {columns.map(col => (
              <InfoField key={col.key} label={col.label} value={col.badge ? <Pill label={item[col.key]} /> : item[col.key]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Notification Toast ───────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

const AlertsPublicScans = () => {
  const [activeTab, setActiveTab] = useState('Open Alert');

  const [openAlerts, setOpenAlerts]     = useState([]);
  const [scanLogs, setScanLogs]         = useState([]);
  const [recallAlerts, setRecallAlerts] = useState([]);
  const [dataLoading, setDataLoading]   = useState(true);
  const [loadError, setLoadError]       = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [checkedRows, setCheckedRows] = useState({});
  const [allChecked, setAllChecked] = useState(false);

  const [detailsItem, setDetailsItem] = useState(null);
  const [recallTarget, setRecallTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const showError = (msg) => showToast(msg, 'error');

  const config = TAB_CONFIG[activeTab];
  const setters = { 'Open Alert': setOpenAlerts, 'Public Scan Logs': setScanLogs, 'Recall Alerts': setRecallAlerts };
  const items = { 'Open Alert': openAlerts, 'Public Scan Logs': scanLogs, 'Recall Alerts': recallAlerts }[activeTab];
  const idField = config.columns[0].key; // display id shown in table/toasts (matches the screenshot content, can repeat)
  const rowKeyField = 'id'; // internal unique key used for React keys, checkboxes, and targeting a row

  const loadData = () => {
    setDataLoading(true);
    setLoadError(null);
    return fetchAllAlertsData()
      .then(({ openAlerts: oa, scanLogs: sl, recallAlerts: ra }) => {
        setOpenAlerts(oa);
        setScanLogs(sl);
        setRecallAlerts(ra);
      })
      .catch((err) => {
        setLoadError(err.message || 'Failed to load data');
        showError(err.message || 'Failed to load data');
      })
      .finally(() => setDataLoading(false));
  };

  // initial load
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reset filters when switching tabs
  useEffect(() => {
    const f = {}; config.filters.forEach(x => f[x.key] = 'All');
    setActiveFilters(f);
    setSearchQuery('');
    setCheckedRows({});
    setAllChecked(false);
  }, [activeTab]);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return items.filter(row => {
      const matchFilters = config.filters.every(f => !activeFilters[f.key] || activeFilters[f.key] === 'All' || row[f.key] === activeFilters[f.key]);
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || config.searchKeys.some(k => String(row[k]).toLowerCase().includes(q));
      return matchFilters && matchSearch;
    });
  }, [items, activeFilters, searchQuery, config]);

  const stats = { openAlerts: openAlerts.length, scanLogs: scanLogs.length, recallAlerts: recallAlerts.length };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleExport = () => {
    try {
      const checkedIds = Object.keys(checkedRows).filter(id => checkedRows[id]);
      const dataToExport = checkedIds.length > 0 ? filtered.filter(r => checkedIds.includes(String(r[rowKeyField]))) : filtered;
      if (!dataToExport.length) { showError('No data to export'); return; }
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, activeTab);
      XLSX.writeFile(wb, `${activeTab.toLowerCase().replace(/\s+/g, '_')}_export.xlsx`);
      showToast('Report exported successfully');
    } catch (err) { showError('Export failed'); }
  };

  const TAB_ENTITY = { 'Open Alert': 'openAlert', 'Recall Alerts': 'recallAlert', 'Public Scan Logs': null };

  const updateRowStatus = async (row, newStatus) => {
    if (!config.statusKey) return;
    const entity = TAB_ENTITY[activeTab];
    const previous = items;
    // optimistic update
    setters[activeTab](prev => prev.map(r => r[rowKeyField] === row[rowKeyField] ? { ...r, [config.statusKey]: newStatus } : r));
    try {
      await updateAlertStatus(entity, row[rowKeyField], newStatus);
    } catch (err) {
      setters[activeTab](previous); // rollback
      showError(err.message || 'Could not update status');
    }
  };

  const handleRowAction = (key, row) => {
    switch (key) {
      case 'view':
        setDetailsItem(row);
        break;
      case 'under_review':
        updateRowStatus(row, 'Under Review');
        showToast(`${row[idField]} marked as Under Review`);
        break;
      case 'resolve':
        updateRowStatus(row, 'Resolved');
        showToast(`${row[idField]} marked as Resolved`);
        break;
      case 'dismiss':
        updateRowStatus(row, 'Dismissed');
        showToast(`${row[idField]} dismissed`);
        break;
      case 'create_recall':
        setRecallTarget(row);
        break;
      default:
        break;
    }
  };

  const handleRecallConfirm = async (reason) => {
    if (!recallTarget) return;
    try {
      await createRecallAlert(recallTarget[rowKeyField], reason);
      showToast(`Recall alert created for ${recallTarget[idField]}`);
      setRecallTarget(null);
      // pull the fresh recall list so the new alert shows up in the Recall Alerts tab
      fetchAllAlertsData().then(({ recallAlerts: ra }) => setRecallAlerts(ra)).catch(() => {});
    } catch (err) {
      showError(err.message || 'Could not create recall alert');
    }
  };

  const handleApplyFilters = (f) => setActiveFilters(f);
  const handleClearFilters = (f) => setActiveFilters(f);

  const handleRefresh = () => {
    setLoading(true);
    loadData().finally(() => {
      setSearchQuery('');
      const f = {}; config.filters.forEach(x => f[x.key] = 'All');
      setActiveFilters(f);
      setCheckedRows({});
      setAllChecked(false);
      setLoading(false);
      showToast('Data refreshed');
    });
  };

  const toggleAll = () => {
    if (allChecked) { setCheckedRows({}); setAllChecked(false); }
    else { const all = {}; filtered.forEach(r => { all[r[rowKeyField]] = true; }); setCheckedRows(all); setAllChecked(true); }
  };
  const toggleRow = (id) => setCheckedRows(p => ({ ...p, [id]: !p[id] }));

  const checkedCount = Object.values(checkedRows).filter(Boolean).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: 'Inter, SF Pro, -apple-system, sans-serif', padding: '24px 28px', boxSizing: 'border-box', background: '#F9FAFB', minHeight: '100%' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#111827' }}>Alerts &amp; </span>
            <span style={{ color: '#004399' }}>Public Scans</span>
          </h1>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 14, color: '#9CA3AF', fontWeight: 400 }}>
            Monitor and manage the pharmaceutical supply chain across Egypt
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
          <RefreshCw size={14} color="#6B7280" style={loading ? { animation: 'spin 0.8s linear infinite' } : undefined} />
          Refresh
        </button>
      </div>

      <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Open Alerts"      value={stats.openAlerts}   icon={ShieldAlert} />
        <StatCard label="Public Scan Logs" value={stats.scanLogs}     icon={ScanLine} />
        <StatCard label="Recall Alerts"    value={stats.recallAlerts} icon={AlertTriangle} />
      </div>

      {/* ── Main Table Card ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '0 20px', borderBottom: '1px solid #F0F0F0' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '14px 14px 12px',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #004399' : '2px solid transparent',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? '#004399' : '#6B7280',
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{activeTab}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search patients, appointments..."
                style={{ padding: '7px 12px 7px 30px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', width: 220, outline: 'none' }}
              />
            </div>
            <FilterDropdown fields={config.filters} activeFilters={activeFilters} onApply={handleApplyFilters} onClear={handleClearFilters} />
            <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
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
                {config.columns.map(col => (
                  <th key={col.key} style={{ padding: '10px 10px', textAlign: 'left', color: '#6B7280', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }}>{col.label}</th>
                ))}
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {dataLoading ? (
                <tr><td colSpan={config.columns.length + 2} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>Loading data…</td></tr>
              ) : loadError ? (
                <tr><td colSpan={config.columns.length + 2} style={{ textAlign: 'center', padding: '40px 0', color: '#DC2626' }}>{loadError} — <button onClick={loadData} style={{ border: 'none', background: 'none', color: '#004399', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>retry</button></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={config.columns.length + 2} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No records found</td></tr>
              ) : (
                filtered.map(row => (
                  <tr key={row[rowKeyField]} style={{ borderBottom: '1px solid #F3F4F6', background: checkedRows[row[rowKeyField]] ? '#F0F7FF' : '#fff' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input type="checkbox" checked={!!checkedRows[row[rowKeyField]]} onChange={() => toggleRow(row[rowKeyField])} style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: 'pointer' }} />
                    </td>
                    {config.columns.map((col, ci) => (
                      <td key={col.key} style={{ padding: '12px 10px', color: ci === 0 ? '#1D4ED8' : '#374151', fontWeight: ci === 0 ? 500 : 400, whiteSpace: 'nowrap' }}>
                        {col.badge ? <Pill label={row[col.key]} /> : row[col.key]}
                      </td>
                    ))}
                    <td style={{ padding: '12px 10px' }}>
                      <RowMenu row={row} onAction={handleRowAction} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination info */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: 12, color: '#9CA3AF' }}>
          Showing {filtered.length} of {items.length} records
        </div>
      </div>

      {/* ── Details Modal ── */}
      {detailsItem && (
        <DetailsModal item={detailsItem} columns={config.columns} idField={idField} onClose={() => setDetailsItem(null)} />
      )}

      {/* ── Recall Modal ── */}
      {recallTarget && (
        <RecallModal
          item={recallTarget}
          idField={idField}
          labelField={config.columns[1]?.key || idField}
          onClose={() => setRecallTarget(null)}
          onConfirm={handleRecallConfirm}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default AlertsPublicScans;