import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  X,
  Check,
  ChevronDown,
  FileText,
  Package,
  Truck,
  ShieldAlert,
  ClipboardCheck,
  RefreshCw,
  Ship,
} from 'lucide-react';
import { useUIStore, useNotificationStore } from '../../store';
import importApi from '../../api/importApi';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Drawer from '../../components/ui/Drawer';
import ReviewRequestModal from './ReviewRequestModal';
import * as XLSX from 'xlsx';

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_COLORS = {
  Critical: { bg: '#FEE2E2', color: '#DC2626' },
  High:     { bg: '#FEF3C7', color: '#D97706' },
  Medium:   { bg: '#DBEAFE', color: '#2563EB' },
  Low:      { bg: '#D1FAE5', color: '#059669' },
};

const STATUS_COLORS = {
  'Under Review': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Monitoring':   { bg: '#FEF3C7', color: '#B45309' },
  'Open':         { bg: '#F3F4F6', color: '#374151' },
  'Resolved':     { bg: '#D1FAE5', color: '#065F46' },
  'Approved':     { bg: '#D1FAE5', color: '#065F46' },
  'Rejected':     { bg: '#FEE2E2', color: '#DC2626' },
  'Pending':      { bg: '#FEF3C7', color: '#B45309' },
  'Cleared':      { bg: '#D1FAE5', color: '#065F46' },
};

const TABS = [
  { key: 'requests',   label: 'Import Requests',    icon: FileText,      badge: 3  },
  { key: 'customs',    label: 'Customs Clearance',  icon: ClipboardCheck, badge: 3  },
  { key: 'tracking',   label: 'Shipment Tracking',  icon: Truck,         badge: 3  },
  { key: 'alerts',     label: 'Compliance Alerts',  icon: ShieldAlert,   badge: null },
];

const COL_LABELS = {
  requests: ['Request ID',  'Shipment ID',  'Company',         'Country of Origin', 'Port of Entry', 'Status'],
  customs:  ['Clearance ID','Shipment ID',  'Customs Type',    'Severity',          'Country',       'Status'],
  tracking: ['Tracking ID', 'Shipment ID',  'Shipment Type',   'Severity',          'Destination',   'Status'],
  alerts:   ['Alert ID',    'Shipment ID',  'Alert Type',      'Severity',          'Status',        'Status'],
};

// Compliance Alerts tab has: Alert ID, Shipment ID, Alert Type, Severity, Status
const ALERTS_COL_LABELS = ['Alert ID', 'Shipment ID', 'Alert Type', 'Severity', 'Status'];

const FILTER_OPTIONS = {
  status:   ['All', 'Open', 'Under Review', 'Monitoring', 'Resolved', 'Approved', 'Rejected', 'Pending', 'Cleared'],
  severity: ['All', 'Critical', 'High', 'Medium', 'Low'],
  country:  ['All', 'Egypt', 'Belgium', 'Germany', 'India', 'USA', 'China', 'France', 'UK'],
};

const MOCK_DOCUMENTS = [
  { id: 1, name: 'Import License.pdf',          type: 'PDF',  size: '1.8 MB', date: '2024-03-12', url: null },
  { id: 2, name: 'Customs Declaration.pdf',     type: 'PDF',  size: '0.9 MB', date: '2024-03-10', url: null },
  { id: 3, name: 'Certificate of Origin.pdf',   type: 'PDF',  size: '2.1 MB', date: '2024-02-28', url: null },
  { id: 4, name: 'Shipment Manifest.xlsx',      type: 'XLSX', size: '1.2 MB', date: '2024-03-08', url: null },
];

// ─── Mock data (swap with API) ─────────────────────────────────────────────────
const MOCK_ALERTS = [
  { id: 'ALT-001', shipmentId: 'IMP-0567', type: 'Missing Clearance Document', severity: 'High',     status: 'Open'         },
  { id: 'ALT-002', shipmentId: 'IMP-0566', type: 'Delayed Customs Inspection',  severity: 'Medium',   status: 'Under Review' },
  { id: 'ALT-003', shipmentId: 'IMP-0565', type: 'Unassigned Shipment',         severity: 'High',     status: 'Open'         },
  { id: 'ALT-004', shipmentId: 'IMP-0564', type: 'Storage Temperature Violation',severity: 'Critical', status: 'Open'         },
  { id: 'ALT-005', shipmentId: 'IMP-0563', type: 'Delayed Distribution',        severity: 'Medium',   status: 'Monitoring'   },
  { id: 'ALT-006', shipmentId: 'IMP-0562', type: 'Missing Shipment Label',      severity: 'Low',      status: 'Resolved'     },
];

