import { useEffect, useState, useRef } from 'react';
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
  Box,
  ScanLine,
  Info,
} from 'lucide-react';
import * as XLSX from 'xlsx';

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

const MOCK_BATCHES = [
  { id: 'BAT001', productName: 'Amoxicillin 500mg',  gtin: '6224001001234', dosageForm: 'Tablet',    strength: '500mg',  requiresColdChain: false, productStatus: 'Approved', manufacturer: 'EIPICO Factory',       factoryName: 'EIPICO - 10th of Ramadan', quantity: 5000, batchLotNo: 'LOT-2024-0210', productionDate: '2024-02-10', expiryDate: '2026-02-10', supplyChainStage: 'In Warehouse',   batchStatus: 'Active',      currentLocation: 'Cairo Central Warehouse',   caseAlerts: 0, createdBy: 'Mona Youssef',   createdAt: '2024-02-10 09:12', updatedAt: '2024-06-02 14:30' },
  { id: 'BAT002', productName: 'Paracetamol 1000mg', gtin: '6224001005678', dosageForm: 'Tablet',    strength: '1000mg', requiresColdChain: false, productStatus: 'Approved', manufacturer: 'Global Napi Pharma',    factoryName: 'Global Napi - Giza',       quantity: 8000, batchLotNo: 'LOT-2024-0322', productionDate: '2024-03-22', expiryDate: '2026-03-22', supplyChainStage: 'In Pharmacies',  batchStatus: 'Active',      currentLocation: 'Al Nasr Pharmacy Branch',   caseAlerts: 1, createdBy: 'Ahmed Kamal',    createdAt: '2024-03-22 10:05', updatedAt: '2024-06-10 11:15' },
  { id: 'BAT003', productName: 'Ibuprofen 400mg',    gtin: '6224001009012', dosageForm: 'Capsule',   strength: '400mg',  requiresColdChain: false, productStatus: 'Pending',  manufacturer: 'Sedico Pharmaceutical', factoryName: 'Sedico - 6th of October',  quantity: 4200, batchLotNo: 'LOT-2024-0115', productionDate: '2024-01-15', expiryDate: '2025-01-15', supplyChainStage: 'In Supply Chain',batchStatus: 'Quarantined', currentLocation: 'In Transit - Alexandria Rd',caseAlerts: 3, createdBy: 'Saif Hassan',    createdAt: '2024-01-15 08:40', updatedAt: '2024-06-08 09:00' },
  { id: 'BAT004', productName: 'Azithromycin Syrup', gtin: '6224001003456', dosageForm: 'Syrup',     strength: '200mg/5ml', requiresColdChain: true, productStatus: 'Approved', manufacturer: 'Pharco Pharmaceuticals',factoryName: 'Pharco - Amreya',         quantity: 2500, batchLotNo: 'LOT-2024-0409', productionDate: '2024-04-09', expiryDate: '2025-10-09', supplyChainStage: 'In Prospection', batchStatus: 'Active',      currentLocation: 'Quality Control Lab',       caseAlerts: 0, createdBy: 'Yehia Fathy',    createdAt: '2024-04-09 13:20', updatedAt: '2024-06-01 16:45' },
  { id: 'BAT005', productName: 'Insulin Glargine',   gtin: '6224001007890', dosageForm: 'Injection', strength: '100IU/ml', requiresColdChain: true, productStatus: 'Approved', manufacturer: 'Novo Nordisk Egypt',    factoryName: 'Novo Nordisk - Cairo',     quantity: 1200, batchLotNo: 'LOT-2024-0501', productionDate: '2024-05-01', expiryDate: '2025-05-01', supplyChainStage: 'In Warehouse',   batchStatus: 'Recalled',    currentLocation: 'Delta Medical Storage',     caseAlerts: 5, createdBy: 'Nour Adel',      createdAt: '2024-05-01 07:55', updatedAt: '2024-06-12 12:10' },
  { id: 'BAT006', productName: 'Cefixime 200mg',     gtin: '6224001002345', dosageForm: 'Tablet',    strength: '200mg',  requiresColdChain: false, productStatus: 'Approved', manufacturer: 'EIPICO Factory',       factoryName: 'EIPICO - 10th of Ramadan', quantity: 6000, batchLotNo: 'LOT-2023-1128', productionDate: '2023-11-28', expiryDate: '2024-11-28', supplyChainStage: 'In Pharmacies',  batchStatus: 'Expired',     currentLocation: 'Giza Distribution Center',  caseAlerts: 2, createdBy: 'Mossad Ali',     createdAt: '2023-11-28 09:30', updatedAt: '2024-05-20 10:00' },
  { id: 'BAT007', productName: 'Vitamin C Effervescent', gtin: '6224001008901', dosageForm: 'Tablet',strength: '1000mg', requiresColdChain: false, productStatus: 'Approved', manufacturer: 'Global Napi Pharma',   factoryName: 'Global Napi - Giza',       quantity: 9000, batchLotNo: 'LOT-2024-0618', productionDate: '2024-06-18', expiryDate: '2027-06-18', supplyChainStage: 'In Supply Chain',batchStatus: 'Active',      currentLocation: 'In Transit - Delta Rd',     caseAlerts: 0, createdBy: 'Mona Youssef',   createdAt: '2024-06-18 15:00', updatedAt: '2024-06-19 08:20' },
];

