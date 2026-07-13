import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Download, Eye, MoreVertical, X, Check, ChevronDown, Search,
  Factory, Warehouse, Store, Package, Boxes, Truck,
  Pause, RotateCcw, XCircle, ClipboardCheck, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import ReviewRequestModal from './ReviewRequestModal';
import { overviewService, factoryService, registrationRequestService } from '../../api/services/admin';
import { ENTITY_API } from '../entities/entitiesConfig';

// ─── Badge / BoolIcon (زي ما هما) ───────────────────────────────────────────

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

const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, active, onClick, loading }) => {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 16, padding: '18px 20px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        boxShadow: active ? '0 4px 16px rgba(0,67,153,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
        border: active ? '2px solid #004399' : '1px solid #F0F0F0', flex: 1, minWidth: 0,
        textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div>
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
          {loading ? <Loader2 size={22} className="animate-spin" /> : value}
        </div>
        {sub && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>{sub}</div>}
      </div>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={iconColor} />
      </div>
    </Wrapper>
  );
};

// ─── Status action config ───────────────────────────────────────────────────

const STATUS_ACTION_LABELS = { suspend: 'Suspend', reactivate: 'Reactivate', setInactive: 'Set Inactive' };
const STATUS_ACTION_ICONS  = { suspend: Pause, reactivate: RotateCcw, setInactive: XCircle };
const STATUS_ACTION_COLORS = { suspend: '#B45309', reactivate: '#059669', setInactive: '#DC2626' };
const STATUS_ACTION_VERB   = { suspend: 'suspended', reactivate: 'reactivated', setInactive: 'set to inactive' };

const getStatusActions = (status) => {
  if (status === 'Active')    return ['suspend', 'setInactive'];
  if (status === 'Suspended') return ['reactivate', 'setInactive'];
  if (status === 'Inactive')  return ['reactivate'];
  return ['suspend', 'setInactive'];
};

// ─── Tab configuration (نفس الـ columns/profileSections القديمة) ──────────