// ─── Small UI Atoms ───────────────────────────────────────────────────────────

const SeverityBadge = ({ severity }) => {
  const s = SEVERITY_COLORS[severity] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color }}>
      {severity}
    </span>
  );
};

const StatusPill = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
  <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #F0F0F0', flex: 1 }}>
    <div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{sub}</div>
    </div>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={iconColor} />
    </div>
  </div>
);

// ─── Filter Dropdown ──────────────────────────────────────────────────────────

const FilterDropdown = ({ activeFilters, onApply, onClear }) => {
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

  const hasActive  = Object.values(activeFilters).some(v => v && v !== 'All');
  const activeCount = Object.values(activeFilters).filter(v => v && v !== 'All').length;

  const handleApply = () => { onApply(local); setOpen(false); };
  const handleClear = () => { const r = { status: 'All', severity: 'All', country: 'All' }; setLocal(r); onClear(r); setOpen(false); };

  const selectStyle = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none' };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, border: hasActive ? '1.5px solid #004399' : '1px solid #E5E7EB', background: hasActive ? '#EFF6FF' : '#fff', fontSize: 13, color: hasActive ? '#004399' : '#374151', cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s' }}
      >
        <Filter size={13} />
        Filters
        {activeCount > 0 && (
          <span style={{ background: '#004399', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '1px 7px' }}>{activeCount}</span>
        )}
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 12px 32px rgba(0,0,0,0.13)', zIndex: 200, width: 280, padding: 16, animation: 'fadeSlideIn 0.15s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Filter by</span>
            {hasActive && (
              <button onClick={handleClear} style={{ fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                <X size={11} /> Clear all
              </button>
            )}
          </div>
          {[{ key: 'status', label: 'Status' }, { key: 'severity', label: 'Severity' }, { key: 'country', label: 'Country' }].map(({ key, label }) => (
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
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ─── Row Menu ─────────────────────────────────────────────────────────────────

const RowMenu = ({ row, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const items = [
    { label: 'View Details', icon: Eye,    color: '#374151', action: () => { onView(row);   setOpen(false); } },
    { label: 'Edit',         icon: Edit,   color: '#374151', action: () => { onEdit(row);   setOpen(false); } },
    { label: 'Delete',       icon: Trash2, color: '#EF4444', action: () => { onDelete(row); setOpen(false); } },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(p => !p); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: open ? '#004399' : '#9CA3AF', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}>
        <MoreVertical size={16} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 160, overflow: 'hidden', animation: 'fadeSlideIn 0.15s ease' }}>
          {items.map(({ label, icon: Icon, color, action }, i) => (
            <button key={label} onClick={action}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', border: 'none', borderTop: i === 2 ? '1px solid #F3F4F6' : 'none', background: 'none', fontSize: 13, color, cursor: 'pointer', textAlign: 'left' }}
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

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const EditModal = ({ item, onClose, onSave }) => {
  const [form, setForm]     = useState({ ...item });
  const [saving, setSaving] = useState(false);

  const fields = [
    { key: 'shipmentId', label: 'Shipment ID',      type: 'text'   },
    { key: 'type',       label: 'Type',              type: 'text'   },
    { key: 'severity',   label: 'Severity',          type: 'select', options: ['Critical','High','Medium','Low'] },
    { key: 'country',    label: 'Country of Origin', type: 'text'   },
    { key: 'status',     label: 'Status',            type: 'select', options: ['Open','Under Review','Monitoring','Resolved','Approved','Rejected','Pending','Cleared'] },
  ];

  const fieldStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', background: '#fff', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.15s' };

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.50)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: 520, background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)', animation: 'fadeSlideIn 0.18s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #F0F0F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Edit size={16} color="#004399" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Edit Record</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>ID: {item.id}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            <X size={15} />
          </button>
        </div>
        {/* Form */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '55vh', overflowY: 'auto' }}>
          {fields.map(({ key, label, type, options }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
              {type === 'select' ? (
                <div style={{ position: 'relative' }}>
                  <select value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    style={{ ...fieldStyle, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = '#004399'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                </div>
              ) : (
                <input type="text" value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = '#004399'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
              )}
            </div>
          ))}
        </div>
        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, padding: '14px 20px', borderTop: '1px solid #F0F0F0' }}>
          <button onClick={onClose} style={{ flex: 1, padding: 9, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 2, padding: 9, borderRadius: 8, border: 'none', background: saving ? '#93C5FD' : '#004399', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {saving ? 'Saving…' : <><Check size={14} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ImportOperations = () => {
  const { setPageTitle, setBreadcrumbs } = useUIStore();
  const { success, error: showError }    = useNotificationStore();

  const [activeTab, setActiveTab]             = useState('alerts');
  const [reviewOpen, setReviewOpen]           = useState(false);
  const [reviewItem, setReviewItem]           = useState(null);
  const [drawerOpen, setDrawerOpen]           = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen]     = useState(false);
  const [isHover, setIsHover]                 = useState(false);
  const [isRefreshing, setIsRefreshing]       = useState(false);

  const [loading, setLoading]       = useState(false);
  const [items, setItems]           = useState(MOCK_ALERTS);
  const [stats, setStats]           = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: MOCK_ALERTS.length });
  const [activeFilters, setActiveFilters] = useState({ status: 'All', severity: 'All', country: 'All' });

  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [checkedRows, setCheckedRows]   = useState({});
  const [allChecked, setAllChecked]     = useState(false);

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    setPageTitle('Import Operations');
    setBreadcrumbs(['Home', 'Import Operations']);
  }, [setPageTitle, setBreadcrumbs]);

  useEffect(() => {
    fetchData();
  }, [activeTab, activeFilters, pagination.page]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Data (TODO: replace with importApi calls) ──────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: const res = await importApi.getItems({ tab: activeTab, ...activeFilters, page: pagination.page });
      // Filtering mock data locally until API is ready
      let filtered = MOCK_ALERTS.filter(row => {
        const matchStatus   = activeFilters.status   === 'All' || row.status   === activeFilters.status;
        const matchSeverity = activeFilters.severity === 'All' || row.severity === activeFilters.severity;
        return matchStatus && matchSeverity;
      });
      setItems(filtered);
      setPagination(p => ({ ...p, total: filtered.length }));
    } catch (err) {
      showError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, activeFilters, pagination.page, showError]);

  const fetchStats = useCallback(async () => {
    try {
      // TODO: const res = await importApi.getStats(); setStats(res.data);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleExport = () => {
    try {
      const checkedIds    = Object.keys(checkedRows).filter(id => checkedRows[id]);
      const dataToExport  = checkedIds.length > 0 ? items.filter(r => checkedIds.includes(String(r.id))) : items;
      if (!dataToExport.length) { showError('No data to export'); return; }
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ImportOps');
      XLSX.writeFile(wb, 'import_operations_export.xlsx');
      success('Report exported successfully');
    } catch (err) { console.error(err); showError('Export failed'); }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
    fetchStats();
    setCheckedRows({});
    setAllChecked(false);
    setTimeout(() => {
      setIsRefreshing(false);
      success('Data refreshed');
    }, 600);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      // TODO: await importApi.deleteItem(itemToDelete.id);
      setItems(prev => prev.filter(r => r.id !== itemToDelete.id));
      success('Record deleted successfully');
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) { showError(err.message || 'Failed to delete'); }
  };

  const handleSaveEdit = async (updated) => {
    try {
      // TODO: await importApi.updateItem(updated.id, updated);
      setItems(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r));
      success('Record updated successfully');
    } catch (err) { showError(err.message || 'Failed to update'); throw err; }
  };

  const handleViewDetails  = (item) => { setSelectedItem(item); setDrawerOpen(true); };
  const handleEditItem     = (item) => { setSelectedItem(item); setEditModalOpen(true); };
  const handleDeletePrompt = (item) => { setItemToDelete(item); setDeleteModalOpen(true); };
  const handleReviewItem   = (item) => { setReviewItem(item); setReviewOpen(true); };

  const handleApplyFilters = (f) => { setActiveFilters(f); setPagination(p => ({ ...p, page: 1 })); };
  const handleClearFilters = (f) => { setActiveFilters(f); setPagination(p => ({ ...p, page: 1 })); };

  const handleReviewAction = (actionType, item) => {
    if (!item) return;
    const statusByAction = {
      approve:    'Approved',
      reject:     'Rejected',
      inspection: 'Under Review',
    };
    const messageByAction = {
      approve:    `${item.id} request approved`,
      reject:     `${item.id} request rejected`,
      inspection: `Inspection requested for ${item.id}`,
    };
    const nextStatus = statusByAction[actionType];
    if (nextStatus) {
      setItems(prev => prev.map(r => r.id === item.id ? { ...r, status: nextStatus } : r));
    }
    if (actionType === 'reject') showError(messageByAction[actionType] || 'Request rejected');
    else success(messageByAction[actionType] || 'Action completed');
  };

  const toggleAll = () => {
    if (allChecked) { setCheckedRows({}); setAllChecked(false); }
    else { const all = {}; items.forEach(r => { all[r.id] = true; }); setCheckedRows(all); setAllChecked(true); }
  };
  const toggleRow       = (id) => setCheckedRows(p => ({ ...p, [id]: !p[id] }));
  const handleTabChange = (key) => { setActiveTab(key); setCheckedRows({}); setAllChecked(false); };

  // ── Derived ────────────────────────────────────────────────────────────────

  const checkedCount    = Object.values(checkedRows).filter(Boolean).length;
  const currentTabLabel = TABS.find(t => t.key === activeTab)?.label ?? '';

  // Alerts tab uses 5 cols; others use 6
  const isAlerts = activeTab === 'alerts';
  const colLabels = isAlerts ? ALERTS_COL_LABELS : (COL_LABELS[activeTab] || COL_LABELS.requests);

  const baseBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.25s ease' };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fadeIn">

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'SF Pro, sans-serif', fontSize: 48, fontWeight: 590, lineHeight: '57px', textShadow: '0px 5px 4px rgba(0,0,0,0.3)' }}>
            <span style={{ color: '#004399' }}>Imported </span>
            <span style={{ color: '#111827' }}>Medicines</span>
          </h2>
          <p style={{ marginTop: 10, marginBottom: 0, fontSize: 15, fontWeight: 400, color: '#9CA3AF' }}>
            Monitor imported pharmaceutical shipments, customs clearance, and distribution oversight across Egypt
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {/* Refresh Button (replaces the old global Review Import Request button) */}
          <button onClick={handleRefresh} disabled={isRefreshing}
            style={{ ...baseBtn, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', opacity: isRefreshing ? 0.75 : 1, cursor: isRefreshing ? 'not-allowed' : 'pointer' }}>
            <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button onClick={handleExport}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            style={{ ...baseBtn, border: 'none', background: 'linear-gradient(90deg, #004399 21%, #9EBEF1 92%)', color: '#fff', boxShadow: isHover ? '0 6px 18px rgba(0,67,153,0.35)' : '0 2px 6px rgba(0,0,0,0.08)', transform: isHover ? 'translateY(-1px)' : 'none' }}>
            <Download size={14} />
            {checkedCount > 0 ? `Export (${checkedCount})` : 'Generate Import Report'}
          </button>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Customs Clearance Reviews" value={stats?.clearance ?? '18'} sub="Under customs verification" icon={ClipboardCheck} iconBg="#EFF6FF" iconColor="#3B82F6" />
        <StatCard label="Pending Requests"          value={stats?.pending   ?? '42'} sub="Awaiting ministry approval"  icon={RefreshCw}     iconBg="#FEF9C3" iconColor="#EAB308" />
        <StatCard label="Approved Shipments"        value={stats?.approved  ?? '326'} sub="Cleared for distribution"  icon={Ship}          iconBg="#F0FDF4" iconColor="#22C55E" />
        <StatCard label="Delayed Shipments"         value={stats?.delayed   ?? '23'} sub="Require immediate follow-up" icon={ShieldAlert}   iconBg="#FEF2F2" iconColor="#EF4444" />
      </div>

      {/* ── Main Table Card ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', padding: '0 4px' }}>
          {TABS.map(tab => {
            const Icon   = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 16px', border: 'none', borderBottom: active ? '2px solid #3B82F6' : '2px solid transparent', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#1D4ED8' : '#6B7280', whiteSpace: 'nowrap', transition: 'all 0.15s', marginBottom: -1 }}>
                <Icon size={15} />
                {tab.label}
                {tab.badge != null && (
                  <span style={{ background: active ? '#DBEAFE' : '#F3F4F6', color: active ? '#1D4ED8' : '#6B7280', borderRadius: 20, fontSize: 11, fontWeight: 600, padding: '1px 7px' }}>{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 12px' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{currentTabLabel}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <FilterDropdown activeFilters={activeFilters} onApply={handleApplyFilters} onClear={handleClearFilters} />
            <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
                <th style={{ padding: '10px 20px', width: 40, textAlign: 'left' }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: 'pointer' }} />
                </th>
                {colLabels.map(lbl => (
                  <th key={lbl} style={{ padding: '10px 12px', textAlign: 'left', color: '#6B7280', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }}>{lbl}</th>
                ))}
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6B7280', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }}>Review</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={colLabels.length + 3} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={colLabels.length + 3} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No records found</td></tr>
              ) : (
                items.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F3F4F6', background: checkedRows[row.id] ? '#F0F7FF' : '#fff', transition: 'background 0.1s' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <input type="checkbox" checked={!!checkedRows[row.id]} onChange={() => toggleRow(row.id)} style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '12px 12px', color: '#1D4ED8', fontWeight: 500 }}>{row.id}</td>
                    <td style={{ padding: '12px 12px', color: '#374151' }}>{row.shipmentId}</td>
                    <td style={{ padding: '12px 12px', color: '#374151' }}>{row.type}</td>
                    <td style={{ padding: '12px 12px' }}><SeverityBadge severity={row.severity} /></td>
                    {!isAlerts && <td style={{ padding: '12px 12px', color: '#374151' }}>{row.country}</td>}
                    <td style={{ padding: '12px 12px' }}><StatusPill status={row.status} /></td>
                    <td style={{ padding: '12px 12px' }}>
                      <button
                        onClick={() => handleReviewItem(row)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #004399', background: '#EFF6FF', color: '#004399', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <ClipboardCheck size={13} />
                        Review
                      </button>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <RowMenu row={row} onView={handleViewDetails} onEdit={handleEditItem} onDelete={handleDeletePrompt} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.total > pagination.limit && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: 12, color: '#9CA3AF' }}>
            Showing {items.length} of {pagination.total} records
          </div>
        )}
      </div>

      {/* ── Details Drawer ── */}
      <Drawer isOpen={drawerOpen} onClose={() => { setDrawerOpen(false); setSelectedItem(null); }} title="Shipment Details" size="md">
        {selectedItem && (
          <div style={{ padding: 'var(--spacing-md)' }}>
            {[['ID', selectedItem.id], ['Shipment ID', selectedItem.shipmentId], ['Type', selectedItem.type], ['Country', selectedItem.country]].map(([lbl, val]) => val && (
              <div key={lbl} style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{lbl}</label>
                <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)', marginTop: 4 }}>{val}</div>
              </div>
            ))}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Severity</label>
              <div style={{ marginTop: 6 }}><SeverityBadge severity={selectedItem.severity} /></div>
            </div>
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</label>
              <div style={{ marginTop: 6 }}><StatusBadge status={selectedItem.status} /></div>
            </div>
          </div>
        )}
      </Drawer>

      {/* ── Delete Modal ── */}
      <Modal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }} title="Confirm Deletion" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          Are you sure you want to delete <strong>{itemToDelete?.id}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
          <Button variant="secondary" onClick={() => { setDeleteModalOpen(false); setItemToDelete(null); }}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      {/* ── Edit Modal ── */}
      {editModalOpen && selectedItem && (
        <EditModal item={selectedItem} onClose={() => { setEditModalOpen(false); setSelectedItem(null); }} onSave={handleSaveEdit} />
      )}

      {/* ── Review Modal (shared component, same one used on other pages) ── */}
      <ReviewRequestModal
        open={reviewOpen}
        item={reviewItem}
        onClose={() => { setReviewOpen(false); setReviewItem(null); }}
        showError={showError}
        onAction={handleReviewAction}
        entityLabel="Import Shipment"
        headerTitle={`${reviewItem?.id || ''} — Import Operations Request`}
        requestFields={[
          ['Request Title',      'Pharmaceutical Import Approval'],
          ['Record ID',          reviewItem?.id],
          ['Shipment ID',        reviewItem?.shipmentId],
          ['Alert / Request Type', reviewItem?.type],
          ['Severity',            reviewItem?.severity],
          ['Country of Origin',   reviewItem?.country],
          ['Status',              reviewItem?.status],
        ]}
        documents={MOCK_DOCUMENTS}
      />
    </div>
  );
};

export default ImportOperations;