const UNIT_SUMMARY_BY_BATCH = {
  BAT001: { total: 5000, generated: 5000, inWarehouse: 3200, inPharmacy: 1750, suspicious: 12, blocked: 3,  recalled: 0,   scans: 4890 },
  BAT002: { total: 8000, generated: 8000, inWarehouse: 900,  inPharmacy: 6800, suspicious: 40, blocked: 8,  recalled: 0,   scans: 12210 },
  BAT003: { total: 4200, generated: 4200, inWarehouse: 4200, inPharmacy: 0,    suspicious: 88, blocked: 60, recalled: 0,   scans: 310 },
  BAT004: { total: 2500, generated: 2100, inWarehouse: 0,    inPharmacy: 0,    suspicious: 2,  blocked: 0,  recalled: 0,   scans: 15 },
  BAT005: { total: 1200, generated: 1200, inWarehouse: 400,  inPharmacy: 300,  suspicious: 25, blocked: 15, recalled: 460, scans: 2870 },
  BAT006: { total: 6000, generated: 6000, inWarehouse: 0,    inPharmacy: 5100, suspicious: 30, blocked: 10, recalled: 0,   scans: 9040 },
  BAT007: { total: 9000, generated: 9000, inWarehouse: 9000, inPharmacy: 0,    suspicious: 0,  blocked: 0,  recalled: 0,   scans: 120 },
};

