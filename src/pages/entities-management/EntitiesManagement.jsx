import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Download,
  Eye,
  MoreVertical,
  X,
  Check,
  ChevronDown,
  Search,
  Factory,
  Warehouse,
  Store,
  Package,
  Boxes,
  Truck,
  Pause,
  RotateCcw,
  XCircle,
  ClipboardCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import ReviewRequestModal from './ReviewRequestModal';

// ─── Badge colors for entity status ────────────────────────────────────────

const BADGE_COLORS = {
  Active:    { bg: '#D1FAE5', color: '#059669' },
  Suspended: { bg: '#FEF3C7', color: '#B45309' },
  Inactive:  { bg: '#FEE2E2', color: '#DC2626' },
};

const Badge = ({ value }) => {
  const s = BADGE_COLORS[value] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ display: 'inline-block', padding: '3px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {value}
    </span>
  );
};

// ─── Yes/No icon cell (Has Cold Storage / QC Lab / etc.) ───────────────────

const BoolIcon = ({ value }) =>
  value ? (
    <span style={{ display: 'inline-flex', width: 20, height: 20, borderRadius: '50%', background: '#D1FAE5', alignItems: 'center', justifyContent: 'center' }}>
      <Check size={12} color="#059669" strokeWidth={3} />
    </span>
  ) : (
    <span style={{ display: 'inline-flex', width: 20, height: 20, borderRadius: '50%', background: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}>
      <X size={12} color="#DC2626" strokeWidth={3} />
    </span>
  );

// ─── Stat card (Factories / Warehouses / Pharmacies count) ────────────────

const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, active, onClick }) => {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '18px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: active ? '0 4px 16px rgba(0,67,153,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
        border: active ? '2px solid #004399' : '1px solid #F0F0F0',
        flex: 1,
        minWidth: 0,
        textAlign: 'left',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div>
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>{sub}</div>}
      </div>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={iconColor} />
      </div>
    </Wrapper>
  );
};

// ─── Mock data — one array per entity type ─────────────────────────────────

const MOCK_FACTORIES = [
  { id: 'FAC-001', factoryName: 'Delta Pharma Factory',  legalCompanyName: 'Delta Pharmaceutical Co.', dosageForms: 'Tablets, Syrups', governorate: 'Alexandria', city: '6th of October', district: 'Industrial Zone 3', fullAddress: 'Plot 14, Industrial Zone 3, 6th of October', factoryLicenseNumber: 'FL-88231', technicalLicenseNumber: 'TL-40217', commercialRegNumber: 'CR-102938', taxCardNumber: 'TX-556213', licenseIssueDate: 'Jan 09, 2022', licenseExpiryDate: 'Jan 09, 2027', hasColdStorage: true,  qcLab: true,  hasFinishedGoodsStore: true, hasQuarantineArea: true, totalBatches: 45, factoryStatus: 'Active',    createdAt: 'May 16, 2024', updatedAt: 'Jun 20, 2026' },
  { id: 'FAC-002', factoryName: 'EIPICO Factory',        legalCompanyName: 'EIPICO Pharmaceutical',    dosageForms: 'Capsules, Injectables', governorate: 'Port Said',  city: 'Cairo',          district: 'Industrial Area 1', fullAddress: 'Plot 2, Industrial Area 1, Cairo', factoryLicenseNumber: 'FL-77120', technicalLicenseNumber: 'TL-30119', commercialRegNumber: 'CR-88213', taxCardNumber: 'TX-441209', licenseIssueDate: 'Dec 15, 2021', licenseExpiryDate: 'Dec 15, 2026', hasColdStorage: true,  qcLab: true,  hasFinishedGoodsStore: true, hasQuarantineArea: true, totalBatches: 38, factoryStatus: 'Active',    createdAt: 'May 13, 2024', updatedAt: 'Jun 18, 2026' },
  { id: 'FAC-003', factoryName: 'Misr Co. for Pharma',   legalCompanyName: 'Misr Pharmaceutical Co.',  dosageForms: 'Tablets', governorate: 'Sokhna',     city: 'Giza',           district: 'New Sokhna Zone', fullAddress: 'Plot 9, New Sokhna Zone, Giza', factoryLicenseNumber: 'FL-55391', technicalLicenseNumber: 'TL-20981', commercialRegNumber: 'CR-77621', taxCardNumber: 'TX-330192', licenseIssueDate: 'Mar 20, 2021', licenseExpiryDate: 'Mar 20, 2026', hasColdStorage: false, qcLab: true,  hasFinishedGoodsStore: false, hasQuarantineArea: true, totalBatches: 12, factoryStatus: 'Suspended', createdAt: 'May 11, 2024', updatedAt: 'Jun 02, 2026' },
  { id: 'FAC-004', factoryName: 'Upper Egypt Factory',   legalCompanyName: 'Upper Egypt Pharma',       dosageForms: 'Syrups, Ointments', governorate: 'Damietta',   city: 'Assiut',         district: 'Industrial Zone 2', fullAddress: 'Plot 5, Industrial Zone 2, Assiut', factoryLicenseNumber: 'FL-90124', technicalLicenseNumber: 'TL-51023', commercialRegNumber: 'CR-99841', taxCardNumber: 'TX-772013', licenseIssueDate: 'Jun 30, 2022', licenseExpiryDate: 'Jun 30, 2027', hasColdStorage: true,  qcLab: true,  hasFinishedGoodsStore: true, hasQuarantineArea: false, totalBatches: 22, factoryStatus: 'Active',    createdAt: 'May 10, 2024', updatedAt: 'Jun 25, 2026' },
  { id: 'FAC-005', factoryName: 'Alexandria Medicines',  legalCompanyName: 'Alexandria Medicines Co.', dosageForms: 'Tablets, Capsules', governorate: 'Alexandria', city: 'Alexandria',     district: 'Borg El Arab', fullAddress: 'Plot 20, Borg El Arab, Alexandria', factoryLicenseNumber: 'FL-40012', technicalLicenseNumber: 'TL-10982', commercialRegNumber: 'CR-55102', taxCardNumber: 'TX-220984', licenseIssueDate: 'Feb 18, 2021', licenseExpiryDate: 'Feb 18, 2026', hasColdStorage: true,  qcLab: false, hasFinishedGoodsStore: true, hasQuarantineArea: false, totalBatches: 0,  factoryStatus: 'Inactive',  createdAt: 'Apr 28, 2024', updatedAt: 'May 30, 2026' },
];

