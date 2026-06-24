
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
  Calendar,
  Home,
  AlertTriangle,
} from 'lucide-react';
import * as XLSX from 'xlsx';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  Pending:        { bg: '#FEF3C7', color: '#B45309' },
  'Under Review': { bg: '#DBEAFE', color: '#1D4ED8' },
  Approved:       { bg: '#D1FAE5', color: '#059669' },
  Rejected:       { bg: '#FEE2E2', color: '#DC2626' },
};

const COMPLIANCE_COLORS = {
  Critical: { bg: '#FEE2E2', color: '#DC2626' },
  High:     { bg: '#FEF3C7', color: '#D97706' },
  Medium:   { bg: '#DBEAFE', color: '#2563EB' },
  Low:      { bg: '#D1FAE5', color: '#059669' },
};

const ENTITY_TYPES = ['All', 'Warehouse', 'Manufacturer', 'Pharmacy', 'Supplier'];
const STATUS_TYPES = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'];
const GOVERNORATES = ['All', 'Cairo', 'Alexandria', 'Mansoura', 'Giza', 'Assiut', 'Port Said'];

const FILTER_OPTIONS = {
  entityType:  ENTITY_TYPES,
  status:      STATUS_TYPES,
  governorate: GOVERNORATES,
};

const MOCK_REQUESTS = [
  { id: 'REQ-001', entityName: 'Delta Medical Storage',       entityType: 'Warehouse',     governorate: 'Mansoura',   submittedOn: 'May 16, 2024', status: 'Pending'      },
  { id: 'REQ-002', entityName: 'Cairo Pharma Factory',        entityType: 'Manufacturer',  governorate: 'Cairo',      submittedOn: 'May 15, 2024', status: 'Under Review' },
  { id: 'REQ-003', entityName: 'Alexandria Storage',          entityType: 'Warehouse',     governorate: 'Alexandria', submittedOn: 'May 15, 2024', status: 'Pending'      },
  { id: 'REQ-004', entityName: 'Alexandria Drug Store',       entityType: 'Pharmacy',      governorate: 'Alexandria', submittedOn: 'May 14, 2024', status: 'Under Review' },
  { id: 'REQ-005', entityName: 'Upper Egypt Factory',         entityType: 'Manufacturer',  governorate: 'Assiut',     submittedOn: 'May 14, 2024', status: 'Rejected'     },
  { id: 'REQ-006', entityName: 'Portsaid Distribution Center',entityType: 'Warehouse',     governorate: 'Port Said',  submittedOn: 'May 14, 2024', status: 'Under Review' },
];

const MOCK_COMPLIANCE = [
  { id: 'ALR-001', entityName: 'Giza Pharma Factory',   entityType: 'Manufacturer', governorate: 'Giza',       reportedOn: 'May 16, 2024', severity: 'Critical' },
  { id: 'ALR-002', entityName: 'Cairo Drug Warehouse',  entityType: 'Warehouse',    governorate: 'Cairo',      reportedOn: 'May 15, 2024', severity: 'High'     },
  { id: 'ALR-003', entityName: 'Delta Pharmacy Chain',  entityType: 'Pharmacy',     governorate: 'Mansoura',   reportedOn: 'May 15, 2024', severity: 'Medium'   },
  { id: 'ALR-004', entityName: 'Alexandria Med Supply', entityType: 'Supplier',     governorate: 'Alexandria', reportedOn: 'May 14, 2024', severity: 'High'     },
  { id: 'ALR-005', entityName: 'Upper Egypt Pharma',    entityType: 'Manufacturer', governorate: 'Assiut',     reportedOn: 'May 14, 2024', severity: 'Low'      },
];

const MOCK_DOCUMENTS = [
  { id: 1, name: 'Warehouse License.pdf',         type: 'PDF',  size: '1.8 MB', date: '2024-03-12', url: null },
  { id: 2, name: 'Storage Inspection Report.pdf', type: 'PDF',  size: '0.9 MB', date: '2024-03-10', url: null },
  { id: 3, name: 'Facility Certificate.pdf',      type: 'PDF',  size: '2.1 MB', date: '2024-02-28', url: null },
  { id: 4, name: 'Capacity Report.xlsx',          type: 'XLSX', size: '1.2 MB', date: '2024-03-08', url: null },
];