const SHIPMENTS_BY_BATCH = {
  BAT001: [
    { transferCode: 'TRX-88012', shipmentType: 'Factory → Warehouse', source: 'EIPICO - 10th of Ramadan', destination: 'Cairo Central Warehouse', expectedQuantity: 5000, receivedQuantity: 5000, shipmentStatus: 'Delivered', dispatchDate: '2024-02-11', receivedDate: '2024-02-13' },
  ],
  BAT002: [
    { transferCode: 'TRX-88240', shipmentType: 'Factory → Warehouse', source: 'Global Napi - Giza', destination: 'Giza Distribution Center', expectedQuantity: 8000, receivedQuantity: 8000, shipmentStatus: 'Delivered', dispatchDate: '2024-03-23', receivedDate: '2024-03-25' },
    { transferCode: 'TRX-88512', shipmentType: 'Warehouse → Pharmacy', source: 'Giza Distribution Center', destination: 'Al Nasr Pharmacy Branch', expectedQuantity: 7000, receivedQuantity: 6800, shipmentStatus: 'Partial', dispatchDate: '2024-04-02', receivedDate: '2024-04-04' },
  ],
  BAT003: [
    { transferCode: 'TRX-88601', shipmentType: 'Factory → Warehouse', source: 'Sedico - 6th of October', destination: 'Alexandria Storage', expectedQuantity: 4200, receivedQuantity: 0, shipmentStatus: 'In Transit', dispatchDate: '2024-06-05', receivedDate: null },
  ],
  BAT004: [],
  BAT005: [
    { transferCode: 'TRX-87990', shipmentType: 'Factory → Warehouse', source: 'Novo Nordisk - Cairo', destination: 'Delta Medical Storage', expectedQuantity: 1200, receivedQuantity: 1200, shipmentStatus: 'Delivered', dispatchDate: '2024-05-02', receivedDate: '2024-05-03' },
    { transferCode: 'TRX-89115', shipmentType: 'Warehouse → Pharmacy', source: 'Delta Medical Storage', destination: 'Delta Pharmacy Network', expectedQuantity: 500, receivedQuantity: 300, shipmentStatus: 'Delayed', dispatchDate: '2024-05-20', receivedDate: null },
  ],
  BAT006: [
    { transferCode: 'TRX-86220', shipmentType: 'Factory → Warehouse', source: 'EIPICO - 10th of Ramadan', destination: 'Giza Distribution Center', expectedQuantity: 6000, receivedQuantity: 6000, shipmentStatus: 'Delivered', dispatchDate: '2023-11-29', receivedDate: '2023-12-01' },
  ],
  BAT007: [
    { transferCode: 'TRX-89340', shipmentType: 'Factory → Warehouse', source: 'Global Napi - Giza', destination: 'In Transit - Delta Rd', expectedQuantity: 9000, receivedQuantity: 0, shipmentStatus: 'In Transit', dispatchDate: '2024-06-19', receivedDate: null },
  ],
};

const INVENTORY_BY_BATCH = {
  BAT001: [
    { holderType: 'Warehouse', holderName: 'Cairo Central Warehouse', totalReceivedQuantity: 5000, availableQuantity: 3200, reservedQuantity: 400, quarantinedQuantity: 0, inventoryStatus: 'Ok', lastUpdated: '2024-06-02' },
  ],
  BAT002: [
    { holderType: 'Warehouse', holderName: 'Giza Distribution Center', totalReceivedQuantity: 8000, availableQuantity: 900,  reservedQuantity: 300, quarantinedQuantity: 0, inventoryStatus: 'Low', lastUpdated: '2024-06-10' },
    { holderType: 'Pharmacy',  holderName: 'Al Nasr Pharmacy Branch',  totalReceivedQuantity: 6800, availableQuantity: 6800, reservedQuantity: 0,   quarantinedQuantity: 0, inventoryStatus: 'Ok',  lastUpdated: '2024-06-10' },
  ],
  BAT003: [
    { holderType: 'Warehouse', holderName: 'Alexandria Storage', totalReceivedQuantity: 4200, availableQuantity: 0, reservedQuantity: 0, quarantinedQuantity: 4200, inventoryStatus: 'Critical', lastUpdated: '2024-06-08' },
  ],
  BAT004: [],
  BAT005: [
    { holderType: 'Warehouse', holderName: 'Delta Medical Storage',   totalReceivedQuantity: 1200, availableQuantity: 400, reservedQuantity: 0, quarantinedQuantity: 460, inventoryStatus: 'Critical', lastUpdated: '2024-06-12' },
    { holderType: 'Pharmacy',  holderName: 'Delta Pharmacy Network',  totalReceivedQuantity: 300,  availableQuantity: 300, reservedQuantity: 0, quarantinedQuantity: 0,   inventoryStatus: 'Low',      lastUpdated: '2024-05-20' },
  ],
  BAT006: [
    { holderType: 'Pharmacy', holderName: 'Giza Distribution Center', totalReceivedQuantity: 6000, availableQuantity: 900, reservedQuantity: 0, quarantinedQuantity: 0, inventoryStatus: 'Ok', lastUpdated: '2024-05-20' },
  ],
  BAT007: [
    { holderType: 'Warehouse', holderName: 'In Transit - Delta Rd', totalReceivedQuantity: 0, availableQuantity: 0, reservedQuantity: 0, quarantinedQuantity: 0, inventoryStatus: 'Ok', lastUpdated: '2024-06-19' },
  ],
};