const MOCK_WAREHOUSES = [
  { id: 'WH-001', warehouseName: 'Cairo Medical Storage', warehouseType: 'Main Warehouse',     governorate: 'Alexandria', city: '6th of October', district: 'Industrial Zone 3', fullAddress: 'Plot 14, Industrial Zone 3, 6th of October', warehouseLicenseNumber: 'WL-88231', licenseIssueDate: 'Jan 09, 2022', licenseExpiryDate: 'Jan 09, 2027', hasColdStorage: true,  hasQuarantineArea: true, hasDeliveryService: true,  totalBatches: null, factoryStatus: 'Active',    createdAt: 'May 16, 2024', updatedAt: 'Jun 20, 2026' },
  { id: 'WH-002', warehouseName: 'Port Said Distribution',warehouseType: 'Regional Warehouse', governorate: 'Port Said',  city: 'Cairo',          district: 'Industrial Area 1', fullAddress: 'Plot 2, Industrial Area 1, Cairo', warehouseLicenseNumber: 'WL-77120', licenseIssueDate: 'Dec 15, 2021', licenseExpiryDate: 'Dec 15, 2026', hasColdStorage: true,  hasQuarantineArea: true, hasDeliveryService: true,  totalBatches: null, factoryStatus: 'Active',    createdAt: 'May 13, 2024', updatedAt: 'Jun 18, 2026' },
  { id: 'WH-003', warehouseName: 'Assiut Central Warehouse', warehouseType: 'Main Warehouse',  governorate: 'Sokhna',     city: 'Giza',           district: 'New Sokhna Zone', fullAddress: 'Plot 9, New Sokhna Zone, Giza', warehouseLicenseNumber: 'WL-55391', licenseIssueDate: 'Mar 20, 2021', licenseExpiryDate: 'Mar 20, 2026', hasColdStorage: false, hasQuarantineArea: false, hasDeliveryService: false, totalBatches: null, factoryStatus: 'Suspended', createdAt: 'May 11, 2024', updatedAt: 'Jun 02, 2026' },
  { id: 'WH-004', warehouseName: 'Delta Storage Warehouse',warehouseType: 'Regional Warehouse',governorate: 'Damietta',   city: 'Assiut',         district: 'Industrial Zone 2', fullAddress: 'Plot 5, Industrial Zone 2, Assiut', warehouseLicenseNumber: 'WL-90124', licenseIssueDate: 'Jun 30, 2022', licenseExpiryDate: 'Jun 30, 2027', hasColdStorage: true,  hasQuarantineArea: true, hasDeliveryService: true,  totalBatches: null, factoryStatus: 'Active',    createdAt: 'May 10, 2024', updatedAt: 'Jun 25, 2026' },
  { id: 'WH-005', warehouseName: 'Alex Warehouse',        warehouseType: 'Main Warehouse',     governorate: 'Alexandria', city: 'Alexandria',     district: 'Borg El Arab', fullAddress: 'Plot 20, Borg El Arab, Alexandria', warehouseLicenseNumber: 'WL-40012', licenseIssueDate: 'Feb 18, 2021', licenseExpiryDate: 'Feb 18, 2026', hasColdStorage: true,  hasQuarantineArea: false, hasDeliveryService: true,  totalBatches: null, factoryStatus: 'Inactive',  createdAt: 'Apr 28, 2024', updatedAt: 'May 30, 2026' },
];

