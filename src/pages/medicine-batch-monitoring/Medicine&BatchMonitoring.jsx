import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  Filter,
  Download,
  Eye,
  MoreVertical,
  X,
  Check,
  ChevronDown,
  Package,
  FlaskConical,
  Truck,
  Warehouse,
  Building2,
  Search,
  ClipboardCheck,
  AlertTriangle,
  RefreshCw,
  Snowflake,
  AlertOctagon,
  ScanLine,
  Info,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

// ─── API service ──────────────────────────────────────────────────────────────
// ⚠️ عدّل المسار ده بحيث يشاور على مكان ملف batchesService عندك فعليًا
// (الملف اللي فيه: getAll, getById, getSummary, freeze, createRecallAlert)
import { batchesService } from '../../api/services/batchesService';

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_COLORS = {
  'In Prospection': { bg: '#F5F3FF', color: '#7C3AED' },
  'In Supply Chain': { bg: '#FEF3C7', color: '#B45309' },
  'In Warehouse':    { bg: '#DBEAFE', color: '#1D4ED8' },
  'In Pharmacies':   { bg: '#D1FAE5', color: '#059669' },
};

const BATCH_STATUS_COLORS = {
  'Active':     { bg: '#D1FAE5', color: '#059669' },
  'Recalled':   { bg: '#FEE2E2', color: '#DC2626' },
  'Expired':    { bg: '#F3F4F6', color: '#374151' },
  'Quarantined':{ bg: '#FEF3C7', color: '#B45309' },
};

const GENERIC_STATUS_COLORS = {
  Approved:     { bg: '#D1FAE5', color: '#059669' },
  Pending:      { bg: '#FEF3C7', color: '#B45309' },
  Open:         { bg: '#FEE2E2', color: '#DC2626' },
  Resolved:     { bg: '#D1FAE5', color: '#059669' },
  Investigating:{ bg: '#DBEAFE', color: '#1D4ED8' },
  'In Transit': { bg: '#FEF3C7', color: '#B45309' },
  Delivered:    { bg: '#D1FAE5', color: '#059669' },
  Delayed:      { bg: '#FEE2E2', color: '#DC2626' },
  Partial:      { bg: '#DBEAFE', color: '#1D4ED8' },
  Ok:           { bg: '#D1FAE5', color: '#059669' },
  Low:          { bg: '#FEF3C7', color: '#B45309' },
  Critical:     { bg: '#FEE2E2', color: '#DC2626' },
  High:         { bg: '#FEE2E2', color: '#DC2626' },
  Medium:       { bg: '#FEF3C7', color: '#B45309' },
};

const FILTER_OPTIONS = {
  supplyChainStage: ['All', 'In Prospection', 'In Supply Chain', 'In Warehouse', 'In Pharmacies'],
  batchStatus:      ['All', 'Active', 'Recalled', 'Expired', 'Quarantined'],
  dosageForm:       ['All', 'Tablet', 'Capsule', 'Syrup', 'Injection'],
};

const PAGE_SIZE = 10;

// ─── Mapping helpers (API DTO → UI row shape) ─────────────────────────────────
// الـ API (BatchListItemDto) مفيهوش كل الحقول اللي كانت موجودة في الـ mock data
// (زي manufacturer, requiresColdChain, productStatus, createdBy...) لأنها موجودة
// بس في تفاصيل الباتش (BatchDetailsDto). فبنعمل fallback بسيط هنا.

const mapListItem = (dto) => ({
  id: dto.id,
  productName: dto.productName ?? '—',
  gtin: dto.gtin,
  dosageForm: dto.dosageForm,
  strength: dto.strength,
  manufacturer: dto.factoryName, // مفيش حقل manufacturer منفصل في الـ list DTO
  factoryName: dto.factoryName,
  quantity: dto.quantity ?? 0,
  batchLotNo: dto.batchNumber,
  productionDate: formatDate(dto.manufacturingDate),
  expiryDate: formatDate(dto.expiryDate),
  supplyChainStage: dto.supplyChainStage,
  batchStatus: dto.batchStatus,
  currentLocation: dto.currentLocation,
  caseAlerts: dto.openAlerts ?? 0,
  unitCodesCount: dto.unitCodesCount ?? 0,
  availableForDispatch: dto.availableForDispatch,
});