const TAB_CONFIG = [
  {
    key: 'factories', label: 'Factories', singular: 'Factory', icon: Factory,
    iconBg: '#EFF6FF', iconColor: '#004399', nameField: 'factoryName',
    columns: [
      { key: 'factoryName', label: 'Factory Name' },
      { key: 'legalCompanyName', label: 'Legal Company Name' },
      { key: 'governorate', label: 'Governorate' },
      { key: 'city', label: 'City' },
      // { key: 'licenseExpiryDate', label: 'License Expiry Date' },
      { key: 'hasColdStorage', label: 'Has Cold Storage', bool: true },
      { key: 'qcLab', label: 'QC Lab', bool: true },
      { key: 'totalBatches', label: 'Total Batches' },
      { key: 'factoryStatus', label: 'Factory Status', badge: true },
      { key: 'createdAt', label: 'Created At' },
    ],
    secondaryActions: [{ key: 'viewBatches', label: 'View Batches', icon: Package }],
    profileSections: [
      { title: 'Identity', fields: [
        { key: 'factoryName', label: 'Official Factory Name' },
        { key: 'legalCompanyName', label: 'Legal Company Name' },
        { key: 'dosageForms', label: 'Dosage Forms Produced' },
      ]},
      { title: 'Location', fields: [
        { key: 'governorate', label: 'Governorate' },
        { key: 'city', label: 'City' },
        { key: 'district', label: 'District / Area' },
        { key: 'fullAddress', label: 'Full Address' },
      ]},
      { title: 'Licensing', fields: [
        { key: 'factoryLicenseNumber', label: 'Factory License Number' },
        { key: 'technicalLicenseNumber', label: 'Technical Operating License Number' },
        { key: 'commercialRegNumber', label: 'Commercial Registration Number' },
        { key: 'taxCardNumber', label: 'Tax Card Number' },
        { key: 'licenseIssueDate', label: 'License Issue Date' },
        // { key: 'licenseExpiryDate', label: 'License Expiry Date' },
      ]},
      { title: 'Capabilities', fields: [
        { key: 'qcLab', label: 'Has Quality Control Lab?', bool: true },
        { key: 'hasFinishedGoodsStore', label: 'Has Finished Goods Store?', bool: true },
        { key: 'hasColdStorage', label: 'Has Cold Storage?', bool: true },
        { key: 'hasQuarantineArea', label: 'Has Quarantine Area?', bool: true },
      ]},
      { title: 'Status', fields: [
        { key: 'factoryStatus', label: 'Factory Status', badge: true },
        { key: 'createdAt', label: 'Created At' },
        { key: 'updatedAt', label: 'Updated At' },
      ]},
    ],
  },
  {
    key: 'warehouses', label: 'Warehouses', singular: 'Warehouse', icon: Warehouse,
    iconBg: '#ECFDF5', iconColor: '#059669', nameField: 'warehouseName',
    columns: [
      { key: 'warehouseName', label: 'Warehouse Name' },
      { key: 'warehouseType', label: 'Warehouse Type' },
      { key: 'governorate', label: 'Governorate' },
      { key: 'city', label: 'City' },
      // { key: 'licenseExpiryDate', label: 'License Expiry Date' },
      { key: 'hasColdStorage', label: 'Has Cold Storage', bool: true },
      { key: 'factoryStatus', label: 'Factory Status', badge: true },
      { key: 'createdAt', label: 'Created At' },
    ],
    secondaryActions: [
      { key: 'viewInventory', label: 'View Inventory Summary', icon: Boxes },
      { key: 'viewShipments', label: 'View Related Shipments', icon: Truck },
    ],
    profileSections: [
      { title: 'Identity', fields: [
        { key: 'warehouseName', label: 'Official Warehouse Name' },
        { key: 'warehouseType', label: 'Warehouse Type' },
      ]},
      { title: 'Location', fields: [
        { key: 'governorate', label: 'Governorate' },
        { key: 'city', label: 'City' },
        { key: 'district', label: 'District / Area' },
        { key: 'fullAddress', label: 'Full Address' },
      ]},
      { title: 'Licensing', fields: [
        { key: 'warehouseLicenseNumber', label: 'Warehouse License Number' },
        { key: 'licenseIssueDate', label: 'License Issue Date' },
        // { key: 'licenseExpiryDate', label: 'License Expiry Date' },
      ]},
      { title: 'Capabilities', fields: [
        { key: 'hasColdStorage', label: 'Has Cold Storage?', bool: true },
        { key: 'hasQuarantineArea', label: 'Has Quarantine Area?', bool: true },
        { key: 'hasDeliveryService', label: 'Has Delivery Service?', bool: true },
      ]},
      { title: 'Status', fields: [
        { key: 'factoryStatus', label: 'Warehouse Status', badge: true },
        { key: 'createdAt', label: 'Created At' },
        { key: 'updatedAt', label: 'Updated At' },
      ]},
    ],
  },
  {
    key: 'pharmacies', label: 'Pharmacies', singular: 'Pharmacy', icon: Store,
    iconBg: '#FEF2F2', iconColor: '#DC2626', nameField: 'pharmacyName',
    columns: [
      { key: 'pharmacyName', label: 'Pharmacy Name' },
      { key: 'pharmacyType', label: 'Pharmacy Type' },
      { key: 'governorate', label: 'Governorate' },
      { key: 'defaultWarehouse', label: 'Default Warehouse' },
      // { key: 'licenseExpiryDate', label: 'License Expiry Date' },
      { key: 'hasColdStorage', label: 'Has Cold Storage', bool: true },
      { key: 'factoryStatus', label: 'Factory Status', badge: true },
      { key: 'createdAt', label: 'Created At' },
    ],
    secondaryActions: [
      { key: 'viewInventory', label: 'View Inventory Summary', icon: Boxes },
      { key: 'viewReceivedShipments', label: 'View Received Shipments', icon: Truck },
    ],
    profileSections: [
      { title: 'Identity', fields: [
        { key: 'pharmacyName', label: 'Official Pharmacy Name' },
        { key: 'pharmacyType', label: 'Pharmacy Type' },
      ]},
      { title: 'Location', fields: [
        { key: 'governorate', label: 'Governorate' },
        { key: 'city', label: 'City' },
        { key: 'district', label: 'District / Area' },
        { key: 'fullAddress', label: 'Full Address' },
      ]},
      { title: 'Operations', fields: [
        { key: 'defaultWarehouse', label: 'Default Warehouse' },
        { key: 'hasColdStorage', label: 'Has Cold Storage?', bool: true },
      ]},
      { title: 'Licensing', fields: [
        { key: 'pharmacyLicenseNumber', label: 'Pharmacy License Number' },
        { key: 'licenseIssueDate', label: 'License Issue Date' },
        // { key: 'licenseExpiryDate', label: 'License Expiry Date' },
        { key: 'syndicateId', label: 'Pharmacist Syndicate ID' },
      ]},
      { title: 'Status', fields: [
        { key: 'factoryStatus', label: 'Pharmacy Status', badge: true },
        { key: 'createdAt', label: 'Created At' },
        { key: 'updatedAt', label: 'Updated At' },
      ]},
    ],
  },
];