const MOCK_PHARMACIES = [
  { id: 'PH-001', pharmacyName: 'Alexandria Drug Store', pharmacyType: 'Retail Pharmacy', governorate: 'Alexandria', city: 'Alexandria', district: 'Roushdy', fullAddress: '12 El Horreya St, Roushdy, Alexandria', defaultWarehouse: 'Alex Warehouse',       pharmacyLicenseNumber: 'PL-88231', licenseIssueDate: 'Jan 09, 2022', licenseExpiryDate: 'Jan 09, 2027', syndicateId: 'SYN-40217', hasColdStorage: true,  factoryStatus: 'Active',    createdAt: 'May 16, 2024', updatedAt: 'Jun 20, 2026' },
  { id: 'PH-002', pharmacyName: 'Mansoura Pharmacy',     pharmacyType: 'Retail Pharmacy', governorate: 'Dakahlia',   city: 'Mansoura',    district: 'Toriel',  fullAddress: '5 El Gomhoreya St, Toriel, Mansoura', defaultWarehouse: 'Cairo Medical Storage',pharmacyLicenseNumber: 'PL-77120', licenseIssueDate: 'Dec 15, 2021', licenseExpiryDate: 'Dec 15, 2026', syndicateId: 'SYN-30119', hasColdStorage: true,  factoryStatus: 'Active',    createdAt: 'May 13, 2024', updatedAt: 'Jun 18, 2026' },
  { id: 'PH-003', pharmacyName: 'Giza City Pharmacy',    pharmacyType: 'Retail Pharmacy', governorate: 'Giza',       city: 'Giza',        district: 'Dokki',   fullAddress: '3 Tahrir St, Dokki, Giza', defaultWarehouse: 'Cairo Medical Storage',pharmacyLicenseNumber: 'PL-55391', licenseIssueDate: 'Mar 20, 2021', licenseExpiryDate: 'Mar 20, 2026', syndicateId: 'SYN-20981', hasColdStorage: false, factoryStatus: 'Suspended', createdAt: 'May 11, 2024', updatedAt: 'Jun 02, 2026' },
  { id: 'PH-004', pharmacyName: 'Heliopolis Pharmacy',   pharmacyType: 'Retail Pharmacy', governorate: 'Cairo',      city: 'Cairo',       district: 'Heliopolis', fullAddress: '18 Baghdad St, Heliopolis, Cairo', defaultWarehouse: 'Cairo Medical Storage',pharmacyLicenseNumber: 'PL-90124', licenseIssueDate: 'Jun 30, 2022', licenseExpiryDate: 'Jun 30, 2027', syndicateId: 'SYN-51023', hasColdStorage: true,  factoryStatus: 'Active',    createdAt: 'May 10, 2024', updatedAt: 'Jun 25, 2026' },
  { id: 'PH-005', pharmacyName: 'Tanta Pharmacy',        pharmacyType: 'Retail Pharmacy', governorate: 'Gharbia',    city: 'Tanta',       district: 'Sobhy',   fullAddress: '7 Sobhy St, Tanta', defaultWarehouse: 'Delta Storage Warehouse', pharmacyLicenseNumber: 'PL-40012', licenseIssueDate: 'Feb 18, 2021', licenseExpiryDate: 'Feb 18, 2026', syndicateId: 'SYN-10982', hasColdStorage: true, factoryStatus: 'Inactive', createdAt: 'Apr 28, 2024', updatedAt: 'May 30, 2026' },
];

