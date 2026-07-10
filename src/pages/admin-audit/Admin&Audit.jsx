import { useEffect, useState, useRef } from 'react';
import {
  Filter,
  Download,
  Eye,
  MoreVertical,
  X,
  Check,
  ChevronDown,
  Users,
  History,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  ShieldOff,
  ShieldCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';

// ─── Shared badge colors ────────────────────────────────────────────────────

const BADGE_COLORS = {
  Active:      { bg: '#D1FAE5', color: '#059669' },
  Inactive:    { bg: '#F3F4F6', color: '#6B7280' },
  Suspended:   { bg: '#FEE2E2', color: '#DC2626' },
  Success:     { bg: '#D1FAE5', color: '#059669' },
  Failed:      { bg: '#FEE2E2', color: '#DC2626' },
  Warning:     { bg: '#FEF3C7', color: '#B45309' },
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

const StaticStatCard = ({ label, value, icon: Icon }) => (
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
      <div style={{ fontSize: 36, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</div>
    </div>
    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 14 }}>
      <Icon size={24} color="#DC2626" />
    </div>
  </div>
);

// ─── Mock data ──────────────────────────────────────────────────────────────

const MOCK_USERS = [
  { id: 'USR-0091', name: 'Ahmed Hassan',   role: 'Warehouse Manager', entity: 'Delta Medical Storage',        email: 'ahmed.hassan@delta.com',   status: 'Active',    lastLogin: 'May 16, 2024' },
  { id: 'USR-0090', name: 'Mohamed Adel',   role: 'Factory Supervisor',entity: 'Cairo Pharma Factory',         email: 'mohamed.adel@cairopharma.com', status: 'Active',    lastLogin: 'May 15, 2024' },
  { id: 'USR-0089', name: 'Saif El-Din',    role: 'Pharmacist',        entity: 'Alexandria Drug Store',        email: 'saif.eldin@alexpharm.com', status: 'Suspended', lastLogin: 'May 11, 2024' },
  { id: 'USR-0088', name: 'Yehia Mostafa',  role: 'Warehouse Manager', entity: 'Portsaid Distribution Center', email: 'yehia.m@portsaid.com',     status: 'Inactive',  lastLogin: 'Apr 28, 2024' },
  { id: 'USR-0087', name: 'Nour Sami',      role: 'Compliance Officer',entity: 'Upper Egypt Factory',          email: 'nour.sami@upperegypt.com', status: 'Active',    lastLogin: 'May 10, 2024' },
];

const MOCK_LOGS = [
  { id: 'LOG-2024-0091', user: 'Ahmed Hassan',  action: 'Approved Request',   entityType: 'Request',   entityName: 'REQ-001',      ip: '41.32.11.5',   result: 'Success', timestamp: 'May 16, 2024 10:42 AM' },
  { id: 'LOG-2024-0090', user: 'Mohamed Adel',  action: 'Uploaded Document',  entityType: 'Batch',     entityName: 'BAT-2024-002', ip: '156.201.9.4',  result: 'Success', timestamp: 'May 15, 2024 4:12 PM'  },
  { id: 'LOG-2024-0089', user: 'Saif El-Din',   action: 'Login Attempt',      entityType: 'System',    entityName: '—',            ip: '197.45.63.2',  result: 'Failed',  timestamp: 'May 15, 2024 9:03 AM'  },
  { id: 'LOG-2024-0088', user: 'Yehia Mostafa', action: 'Edited Batch Status',entityType: 'Batch',     entityName: 'BAT-2024-004', ip: '102.44.8.19',  result: 'Warning', timestamp: 'May 14, 2024 2:57 PM'  },
  { id: 'LOG-2024-0087', user: 'Nour Sami',     action: 'Deleted Alert',      entityType: 'Alert',     entityName: 'ALR-005',      ip: '41.32.11.5',   result: 'Success', timestamp: 'May 14, 2024 11:20 AM' },
];

// ─── Tab configuration — columns, stat cards, and row actions per tab ─────

const TAB_CONFIG = [
  {
    key: 'users',
    label: 'System Users',
    tableTitle: 'System Users',
    data: MOCK_USERS,
    columns: [
      { key: 'name',      label: 'Name' },
      { key: 'role',      label: 'Role' },
      { key: 'entity',    label: 'Entity' },
      { key: 'email',     label: 'Email' },
      { key: 'status',    label: 'Status', badge: true },
      { key: 'lastLogin', label: 'Last Login' },
    ],
    filterFields: ['role', 'status'],
    stats: [
      { label: 'Total Users',   icon: Users,   calc: (rows) => rows.length },
      { label: 'Active Users',  icon: UserCheck, calc: (rows) => rows.filter(r => r.status === 'Active').length },
      { label: 'Suspended',     icon: UserX,   calc: (rows) => rows.filter(r => r.status === 'Suspended').length },
    ],
    rowActions: [
      { key: 'activate',   label: 'Activate User',    icon: ShieldCheck, color: '#059669' },
      { key: 'deactivate', label: 'Deactivate User',   icon: ShieldOff,   color: '#D97706' },
      { key: 'revoke',     label: 'Revoke Sessions',   icon: X,           color: '#DC2626' },
    ],
  },
  {
    key: 'logs',
    label: 'Audit Logs',
    tableTitle: 'Audit Logs',
    data: MOCK_LOGS,
    columns: [
      { key: 'user',       label: 'User' },
      { key: 'action',     label: 'Action' },
      { key: 'entityType', label: 'Entity Type' },
      { key: 'entityName', label: 'Entity Name' },
      { key: 'ip',         label: 'IP Address' },
      { key: 'result',     label: 'Result', badge: true },
      { key: 'timestamp',  label: 'Timestamp' },
    ],
    filterFields: ['entityType', 'result'],
    stats: [
      { label: 'Total Logs',    icon: History,  calc: (rows) => rows.length },
      { label: 'Failed Events', icon: UserX,    calc: (rows) => rows.filter(r => r.result === 'Failed').length },
      { label: 'Unique Users',  icon: Users,    calc: (rows) => new Set(rows.map(r => r.user)).size },
    ],
    rowActions: [
      { key: 'view',   label: 'View Details', icon: Eye,      color: '#374151' },
      { key: 'export', label: 'Export',       icon: Download, color: '#374151' },
    ],
  },
];

// ─── Filter dropdown ────────────────────────────────────────────────────────

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

// ─── Row menu (kebab) — actions are driven entirely by the active tab's config ──

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
              onClick={() => { onAction(key); setOpen(false); }}
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

// ─── Confirm modal (used for Activate / Deactivate / Revoke Sessions) ─────

const ConfirmModal = ({ title, message, confirmLabel, confirmColor, onClose, onConfirm }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.50)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: 400, background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)', padding: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 10 }}>{title}</div>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 20 }}>{message}</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
        <button onClick={onConfirm} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: confirmColor, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{confirmLabel}</button>
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

const SystemUsersAuditLogs = () => {
  const [activeTabKey, setActiveTabKey] = useState('users');
  const [allData, setAllData] = useState(Object.fromEntries(TAB_CONFIG.map(t => [t.key, t.data])));
  const [filtersByTab, setFiltersByTab] = useState(
    Object.fromEntries(TAB_CONFIG.map(t => [t.key, Object.fromEntries(t.filterFields.map(f => [f, 'All']))]))
  );
  const [search, setSearch]             = useState('');
  const [drawerItem, setDrawerItem]     = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // { key, row }
  const [toast, setToast]               = useState(null);
  const [loading, setLoading]           = useState(false);
  const [isHover, setIsHover]           = useState(false);
  const [checkedRows, setCheckedRows]   = useState({});
  const [allChecked, setAllChecked]     = useState(false);

  const activeTab  = TAB_CONFIG.find(t => t.key === activeTabKey);
  const activeData = allData[activeTabKey];
  const filters    = filtersByTab[activeTabKey];

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const showError = (msg) => showToast(msg, 'error');

  const filteredData = activeData
    .filter(row => activeTab.filterFields.every(f => !filters[f] || filters[f] === 'All' || row[f] === filters[f]))
    .filter(row => !search || Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase())));

  useEffect(() => { setSearch(''); setCheckedRows({}); setAllChecked(false); }, [activeTabKey]);

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

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setAllData(Object.fromEntries(TAB_CONFIG.map(t => [t.key, t.data])));
      setFiltersByTab(Object.fromEntries(TAB_CONFIG.map(t => [t.key, Object.fromEntries(t.filterFields.map(f => [f, 'All']))])));
      setLoading(false);
      showToast('Data refreshed');
    }, 700);
  };

  // ── Row action dispatch — behavior depends on the active tab's rowActions ──
  const handleRowAction = (key, row) => {
    if (activeTabKey === 'users') {
      if (key === 'activate' || key === 'deactivate' || key === 'revoke') {
        setPendingAction({ key, row });
        return;
      }
    }
    if (activeTabKey === 'logs') {
      if (key === 'view')   { setDrawerItem(row); return; }
      if (key === 'export') { handleExport([row]); return; }
    }
  };

  const confirmPendingAction = () => {
    if (!pendingAction) return;
    const { key, row } = pendingAction;
    if (key === 'activate') {
      setAllData(prev => ({ ...prev, users: prev.users.map(u => u.id === row.id ? { ...u, status: 'Active' } : u) }));
      showToast(`${row.name} activated`);
    } else if (key === 'deactivate') {
      setAllData(prev => ({ ...prev, users: prev.users.map(u => u.id === row.id ? { ...u, status: 'Inactive' } : u) }));
      showToast(`${row.name} deactivated`);
    } else if (key === 'revoke') {
      showToast(`Sessions revoked for ${row.name}`);
    }
    setPendingAction(null);
  };

  const confirmCopy = {
    activate:   { title: 'Activate User',   message: `Activate ${pendingAction?.row?.name}? They will regain access to the platform.`,        confirmLabel: 'Activate',   confirmColor: '#059669' },
    deactivate: { title: 'Deactivate User', message: `Deactivate ${pendingAction?.row?.name}? They will lose access until reactivated.`,       confirmLabel: 'Deactivate', confirmColor: '#D97706' },
    revoke:     { title: 'Revoke Sessions', message: `End all active sessions for ${pendingAction?.row?.name} across every device?`,          confirmLabel: 'Revoke',     confirmColor: '#DC2626' },
  };

  return (
    <div style={{ fontFamily: 'Inter, SF Pro, -apple-system, sans-serif', padding: '28px 32px', boxSizing: 'border-box', background: '#F8F9FB', minHeight: '100vh' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#004399' }}>System </span>
            <span style={{ color: '#111827' }}>Users & Audit Logs</span>
          </h1>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 14, color: '#9CA3AF', fontWeight: 400 }}>
            Monitor and manage the pharmaceutical supply chain across Egypt
          </p>
        </div>
        <button onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', fontWeight: 500, cursor: 'pointer' }}>
          <RefreshCw size={14} color="#6B7280" style={loading ? { animation: 'spin 0.8s linear infinite' } : undefined} />
          Refresh
        </button>
      </div>
      <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>

      {/* ── Stat cards — swap with the active tab ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
        {activeTab.stats.map(s => (
          <StaticStatCard key={s.label} label={s.label} value={s.calc(activeData)} icon={s.icon} />
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
              onApply={f => setFiltersByTab(p => ({ ...p, [activeTabKey]: f }))}
              onClear={f => setFiltersByTab(p => ({ ...p, [activeTabKey]: f }))}
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
              {filteredData.length === 0 ? (
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

        {/* Pagination */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: 12, color: '#9CA3AF' }}>
          Showing {filteredData.length} of {activeData.length} records
        </div>
      </div>

      {/* ── Details drawer (Audit Logs → View Details) ── */}
      {drawerItem && <DetailsDrawer tab={activeTab} item={drawerItem} onClose={() => setDrawerItem(null)} />}

      {/* ── Confirm modal (System Users → Activate / Deactivate / Revoke Sessions) ── */}
      {pendingAction && (
        <ConfirmModal
          {...confirmCopy[pendingAction.key]}
          onClose={() => setPendingAction(null)}
          onConfirm={confirmPendingAction}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default SystemUsersAuditLogs;