const REVIEW_TABS = ['Request Information', 'Documents'];

// ─── Small UI Atoms ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ display: 'inline-block', padding: '3px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

const SeverityBadge = ({ severity }) => {
  const s = COMPLIANCE_COLORS[severity] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ display: 'inline-block', padding: '3px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color }}>
      {severity}
    </span>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
  <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F0F0F0', flex: 1 }}>
    <div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>{sub}</div>}
    </div>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} color={iconColor} />
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

const FilterDropdown = ({ activeFilters, filterKeys, onApply, onClear }) => {
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
  const handleClear = () => {
    const r = Object.fromEntries(filterKeys.map(k => [k.key, 'All']));
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
          {filterKeys.map(({ key, label }) => (
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

// ─── Review Modal ─────────────────────────────────────────────────────────────

const ReviewModal = ({ onClose, showError }) => {
  const [activeSection, setActiveSection] = useState('Request Information');

  const fieldStyle = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', background: '#fff', boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 };

  const handleViewDoc = (doc) => {
    if (!doc.url) { showError?.('Document not available yet'); return; }
    window.open(doc.url, '_blank');
  };
  const handleDownloadDoc = (doc) => {
    if (!doc.url) { showError?.('Document not available for download yet'); return; }
    const a = document.createElement('a'); a.href = doc.url; a.download = doc.name; a.click();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, paddingTop: 40 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '92vw', maxWidth: 460, background: '#fff', borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.25)', maxHeight: '90vh' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 20px 14px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>Warehouse Monitoring Request</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>Request Information</div>
          </div>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #DC2626, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: 18 }}>🏛</span>
          </div>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', padding: '0 20px' }}>
          {REVIEW_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveSection(tab)}
              style={{ padding: '10px 14px', border: 'none', borderBottom: activeSection === tab ? '2px solid #004399' : '2px solid transparent', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: activeSection === tab ? 600 : 400, color: activeSection === tab ? '#004399' : '#6B7280', marginBottom: -1 }}>
              {tab}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {activeSection === 'Request Information' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['Request Title',    'Warehouse Registration Request'],
                ['Company Name',     'Delta Medical Storage'],
                ['Contact Email',    'Operations@Deltastorage.Com'],
                ['Request Type',     'Storage Facility Registration'],
                ['Requested Action', 'Register New Pharmaceutical Storage Warehouse'],
                ['Warehouse ID',     'WH-REQ-014'],
                ['Governorate',      'Mansoura'],
                ['Storage Capacity', '18,000 Packages'],
              ].map(([lbl, val]) => (
                <div key={lbl}>
                  <label style={labelStyle}>{lbl}</label>
                  <input defaultValue={val} style={fieldStyle} readOnly />
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
        <div style={{ display: 'flex', gap: 8, padding: '14px 20px', borderTop: '1px solid #F0F0F0' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#EF4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
          <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#1D4ED8', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Review Requests</button>
          <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#F59E0B', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Request Inspection</button>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Modal (Requests) ────────────────────────────────────────────────────

const EditRequestModal = ({ item, onClose, onSave }) => {
  const [form, setForm]     = useState({ ...item });
  const [saving, setSaving] = useState(false);

  const fields = [
    { key: 'entityName',  label: 'Entity Name',  type: 'text'   },
    { key: 'entityType',  label: 'Entity Type',  type: 'select', options: ['Warehouse', 'Manufacturer', 'Pharmacy', 'Supplier'] },
    { key: 'governorate', label: 'Governorate',  type: 'select', options: ['Cairo', 'Alexandria', 'Mansoura', 'Giza', 'Assiut', 'Port Said'] },
    { key: 'status',      label: 'Status',       type: 'select', options: ['Pending', 'Under Review', 'Approved', 'Rejected'] },
  ];

  const fieldStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', background: '#fff', boxSizing: 'border-box', outline: 'none' };

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.50)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: 520, background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #F0F0F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Edit size={16} color="#004399" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Edit Request</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>ID: {item.id}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '55vh', overflowY: 'auto' }}>
          {fields.map(({ key, label, type, options }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
              {type === 'select' ? (
                <div style={{ position: 'relative' }}>
                  <select value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    style={{ ...fieldStyle, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                </div>
              ) : (
                <input type="text" value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={fieldStyle} />
              )}
            </div>
          ))}
        </div>
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

const DetailsDrawer = ({ item, tabType, onClose }) => {
  if (!item) return null;

  const isCompliance = tabType === 'compliance';
  const fields = isCompliance ? [
    ['Alert ID',     item.id],
    ['Entity Name',  item.entityName],
    ['Entity Type',  item.entityType],
    ['Governorate',  item.governorate],
    ['Reported On',  item.reportedOn],
  ] : [
    ['Request ID',   item.id],
    ['Entity Name',  item.entityName],
    ['Entity Type',  item.entityType],
    ['Governorate',  item.governorate],
    ['Submitted On', item.submittedOn],
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 380, background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', padding: 24, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{isCompliance ? 'Alert Details' : 'Request Details'}</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            <X size={15} />
          </button>
        </div>
        {fields.map(([lbl, val]) => val && (
          <div key={lbl} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>{lbl}</div>
            <div style={{ fontSize: 14, color: '#111827' }}>{val}</div>
          </div>
        ))}
        <div>
          <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
            {isCompliance ? 'Severity' : 'Status'}
          </div>
          {isCompliance
            ? <SeverityBadge severity={item.severity} />
            : <StatusBadge status={item.status} />
          }
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
  const [activeTab, setActiveTab]         = useState('requests');
  const [reviewOpen, setReviewOpen]       = useState(false);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isHover, setIsHover]             = useState(false);

  const [requests, setRequests]         = useState(MOCK_REQUESTS);
  const [compliance, setCompliance]     = useState(MOCK_COMPLIANCE);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [checkedRows, setCheckedRows]   = useState({});
  const [allChecked, setAllChecked]     = useState(false);
  const [toast, setToast]               = useState(null);
const [loading, setLoading] = useState(false);
  const [reqFilters, setReqFilters] = useState({ entityType: 'All', status: 'All', governorate: 'All' });
  const [cmpFilters, setCmpFilters] = useState({ entityType: 'All', governorate: 'All' });

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const showError = (msg) => showToast(msg, 'error');

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredRequests = requests.filter(r => {
    const matchET = reqFilters.entityType  === 'All' || r.entityType  === reqFilters.entityType;
    const matchS  = reqFilters.status      === 'All' || r.status      === reqFilters.status;
    const matchG  = reqFilters.governorate === 'All' || r.governorate === reqFilters.governorate;
    return matchET && matchS && matchG;
  });

  const filteredCompliance = compliance.filter(r => {
    const matchET = cmpFilters.entityType  === 'All' || r.entityType  === cmpFilters.entityType;
    const matchG  = cmpFilters.governorate === 'All' || r.governorate === cmpFilters.governorate;
    return matchET && matchG;
  });

  const activeData     = activeTab === 'requests' ? filteredRequests : filteredCompliance;
  const activeSetItems = activeTab === 'requests' ? setRequests : setCompliance;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleExport = () => {
    try {
      const checkedIds   = Object.keys(checkedRows).filter(id => checkedRows[id]);
      const dataToExport = checkedIds.length > 0 ? activeData.filter(r => checkedIds.includes(String(r.id))) : activeData;
      if (!dataToExport.length) { showError('No data to export'); return; }
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, activeTab === 'requests' ? 'Requests' : 'Compliance');
      XLSX.writeFile(wb, `${activeTab}_export.xlsx`);
      showToast('Report exported successfully');
    } catch (err) { showError('Export failed'); }
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    activeSetItems(prev => prev.filter(r => r.id !== itemToDelete.id));
    showToast('Record deleted successfully');
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleSaveEdit = (updated) => {
    activeSetItems(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r));
    showToast('Record updated successfully');
  };

  const handleViewDetails  = (item) => { setSelectedItem(item); setDrawerOpen(true); };
  const handleEditItem     = (item) => { setSelectedItem(item); setEditModalOpen(true); };
  const handleDeletePrompt = (item) => { setItemToDelete(item); setDeleteModalOpen(true); };

  const toggleAll = () => {
    if (allChecked) { setCheckedRows({}); setAllChecked(false); }
    else { const all = {}; activeData.forEach(r => { all[r.id] = true; }); setCheckedRows(all); setAllChecked(true); }
  };
  const toggleRow = (id) => setCheckedRows(p => ({ ...p, [id]: !p[id] }));

  useEffect(() => { setCheckedRows({}); setAllChecked(false); }, [activeTab]);

  const checkedCount = Object.values(checkedRows).filter(Boolean).length;
 const handleRefresh = async () => {
  setLoading(true);

  setTimeout(() => {
    setLoading(false);
  }, 1000);
};

  // ── Render ─────────────────────────────────────────────────────────────────

  const reqFilterKeys = [
    { key: 'entityType',  label: 'Entity Type' },
    { key: 'status',      label: 'Status' },
    { key: 'governorate', label: 'Governorate' },
  ];
  const cmpFilterKeys = [
    { key: 'entityType',  label: 'Entity Type' },
    { key: 'governorate', label: 'Governorate' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, SF Pro, -apple-system, sans-serif', padding: '28px 32px', boxSizing: 'border-box', background: '#F8F9FB', minHeight: '100vh' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 38, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#004399' }}>National </span>
            <span style={{ color: '#111827' }}>Monitoring</span>
            <span style={{ color: '#111827' }}> Overview</span>
          </h1>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 14, color: '#9CA3AF', fontWeight: 400 }}>
            Monitor and manage the pharmaceutical supply chain across Egypt
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Date Range */}
          <button
  onClick={handleRefresh}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '9px 16px',
    borderRadius: 10,
    border: '1px solid #E5E7EB',
    background: '#fff',
    fontSize: 13,
    color: '#374151',
    fontWeight: 500,
    cursor: 'pointer',
  }}
>
  <RefreshCw size={14} color="#6B7280" />
  Refresh
</button>

          {/* Download Report Button */}
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

      {/* ── 4 Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard
          label="Licensed Pharmaceutical Facilities"
          value="8,642"
          sub="Actively monitored nationwide"
          icon={Home}
          iconBg="#EFF6FF"
          iconColor="#3B82F6"
        />
        <StatCard
          label="Pending Requests"
          value="42"
          sub="Awaiting ministry review"
          icon={Clock}
          iconBg="#FEF9C3"
          iconColor="#EAB308"
        />
        <StatCard
          label="Active Inspections"
          value="18"
          sub="Scheduled for field inspection"
          icon={Search}
          iconBg="#F5F3FF"
          iconColor="#8B5CF6"
        />
        <StatCard
          label="Compliance Alerts"
          value="11"
          sub="Require regulatory attention"
          icon={AlertTriangle}
          iconBg="#FEF2F2"
          iconColor="#EF4444"
        />
      </div>

      {/* ── Main Table Card ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', padding: '0 8px', gap: 4 }}>
          <button
            onClick={() => setActiveTab('requests')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '14px 16px', border: 'none', borderBottom: activeTab === 'requests' ? '2px solid #3B82F6' : '2px solid transparent', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === 'requests' ? 600 : 400, color: activeTab === 'requests' ? '#1D4ED8' : '#6B7280', whiteSpace: 'nowrap', marginBottom: -1 }}>
            <ClipboardCheck size={15} />
            Recent Registration Requests
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '14px 16px', border: 'none', borderBottom: activeTab === 'compliance' ? '2px solid #3B82F6' : '2px solid transparent', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === 'compliance' ? 600 : 400, color: activeTab === 'compliance' ? '#1D4ED8' : '#6B7280', whiteSpace: 'nowrap', marginBottom: -1 }}>
            <AlertTriangle size={15} />
            Recent Compliance Alerts
            <span style={{ background: '#EF4444', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '2px 7px', minWidth: 20, textAlign: 'center' }}>11</span>
          </button>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 12px' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
            {activeTab === 'requests' ? 'Recent Registration Requests' : 'Recent Compliance Alerts'}
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <FilterDropdown
              activeFilters={activeTab === 'requests' ? reqFilters : cmpFilters}
              filterKeys={activeTab === 'requests' ? reqFilterKeys : cmpFilterKeys}
              onApply={activeTab === 'requests' ? setReqFilters : setCmpFilters}
              onClear={activeTab === 'requests' ? setReqFilters : setCmpFilters}
            />
            <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
              <Download size={13} />
              {checkedCount > 0 ? `Export (${checkedCount})` : 'Export'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {activeTab === 'requests' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
                  <th style={{ padding: '10px 16px', width: 40, textAlign: 'left' }}>
                    <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: 'pointer' }} />
                  </th>
                  {['Request ID', 'Entity Name', 'Entity Type', 'Governorate', 'Submitted On', 'Status'].map(lbl => (
                    <th key={lbl} style={{ padding: '10px 12px', textAlign: 'left', color: '#6B7280', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }}>{lbl}</th>
                  ))}
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No records found</td></tr>
                ) : (
                  filteredRequests.map(row => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #F3F4F6', background: checkedRows[row.id] ? '#F0F7FF' : '#fff' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <input type="checkbox" checked={!!checkedRows[row.id]} onChange={() => toggleRow(row.id)} style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '12px 12px', color: '#1D4ED8', fontWeight: 600 }}>{row.id}</td>
                      <td style={{ padding: '12px 12px', color: '#111827', fontWeight: 500 }}>{row.entityName}</td>
                      <td style={{ padding: '12px 12px', color: '#374151' }}>{row.entityType}</td>
                      <td style={{ padding: '12px 12px', color: '#374151' }}>{row.governorate}</td>
                      <td style={{ padding: '12px 12px', color: '#6B7280', whiteSpace: 'nowrap' }}>{row.submittedOn}</td>
                      <td style={{ padding: '12px 12px' }}><StatusBadge status={row.status} /></td>
                      <td style={{ padding: '12px 12px' }}>
                        <RowMenu row={row} onView={handleViewDetails} onEdit={handleEditItem} onDelete={handleDeletePrompt} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
                  <th style={{ padding: '10px 16px', width: 40, textAlign: 'left' }}>
                    <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: 'pointer' }} />
                  </th>
                  {['Alert ID', 'Entity Name', 'Entity Type', 'Governorate', 'Reported On', 'Severity'].map(lbl => (
                    <th key={lbl} style={{ padding: '10px 12px', textAlign: 'left', color: '#6B7280', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }}>{lbl}</th>
                  ))}
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {filteredCompliance.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No records found</td></tr>
                ) : (
                  filteredCompliance.map(row => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #F3F4F6', background: checkedRows[row.id] ? '#F0F7FF' : '#fff' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <input type="checkbox" checked={!!checkedRows[row.id]} onChange={() => toggleRow(row.id)} style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '12px 12px', color: '#1D4ED8', fontWeight: 600 }}>{row.id}</td>
                      <td style={{ padding: '12px 12px', color: '#111827', fontWeight: 500 }}>{row.entityName}</td>
                      <td style={{ padding: '12px 12px', color: '#374151' }}>{row.entityType}</td>
                      <td style={{ padding: '12px 12px', color: '#374151' }}>{row.governorate}</td>
                      <td style={{ padding: '12px 12px', color: '#6B7280', whiteSpace: 'nowrap' }}>{row.reportedOn}</td>
                      <td style={{ padding: '12px 12px' }}><SeverityBadge severity={row.severity} /></td>
                      <td style={{ padding: '12px 12px' }}>
                        <RowMenu row={row} onView={handleViewDetails} onEdit={handleEditItem} onDelete={handleDeletePrompt} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: 12, color: '#9CA3AF' }}>
          Showing {activeData.length} of {activeTab === 'requests' ? requests.length : compliance.length} records
        </div>
      </div>

      {/* ── Details Drawer ── */}
      {drawerOpen && <DetailsDrawer item={selectedItem} tabType={activeTab} onClose={() => { setDrawerOpen(false); setSelectedItem(null); }} />}

      {/* ── Delete Modal ── */}
      {deleteModalOpen && <DeleteModal item={itemToDelete} onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }} onConfirm={handleDelete} />}

      {/* ── Edit Modal ── */}
      {editModalOpen && selectedItem && (
        <EditRequestModal item={selectedItem} onClose={() => { setEditModalOpen(false); setSelectedItem(null); }} onSave={handleSaveEdit} />
      )}

      {/* ── Review Modal ── */}
      {reviewOpen && <ReviewModal onClose={() => setReviewOpen(false)} showError={showError} />}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default WarehouseDashboard;