const VALID_TAB_KEYS = TAB_CONFIG.map(t => t.key);
const STATUS_OPTIONS = ['All', 'Active', 'Suspended', 'Inactive'];
const PAGE_SIZE = 10;

// ─── Status filter (مبسّطة — status بس، لأن ده اللي الـ API بيدعمه) ───────

const StatusFilter = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const hasActive = value !== 'All';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: hasActive ? '1.5px solid #004399' : '1px solid #E5E7EB', background: hasActive ? '#EFF6FF' : '#fff', fontSize: 13, color: hasActive ? '#004399' : '#374151', cursor: 'pointer', fontWeight: 500 }}>
        {value === 'All' ? 'Status: All' : `Status: ${value}`}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', boxShadow: '0 12px 32px rgba(0,0,0,0.13)', zIndex: 200, minWidth: 160, overflow: 'hidden' }}>
          {STATUS_OPTIONS.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', border: 'none', background: opt === value ? '#F0F7FF' : 'none', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Row menu ────────────────────────────────────────────────────────────

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
    key: sk, label: STATUS_ACTION_LABELS[sk], icon: STATUS_ACTION_ICONS[sk], color: STATUS_ACTION_COLORS[sk],
    action: () => { onStatusChange(row, sk); setOpen(false); },
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

// ─── Profile drawer ─────────────────────────────────────────────────────

const ProfileDrawer = ({ tab, item, loading, onClose }) => {
  if (!item && !loading) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 400, background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', padding: 24, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{tab.singular} Profile</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            <X size={15} />
          </button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', color: '#9CA3AF' }}>
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : (
          tab.profileSections.map(section => (
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
          ))
        )}
      </div>
    </div>
  );
};

// ─── Toast ──────────────────────────────────────────────────────────────

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

// ─── Review-request field/document builders (RegistrationRequestDetailsDto → modal props) ──