// ─── Status action config (Suspend / Reactivate / Set Inactive) ───────────

const STATUS_ACTION_LABELS = { suspend: 'Suspend', reactivate: 'Reactivate', setInactive: 'Set Inactive' };
const STATUS_ACTION_ICONS  = { suspend: Pause, reactivate: RotateCcw, setInactive: XCircle };
const STATUS_ACTION_COLORS = { suspend: '#B45309', reactivate: '#059669', setInactive: '#DC2626' };
const STATUS_ACTION_TARGET = { suspend: 'Suspended', reactivate: 'Active', setInactive: 'Inactive' };
const STATUS_ACTION_VERB   = { suspend: 'suspended', reactivate: 'reactivated', setInactive: 'set to inactive' };

const getStatusActions = (status) => {
  if (status === 'Active')    return ['suspend', 'setInactive'];
  if (status === 'Suspended') return ['reactivate', 'setInactive'];
  if (status === 'Inactive')  return ['reactivate'];
  return ['suspend', 'setInactive'];
};

// ─── Tab configuration — drives table title, columns, filters, actions & profile drawer ──

const TAB_CONFIG = [
  {
    key: 'factories',
    label: 'Factories',
    singular: 'Factory',
    icon: Factory,
    iconBg: '#EFF6FF',
    iconColor: '#004399',
    nameField: 'factoryName',
    searchFields: ['factoryName', 'legalCompanyName', 'city', 'governorate'],
    columns: [
      { key: 'factoryName',        label: 'Factory Name' },
      { key: 'legalCompanyName',   label: 'Legal Company Name' },
      { key: 'governorate',        label: 'Governorate' },
      { key: 'city',               label: 'City' },
      { key: 'licenseExpiryDate',  label: 'License Expiry Date' },
      { key: 'hasColdStorage',     label: 'Has Cold Storage', bool: true },
      { key: 'qcLab',              label: 'QC Lab', bool: true },
      { key: 'totalBatches',       label: 'Total Batches' },
      { key: 'factoryStatus',      label: 'Factory Status', badge: true },
      { key: 'createdAt',          label: 'Created At' },
    ],
    filterFields: ['governorate', 'factoryStatus'],
    secondaryActions: [
      { key: 'viewBatches', label: 'View Batches', icon: Package },
    ],
    profileSections: [
      { title: 'Identity', fields: [
        { key: 'factoryName',       label: 'Official Factory Name' },
        { key: 'legalCompanyName',  label: 'Legal Company Name' },
        { key: 'dosageForms',       label: 'Dosage Forms Produced' },
      ]},
      { title: 'Location', fields: [
        { key: 'governorate',  label: 'Governorate' },
        { key: 'city',         label: 'City' },
        { key: 'district',     label: 'District / Area' },
        { key: 'fullAddress',  label: 'Full Address' },
      ]},
      { title: 'Licensing', fields: [
        { key: 'factoryLicenseNumber',    label: 'Factory License Number' },
        { key: 'technicalLicenseNumber',  label: 'Technical Operating License Number' },
        { key: 'commercialRegNumber',     label: 'Commercial Registration Number' },
        { key: 'taxCardNumber',           label: 'Tax Card Number' },
        { key: 'licenseIssueDate',        label: 'License Issue Date' },
        { key: 'licenseExpiryDate',       label: 'License Expiry Date' },
      ]},
      { title: 'Capabilities', fields: [
        { key: 'qcLab',                 label: 'Has Quality Control Lab?', bool: true },
        { key: 'hasFinishedGoodsStore', label: 'Has Finished Goods Store?', bool: true },
        { key: 'hasColdStorage',        label: 'Has Cold Storage?', bool: true },
        { key: 'hasQuarantineArea',     label: 'Has Quarantine Area?', bool: true },
      ]},
      { title: 'Status', fields: [
        { key: 'factoryStatus', label: 'Factory Status', badge: true },
        { key: 'createdAt',     label: 'Created At' },
        { key: 'updatedAt',     label: 'Updated At' },
      ]},
    ],
  },
  {
    key: 'warehouses',
    label: 'Warehouses',
    singular: 'Warehouse',
    icon: Warehouse,
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    nameField: 'warehouseName',
    searchFields: ['warehouseName', 'warehouseType', 'city', 'governorate'],
    columns: [
      { key: 'warehouseName',      label: 'Warehouse Name' },
      { key: 'warehouseType',      label: 'Warehouse Type' },
      { key: 'governorate',        label: 'Governorate' },
      { key: 'city',               label: 'City' },
      { key: 'licenseExpiryDate',  label: 'License Expiry Date' },
      { key: 'hasColdStorage',     label: 'Has Cold Storage', bool: true },
      { key: 'factoryStatus',      label: 'Factory Status', badge: true },
      { key: 'createdAt',          label: 'Created At' },
    ],
    filterFields: ['warehouseType', 'factoryStatus'],
    secondaryActions: [
      { key: 'viewInventory', label: 'View Inventory Summary', icon: Boxes },
      { key: 'viewShipments',  label: 'View Related Shipments', icon: Truck },
    ],
    profileSections: [
      { title: 'Identity', fields: [
        { key: 'warehouseName', label: 'Official Warehouse Name' },
        { key: 'warehouseType', label: 'Warehouse Type' },
      ]},
      { title: 'Location', fields: [
        { key: 'governorate',  label: 'Governorate' },
        { key: 'city',         label: 'City' },
        { key: 'district',     label: 'District / Area' },
        { key: 'fullAddress',  label: 'Full Address' },
      ]},
      { title: 'Licensing', fields: [
        { key: 'warehouseLicenseNumber', label: 'Warehouse License Number' },
        { key: 'licenseIssueDate',       label: 'License Issue Date' },
        { key: 'licenseExpiryDate',      label: 'License Expiry Date' },
      ]},
      { title: 'Capabilities', fields: [
        { key: 'hasColdStorage',    label: 'Has Cold Storage?', bool: true },
        { key: 'hasQuarantineArea', label: 'Has Quarantine Area?', bool: true },
        { key: 'hasDeliveryService',label: 'Has Delivery Service?', bool: true },
      ]},
      { title: 'Status', fields: [
        { key: 'factoryStatus', label: 'Warehouse Status', badge: true },
        { key: 'createdAt',     label: 'Created At' },
        { key: 'updatedAt',     label: 'Updated At' },
      ]},
    ],
  },
  {
    key: 'pharmacies',
    label: 'Pharmacies',
    singular: 'Pharmacy',
    icon: Store,
    iconBg: '#FEF2F2',
    iconColor: '#DC2626',
    nameField: 'pharmacyName',
    searchFields: ['pharmacyName', 'pharmacyType', 'governorate'],
    columns: [
      { key: 'pharmacyName',       label: 'Pharmacy Name' },
      { key: 'pharmacyType',       label: 'Pharmacy Type' },
      { key: 'governorate',        label: 'Governorate' },
      { key: 'defaultWarehouse',   label: 'Default Warehouse' },
      { key: 'licenseExpiryDate',  label: 'License Expiry Date' },
      { key: 'hasColdStorage',     label: 'Has Cold Storage', bool: true },
      { key: 'factoryStatus',      label: 'Factory Status', badge: true },
      { key: 'createdAt',          label: 'Created At' },
    ],
    filterFields: ['governorate', 'factoryStatus'],
    secondaryActions: [
      { key: 'viewInventory',         label: 'View Inventory Summary', icon: Boxes },
      { key: 'viewReceivedShipments', label: 'View Received Shipments', icon: Truck },
    ],
    profileSections: [
      { title: 'Identity', fields: [
        { key: 'pharmacyName', label: 'Official Pharmacy Name' },
        { key: 'pharmacyType', label: 'Pharmacy Type' },
      ]},
      { title: 'Location', fields: [
        { key: 'governorate',  label: 'Governorate' },
        { key: 'city',         label: 'City' },
        { key: 'district',     label: 'District / Area' },
        { key: 'fullAddress',  label: 'Full Address' },
      ]},
      { title: 'Operations', fields: [
        { key: 'defaultWarehouse', label: 'Default Warehouse' },
        { key: 'hasColdStorage',   label: 'Has Cold Storage?', bool: true },
      ]},
      { title: 'Licensing', fields: [
        { key: 'pharmacyLicenseNumber', label: 'Pharmacy License Number' },
        { key: 'licenseIssueDate',      label: 'License Issue Date' },
        { key: 'licenseExpiryDate',     label: 'License Expiry Date' },
        { key: 'syndicateId',           label: 'Pharmacist Syndicate ID' },
      ]},
      { title: 'Status', fields: [
        { key: 'factoryStatus', label: 'Pharmacy Status', badge: true },
        { key: 'createdAt',     label: 'Created At' },
        { key: 'updatedAt',     label: 'Updated At' },
      ]},
    ],
  },
];

