import { factoryService, warehouseService, pharmacyService } from '../../api/services/admin';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

// ── Factories (FactoryListItemDto / FactoryProfileDto) ───────────────────
const mapFactoryRow = (item) => ({
  id: item.id,
  factoryName: item.factoryName,
  legalCompanyName: item.legalCompanyName,
  governorate: item.governorate,
  city: item.city,
  hasColdStorage: !!item.hasColdStorage,
  qcLab: !!item.hasQualityControlLab,
  totalBatches: item.totalBatches ?? 0,
  factoryStatus: item.factoryStatus,
  createdAt: fmtDate(item.createdAt),
});

const mapFactoryProfile = (dto) => ({
  factoryName: dto.officialFactoryName,
  legalCompanyName: dto.legalCompanyName,
  dosageForms: dto.dosageFormsProduced,
  governorate: dto.governorate,
  city: dto.city,
  district: dto.districtArea,
  fullAddress: dto.fullAddress,
  factoryLicenseNumber: dto.factoryLicenseNumber,
  technicalLicenseNumber: dto.technicalOperatingLicenseNumber,
  commercialRegNumber: dto.commercialRegistrationNumber,
  taxCardNumber: dto.taxCardNumber,
  licenseIssueDate: fmtDate(dto.licenseIssueDate),
  qcLab: !!dto.hasQualityControlLab,
  hasFinishedGoodsStore: !!dto.hasFinishedGoodsStore,
  hasColdStorage: !!dto.hasColdStorage,
  hasQuarantineArea: !!dto.hasQuarantineArea,
  factoryStatus: dto.factoryStatus,
  createdAt: fmtDate(dto.createdAt),
  updatedAt: fmtDate(dto.updatedAt),
});

// ── Warehouses (WarehouseListItemDto / WarehouseProfileDto) ──────────────
// NB: the UI's shared "factoryStatus" column/field key is reused for every
// tab (see TAB_CONFIG in EntitiesManagement.jsx) — we map warehouseStatus
// into that same key so the existing Badge rendering keeps working as-is.
const mapWarehouseRow = (item) => ({
  id: item.id,
  warehouseName: item.warehouseName,
  warehouseType: item.warehouseType,
  governorate: item.governorate,
  city: item.city,
  hasColdStorage: !!item.hasColdStorage,
  factoryStatus: item.warehouseStatus,
  createdAt: fmtDate(item.createdAt),
});

const mapWarehouseProfile = (dto) => ({
  warehouseName: dto.officialWarehouseName,
  warehouseType: dto.warehouseType,
  governorate: dto.governorate,
  city: dto.city,
  district: dto.districtArea,
  fullAddress: dto.fullAddress,
  warehouseLicenseNumber: dto.warehouseLicenseNumber,
  licenseIssueDate: fmtDate(dto.licenseIssueDate),
  hasColdStorage: !!dto.hasColdStorage,
  hasQuarantineArea: !!dto.hasQuarantineArea,
  hasDeliveryService: !!dto.hasDeliveryService,
  factoryStatus: dto.warehouseStatus,
  createdAt: fmtDate(dto.createdAt),
  updatedAt: fmtDate(dto.updatedAt),
});

// ── Pharmacies (PharmacyListItemDto / PharmacyProfileDto) ────────────────
const mapPharmacyRow = (item) => ({
  id: item.id,
  pharmacyName: item.pharmacyName,
  pharmacyType: item.pharmacyType,
  governorate: item.governorate,
  city: item.city,
  defaultWarehouse: item.defaultWarehouse,
  hasColdStorage: !!item.hasColdStorage,
  factoryStatus: item.pharmacyStatus,
  createdAt: fmtDate(item.createdAt),
});

const mapPharmacyProfile = (dto) => ({
  pharmacyName: dto.officialPharmacyName,
  pharmacyType: dto.pharmacyType,
  governorate: dto.governorate,
  city: dto.city,
  district: dto.districtArea,
  fullAddress: dto.fullAddress,
  defaultWarehouse: dto.defaultWarehouse,
  hasColdStorage: !!dto.hasColdStorage,
  pharmacyLicenseNumber: dto.pharmacyLicenseNumber,
  licenseIssueDate: fmtDate(dto.licenseIssueDate),
  syndicateId: dto.pharmacistSyndicateId,
  factoryStatus: dto.pharmacyStatus,
  createdAt: fmtDate(dto.createdAt),
  updatedAt: fmtDate(dto.updatedAt),
});

export const ENTITY_API = {
  factories: {
    service: factoryService,
    mapRow: mapFactoryRow,
    mapProfile: mapFactoryProfile,
  },
  warehouses: {
    service: warehouseService,
    mapRow: mapWarehouseRow,
    mapProfile: mapWarehouseProfile,
  },
  pharmacies: {
    service: pharmacyService,
    mapRow: mapPharmacyRow,
    mapProfile: mapPharmacyProfile,
  },
};