const mapDetails = (dto) => {
  const p = dto.productInfo || {};
  const b = dto.batchInfo || {};
  const u = dto.unitCodesSummary || {};
  return {
    id: dto.id,
    productName: p.productName,
    gtin: p.gtin,
    dosageForm: p.dosageForm,
    strength: p.strength,
    requiresColdChain: p.requiresColdChain,
    productStatus: p.productStatus,
    batchLotNo: b.batchNumber,
    factoryName: b.factoryName,
    quantity: b.quantity,
    productionDate: formatDate(b.manufacturingDate),
    expiryDate: formatDate(b.expiryDate),
    batchStatus: b.batchStatus,
    supplyChainStage: b.supplyChainStage,
    createdBy: b.createdBy,
    createdAt: formatDate(b.createdAt, true),
    updatedAt: formatDate(b.updatedAt, true),
    unitSummary: {
      total: u.totalUnitCodes ?? 0,
      generated: u.generatedCount ?? 0,
      inWarehouse: u.inWarehouseCount ?? 0,
      inPharmacy: u.inPharmacyCount ?? 0,
      suspicious: u.suspiciousCount ?? 0,
      blocked: u.blockedCount ?? 0,
      recalled: u.recalledCount ?? 0,
      scans: u.scanCountTotal ?? 0,
    },
    shipments: (dto.shipments || []).map(s => ({
      transferCode: s.transferCode,
      shipmentType: s.shipmentType,
      source: s.source,
      destination: s.destination,
      expectedQuantity: s.expectedQuantity,
      receivedQuantity: s.receivedQuantity,
      shipmentStatus: s.shipmentStatus,
      dispatchDate: formatDate(s.dispatchDate),
      receivedDate: formatDate(s.receivedDate),
    })),
    inventory: (dto.inventoryDistribution || []).map(i => ({
      holderType: i.holderType,
      holderName: i.holderName,
      totalReceivedQuantity: i.totalReceivedQuantity,
      availableQuantity: i.availableQuantity,
      reservedQuantity: i.reservedQuantity,
      quarantinedQuantity: i.quarantinedQuantity,
      inventoryStatus: i.inventoryStatus,
      lastUpdated: formatDate(i.lastUpdated),
    })),
    alerts: (dto.relatedAlerts || []).map(a => ({
      alertType: a.alertType,
      severity: a.severity,
      message: a.message,
      alertStatus: a.alertStatus,
      createdAt: formatDate(a.createdAt),
      resolvedAt: formatDate(a.resolvedAt),
    })),
  };
};

function formatDate(value, withTime = false) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const datePart = d.toISOString().slice(0, 10);
  if (!withTime) return datePart;
  return `${datePart} ${d.toTimeString().slice(0, 5)}`;
}

// ─── Small UI Atoms ───────────────────────────────────────────────────────────

const Pill = ({ label, palette }) => {
  const s = palette[label] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
};

const StageBadge       = ({ status }) => <Pill label={status} palette={STAGE_COLORS} />;
const BatchStatusBadge = ({ status }) => <Pill label={status} palette={BATCH_STATUS_COLORS} />;
const GenericBadge     = ({ status }) => <Pill label={status} palette={GENERIC_STATUS_COLORS} />;

const CaseAlertsBadge = ({ count }) => {
  if (!count) return <span style={{ color: '#9CA3AF', fontSize: 13 }}>—</span>;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#FEE2E2', color: '#DC2626' }}>
      <AlertTriangle size={12} />
      {count}
    </span>
  );
};

