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
  Warehouse,
  Clock,
  Search,
  Bell,
} from 'lucide-react';
import * as XLSX from 'xlsx';

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_COLORS = {
  Critical: { bg: '#FEE2E2', color: '#DC2626' },
  High:     { bg: '#FEF3C7', color: '#D97706' },
  Medium:   { bg: '#DBEAFE', color: '#2563EB' },
  Low:      { bg: '#D1FAE5', color: '#059669' },
};

const CLEARANCE_COLORS = {
  'Approved':          { bg: '#D1FAE5', color: '#059669' },
  'Pending':           { bg: '#FEF3C7', color: '#B45309' },
  'Under Inspection':  { bg: '#DBEAFE', color: '#1D4ED8' },
  'Rejected':          { bg: '#FEE2E2', color: '#DC2626' },
};

const STORAGE_COLORS = {
  'Stored':           { bg: '#D1FAE5', color: '#059669' },
  'Under Inspection': { bg: '#DBEAFE', color: '#1D4ED8' },
  'In Transit':       { bg: '#FEF3C7', color: '#B45309' },
  'Awaiting Storage': { bg: '#F3F4F6', color: '#374151' },
};

const FILTER_OPTIONS = {
  clearanceStatus: ['All', 'Approved', 'Pending', 'Under Inspection', 'Rejected'],
  storageStatus:   ['All', 'Stored', 'Under Inspection', 'In Transit', 'Awaiting Storage'],
  country:         ['All', 'Switzerland', 'Belgium', 'Germany', 'France', 'UK', 'Egypt', 'USA'],
};

const MOCK_SHIPMENTS = [
  { id: 'IMP-0567', importedBy: 'Novartis Egypt',  country: 'Switzerland', warehouse: 'Cairo Central Warehouse',    governorate: 'Cairo',      countryOrigin: 'Switzerland', arrivalDate: '2024-05-15', clearanceStatus: 'Approved',  lastUpdated: '2 hours ago',  storageStatus: 'Stored'           },
  { id: 'IMP-0566', importedBy: 'Pfizer Egypt',    country: 'Belgium',     warehouse: 'Alexandria Storage Hub',     governorate: 'Alexandria', countryOrigin: 'Belgium',     arrivalDate: '2024-05-14', clearanceStatus: 'Pending',   lastUpdated: '1 day ago',    storageStatus: 'Under Inspection' },
  { id: 'IMP-0565', importedBy: 'Bayer AG',        country: 'Germany',     warehouse: 'Delta Medical Storage',      governorate: 'Mansoura',   countryOrigin: 'Germany',     arrivalDate: '2024-05-13', clearanceStatus: 'Approved',  lastUpdated: '5 hours ago',  storageStatus: 'In Transit'       },
  { id: 'IMP-0564', importedBy: 'Sanofi Egypt',    country: 'France',      warehouse: 'Upper Egypt Storage Hub',    governorate: 'Assiut',     countryOrigin: 'France',      arrivalDate: '2024-05-13', clearanceStatus: 'Pending',   lastUpdated: '2 hours ago',  storageStatus: 'Stored'           },
  { id: 'IMP-0563', importedBy: 'GSK Egypt',       country: 'UK',          warehouse: 'Giza Distribution Center',   governorate: 'Giza',       countryOrigin: 'UK',          arrivalDate: '2024-05-12', clearanceStatus: 'Approved',  lastUpdated: '1 day ago',    storageStatus: 'Awaiting Storage' },
  { id: 'IMP-0562', importedBy: 'GSK Egypt',       country: 'UK',          warehouse: 'Giza Distribution Center',   governorate: 'Giza',       countryOrigin: 'UK',          arrivalDate: '2024-05-12', clearanceStatus: 'Approved',  lastUpdated: '2 days ago',   storageStatus: 'Stored'           },
];

const MOCK_DOCUMENTS = [
  { id: 1, name: 'Warehouse License.pdf',        type: 'PDF',  size: '1.8 MB', date: '2024-03-12', url: null },
  { id: 2, name: 'Storage Inspection Report.pdf',type: 'PDF',  size: '0.9 MB', date: '2024-03-10', url: null },
  { id: 3, name: 'Facility Certificate.pdf',     type: 'PDF',  size: '2.1 MB', date: '2024-02-28', url: null },
  { id: 4, name: 'Capacity Report.xlsx',         type: 'XLSX', size: '1.2 MB', date: '2024-03-08', url: null },
];