const buildRequestFields = (details) => {
  if (!details) return [];
  const e = details.entity || {};
  const a = details.account || {};
  return [
    ['Request Code', details.requestCode],
    ['Entity Type', details.entityType],
    ['Submitted At', details.submittedAt ? new Date(details.submittedAt).toLocaleString() : ''],
    ['Registration Status', details.registrationStatus],
    ['Representative Name', a.fullName],
    ['Representative Email', a.email],
    ['Mobile Number', a.mobileNumber],
    ['Governorate', e.governorate],
    ['City', e.city],
    ['Full Address', e.fullAddress],
    ['Admin Notes', details.adminNotes],
    ['Rejection Reason', details.rejectionReason],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');
};

const buildDocuments = (details) => {
  if (!details?.documents) return [];
  return details.documents.map((doc) => ({
    id: doc.id,
    name: doc.fileName,
    url: doc.fileUrl,
    type: (doc.documentType || 'FILE').slice(0, 4).toUpperCase(),
    date: doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '--',
    size: undefined,
  }));
};

// ─── Main component ─────────────────────────────────────────────────────

const EntitiesManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = VALID_TAB_KEYS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'factories';

  const [activeTabKey, setActiveTabKey] = useState(initialTab);
  const [rows, setRows]           = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage]           = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]       = useState('');       // debounced
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const [drawerItem, setDrawerItem]     = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [reviewItem, setReviewItem]     = useState(null);
  const [toast, setToast]               = useState(null);
  const [checkedRows, setCheckedRows]   = useState({});
  const [allChecked, setAllChecked]     = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [statCards, setStatCards] = useState({
    factories:  { active: null, total: null },
    warehouses: { active: null, total: null },
    pharmacies: { active: null, total: null },
  });
  const [statLoading, setStatLoading] = useState(true);

  const activeTab = TAB_CONFIG.find(t => t.key === activeTabKey);
  const api       = ENTITY_API[activeTabKey];

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const showError = (msg) => showToast(msg, 'error');

  // ── Debounce search input ───────────────────────────────────────────
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // ── Tab switch: reset local UI state + sync URL ─────────────────────
  const changeTab = (key) => {
    setActiveTabKey(key);
    setSearchParams({ tab: key });
    setSearchInput('');
    setSearch('');
    setStatusFilter('All');
    setPage(1);
    setCheckedRows({});
    setAllChecked(false);
  };

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && VALID_TAB_KEYS.includes(tabFromUrl) && tabFromUrl !== activeTabKey) {
      changeTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Fetch list from API ─────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.service.getAll({
        search: search || undefined,
        status: statusFilter === 'All' ? undefined : statusFilter,
        page,
        pageSize: PAGE_SIZE,
      });
      setRows((res.items || []).map(api.mapRow));
      setTotalCount(res.totalCount || 0);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [api, search, statusFilter, page]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ── Fetch stat cards once (overview + per-entity totals) ────────────
  useEffect(() => {
    (async () => {
      setStatLoading(true);
      try {
        const [overview, facTotal, whTotal, phTotal] = await Promise.all([
          overviewService.getOverview(),
          ENTITY_API.factories.service.getAll({ page: 1, pageSize: 1 }),
          ENTITY_API.warehouses.service.getAll({ page: 1, pageSize: 1 }),
          ENTITY_API.pharmacies.service.getAll({ page: 1, pageSize: 1 }),
        ]);
        setStatCards({
          factories:  { active: overview?.cards?.activeFactories ?? 0, total: facTotal?.totalCount ?? 0 },
          warehouses: { active: overview?.cards?.activeWarehouses ?? 0, total: whTotal?.totalCount ?? 0 },
          pharmacies: { active: overview?.cards?.activePharmacies ?? 0, total: phTotal?.totalCount ?? 0 },
        });
      } catch {
        // fail silently — stat cards are non-critical
      } finally {
        setStatLoading(false);
      }
    })();
  }, []);

  const checkedCount = Object.values(checkedRows).filter(Boolean).length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ── Handlers ───────────────────────────────────────────────────────

  const handleExport = () => {
    try {
      const checkedIds   = Object.keys(checkedRows).filter(id => checkedRows[id]);
      const dataToExport = checkedIds.length > 0 ? rows.filter(r => checkedIds.includes(String(r.id))) : rows;
      if (!dataToExport.length) { showError('No data to export'); return; }
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, activeTab.label);
      XLSX.writeFile(wb, `${activeTab.key}_export.xlsx`);
      showToast('Report exported successfully (current page only)', 'info');
    } catch {
      showError('Export failed');
    }
  };

  const toggleAll = () => {
    if (allChecked) { setCheckedRows({}); setAllChecked(false); }
    else { const all = {}; rows.forEach(r => { all[r.id] = true; }); setCheckedRows(all); setAllChecked(true); }
  };
  const toggleRow = (id) => setCheckedRows(p => ({ ...p, [id]: !p[id] }));

  // Secondary row actions now call the real per-entity endpoints
  // (factories/{id}/batches, warehouses/{id}/inventory|shipments, pharmacies/{id}/inventory|shipments).
  const handleSecondaryAction = async (sa, row) => {
    try {
      let res;
      if (sa.key === 'viewBatches') {
        res = await api.service.getBatches(row.id, { page: 1, pageSize: 10 });
      } else if (sa.key === 'viewInventory') {
        res = await api.service.getInventory(row.id, { page: 1, pageSize: 10 });
      } else if (sa.key === 'viewShipments' || sa.key === 'viewReceivedShipments') {
        res = await api.service.getShipments(row.id, { page: 1, pageSize: 10 });
      }
      showToast(`${sa.label}: ${res?.totalCount ?? 0} record(s) found for ${row[activeTab.nameField]}`, 'info');
    } catch (err) {
      showError(err.message || `Failed to load ${sa.label}`);
    }
  };

  const handleViewProfile = async (row) => {
    setDrawerItem({});
    setDrawerLoading(true);
    try {
      const full = await api.service.getById(row.id);
      setDrawerItem(api.mapProfile(full));
    } catch (err) {
      showError(err.message || 'Failed to load profile');
      setDrawerItem(null);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleStatusChange = async (row, actionKey) => {
    setActionLoadingId(row.id);
    try {
      await api.service[actionKey](row.id);
      showToast(`${row[activeTab.nameField]} ${STATUS_ACTION_VERB[actionKey]} successfully`);
      fetchList();
    } catch (err) {
      showError(err.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  // "Review Request" — the Swagger has no endpoint that returns the
  // registration request behind an already-approved entity, so this
  // resolves it via a best-effort lookup (factory profile → request
  // number → search registration-requests by that code). See the
  // integration report for the backend endpoint that would replace this.
  const handleOpenReview = async (row) => {
    if (activeTabKey !== 'factories') {
      showError('Review Request needs a registrationRequestId link from the backend for this entity type (see integration report)');
      return;
    }
    try {
      const fullProfile = await factoryService.getFullProfile(row.id);
      const requestCode = fullProfile?.registrationInfo?.registrationRequestNo;
      if (!requestCode) {
        showError('No registration request reference found for this factory');
        return;
      }
      const list = await registrationRequestService.getAll({ search: requestCode, page: 1, pageSize: 1 });
      const match = list?.items?.[0];
      if (!match) {
        showError('Matching registration request could not be found');
        return;
      }
      const details = await registrationRequestService.getById(match.id);
      setReviewItem({ row, tab: activeTab, details });
    } catch (err) {
      showError(err.message || 'Failed to load registration request');
    }
  };

  const handleReviewAction = async (action, item) => {
    const requestId = reviewItem?.details?.id;
    if (!requestId) { setReviewItem(null); return; }
    try {
      if (action === 'approve') {
        await registrationRequestService.approve(requestId);
        showToast('Registration request approved');
      } else if (action === 'reject') {
        await registrationRequestService.reject(requestId, 'Rejected from Entities Management');
        showToast('Registration request rejected');
      } else if (action === 'inspection') {
        // No backend endpoint exists for scheduling an inspection — see integration report.
        showError('Request Inspection is not supported by the backend yet');
        return;
      }
      setReviewItem(null);
      fetchList();
    } catch (err) {
      showError(err.message || 'Action failed');
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, SF Pro, -apple-system, sans-serif', padding: '28px 32px', boxSizing: 'border-box', background: '#F8F9FB', minHeight: '100vh' }}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.5px' }}>
          <span style={{ color: '#004399' }}>Entities </span>
          <span style={{ color: '#111827' }}>Management</span>
        </h1>
        <p style={{ marginTop: 8, marginBottom: 0, fontSize: 14, color: '#9CA3AF', fontWeight: 400 }}>
          Monitor and manage all registered supply chain entities
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {TAB_CONFIG.map(tab => (
          <StatCard
            key={tab.key}
            label={tab.label}
            value={statCards[tab.key].active}
            sub={statCards[tab.key].total !== null ? `${statCards[tab.key].total} total` : undefined}
            loading={statLoading}
            icon={tab.icon}
            iconBg={tab.iconBg}
            iconColor={tab.iconColor}
            active={tab.key === activeTabKey}
            onClick={() => changeTab(tab.key)}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E5E7EB', marginBottom: 20 }}>
        {TAB_CONFIG.map(tab => {
          const isActive = tab.key === activeTabKey;
          return (
            <button key={tab.key} onClick={() => changeTab(tab.key)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '10px 2px', fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? '#004399' : '#6B7280', borderBottom: isActive ? '2px solid #004399' : '2px solid transparent', marginBottom: -1 }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{activeTab.label}</span>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={`Search ${activeTab.label.toLowerCase()}...`}
                style={{ width: 260, padding: '8px 12px 8px 34px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', outline: 'none' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <StatusFilter value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
            <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
              <Download size={13} />
              {checkedCount > 0 ? `Export (${checkedCount})` : 'Export'}
            </button>
          </div>
        </div>

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
                <tr><td colSpan={activeTab.columns.length + 2} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
                  <Loader2 size={20} className="animate-spin" style={{ marginRight: 8 }} /> Loading…
                </td></tr>
              ) : error ? (
                <tr><td colSpan={activeTab.columns.length + 2} style={{ textAlign: 'center', padding: '40px 0', color: '#DC2626' }}>{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={activeTab.columns.length + 2} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No records found</td></tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F3F4F6', background: checkedRows[row.id] ? '#F0F7FF' : '#fff', opacity: actionLoadingId === row.id ? 0.5 : 1 }}>
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
                          onViewProfile={handleViewProfile}
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

        <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: 12, color: '#9CA3AF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Showing {rows.length} of {totalCount} records — page {page} of {totalPages}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, color: page <= 1 ? '#D1D5DB' : '#374151', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>
              <ChevronLeft size={13} /> Prev
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, color: page >= totalPages ? '#D1D5DB' : '#374151', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {(drawerItem || drawerLoading) && (
        <ProfileDrawer tab={activeTab} item={drawerItem} loading={drawerLoading} onClose={() => setDrawerItem(null)} />
      )}

      {reviewItem && (
        <ReviewRequestModal
          open={!!reviewItem}
          item={reviewItem.row}
          onClose={() => setReviewItem(null)}
          showError={showError}
          onAction={handleReviewAction}
          entityLabel={reviewItem.tab.singular}
          headerTitle={`${reviewItem.tab.singular} Registration Request`}
          requestFields={buildRequestFields(reviewItem.details)}
          documents={buildDocuments(reviewItem.details)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default EntitiesManagement;