const ALERTS_BY_BATCH = {
  BAT001: [],
  BAT002: [
    { alertType: 'Suspicious Scan',   severity: 'Medium', message: 'Multiple scans of the same unit code detected within 2 minutes.', alertStatus: 'Investigating', createdAt: '2024-06-09', resolvedAt: null },
  ],
  BAT003: [
    { alertType: 'Cold Chain Issue',  severity: 'High',   message: 'Temperature excursion recorded during transit near Alexandria.',   alertStatus: 'Open',          createdAt: '2024-06-06', resolvedAt: null },
    { alertType: 'Quantity Mismatch', severity: 'High',   message: 'Received quantity does not match expected quantity on manifest.',  alertStatus: 'Open',          createdAt: '2024-06-07', resolvedAt: null },
    { alertType: 'Duplicate Serial',  severity: 'Medium', message: 'Duplicate unit code scanned at two different locations.',           alertStatus: 'Resolved',      createdAt: '2024-06-05', resolvedAt: '2024-06-06' },
  ],
  BAT004: [],
  BAT005: [
    { alertType: 'Recall Notice',     severity: 'Critical', message: 'Batch recalled due to reported adverse reactions.',               alertStatus: 'Open',          createdAt: '2024-06-12', resolvedAt: null },
    { alertType: 'Cold Chain Issue',  severity: 'High',     message: 'Storage unit temperature breach at Delta Medical Storage.',        alertStatus: 'Resolved',      createdAt: '2024-05-25', resolvedAt: '2024-05-26' },
  ],
  BAT006: [
    { alertType: 'Expiry Warning',    severity: 'Medium', message: 'Batch has passed its expiry date and is still marked in circulation.', alertStatus: 'Open', createdAt: '2024-05-01', resolvedAt: null },
  ],
  BAT007: [],
};

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