const StatCard = ({ label, value, icon: Icon, loading }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F0F0F0', flex: 1, minWidth: 0 }}>
    <div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
        {loading ? <Loader2 size={20} className="spin-icon" style={{ animation: 'spin 0.8s linear infinite' }} /> : value}
      </div>
    </div>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color="#990026" />
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

  const hasActive   = Object.values(activeFilters).some(v => v && v !== 'All');
  const activeCount = Object.values(activeFilters).filter(v => v && v !== 'All').length;

  const handleApply = () => { onApply(local); setOpen(false); };
  const handleClear = () => { const r = { supplyChainStage: 'All', batchStatus: 'All', dosageForm: 'All' }; setLocal(r); onClear(r); setOpen(false); };

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
            { key: 'supplyChainStage', label: 'Supply Chain Stage' },
            { key: 'batchStatus',      label: 'Batch Status' },
            { key: 'dosageForm',       label: 'Dosage Form' },
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
          {/* dosageForm مش مدعوم كـ query param في /api/batches — بيتفلتر client-side على الصفحة الحالية بس */}
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

const RowMenu = ({ row, onView, onFreeze, onRecall }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const items = [
    { label: 'View Batch Details', icon: Eye,          color: '#374151', action: () => { onView(row);   setOpen(false); } },
    { label: 'Freeze Batch',       icon: Snowflake,     color: '#1D4ED8', action: () => { onFreeze(row); setOpen(false); } },
    { label: 'Create Recall Alert',icon: AlertOctagon,  color: '#EF4444', action: () => { onRecall(row); setOpen(false); } },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(p => !p); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: open ? '#004399' : '#9CA3AF', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}>
        <MoreVertical size={16} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 190, overflow: 'hidden' }}>
          {items.map(({ label, icon: Icon, color, action }, i) => (
            <button key={label} onClick={action}
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

// ─── Recall Confirm Modal ──────────────────────────────────────────────────────

const RecallModal = ({ item, onClose, onConfirm, submitting }) => {
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
          This will mark batch #<strong>{item?.id}</strong> ({item?.productName}) as recalled and notify all holders in the supply chain.
        </p>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Reason (optional)</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="e.g. Reported adverse reactions, quality deviation..."
          rows={3}
          disabled={submitting}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', boxSizing: 'border-box', outline: 'none', resize: 'vertical', marginBottom: 18, fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={submitting} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer' }}>Cancel</button>
          <button onClick={() => onConfirm(message)} disabled={submitting} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {submitting && <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />}
            Confirm Recall
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Details Modal building blocks ─────────────────────────────────────────────

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

const MiniStat = ({ label, value, tone }) => (
  <div style={{ background: '#F9FAFB', border: '1px solid #F0F0F0', borderRadius: 10, padding: '10px 12px' }}>
    <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color: tone || '#111827' }}>{Number(value || 0).toLocaleString()}</div>
  </div>
);