const INITIAL_DATA = {
  factories:  MOCK_FACTORIES,
  warehouses: MOCK_WAREHOUSES,
  pharmacies: MOCK_PHARMACIES,
};

const VALID_TAB_KEYS = TAB_CONFIG.map(t => t.key);

// ─── Filter dropdown (same pattern as the dashboard) ───────────────────────

const FilterDropdown = ({ tab, data, activeFilters, onApply, onClear }) => {
  const [open, setOpen]   = useState(false);
  const [local, setLocal] = useState(activeFilters);
  const ref                = useRef(null);

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

// ─── Row menu (kebab / popup) — View Profile, entity-specific views, status actions ──

const RowMenu = ({ tab, row, onViewProfile, onReviewRequest, onSecondaryAction, onStatusChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const primaryItems = [
    { key: 'viewProfile', label: 'View Profile', icon: Eye, color: '#374151', action: () => { onViewProfile(row); setOpen(false); } },
    { key: 'reviewRequest', label: 'Review Request', icon: ClipboardCheck, color: '#374151', action: () => { onReviewRequest(row); setOpen(false); } },
    ...tab.secondaryActions.map(sa => ({
      key: sa.key, label: sa.label, icon: sa.icon, color: '#374151',
      action: () => { onSecondaryAction(sa, row); setOpen(false); },
    })),
  ];

  const statusKeys = getStatusActions(row.factoryStatus);
  const statusItems = statusKeys.map(sk => ({
    key: sk,
    label: STATUS_ACTION_LABELS[sk],
    icon: STATUS_ACTION_ICONS[sk],
    color: STATUS_ACTION_COLORS[sk],
    action: () => { onStatusChange(row, STATUS_ACTION_TARGET[sk], sk); setOpen(false); },
  }));

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(p => !p); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: open ? '#004399' : '#9CA3AF', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}>
        <MoreVertical size={16} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 200, overflow: 'hidden' }}>
          {primaryItems.map(({ key, label, icon: Icon, color, action }) => (
            <button key={key} onClick={action}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', border: 'none', background: 'none', fontSize: 13, color, cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <Icon size={14} />{label}
            </button>
          ))}
          {statusItems.length > 0 && (
            <div style={{ borderTop: '1px solid #F3F4F6' }}>
              {statusItems.map(({ key, label, icon: Icon, color, action }) => (
                <button key={key} onClick={action}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', border: 'none', background: 'none', fontSize: 13, color, cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <Icon size={14} />{label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Profile drawer — sectioned fields per entity type ─────────────────────

const ProfileDrawer = ({ tab, item, onClose }) => {
  if (!item) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 400, background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', padding: 24, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{tab.singular} Profile</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            <X size={15} />
          </button>
        </div>
        {tab.profileSections.map((section, si) => (
          <div key={section.title} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#004399', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #F0F0F0' }}>
              {section.title}
            </div>
            {section.fields.map(({ key, label, badge, bool }) => {
              const value = item[key];
              if (value === undefined || value === null || value === '') return null;
              return (
                <div key={key} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, marginBottom: 5 }}>{label}</div>
                  {badge ? <Badge value={value} /> : bool ? <BoolIcon value={value} /> : <div style={{ fontSize: 14, color: '#111827' }}>{value}</div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Toast ──────────────────────────────────────────────────────────────────

const TOAST_STYLES = {
  success: { bg: '#D1FAE5', color: '#065F46' },
  error:   { bg: '#FEE2E2', color: '#DC2626' },
  info:    { bg: '#EFF6FF', color: '#004399' },
};

const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  const s = TOAST_STYLES[type] || TOAST_STYLES.success;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, background: s.bg, color: s.color, padding: '12px 18px', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: 13, fontWeight: 500, maxWidth: 320 }}>
      {message}
    </div>
  );
};

// ─── Main component ─────────────────────────────────────────────────────────

const EntitiesManagement = () => {
  // ✅ الـ tab دلوقتي بيتقرأ من الرابط (?tab=factories / warehouses / pharmacies)
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = VALID_TAB_KEYS.includes(searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'factories';

  const [activeTabKey, setActiveTabKey] = useState(initialTab);
  const [allData, setAllData]           = useState(INITIAL_DATA);
  const [search, setSearch]             = useState('');
  const [filtersByTab, setFiltersByTab] = useState(
    Object.fromEntries(TAB_CONFIG.map(t => [t.key, Object.fromEntries(t.filterFields.map(f => [f, 'All']))]))
  );

  const [drawerItem, setDrawerItem]     = useState(null);
  const [reviewItem, setReviewItem]     = useState(null);
  const [toast, setToast]               = useState(null);
  const [checkedRows, setCheckedRows]   = useState({});
  const [allChecked, setAllChecked]     = useState(false);

  const activeTab  = TAB_CONFIG.find(t => t.key === activeTabKey);
  const activeData = allData[activeTabKey];
  const filters    = filtersByTab[activeTabKey];

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const showError = (msg) => showToast(msg, 'error');

  // ── Reset search + selection when switching tabs ───────────────────────
  useEffect(() => { setSearch(''); setCheckedRows({}); setAllChecked(false); }, [activeTabKey]);

  // ✅ يتابع أي تغيير في ?tab= جاي من برة (زي الضغط على صورة في HomePage
  // وإنت أصلاً واقف في نفس الصفحة، فمفيش remount كامل للكومبوننت)
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && VALID_TAB_KEYS.includes(tabFromUrl) && tabFromUrl !== activeTabKey) {
      setActiveTabKey(tabFromUrl);
    }
  }, [searchParams]);

  // ✅ يخلي تغيير التاب من جوه الصفحة يحدث الرابط برضو، عشان يفضلوا متزامنين
  const changeTab = (key) => {
    setActiveTabKey(key);
    setSearchParams({ tab: key });
  };

  const checkedCount = Object.values(checkedRows).filter(Boolean).length;

  // ── Filtering + search ─────────────────────────────────────────────────
  const filteredData = activeData
    .filter(row => activeTab.filterFields.every(f => !filters[f] || filters[f] === 'All' || row[f] === filters[f]))
    .filter(row => !search || activeTab.searchFields.some(f => String(row[f] || '').toLowerCase().includes(search.toLowerCase())));

  // ── Handlers ───────────────────────────────────────────────────────────

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

  const toggleAll = () => {
    if (allChecked) { setCheckedRows({}); setAllChecked(false); }
    else { const all = {}; filteredData.forEach(r => { all[r.id] = true; }); setCheckedRows(all); setAllChecked(true); }
  };
  const toggleRow = (id) => setCheckedRows(p => ({ ...p, [id]: !p[id] }));

  const handleSecondaryAction = (sa, row) => {
    showToast(`${sa.label} — coming soon`, 'info');
  };

  const handleStatusChange = (row, newStatus, actionKey) => {
    setAllData(prev => ({
      ...prev,
      [activeTabKey]: prev[activeTabKey].map(r => r.id === row.id ? { ...r, factoryStatus: newStatus, updatedAt: 'Just now' } : r),
    }));
    showToast(`${row[activeTab.nameField]} ${STATUS_ACTION_VERB[actionKey]} successfully`);
  };

  // ── Review Request modal: opened only via the row menu button, never by clicking the row/card ──
  const handleOpenReview = (row) => setReviewItem({ tab: activeTab, row });

  const buildRequestFields = (tab, row) => {
    const fields = [];
    tab.profileSections.forEach(section => {
      section.fields.forEach(({ key, label, bool, badge }) => {
        const raw = row[key];
        if (raw === undefined || raw === null || raw === '') return;
        const value = bool ? (raw ? 'Yes' : 'No') : raw;
        fields.push([label, value]);
      });
    });
    return fields;
  };

  const buildRequestDocuments = (tab) => [
    { id: 'doc-1', name: `${tab.singular} License Certificate.pdf`, type: 'PDF', size: '1.2 MB', date: 'Jun 2026', url: null },
    { id: 'doc-2', name: 'Commercial Registration.pdf', type: 'PDF', size: '840 KB', date: 'Jun 2026', url: null },
  ];

  const handleReviewAction = (actionType, row) => {
    if (!row) return;
    if (actionType === 'approve') {
      setAllData(prev => ({ ...prev, [activeTabKey]: prev[activeTabKey].map(r => r.id === row.id ? { ...r, factoryStatus: 'Active', updatedAt: 'Just now' } : r) }));
      showToast(`${row[activeTab.nameField]} request approved`);
    } else if (actionType === 'reject') {
      setAllData(prev => ({ ...prev, [activeTabKey]: prev[activeTabKey].map(r => r.id === row.id ? { ...r, factoryStatus: 'Inactive', updatedAt: 'Just now' } : r) }));
      showToast(`${row[activeTab.nameField]} request rejected`, 'error');
    } else if (actionType === 'inspection') {
      showToast(`Inspection requested for ${row[activeTab.nameField]}`, 'info');
    }
    setReviewItem(null);
  };

  return (
    <div style={{ fontFamily: 'Inter, SF Pro, -apple-system, sans-serif', padding: '28px 32px', boxSizing: 'border-box', background: '#F8F9FB', minHeight: '100vh' }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.5px' }}>
          <span style={{ color: '#004399' }}>Entities </span>
          <span style={{ color: '#111827' }}>Management</span>
        </h1>
        <p style={{ marginTop: 8, marginBottom: 0, fontSize: 14, color: '#9CA3AF', fontWeight: 400 }}>
          Monitor and manage all imported medicine shipments
        </p>
      </div>

      {/* ── Stat cards (Factories / Warehouses / Pharmacies) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {TAB_CONFIG.map(tab => (
          <StatCard
            key={tab.key}
            label={tab.label}
            value={allData[tab.key].filter(r => r.factoryStatus === 'Active').length}
            sub={`${allData[tab.key].length} total`}
            icon={tab.icon}
            iconBg={tab.iconBg}
            iconColor={tab.iconColor}
            active={tab.key === activeTabKey}
            onClick={() => changeTab(tab.key)}
          />
        ))}
      </div>

      {/* ── Tabs (Factories | Warehouses | Pharmacies) ── */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E5E7EB', marginBottom: 20 }}>
        {TAB_CONFIG.map(tab => {
          const isActive = tab.key === activeTabKey;
          return (
            <button
              key={tab.key}
              onClick={() => changeTab(tab.key)}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '10px 2px',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#004399' : '#6B7280',
                borderBottom: isActive ? '2px solid #004399' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Table card ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{activeTab.label}</span>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patients, appointments..."
                style={{ width: 260, padding: '8px 12px 8px 34px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', outline: 'none' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <FilterDropdown
              tab={activeTab}
              data={activeData}
              activeFilters={filters}
              onApply={f => setFiltersByTab(p => ({ ...p, [activeTabKey]: f }))}
              onClear={f => setFiltersByTab(p => ({ ...p, [activeTabKey]: f }))}
            />
            <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
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
                        {col.badge ? <Badge value={row[col.key]} /> : col.bool ? <BoolIcon value={row[col.key]} /> : (row[col.key] ?? '—')}
                      </td>
                    ))}
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <RowMenu
                          tab={activeTab}
                          row={row}
                          onViewProfile={setDrawerItem}
                          onReviewRequest={handleOpenReview}
                          onSecondaryAction={handleSecondaryAction}
                          onStatusChange={handleStatusChange}
                        />
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

      {/* ── Profile drawer ── */}
      {drawerItem && <ProfileDrawer tab={activeTab} item={drawerItem} onClose={() => setDrawerItem(null)} />}

      {/* ── Review Request modal (centered, opened only via the row menu button) ── */}
      {reviewItem && (
        <ReviewRequestModal
          open={!!reviewItem}
          item={reviewItem.row}
          onClose={() => setReviewItem(null)}
          showError={showError}
          onAction={(actionType, row) => handleReviewAction(actionType, row)}
          entityLabel={reviewItem.tab.singular}
          headerTitle={`${reviewItem.tab.singular} Registration Request`}
          requestFields={buildRequestFields(reviewItem.tab, reviewItem.row)}
          documents={buildRequestDocuments(reviewItem.tab)}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default EntitiesManagement;