const StatCard = ({ label, value, icon: Icon }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F0F0F0', flex: 1, minWidth: 0 }}>
    <div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</div>
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

const RecallModal = ({ item, onClose, onConfirm }) => {
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
          This will mark <strong>{item?.id}</strong> ({item?.productName}) as recalled and notify all holders in the supply chain.
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

// ─── Details Drawer building blocks ────────────────────────────────────────────

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
    <div style={{ fontSize: 18, fontWeight: 700, color: tone || '#111827' }}>{Number(value).toLocaleString()}</div>
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

const BatchDetailsModal = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!item) return null;
  const unitSummary = UNIT_SUMMARY_BY_BATCH[item.id] || {};
  const shipments   = SHIPMENTS_BY_BATCH[item.id]   || [];
  const inventory   = INVENTORY_BY_BATCH[item.id]   || [];
  const alerts      = ALERTS_BY_BATCH[item.id]      || [];

  const tabCounts = {
    shipments: shipments.length,
    inventory: inventory.length,
    alerts:    alerts.length,
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
              <div style={{ fontWeight: 700, fontSize: 19, color: '#111827' }}>{item.productName}</div>
              <BatchStatusBadge status={item.batchStatus} />
              {item.caseAlerts > 0 && <CaseAlertsBadge count={item.caseAlerts} />}
            </div>
            <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 5 }}>{item.id} · Batch {item.batchLotNo} · {item.factoryName}</div>
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

        {/* Scrollable body — only the active tab is rendered */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }}>

          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
              <div>
                <SectionTitle>Product Information</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <InfoField label="Product Name" value={item.productName} />
                  <InfoField label="GTIN" value={item.gtin} />
                  <InfoField label="Dosage Form" value={item.dosageForm} />
                  <InfoField label="Strength" value={item.strength} />
                  <InfoField label="Requires Cold Chain" value={item.requiresColdChain ? 'Yes' : 'No'} />
                  <InfoField label="Product Status" value={<GenericBadge status={item.productStatus} />} />
                </div>
              </div>

              <div>
                <SectionTitle>Batch Information</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <InfoField label="Batch Number" value={item.batchLotNo} />
                  <InfoField label="Factory Name" value={item.factoryName} />
                  <InfoField label="Quantity" value={item.quantity?.toLocaleString()} />
                  <InfoField label="Manufacturing Date" value={item.productionDate} />
                  <InfoField label="Expiry Date" value={item.expiryDate} />
                  <InfoField label="Batch Status" value={<BatchStatusBadge status={item.batchStatus} />} />
                  <InfoField label="Supply Chain Stage" value={<StageBadge status={item.supplyChainStage} />} />
                  <InfoField label="Created By" value={item.createdBy} />
                  <InfoField label="Created At" value={item.createdAt} />
                  <InfoField label="Updated At" value={item.updatedAt} />
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
                <MiniStat label="Total Unit Codes" value={unitSummary.total ?? 0} />
                <MiniStat label="Generated"         value={unitSummary.generated ?? 0} />
                <MiniStat label="In Warehouse"      value={unitSummary.inWarehouse ?? 0} />
                <MiniStat label="In Pharmacy"       value={unitSummary.inPharmacy ?? 0} />
                <MiniStat label="Suspicious"        value={unitSummary.suspicious ?? 0} tone="#B45309" />
                <MiniStat label="Blocked"           value={unitSummary.blocked ?? 0}   tone="#DC2626" />
                <MiniStat label="Recalled"          value={unitSummary.recalled ?? 0}  tone="#DC2626" />
                <MiniStat label="Total Scans"       value={unitSummary.scans ?? 0} />
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
                rows={shipments}
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
                rows={inventory}
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
                rows={alerts}
              />
            </div>
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
  const [items, setItems]                     = useState(MOCK_BATCHES);
  const [activeFilters, setActiveFilters]     = useState({ supplyChainStage: 'All', batchStatus: 'All', dosageForm: 'All' });
  const [searchQuery, setSearchQuery]         = useState('');

  const [drawerItemId, setDrawerItemId]       = useState(null);
  const [recallTarget, setRecallTarget]       = useState(null);
  const [checkedRows, setCheckedRows]         = useState({});
  const [allChecked, setAllChecked]           = useState(false);
  const [toast, setToast]                     = useState(null);
  const [loading, setLoading]                 = useState(false);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const showError = (msg) => showToast(msg, 'error');

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = items.filter(row => {
    const matchStage  = activeFilters.supplyChainStage === 'All' || row.supplyChainStage === activeFilters.supplyChainStage;
    const matchStatus = activeFilters.batchStatus       === 'All' || row.batchStatus       === activeFilters.batchStatus;
    const matchDosage = activeFilters.dosageForm        === 'All' || row.dosageForm        === activeFilters.dosageForm;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || [row.id, row.productName, row.manufacturer, row.factoryName, row.batchLotNo]
      .some(v => String(v).toLowerCase().includes(q));
    return matchStage && matchStatus && matchDosage && matchSearch;
  });

  // ── Stat totals (independent of active filters, reflect full dataset) ──────

  const stats = {
    total:        items.length,
    prospection:  items.filter(i => i.supplyChainStage === 'In Prospection').length,
    supplyChain:  items.filter(i => i.supplyChainStage === 'In Supply Chain').length,
    warehouse:    items.filter(i => i.supplyChainStage === 'In Warehouse').length,
    pharmacies:   items.filter(i => i.supplyChainStage === 'In Pharmacies').length,
  };

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
      showToast('Report exported successfully');
    } catch (err) { showError('Export failed'); }
  };

  const handleViewDetails = (item) => setDrawerItemId(item.id);

  const handleFreeze = (item) => {
    setItems(prev => prev.map(r => r.id === item.id ? { ...r, batchStatus: 'Quarantined', updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') } : r));
    showToast(`Batch ${item.id} frozen and marked as Quarantined`);
  };

  const handleRecallConfirm = (message) => {
    if (!recallTarget) return;
    const id = recallTarget.id;
    setItems(prev => prev.map(r => r.id === id ? { ...r, batchStatus: 'Recalled', caseAlerts: (r.caseAlerts || 0) + 1, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') } : r));
    if (!ALERTS_BY_BATCH[id]) ALERTS_BY_BATCH[id] = [];
    ALERTS_BY_BATCH[id] = [
      { alertType: 'Recall Notice', severity: 'Critical', message: message?.trim() || 'Batch recalled by supply chain team.', alertStatus: 'Open', createdAt: new Date().toISOString().slice(0, 10), resolvedAt: null },
      ...ALERTS_BY_BATCH[id],
    ];
    showToast(`Recall alert created for ${id}`);
    setRecallTarget(null);
  };

  const handleApplyFilters = (f) => setActiveFilters(f);
  const handleClearFilters = (f) => setActiveFilters(f);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulates re-fetching the latest data from the server
      setItems(MOCK_BATCHES);
      setActiveFilters({ supplyChainStage: 'All', batchStatus: 'All', dosageForm: 'All' });
      setSearchQuery('');
      setCheckedRows({});
      setAllChecked(false);
      setLoading(false);
      showToast('Data refreshed');
    }, 800);
  };

  const toggleAll = () => {
    if (allChecked) { setCheckedRows({}); setAllChecked(false); }
    else { const all = {}; filtered.forEach(r => { all[r.id] = true; }); setCheckedRows(all); setAllChecked(true); }
  };
  const toggleRow = (id) => setCheckedRows(p => ({ ...p, [id]: !p[id] }));

  const checkedCount = Object.values(checkedRows).filter(Boolean).length;
  const drawerItem   = items.find(i => i.id === drawerItemId) || null;

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
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
          <RefreshCw size={14} color="#6B7280" style={loading ? { animation: 'spin 0.8s linear infinite' } : undefined} />
          Refresh
        </button>
      </div>

      <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>

      {/* ── 5 Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Batches"    value={stats.total}       icon={Package} />
        <StatCard label="In Prospection"   value={stats.prospection} icon={FlaskConical} />
        <StatCard label="In Supply Chain"  value={stats.supplyChain} icon={Truck} />
        <StatCard label="In Warehouse"     value={stats.warehouse}   icon={Warehouse} />
        <StatCard label="In Pharmacies"    value={stats.pharmacies}  icon={Building2} />
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
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search product, batch, manufacturer..."
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
              {filtered.length === 0 ? (
                <tr><td colSpan={TABLE_COLUMNS.length + 2} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No records found</td></tr>
              ) : (
                filtered.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F3F4F6', background: checkedRows[row.id] ? '#F0F7FF' : '#fff' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input type="checkbox" checked={!!checkedRows[row.id]} onChange={() => toggleRow(row.id)} style={{ accentColor: '#3B82F6', width: 15, height: 15, cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '12px 10px', color: '#1D4ED8', fontWeight: 500, whiteSpace: 'nowrap' }}>{row.id}</td>
                    <td style={{ padding: '12px 10px', color: '#374151', whiteSpace: 'nowrap' }}>{row.productName}</td>
                    <td style={{ padding: '12px 10px', color: '#374151' }}>{row.dosageForm}</td>
                    <td style={{ padding: '12px 10px', color: '#374151', whiteSpace: 'nowrap' }}>{row.manufacturer}</td>
                    <td style={{ padding: '12px 10px', color: '#374151', whiteSpace: 'nowrap' }}>{row.factoryName}</td>
                    <td style={{ padding: '12px 10px', color: '#374151' }}>{row.quantity.toLocaleString()}</td>
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

        {/* Pagination info */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: 12, color: '#9CA3AF' }}>
          Showing {filtered.length} of {items.length} records
        </div>
      </div>

      {/* ── Batch Details Modal ── */}
      {drawerItemId && <BatchDetailsModal key={drawerItemId} item={drawerItem} onClose={() => setDrawerItemId(null)} />}

      {/* ── Recall Modal ── */}
      {recallTarget && <RecallModal item={recallTarget} onClose={() => setRecallTarget(null)} onConfirm={handleRecallConfirm} />}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default MedicineBatchDashboard;