const MiniTable = ({ columns, rows, badgeKeys = [], emptyLabel }) => {
  if (!rows || rows.length === 0) {
    return <div style={{ fontSize: 12.5, color: '#9CA3AF', padding: '14px 0', textAlign: 'center', background: '#F9FAFB', borderRadius: 10, border: '1px dashed #E5E7EB' }}>{emptyLabel}</div>;
  }
  return (
    <div style={{ overflowX: 'auto', border: '1px solid #F0F0F0', borderRadius: 10 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: '#F9FAFB' }}>
            {columns.map(col => (
              <th key={col.key} style={{ padding: '8px 10px', textAlign: 'left', color: '#6B7280', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap', borderBottom: '1px solid #F0F0F0' }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: idx === rows.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
              {columns.map(col => (
                <td key={col.key} style={{ padding: '8px 10px', color: '#374151', whiteSpace: 'nowrap' }}>
                  {row[col.key] === null || row[col.key] === undefined || row[col.key] === '' ? '—' :
                    badgeKeys.includes(col.key) ? <GenericBadge status={row[col.key]} /> : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DETAILS_TABS = [
  { key: 'overview',   label: 'Overview',    icon: Info },
  { key: 'unitCodes',  label: 'Unit Codes',  icon: ScanLine },
  { key: 'shipments',  label: 'Shipments',   icon: Truck },
  { key: 'inventory',  label: 'Inventory',   icon: Warehouse },
  { key: 'alerts',     label: 'Alerts',      icon: AlertTriangle },
];

const BatchDetailsModal = ({ batchId, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [details, setDetails]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    batchesService.getById(batchId)
      .then(res => { if (!cancelled) setDetails(mapDetails(res.data ?? res)); })
      .catch(() => { if (!cancelled) setError('Failed to load batch details'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [batchId]);

  const tabCounts = {
    shipments: details?.shipments?.length ?? 0,
    inventory: details?.inventory?.length ?? 0,
    alerts:    details?.alerts?.length ?? 0,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, padding: 24 }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 920, maxHeight: '88vh', background: '#fff', borderRadius: 20, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '22px 26px 18px', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 700, fontSize: 19, color: '#111827' }}>{details?.productName || (loading ? 'Loading…' : 'Batch')}</div>
              {details?.batchStatus && <BatchStatusBadge status={details.batchStatus} />}
            </div>
            <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 5 }}>
              #{batchId}{details?.batchLotNo ? ` · Batch ${details.batchLotNo}` : ''}{details?.factoryName ? ` · ${details.factoryName}` : ''}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, padding: '0 26px', borderBottom: '1px solid #F0F0F0', flexShrink: 0, overflowX: 'auto' }}>
          {DETAILS_TABS.map(tab => {
            const isActive = activeTab === tab.key;
            const count = tabCounts[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '11px 14px',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #004399' : '2px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#004399' : '#6B7280',
                  marginBottom: -1,
                  whiteSpace: 'nowrap',
                }}
              >
                <tab.icon size={14} />
                {tab.label}
                {typeof count === 'number' && count > 0 && (
                  <span style={{ background: isActive ? '#004399' : '#E5E7EB', color: isActive ? '#fff' : '#6B7280', borderRadius: 20, fontSize: 10.5, fontWeight: 700, padding: '1px 6px', minWidth: 16, textAlign: 'center' }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 0', color: '#9CA3AF', fontSize: 13 }}>
              <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Loading batch details…
            </div>
          )}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#DC2626', fontSize: 13 }}>{error}</div>
          )}
          {!loading && !error && details && (
            <>
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
                  <div>
                    <SectionTitle>Product Information</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                      <InfoField label="Product Name" value={details.productName} />
                      <InfoField label="GTIN" value={details.gtin} />
                      <InfoField label="Dosage Form" value={details.dosageForm} />
                      <InfoField label="Strength" value={details.strength} />
                      <InfoField label="Requires Cold Chain" value={details.requiresColdChain ? 'Yes' : 'No'} />
                      <InfoField label="Product Status" value={details.productStatus ? <GenericBadge status={details.productStatus} /> : '—'} />
                    </div>
                  </div>

                  <div>
                    <SectionTitle>Batch Information</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                      <InfoField label="Batch Number" value={details.batchLotNo} />
                      <InfoField label="Factory Name" value={details.factoryName} />
                      <InfoField label="Quantity" value={details.quantity?.toLocaleString()} />
                      <InfoField label="Manufacturing Date" value={details.productionDate} />
                      <InfoField label="Expiry Date" value={details.expiryDate} />
                      <InfoField label="Batch Status" value={details.batchStatus ? <BatchStatusBadge status={details.batchStatus} /> : '—'} />
                      <InfoField label="Supply Chain Stage" value={details.supplyChainStage ? <StageBadge status={details.supplyChainStage} /> : '—'} />
                      <InfoField label="Created By" value={details.createdBy} />
                      <InfoField label="Created At" value={details.createdAt} />
                      <InfoField label="Updated At" value={details.updatedAt} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'unitCodes' && (
                <div>
                  <SectionTitle>Unit Codes Summary</SectionTitle>
                  <p style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: -6, marginBottom: 16 }}>
                    Aggregated counts only — individual unit codes are not listed here as a batch can contain thousands.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    <MiniStat label="Total Unit Codes" value={details.unitSummary.total} />
                    <MiniStat label="Generated"         value={details.unitSummary.generated} />
                    <MiniStat label="In Warehouse"      value={details.unitSummary.inWarehouse} />
                    <MiniStat label="In Pharmacy"       value={details.unitSummary.inPharmacy} />
                    <MiniStat label="Suspicious"        value={details.unitSummary.suspicious} tone="#B45309" />
                    <MiniStat label="Blocked"           value={details.unitSummary.blocked}   tone="#DC2626" />
                    <MiniStat label="Recalled"          value={details.unitSummary.recalled}  tone="#DC2626" />
                    <MiniStat label="Total Scans"       value={details.unitSummary.scans} />
                  </div>
                </div>
              )}

              {activeTab === 'shipments' && (
                <div>
                  <SectionTitle>Shipments Summary</SectionTitle>
                  <MiniTable
                    emptyLabel="No shipments recorded for this batch"
                    badgeKeys={['shipmentStatus']}
                    columns={[
                      { key: 'transferCode',      label: 'Transfer Code' },
                      { key: 'shipmentType',      label: 'Shipment Type' },
                      { key: 'source',            label: 'Source' },
                      { key: 'destination',       label: 'Destination' },
                      { key: 'expectedQuantity',  label: 'Expected Qty' },
                      { key: 'receivedQuantity',  label: 'Received Qty' },
                      { key: 'shipmentStatus',    label: 'Status' },
                      { key: 'dispatchDate',      label: 'Dispatch Date' },
                      { key: 'receivedDate',      label: 'Received Date' },
                    ]}
                    rows={details.shipments}
                  />
                </div>
              )}

              {activeTab === 'inventory' && (
                <div>
                  <SectionTitle>Inventory Distribution</SectionTitle>
                  <MiniTable
                    emptyLabel="No inventory holders recorded for this batch"
                    badgeKeys={['inventoryStatus']}
                    columns={[
                      { key: 'holderType',            label: 'Holder Type' },
                      { key: 'holderName',            label: 'Holder Name' },
                      { key: 'totalReceivedQuantity', label: 'Total Received' },
                      { key: 'availableQuantity',     label: 'Available' },
                      { key: 'reservedQuantity',      label: 'Reserved' },
                      { key: 'quarantinedQuantity',   label: 'Quarantined' },
                      { key: 'inventoryStatus',       label: 'Status' },
                      { key: 'lastUpdated',           label: 'Last Updated' },
                    ]}
                    rows={details.inventory}
                  />
                </div>
              )}

              {activeTab === 'alerts' && (
                <div>
                  <SectionTitle>Related Alerts</SectionTitle>
                  <MiniTable
                    emptyLabel="No alerts linked to this batch"
                    badgeKeys={['severity', 'alertStatus']}
                    columns={[
                      { key: 'alertType',   label: 'Alert Type' },
                      { key: 'severity',    label: 'Severity' },
                      { key: 'message',     label: 'Message' },
                      { key: 'alertStatus', label: 'Status' },
                      { key: 'createdAt',   label: 'Created At' },
                      { key: 'resolvedAt',  label: 'Resolved At' },
                    ]}
                    rows={details.alerts}
                  />
                </div>
              )}
            </>
          )}
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

const TABLE_COLUMNS = [
  { key: 'id',               label: 'Batch ID' },
  { key: 'productName',      label: 'Product Name' },
  { key: 'dosageForm',       label: 'Dosage Form' },
  { key: 'manufacturer',     label: 'Manufacturer' },
  { key: 'factoryName',      label: 'Factory Name' },
  { key: 'quantity',         label: 'Quantity' },
  { key: 'batchLotNo',       label: 'Batch/Lot No.' },
  { key: 'productionDate',   label: 'Production Date' },
  { key: 'expiryDate',       label: 'Expiry Date' },
  { key: 'supplyChainStage', label: 'Supply Chain Stage' },
  { key: 'batchStatus',      label: 'Batch Status' },
  { key: 'currentLocation',  label: 'Current Location' },
  { key: 'caseAlerts',       label: 'Case Alerts' },
];

const MedicineBatchDashboard = () => {
  const [items, setItems]               = useState([]);
  const [totalCount, setTotalCount]     = useState(0);
  const [page, setPage]                 = useState(1);

  const [activeFilters, setActiveFilters] = useState({ supplyChainStage: 'All', batchStatus: 'All', dosageForm: 'All' });
  const [searchInput, setSearchInput]     = useState('');
  const [searchQuery, setSearchQuery]     = useState('');

  const [drawerItemId, setDrawerItemId] = useState(null);
  const [recallTarget, setRecallTarget] = useState(null);
  const [recallSubmitting, setRecallSubmitting] = useState(false);
  const [checkedRows, setCheckedRows]   = useState({});
  const [allChecked, setAllChecked]     = useState(false);
  const [toast, setToast]               = useState(null);

  const [listLoading, setListLoading]   = useState(true);
  const [listError, setListError]       = useState(null);

  const [summary, setSummary]           = useState({ total: 0, prospection: 0, supplyChain: 0, warehouse: 0, pharmacies: 0 });
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [rowActionId, setRowActionId]   = useState(null); // batch id currently being frozen

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const showError = (msg) => showToast(msg, 'error');

  // ── Debounce search input ──────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setSearchQuery(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Fetch batch list from API ──────────────────────────────────────────────
  const fetchList = useCallback(() => {
    setListLoading(true);
    setListError(null);
    const params = {
      page,
      pageSize: PAGE_SIZE,
      search: searchQuery || undefined,
      stage: activeFilters.supplyChainStage !== 'All' ? activeFilters.supplyChainStage : undefined,
      batchStatus: activeFilters.batchStatus !== 'All' ? activeFilters.batchStatus : undefined,
    };
    return batchesService.getAll(params)
      .then(res => {
        const data = res.data ?? res;
        setItems((data.items || []).map(mapListItem));
        setTotalCount(data.totalCount ?? 0);
      })
      .catch(() => {
        setListError('Failed to load batches. Please try again.');
        setItems([]);
        setTotalCount(0);
      })
      .finally(() => setListLoading(false));
  }, [page, searchQuery, activeFilters.supplyChainStage, activeFilters.batchStatus]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ── Fetch summary cards ────────────────────────────────────────────────────
  const fetchSummary = useCallback(() => {
    setSummaryLoading(true);
    return batchesService.getSummary()
      .then(res => {
        const d = res.data ?? res ?? {};
        setSummary({
          total:       d.total ?? d.totalBatches ?? 0,
          prospection: d.prospection ?? d.inProspection ?? 0,
          supplyChain: d.supplyChain ?? d.inSupplyChain ?? 0,
          warehouse:   d.warehouse ?? d.inWarehouse ?? 0,
          pharmacies:  d.pharmacies ?? d.inPharmacies ?? 0,
        });
      })
      .catch(() => { /* keep previous / zeroed summary silently */ })
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  // ── Client-side dosageForm filter (not supported by the API) ───────────────
  const filtered = useMemo(() => {
    if (activeFilters.dosageForm === 'All') return items;
    return items.filter(row => row.dosageForm === activeFilters.dosageForm);
  }, [items, activeFilters.dosageForm]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleExport = () => {
    try {
      const checkedIds   = Object.keys(checkedRows).filter(id => checkedRows[id]);
      const dataToExport = checkedIds.length > 0 ? filtered.filter(r => checkedIds.includes(String(r.id))) : filtered;
      if (!dataToExport.length) { showError('No data to export'); return; }
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Batches');
      XLSX.writeFile(wb, 'medicine_batch_export.xlsx');
      showToast('Report exported successfully (current page only)');
    } catch (err) { showError('Export failed'); }
  };

  const handleViewDetails = (item) => setDrawerItemId(item.id);

  const handleFreeze = async (item) => {
    setRowActionId(item.id);
    try {
      await batchesService.freeze(item.id);
      showToast(`Batch #${item.id} frozen and marked as Quarantined`);
      await Promise.all([fetchList(), fetchSummary()]);
    } catch (err) {
      showError(`Failed to freeze batch #${item.id}`);
    } finally {
      setRowActionId(null);
    }
  };

  const handleRecallConfirm = async (message) => {
    if (!recallTarget) return;
    setRecallSubmitting(true);
    try {
      await batchesService.createRecallAlert(recallTarget.id, message?.trim());
      showToast(`Recall alert created for batch #${recallTarget.id}`);
      setRecallTarget(null);
      await Promise.all([fetchList(), fetchSummary()]);
    } catch (err) {
      showError(`Failed to create recall alert for batch #${recallTarget.id}`);
    } finally {
      setRecallSubmitting(false);
    }
  };

  const handleApplyFilters = (f) => { setActiveFilters(f); setPage(1); };
  const handleClearFilters = (f) => { setActiveFilters(f); setPage(1); };

  const handleRefresh = () => {
    setCheckedRows({});
    setAllChecked(false);
    fetchList();
    fetchSummary();
  };

  const toggleAll = () => {
    if (allChecked) { setCheckedRows({}); setAllChecked(false); }
    else { const all = {}; filtered.forEach(r => { all[r.id] = true; }); setCheckedRows(all); setAllChecked(true); }
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
            <span style={{ color: '#004399' }}>Medicine &amp; </span>
            <span style={{ color: '#111827' }}>Batch Monitoring</span>
          </h1>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 14, color: '#9CA3AF', fontWeight: 400 }}>
            Track every batch across prospection, supply chain, warehousing, and pharmacy distribution
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={listLoading}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', fontWeight: 500, cursor: listLoading ? 'not-allowed' : 'pointer' }}>
          <RefreshCw size={14} color="#6B7280" style={listLoading ? { animation: 'spin 0.8s linear infinite' } : undefined} />
          Refresh
        </button>
      </div>

      <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>

      {/* ── 5 Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Batches"    value={summary.total}       icon={Package}      loading={summaryLoading} />
        <StatCard label="In Prospection"   value={summary.prospection} icon={FlaskConical} loading={summaryLoading} />
        <StatCard label="In Supply Chain"  value={summary.supplyChain} icon={Truck}        loading={summaryLoading} />
        <StatCard label="In Warehouse"     value={summary.warehouse}   icon={Warehouse}    loading={summaryLoading} />
        <StatCard label="In Pharmacies"    value={summary.pharmacies}  icon={Building2}    loading={summaryLoading} />
      </div>

      {/* ── Main Table Card ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardCheck size={16} color="#004399" />
            Medicine &amp; Batch Monitoring
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search product, batch, factory..."
                style={{ padding: '7px 12px 7px 30px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', width: 220, outline: 'none' }}
              />
            </div>
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
                {TABLE_COLUMNS.map(col => (
                  <th key={col.key} style={{ padding: '10px 10px', textAlign: 'left', color: '#6B7280', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }}>{col.label}</th>
                ))}
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                <tr><td colSpan={TABLE_COLUMNS.length + 2} style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Loading batches…
                  </div>
                </td></tr>
              ) : listError ? (
                <tr><td colSpan={TABLE_COLUMNS.length + 2} style={{ textAlign: 'center', padding: '48px 0', color: '#DC2626' }}>{listError}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={TABLE_COLUMNS.length + 2} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No records found</td></tr>
              ) : (
                filtered.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F3F4F6', background: checkedRows[row.id] ? '#F0F7FF' : '#fff', opacity: rowActionId === row.id ? 0.5 : 1 }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input type="checkbox" checked={!!checkedRows[row.id]} onChange={() => toggleRow(row.id)} style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '12px 10px', color: '#1D4ED8', fontWeight: 500, whiteSpace: 'nowrap' }}>{row.id}</td>
                    <td style={{ padding: '12px 10px', color: '#374151', whiteSpace: 'nowrap' }}>{row.productName}</td>
                    <td style={{ padding: '12px 10px', color: '#374151' }}>{row.dosageForm}</td>
                    <td style={{ padding: '12px 10px', color: '#374151', whiteSpace: 'nowrap' }}>{row.manufacturer}</td>
                    <td style={{ padding: '12px 10px', color: '#374151', whiteSpace: 'nowrap' }}>{row.factoryName}</td>
                    <td style={{ padding: '12px 10px', color: '#374151' }}>{Number(row.quantity).toLocaleString()}</td>
                    <td style={{ padding: '12px 10px', color: '#374151', whiteSpace: 'nowrap' }}>{row.batchLotNo}</td>
                    <td style={{ padding: '12px 10px', color: '#374151', whiteSpace: 'nowrap' }}>{row.productionDate}</td>
                    <td style={{ padding: '12px 10px', color: '#374151', whiteSpace: 'nowrap' }}>{row.expiryDate}</td>
                    <td style={{ padding: '12px 10px' }}><StageBadge status={row.supplyChainStage} /></td>
                    <td style={{ padding: '12px 10px' }}><BatchStatusBadge status={row.batchStatus} /></td>
                    <td style={{ padding: '12px 10px', color: '#374151', whiteSpace: 'nowrap' }}>{row.currentLocation}</td>
                    <td style={{ padding: '12px 10px' }}><CaseAlertsBadge count={row.caseAlerts} /></td>
                    <td style={{ padding: '12px 10px' }}>
                      <RowMenu row={row} onView={handleViewDetails} onFreeze={handleFreeze} onRecall={setRecallTarget} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: 12, color: '#9CA3AF', flexWrap: 'wrap', gap: 10 }}>
          <span>
            Showing {filtered.length} of {totalCount} record{totalCount === 1 ? '' : 's'} · page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || listLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, color: page <= 1 ? '#D1D5DB' : '#374151', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>
              <ChevronLeft size={13} /> Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || listLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, color: page >= totalPages ? '#D1D5DB' : '#374151', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Batch Details Modal ── */}
      {drawerItemId && <BatchDetailsModal key={drawerItemId} batchId={drawerItemId} onClose={() => setDrawerItemId(null)} />}

      {/* ── Recall Modal ── */}
      {recallTarget && (
        <RecallModal
          item={recallTarget}
          submitting={recallSubmitting}
          onClose={() => !recallSubmitting && setRecallTarget(null)}
          onConfirm={handleRecallConfirm}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default MedicineBatchDashboard;