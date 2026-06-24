
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Filter, Download, Eye, Edit, Trash2, MoreVertical,
  X, Check, ChevronDown, Package, Warehouse, Clock,
  Bell, ClipboardCheck,
} from 'lucide-react';
import { useUIStore, useNotificationStore } from '../../store';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Drawer from '../../components/ui/Drawer';
import * as XLSX from 'xlsx';

const CLEARANCE_COLORS = {
  'Approved':         { bg: '#D1FAE5', color: '#059669' },
  'Pending':          { bg: '#FEF3C7', color: '#B45309' },
  'Under Inspection': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Rejected':         { bg: '#FEE2E2', color: '#DC2626' },
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
  { id: 'IMP-0567', importedBy: 'Novartis Egypt', country: 'Switzerland', warehouse: 'Cairo Central Warehouse',   governorate: 'Cairo',      countryOrigin: 'Switzerland', arrivalDate: '2024-05-15', clearanceStatus: 'Approved', lastUpdated: '2 hours ago', storageStatus: 'Stored'           },
  { id: 'IMP-0566', importedBy: 'Pfizer Egypt',   country: 'Belgium',     warehouse: 'Alexandria Storage Hub',   governorate: 'Alexandria', countryOrigin: 'Belgium',     arrivalDate: '2024-05-14', clearanceStatus: 'Pending',  lastUpdated: '1 day ago',   storageStatus: 'Under Inspection' },
  { id: 'IMP-0565', importedBy: 'Bayer AG',        country: 'Germany',     warehouse: 'Delta Medical Storage',    governorate: 'Mansoura',   countryOrigin: 'Germany',     arrivalDate: '2024-05-13', clearanceStatus: 'Approved', lastUpdated: '5 hours ago', storageStatus: 'In Transit'       },
  { id: 'IMP-0564', importedBy: 'Sanofi Egypt',   country: 'France',      warehouse: 'Upper Egypt Storage Hub',  governorate: 'Assiut',     countryOrigin: 'France',      arrivalDate: '2024-05-13', clearanceStatus: 'Pending',  lastUpdated: '2 hours ago', storageStatus: 'Stored'           },
  { id: 'IMP-0563', importedBy: 'GSK Egypt',       country: 'UK',          warehouse: 'Giza Distribution Center', governorate: 'Giza',      countryOrigin: 'UK',          arrivalDate: '2024-05-12', clearanceStatus: 'Approved', lastUpdated: '1 day ago',   storageStatus: 'Awaiting Storage' },
  { id: 'IMP-0562', importedBy: 'GSK Egypt',       country: 'UK',          warehouse: 'Giza Distribution Center', governorate: 'Giza',      countryOrigin: 'UK',          arrivalDate: '2024-05-12', clearanceStatus: 'Approved', lastUpdated: '2 days ago',  storageStatus: 'Stored'           },
];

const MOCK_DOCUMENTS = [
  { id: 1, name: 'Warehouse License.pdf',         type: 'PDF',  size: '1.8 MB', date: '2024-03-12', url: null },
  { id: 2, name: 'Storage Inspection Report.pdf', type: 'PDF',  size: '0.9 MB', date: '2024-03-10', url: null },
  { id: 3, name: 'Facility Certificate.pdf',      type: 'PDF',  size: '2.1 MB', date: '2024-02-28', url: null },
  { id: 4, name: 'Capacity Report.xlsx',          type: 'XLSX', size: '1.2 MB', date: '2024-03-08', url: null },
];

const TABS = [
  { key: 'requests',  label: 'Review Request',                       icon: ClipboardCheck, badge: 35   },
  { key: 'shipments', label: 'Imported Shipment Storage Monitoring',  icon: Package,        badge: null },
];

const REVIEW_TABS = ['Request Information', 'Documents'];

// ── Atoms ──────────────────────────────────────────────────────────────────────

const ClearanceBadge = ({ status }) => {
  const s = CLEARANCE_COLORS[status] || { bg: '#F3F4F6', color: '#374151' };
  return <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color }}>{status}</span>;
};