const REVIEW_TABS = ['Request Information', 'Documents'];

// ─── Small UI Atoms ───────────────────────────────────────────────────────────

const ClearanceBadge = ({ status }) => {
  const s = CLEARANCE_COLORS[status] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

const StorageBadge = ({ status }) => {
  const s = STORAGE_COLORS[status] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, trend }) => (
  <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #F0F0F0', flex: 1 }}>
    <div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</div>
      {trend && (
        <div style={{ fontSize: 11, color: trend.up ? '#22C55E' : '#EF4444', marginTop: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
          <span>{trend.up ? '↑' : '↓'} {trend.value}</span>
          <span style={{ color: '#9CA3AF' }}>from last month</span>
        </div>
      )}
    </div>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={iconColor} />
    </div>
  </div>
);

const DocTypeIcon = ({ type }) => {
  const isPdf = type === 'PDF';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: isPdf ? '#FEE2E2' : '#D1FAE5', color: isPdf ? '#DC2626' : '#059669', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
      {type}
    </span>
  );
};

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

  const hasActive   = Object.values(activeFilters).some(v => v && v !== 'All');
  const activeCount = Object.values(activeFilters).filter(v => v && v !== 'All').length;

  const handleApply = () => { onApply(local); setOpen(false); };
  const handleClear = () => { const r = { clearanceStatus: 'All', storageStatus: 'All', country: 'All' }; setLocal(r); onClear(r); setOpen(false); };

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
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 12px 32px rgba(0,0,0,0.13)', zIndex: 200, width: 280, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Filter by</span>
            {hasActive && (
              <button onClick={handleClear} style={{ fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                <X size={11} /> Clear all
              </button>
            )}
          </div>
          {[
            { key: 'clearanceStatus', label: 'Clearance Status' },
            { key: 'storageStatus',   label: 'Storage Status' },
            { key: 'country',         label: 'Country' },
          ].map(({ key, label }) => (
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

const RowMenu = ({ row, onView, onDelete }) => {
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
    { label: 'Delete',       icon: Trash2, color: '#EF4444', action: () => { onDelete(row); setOpen(false); } },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(p => !p); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: open ? '#004399' : '#9CA3AF', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}>
        <MoreVertical size={16} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 160, overflow: 'hidden' }}>
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

// ─── Review Modal (Warehouse Monitoring Request) ───────────────────────────────
// Now bound to a specific row: shows that shipment's own info & lets the reviewer
// approve / reject / request inspection for THAT item.

const ReviewModal = ({ item, onClose, showError, onAction }) => {
  const [activeSection, setActiveSection] = useState('Request Information');

  const fieldStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #E5E7EB',
    fontSize: 13, color: '#374151', background: '#fff', boxSizing: 'border-box', outline: 'none',
  };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 };

  const handleViewDoc = (doc) => {
    if (!doc.url) { showError?.('Document not available yet'); return; }
    window.open(doc.url, '_blank');
  };
  const handleDownloadDoc = (doc) => {
    if (!doc.url) { showError?.('Document not available for download yet'); return; }
    const a = document.createElement('a'); a.href = doc.url; a.download = doc.name; a.click();
  };

  const requestFields = [
    ['Request Title',     'Warehouse Registration Request'],
    ['Shipment ID',       item?.id],
    ['Imported By',       item?.importedBy],
    ['Assigned Warehouse',item?.warehouse],
    ['Governorate',       item?.governorate],
    ['Country of Origin', item?.countryOrigin],
    ['Arrival Date',      item?.arrivalDate],
    ['Clearance Status',  item?.clearanceStatus],
    ['Storage Status',    item?.storageStatus],
  ];

  const handleAction = (type) => { onAction?.(type, item); onClose(); };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, paddingTop: 40 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '92vw', maxWidth: 460, background: '#fff', borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.25)', maxHeight: '90vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 20px 14px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>
              Shipment {item?.id || ''} — Warehouse Monitoring Request
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>Request Information</div>
          </div>
          {/* Egypt Logo Placeholder */}
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #DC2626, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: 18 }}>🏛</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', padding: '0 20px' }}>
          {REVIEW_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveSection(tab)}
              style={{ padding: '10px 14px', border: 'none', borderBottom: activeSection === tab ? '2px solid #004399' : '2px solid transparent', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: activeSection === tab ? 600 : 400, color: activeSection === tab ? '#004399' : '#6B7280', marginBottom: -1 }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {activeSection === 'Request Information' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {requestFields.map(([lbl, val]) => (
                <div key={lbl}>
                  <label style={labelStyle}>{lbl}</label>
                  <input defaultValue={val || ''} style={fieldStyle} readOnly />
                </div>
              ))}
            </div>
          )}

          {activeSection === 'Documents' && (
            <div>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>{MOCK_DOCUMENTS.length} documents attached to this request</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {MOCK_DOCUMENTS.map(doc => (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#FAFAFA' }}>
                    <DocTypeIcon type={doc.type} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{doc.size} · {doc.date}</div>
                    </div>
                    <button onClick={() => handleViewDoc(doc)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                      <Eye size={12} /> View
                    </button>
                    <button onClick={() => handleDownloadDoc(doc)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                      <Download size={12} /> Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, padding: '14px 20px', borderTop: '1px solid #F0F0F0' }}>
          <button onClick={() => handleAction('reject')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#EF4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
          <button onClick={() => handleAction('approve')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#1D4ED8', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Approve</button>
          <button onClick={() => handleAction('inspection')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#F59E0B', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Request Inspection</button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

const DeleteModal = ({ item, onClose, onConfirm }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.50)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: 400, background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)', padding: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 10 }}>Confirm Deletion</div>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 20 }}>
        Are you sure you want to delete <strong>{item?.id}</strong>? This action cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
        <button onClick={onConfirm} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
      </div>
    </div>
  </div>
);

// ─── Details Drawer ───────────────────────────────────────────────────────────

const DetailsDrawer = ({ item, onClose }) => {
  if (!item) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 380, background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', padding: 24, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Shipment Details</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            <X size={15} />
          </button>
        </div>
        {[
          ['Shipment ID',        item.id],
          ['Imported By',        item.importedBy],
          ['Country of Origin',  item.country],
          ['Assigned Warehouse', item.warehouse],
          ['Governorate',        item.governorate],
          ['Arrival Date',       item.arrivalDate],
          ['Last Updated',       item.lastUpdated],
        ].map(([lbl, val]) => val && (
          <div key={lbl} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>{lbl}</div>
            <div style={{ fontSize: 14, color: '#111827' }}>{val}</div>
          </div>
        ))}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Clearance Status</div>
          <ClearanceBadge status={item.clearanceStatus} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Storage Status</div>
          <StorageBadge status={item.storageStatus} />
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

const WarehouseDashboard = () => {
  const [activeSubTab, setActiveSubTab]       = useState('shipments'); // 'requests' | 'shipments'
  const [reviewOpen, setReviewOpen]           = useState(false);
  const [reviewItem, setReviewItem]           = useState(null);
  const [drawerOpen, setDrawerOpen]           = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isHover, setIsHover]                 = useState(false);
  const [isRefreshing, setIsRefreshing]       = useState(false);

  const [items, setItems]               = useState(MOCK_SHIPMENTS);
  const [activeFilters, setActiveFilters] = useState({ clearanceStatus: 'All', storageStatus: 'All', country: 'All' });

  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [checkedRows, setCheckedRows]   = useState({});
  const [allChecked, setAllChecked]     = useState(false);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const showError = (msg) => showToast(msg, 'error');

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = items.filter(row => {
    const matchCS = activeFilters.clearanceStatus === 'All' || row.clearanceStatus === activeFilters.clearanceStatus;
    const matchSS = activeFilters.storageStatus   === 'All' || row.storageStatus   === activeFilters.storageStatus;
    const matchC  = activeFilters.country         === 'All' || row.country         === activeFilters.country;
    return matchCS && matchSS && matchC;
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleExport = () => {
    try {
      const checkedIds   = Object.keys(checkedRows).filter(id => checkedRows[id]);
      const dataToExport = checkedIds.length > 0 ? filtered.filter(r => checkedIds.includes(String(r.id))) : filtered;
      if (!dataToExport.length) { showError('No data to export'); return; }
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Warehouse');
      XLSX.writeFile(wb, 'warehouse_shipments_export.xlsx');
      showToast('Report exported successfully');
    } catch (err) { showError('Export failed'); }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Placeholder for a real refetch — swap for an API call when wired up
    setTimeout(() => {
      setItems(MOCK_SHIPMENTS);
      setActiveFilters({ clearanceStatus: 'All', storageStatus: 'All', country: 'All' });
      setCheckedRows({});
      setAllChecked(false);
      setIsRefreshing(false);
      showToast('Data refreshed');
    }, 600);
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    setItems(prev => prev.filter(r => r.id !== itemToDelete.id));
    showToast('Record deleted successfully');
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleViewDetails  = (item) => { setSelectedItem(item); setDrawerOpen(true); };
  const handleDeletePrompt = (item) => { setItemToDelete(item); setDeleteModalOpen(true); };
  const handleReviewItem   = (item) => { setReviewItem(item); setReviewOpen(true); };

  const handleReviewAction = (actionType, item) => {
    if (!item) return;
    const statusByAction = {
      approve:    'Approved',
      reject:     'Rejected',
      inspection: 'Under Inspection',
    };
    const messageByAction = {
      approve:    `${item.id} request approved`,
      reject:     `${item.id} request rejected`,
      inspection: `Inspection requested for ${item.id}`,
    };
    const nextStatus = statusByAction[actionType];
    if (nextStatus) {
      setItems(prev => prev.map(r => r.id === item.id ? { ...r, clearanceStatus: nextStatus, lastUpdated: 'Just now' } : r));
    }
    if (actionType === 'reject') showToast(messageByAction[actionType] || 'Request rejected', 'error');
    else showToast(messageByAction[actionType] || 'Action completed');
  };

  const handleApplyFilters = (f) => setActiveFilters(f);
  const handleClearFilters = (f) => setActiveFilters(f);

  const toggleAll = () => {
    if (allChecked) { setCheckedRows({}); setAllChecked(false); }
    else { const all = {}; filtered.forEach(r => { all[r.id] = true; }); setCheckedRows(all); setAllChecked(true); }
  };
  const toggleRow = (id) => setCheckedRows(p => ({ ...p, [id]: !p[id] }));

  const checkedCount = Object.values(checkedRows).filter(Boolean).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: 'Inter, SF Pro, -apple-system, sans-serif', padding: '24px 28px', boxSizing: 'border-box' }}>

        {/* ── Page Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 44, fontWeight: 700, lineHeight: 1.15 }}>
              <span style={{ color: '#004399' }}>Warehouse </span>
              <span style={{ color: '#111827' }}>Dashboard</span>
            </h1>
            <p style={{ marginTop: 10, marginBottom: 0, fontSize: 15, fontWeight: 400, color: '#9CA3AF' }}>
              Monitor and manage warehouse inventory and stock levels
            </p>
          </div>

          {/* Refresh Button — replaces the old global Review Request button.
              Reviewing now happens per-row from the table itself. */}
          <button
            onClick={handleRefresh}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            disabled={isRefreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #004399, #1D6FDB)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: isRefreshing ? 'not-allowed' : 'pointer', opacity: isRefreshing ? 0.8 : 1, boxShadow: isHover ? '0 6px 18px rgba(0,67,153,0.35)' : '0 2px 8px rgba(0,0,0,0.12)', transform: isHover ? 'translateY(-1px)' : 'none', transition: 'all 0.2s' }}>
            <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* ── 4 Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard
            label="Registered Warehouse"
            value="8,642"
            trend={{ up: true, value: '12.5%' }}
            icon={Warehouse}
            iconBg="#EFF6FF"
            iconColor="#3B82F6"
          />
          <StatCard
            label="Pending Requests"
            value="3"
            trend={{ up: true, value: '8.3' }}
            icon={Clock}
            iconBg="#FEF9C3"
            iconColor="#EAB308"
          />
          <StatCard
            label="Under Inspection"
            value="5"
            trend={{ up: true, value: '18%' }}
            icon={Search}
            iconBg="#F5F3FF"
            iconColor="#8B5CF6"
          />
          <StatCard
            label="Capacity Alerts"
            value="5"
            trend={{ up: false, value: '4.1%' }}
            icon={Bell}
            iconBg="#FEF2F2"
            iconColor="#EF4444"
          />
        </div>

        {/* ── Main Table Card ── */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

          {/* Sub tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', padding: '0 8px', gap: 4 }}>
            {/* Review Request tab with badge */}
            <button
              onClick={() => setActiveSubTab('requests')}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '14px 16px', border: 'none', borderBottom: activeSubTab === 'requests' ? '2px solid #3B82F6' : '2px solid transparent', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: activeSubTab === 'requests' ? 600 : 400, color: activeSubTab === 'requests' ? '#1D4ED8' : '#6B7280', whiteSpace: 'nowrap', marginBottom: -1 }}>
              <ClipboardCheck size={15} />
              Review Request
              <span style={{ background: '#EF4444', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '2px 7px', minWidth: 20, textAlign: 'center' }}>35</span>
            </button>

            {/* Imported Shipment Storage Monitoring tab */}
            <button
              onClick={() => setActiveSubTab('shipments')}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '14px 16px', border: 'none', borderBottom: activeSubTab === 'shipments' ? '2px solid #3B82F6' : '2px solid transparent', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: activeSubTab === 'shipments' ? 600 : 400, color: activeSubTab === 'shipments' ? '#1D4ED8' : '#6B7280', whiteSpace: 'nowrap', marginBottom: -1 }}>
              <Package size={15} />
              Imported Shipment Storage Monitoring
            </button>
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 12px' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
              {activeSubTab === 'shipments' ? 'Imported Shipment Storage Monitoring' : 'Review Requests'}
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <FilterDropdown activeFilters={activeFilters} onApply={handleApplyFilters} onClear={handleClearFilters} />
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
                  {['Shipment ID', 'Imported By', 'Country of Origin', 'Assigned Warehouse', 'Governorate', 'Country of Origin', 'Arrival Date', 'Clearance Status', 'Last Updated', 'Storage Status'].map(lbl => (
                    <th key={lbl} style={{ padding: '10px 10px', textAlign: 'left', color: '#6B7280', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }}>{lbl}</th>
                  ))}
                  <th style={{ padding: '10px 10px', textAlign: 'left', color: '#6B7280', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }}>Review</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={13} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No records found</td></tr>
                ) : (
                  filtered.map(row => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #F3F4F6', background: checkedRows[row.id] ? '#F0F7FF' : '#fff' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <input type="checkbox" checked={!!checkedRows[row.id]} onChange={() => toggleRow(row.id)} style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '12px 10px', color: '#1D4ED8', fontWeight: 500 }}>{row.id}</td>
                      <td style={{ padding: '12px 10px', color: '#374151' }}>{row.importedBy}</td>
                      <td style={{ padding: '12px 10px', color: '#374151' }}>{row.country}</td>
                      <td style={{ padding: '12px 10px', color: '#374151' }}>{row.warehouse}</td>
                      <td style={{ padding: '12px 10px', color: '#374151' }}>{row.governorate}</td>
                      <td style={{ padding: '12px 10px', color: '#374151' }}>{row.countryOrigin}</td>
                      <td style={{ padding: '12px 10px', color: '#374151', whiteSpace: 'nowrap' }}>{row.arrivalDate}</td>
                      <td style={{ padding: '12px 10px' }}><ClearanceBadge status={row.clearanceStatus} /></td>
                      <td style={{ padding: '12px 10px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{row.lastUpdated}</td>
                      <td style={{ padding: '12px 10px' }}><StorageBadge status={row.storageStatus} /></td>
                      <td style={{ padding: '12px 10px' }}>
                        <button
                          onClick={() => handleReviewItem(row)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #004399', background: '#EFF6FF', color: '#004399', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          <ClipboardCheck size={13} />
                          Review
                        </button>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <RowMenu row={row} onView={handleViewDetails} onDelete={handleDeletePrompt} />
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

      {/* ── Details Drawer ── */}
      {drawerOpen && <DetailsDrawer item={selectedItem} onClose={() => { setDrawerOpen(false); setSelectedItem(null); }} />}

      {/* ── Delete Modal ── */}
      {deleteModalOpen && <DeleteModal item={itemToDelete} onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }} onConfirm={handleDelete} />}

      {/* ── Review Modal — now opened per-row, scoped to the clicked shipment ── */}
      {reviewOpen && (
        <ReviewModal
          item={reviewItem}
          onClose={() => { setReviewOpen(false); setReviewItem(null); }}
          showError={showError}
          onAction={handleReviewAction}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default WarehouseDashboard;