const StorageBadge = ({ status }) => {
  const s = STORAGE_COLORS[status] || { bg: '#F3F4F6', color: '#374151' };
  return <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color }}>{status}</span>;
};

const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
  <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #F0F0F0', flex: 1 }}>
    <div>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{sub}</div>
    </div>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={22} color={iconColor} />
    </div>
  </div>
);

const DocTypeIcon = ({ type }) => {
  const isPdf = type === 'PDF';
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: isPdf ? '#FEE2E2' : '#D1FAE5', color: isPdf ? '#DC2626' : '#059669', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{type}</span>;
};

// ── Filter Dropdown ────────────────────────────────────────────────────────────

const FilterDropdown = ({ activeFilters, onApply, onClear }) => {
  const [open, setOpen]   = useState(false);
  const [local, setLocal] = useState(activeFilters);
  const ref               = useRef(null);

  useEffect(() => { setLocal(activeFilters); }, [activeFilters]);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const hasActive   = Object.values(activeFilters).some(v => v && v !== 'All');
  const activeCount = Object.values(activeFilters).filter(v => v && v !== 'All').length;
  const handleApply = () => { onApply(local); setOpen(false); };
  const handleClear = () => { const r = { clearanceStatus: 'All', storageStatus: 'All', country: 'All' }; setLocal(r); onClear(r); setOpen(false); };
  const sel = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none' };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, border: hasActive ? '1.5px solid #004399' : '1px solid #E5E7EB', background: hasActive ? '#EFF6FF' : '#fff', fontSize: 13, color: hasActive ? '#004399' : '#374151', cursor: 'pointer', fontWeight: 500 }}>
        <Filter size={13} /> Filters
        {activeCount > 0 && <span style={{ background: '#004399', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '1px 7px' }}>{activeCount}</span>}
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 12px 32px rgba(0,0,0,0.13)', zIndex: 200, width: 280, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Filter by</span>
            {hasActive && <button onClick={handleClear} style={{ fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}><X size={11} /> Clear all</button>}
          </div>
          {[{ key: 'clearanceStatus', label: 'Clearance Status' }, { key: 'storageStatus', label: 'Storage Status' }, { key: 'country', label: 'Country' }].map(({ key, label }) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <select value={local[key] || 'All'} onChange={e => setLocal(p => ({ ...p, [key]: e.target.value }))} style={sel}>
                  {FILTER_OPTIONS[key].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={() => setOpen(false)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
            <button onClick={handleApply} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#004399', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}><Check size={13} /> Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Row Menu ───────────────────────────────────────────────────────────────────

const RowMenu = ({ row, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const items = [
    { label: 'View Details', icon: Eye,    color: '#374151', action: () => { onView(row);   setOpen(false); } },
    { label: 'Edit',         icon: Edit,   color: '#374151', action: () => { onEdit(row);   setOpen(false); } },
    { label: 'Delete',       icon: Trash2, color: '#EF4444', action: () => { onDelete(row); setOpen(false); } },
  ];
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(p => !p); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: open ? '#004399' : '#9CA3AF', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}>
        <MoreVertical size={16} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 160, overflow: 'hidden' }}>
          {items.map(({ label, icon: Icon, color, action }, i) => (
            <button key={label} onClick={action} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', border: 'none', borderTop: i === 2 ? '1px solid #F3F4F6' : 'none', background: 'none', fontSize: 13, color, cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Review Modal ───────────────────────────────────────────────────────────────

const ReviewModal = ({ onClose, showError }) => {
  const [activeSection, setActiveSection] = useState('Request Information');
  const fieldStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', background: '#F9FAFB', boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 };
  const handleViewDoc     = (doc) => { if (!doc.url) { showError?.('Document not available yet'); return; } window.open(doc.url, '_blank'); };
  const handleDownloadDoc = (doc) => { if (!doc.url) { showError?.('Document not available for download yet'); return; } const a = document.createElement('a'); a.href = doc.url; a.download = doc.name; a.click(); };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, paddingTop: 40 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: 960, height: '88vh', background: '#fff', borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid #F0F0F0' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Warehouse Monitoring Request</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Request Information</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/images/logo.png" alt="logo" style={{ width: 52, height: 52, objectFit: 'contain' }} />
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
          </div>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', padding: '0 20px' }}>
          {REVIEW_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveSection(tab)} style={{ padding: '12px 16px', border: 'none', borderBottom: activeSection === tab ? '2px solid #004399' : '2px solid transparent', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: activeSection === tab ? 600 : 400, color: activeSection === tab ? '#004399' : '#6B7280', marginBottom: -1 }}>{tab}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {activeSection === 'Request Information' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['Request Title','Warehouse Registration Request'],['Company Name','Delta Medical Storage'],['Contact Email','Operations@Deltastorage.Com'],['Request Type','Storage Facility Registration'],['Requested Action','Register New Pharmaceutical Storage Warehouse'],['Warehouse ID','WH-REQ-014'],['Governorate','Mansoura'],['Storage Capacity','18,000 Packages']].map(([lbl, val]) => (
                <div key={lbl}><label style={labelStyle}>{lbl}</label><input defaultValue={val} style={fieldStyle} readOnly /></div>
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
                    <button onClick={() => handleViewDoc(doc)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, color: '#374151', cursor: 'pointer', fontWeight: 500 }}><Eye size={12} /> View</button>
                    <button onClick={() => handleDownloadDoc(doc)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, color: '#374151', cursor: 'pointer', fontWeight: 500 }}><Download size={12} /> Download</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '14px 20px', borderTop: '1px solid #F0F0F0' }}>
          <button onClick={onClose} style={{ flex: 1, padding: 9, borderRadius: 8, border: '2px solid #EF4444', background: '#fff', color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
          <button style={{ flex: 1, padding: 9, borderRadius: 8, border: 'none', background: '#004399', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Review Requests</button>
          <button style={{ flex: 1, padding: 9, borderRadius: 8, border: 'none', background: '#F59E0B', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Request Inspection</button>
        </div>
      </div>
    </div>
  );
};

// ── Edit Modal ─────────────────────────────────────────────────────────────────

const EditModal = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState({ ...item });
  const [saving, setSaving] = useState(false);
  const fields = [
    { key: 'importedBy',      label: 'Imported By',       type: 'text'   },
    { key: 'warehouse',       label: 'Assigned Warehouse', type: 'text'   },
    { key: 'governorate',     label: 'Governorate',        type: 'text'   },
    { key: 'clearanceStatus', label: 'Clearance Status',   type: 'select', options: ['Approved','Pending','Under Inspection','Rejected'] },
    { key: 'storageStatus',   label: 'Storage Status',     type: 'select', options: ['Stored','Under Inspection','In Transit','Awaiting Storage'] },
  ];
  const fs = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', background: '#fff', boxSizing: 'border-box', outline: 'none' };
  const handleSave = async () => { setSaving(true); try { await onSave(form); onClose(); } finally { setSaving(false); } };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.50)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: 520, background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #F0F0F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit size={16} color="#004399" /></div>
            <div><div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Edit Shipment</div><div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>ID: {item.id}</div></div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}><X size={15} /></button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '55vh', overflowY: 'auto' }}>
          {fields.map(({ key, label, type, options }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
              {type === 'select' ? (
                <div style={{ position: 'relative' }}>
                  <select value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ ...fs, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                </div>
              ) : (
                <input type="text" value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={fs} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '14px 20px', borderTop: '1px solid #F0F0F0' }}>
          <button onClick={onClose} style={{ flex: 1, padding: 9, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: 9, borderRadius: 8, border: 'none', background: saving ? '#93C5FD' : '#004399', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {saving ? 'Saving…' : <><Check size={14} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const WarehouseDashboard = () => {
  const { setPageTitle, setBreadcrumbs } = useUIStore();
  const { success, error: showError }    = useNotificationStore();

  const [activeTab, setActiveTab]             = useState('shipments');
  const [reviewOpen, setReviewOpen]           = useState(false);
  const [drawerOpen, setDrawerOpen]           = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen]     = useState(false);
  const [isHover, setIsHover]                 = useState({ review: false, report: false });

  const [loading, setLoading]         = useState(false);
  const [items, setItems]             = useState(MOCK_SHIPMENTS);
  const [stats, setStats]             = useState(null);
  const [activeFilters, setActiveFilters] = useState({ clearanceStatus: 'All', storageStatus: 'All', country: 'All' });

  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [checkedRows, setCheckedRows]   = useState({});
  const [allChecked, setAllChecked]     = useState(false);

  useEffect(() => {
    setPageTitle('Warehouse Dashboard');
    setBreadcrumbs(['Home', 'Warehouse Dashboard']);
  }, [setPageTitle, setBreadcrumbs]);

  const filtered = items.filter(row => {
    const matchCS = activeFilters.clearanceStatus === 'All' || row.clearanceStatus === activeFilters.clearanceStatus;
    const matchSS = activeFilters.storageStatus   === 'All' || row.storageStatus   === activeFilters.storageStatus;
    const matchC  = activeFilters.country         === 'All' || row.country         === activeFilters.country;
    return matchCS && matchSS && matchC;
  });

  const handleExport = () => {
    try {
      const ids = Object.keys(checkedRows).filter(id => checkedRows[id]);
      const data = ids.length > 0 ? filtered.filter(r => ids.includes(String(r.id))) : filtered;
      if (!data.length) { showError('No data to export'); return; }
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Warehouse');
      XLSX.writeFile(wb, 'warehouse_export.xlsx');
      success('Report exported successfully');
    } catch { showError('Export failed'); }
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    setItems(prev => prev.filter(r => r.id !== itemToDelete.id));
    success('Record deleted successfully');
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleSaveEdit    = (u) => { setItems(prev => prev.map(r => r.id === u.id ? { ...r, ...u } : r)); success('Record updated successfully'); };
  const handleViewDetails = (item) => { setSelectedItem(item); setDrawerOpen(true); };
  const handleEditItem    = (item) => { setSelectedItem(item); setEditModalOpen(true); };
  const handleDeletePrompt = (item) => { setItemToDelete(item); setDeleteModalOpen(true); };
  const handleApplyFilters = (f) => setActiveFilters(f);
  const handleClearFilters = (f) => setActiveFilters(f);

  const toggleAll = () => {
    if (allChecked) { setCheckedRows({}); setAllChecked(false); }
    else { const all = {}; filtered.forEach(r => { all[r.id] = true; }); setCheckedRows(all); setAllChecked(true); }
  };
  const toggleRow       = (id) => setCheckedRows(p => ({ ...p, [id]: !p[id] }));
  const handleTabChange = (key) => { setActiveTab(key); setCheckedRows({}); setAllChecked(false); };

  const checkedCount    = Object.values(checkedRows).filter(Boolean).length;
  const currentTabLabel = TABS.find(t => t.key === activeTab)?.label ?? '';

  const baseBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.25s ease' };

  return (
    <div className="animate-fadeIn">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'SF Pro, sans-serif', fontSize: 48, fontWeight: 590, lineHeight: '57px', textShadow: '0px 5px 4px rgba(0,0,0,0.3)' }}>
            <span style={{ color: '#004399' }}>Warehouse </span>
            <span style={{ color: '#111827' }}>Dashboard</span>
          </h2>
          <p style={{ marginTop: 8, marginBottom: 0, fontFamily: 'SF Pro, sans-serif', fontSize: 18, fontWeight: 400, lineHeight: '28px', color: '#9CA3AF', maxWidth: 600 }}>
            Monitor and manage warehouse inventory and stock levels
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setReviewOpen(true)}
            onMouseEnter={() => setIsHover(p => ({ ...p, review: true }))}
            onMouseLeave={() => setIsHover(p => ({ ...p, review: false }))}
            style={{ ...baseBtn, border: 'none', background: '#fff', color: '#004399', boxShadow: '0px 4px 10px rgba(37,99,235,0.25)' }}>
            <Eye size={14} /> Review Request
          </button>
          <button onClick={handleExport}
            onMouseEnter={() => setIsHover(p => ({ ...p, report: true }))}
            onMouseLeave={() => setIsHover(p => ({ ...p, report: false }))}
            style={{ ...baseBtn, border: '1px solid transparent', background: 'linear-gradient(90deg, #004399 21%, #9EBEF1 92%)', color: '#fff', boxShadow: isHover.report ? '0px 6px 18px rgba(0,67,153,0.35)' : '0px 2px 6px rgba(0,0,0,0.05)', transform: isHover.report ? 'translateY(-1px)' : 'translateY(0)' }}>
            <Download size={14} />
            {checkedCount > 0 ? `Export (${checkedCount})` : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        <StatCard label="Registered Warehouse" value={stats?.registered ?? '8,642'} sub="Active storage facilities"  icon={Warehouse} iconBg="#EFF6FF" iconColor="#3B82F6" />
        <StatCard label="Pending Requests"      value={stats?.pending    ?? '3'}     sub="Awaiting approval"          icon={Clock}     iconBg="#FEF9C3" iconColor="#EAB308" />
        <StatCard label="Capacity Alerts"       value={stats?.alerts     ?? '5'}     sub="Require immediate attention" icon={Bell}      iconBg="#FEF2F2" iconColor="#EF4444" />
      </div>

      {/* Table Card */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Tabs */}
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
                  <span style={{ background: tab.key === 'requests' ? '#EF4444' : (active ? '#DBEAFE' : '#F3F4F6'), color: tab.key === 'requests' ? '#fff' : (active ? '#1D4ED8' : '#6B7280'), borderRadius: 20, fontSize: 11, fontWeight: 600, padding: '1px 7px' }}>
                    {tab.badge}
                  </span>
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
                {['Shipment ID','Imported By','Country of Origin','Assigned Warehouse','Governorate','Country of Origin','Arrival Date','Clearance Status','Last Updated','Storage Status'].map(lbl => (
                  <th key={lbl} style={{ padding: '10px 10px', textAlign: 'left', color: '#6B7280', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }}>{lbl}</th>
                ))}
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: 13 }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: 13 }}>No records found</td></tr>
              ) : (
                filtered.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F3F4F6', background: checkedRows[row.id] ? '#F0F7FF' : '#fff', transition: 'background 0.1s' }}>
                    <td style={{ padding: '12px 20px' }}><input type="checkbox" checked={!!checkedRows[row.id]} onChange={() => toggleRow(row.id)} style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: 'pointer' }} /></td>
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
                    <td style={{ padding: '12px 10px' }}><RowMenu row={row} onView={handleViewDetails} onEdit={handleEditItem} onDelete={handleDeletePrompt} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: 12, color: '#9CA3AF' }}>
          Showing {filtered.length} of {items.length} records
        </div>
      </div>

      {/* Details Drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => { setDrawerOpen(false); setSelectedItem(null); }} title="Shipment Details" size="md">
        {selectedItem && (
          <div style={{ padding: 'var(--spacing-md)' }}>
            {[['ID', selectedItem.id],['Imported By', selectedItem.importedBy],['Country', selectedItem.country],['Warehouse', selectedItem.warehouse],['Governorate', selectedItem.governorate],['Arrival Date', selectedItem.arrivalDate]].map(([lbl, val]) => val && (
              <div key={lbl} style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{lbl}</label>
                <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)', marginTop: 4 }}>{val}</div>
              </div>
            ))}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clearance Status</label>
              <div style={{ marginTop: 6 }}><ClearanceBadge status={selectedItem.clearanceStatus} /></div>
            </div>
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Storage Status</label>
              <div style={{ marginTop: 6 }}><StorageBadge status={selectedItem.storageStatus} /></div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }} title="Confirm Deletion" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          Are you sure you want to delete <strong>{itemToDelete?.id}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
          <Button variant="secondary" onClick={() => { setDeleteModalOpen(false); setItemToDelete(null); }}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      {editModalOpen && selectedItem && (
        <EditModal item={selectedItem} onClose={() => { setEditModalOpen(false); setSelectedItem(null); }} onSave={handleSaveEdit} />
      )}

      {/* Review Modal */}
      {reviewOpen && <ReviewModal onClose={() => setReviewOpen(false)} showError={showError} />}
    </div>
  );
};

export default WarehouseDashboard;



