import { formatDisplayDate, formatDisplayDateTime } from './utils';

export function mapAlertRow(item) {
  return {
    id: item.id,
    type: item.alertType,
    alertType: item.alertType,
    severity: item.severity,
    entityType: item.entityType,
    entityName: item.entityName,
    batch: item.batchNumber,
    batchNumber: item.batchNumber,
    message: item.message,
    createdAt: formatDisplayDateTime(item.createdAt),
    status: item.alertStatus,
    alertStatus: item.alertStatus,
  };
}

export function mapRecallAlertRow(item) {
  return {
    id: item.id,
    alertId: item.alertCode || `ALR-${item.id}`,
    product: item.productName,
    batch: item.batchNumber,
    factory: item.entityName,
    severity: item.severity,
    message: item.message,
    status: item.alertStatus,
    scannedAt: formatDisplayDateTime(item.createdAt),
  };
}

export function mapScanRow(item) {
  return {
    id: item.id,
    scanId: item.scanCode || `SCN-${item.id}`,
    gtin: item.scannedGTIN,
    serial: item.scannedSerialNumber,
    batch: item.scannedBatchNumber,
    product: item.productName,
    result: item.verificationResult,
    reason: item.reason,
    governorate: item.governorate,
    city: item.city,
    scannedAt: formatDisplayDateTime(item.scannedAt),
  };
}

export function mapBatchRow(item) {
  return {
    id: item.id,
    productName: item.productName,
    gtin: item.gtin,
    dosageForm: item.dosageForm,
    strength: item.strength,
    manufacturer: item.factoryName,
    factoryName: item.factoryName,
    quantity: item.quantity,
    batchLotNo: item.batchNumber,
    batchNumber: item.batchNumber,
    productionDate: formatDisplayDate(item.manufacturingDate),
    expiryDate: formatDisplayDate(item.expiryDate),
    supplyChainStage: item.supplyChainStage,
    batchStatus: item.batchStatus,
    currentLocation: item.currentLocation,
    caseAlerts: item.openAlerts ?? 0,
    lastUpdate: formatDisplayDate(item.manufacturingDate),
  };
}

export function mapRegistrationRequestRow(item) {
  return {
    id: item.id,
    entityType: item.entityType,
    entityName: item.entityName,
    submittedBy: item.representativeName,
    submittedAt: formatDisplayDate(item.submittedAt),
    status: item.registrationStatus,
  };
}

export function mapFactoryRow(item) {
  return {
    ...item,
    qcLab: item.hasQualityControlLab ?? item.qcLab,
    factoryStatus: item.factoryStatus,
    licenseExpiryDate: formatDisplayDate(item.licenseExpiryDate),
    createdAt: formatDisplayDate(item.createdAt),
    updatedAt: formatDisplayDate(item.updatedAt),
  };
}

export function mapWarehouseRow(item) {
  return {
    ...item,
    factoryStatus: item.warehouseStatus ?? item.factoryStatus,
    licenseExpiryDate: formatDisplayDate(item.licenseExpiryDate),
    createdAt: formatDisplayDate(item.createdAt),
    updatedAt: formatDisplayDate(item.updatedAt),
  };
}

export function mapPharmacyRow(item) {
  return {
    ...item,
    factoryStatus: item.pharmacyStatus ?? item.factoryStatus,
    licenseExpiryDate: formatDisplayDate(item.licenseExpiryDate),
    createdAt: formatDisplayDate(item.createdAt),
    updatedAt: formatDisplayDate(item.updatedAt),
  };
}

export function mapSystemUserRow(item) {
  return {
    id: item.id,
    name: item.fullName,
    role: item.role,
    entity: item.entityType || '—',
    email: item.email,
    status: item.isActive ? 'Active' : 'Inactive',
    lastLogin: formatDisplayDate(item.lastLoginAt),
  };
}

export function mapAuditLogRow(item) {
  return {
    id: item.id,
    user: item.user,
    action: item.action,
    entityType: item.resourceType,
    entityName: item.resourceId,
    ip: item.ipAddress,
    result: item.result || 'Unknown',
    timestamp: formatDisplayDateTime(item.createdAt),
  };
}

export function mapStaffMember(item) {
  return {
    id: item.id,
    name: item.fullName,
    personalEmail: item.email,
    officialEmail: item.email,
    email: item.email,
    phone: item.mobileNumber,
    role: item.role,
    department: item.entityType || '',
    facility: item.entityId ? `${item.entityType || 'Entity'} #${item.entityId}` : '',
    status: item.isActive ? 'active' : 'inactive',
    nationalId: item.nationalId || '',
    lastLogin: formatDisplayDate(item.lastLoginAt),
  };
}
export function mapFactoryProfile(item) {
  return {
    factoryName: item.officialFactoryName,
    legalCompanyName: item.legalCompanyName,
    dosageForms: item.dosageFormsProduced,
    governorate: item.governorate,
    city: item.city,
    district: item.districtArea,
    fullAddress: item.fullAddress,
    factoryLicenseNumber: item.factoryLicenseNumber,
    technicalLicenseNumber: item.technicalOperatingLicenseNumber,
    commercialRegNumber: item.commercialRegistrationNumber,
    taxCardNumber: item.taxCardNumber,
    licenseIssueDate: formatDisplayDate(item.licenseIssueDate),
    licenseExpiryDate: formatDisplayDate(item.licenseExpiryDate),
    qcLab: item.hasQualityControlLab,
    hasFinishedGoodsStore: item.hasFinishedGoodsStore,
    hasColdStorage: item.hasColdStorage,
    hasQuarantineArea: item.hasQuarantineArea,
    factoryStatus: item.factoryStatus,
    createdAt: formatDisplayDate(item.createdAt),
    updatedAt: formatDisplayDate(item.updatedAt),
  };
}

export function mapWarehouseProfile(item) {
  return {
    warehouseName: item.officialWarehouseName,
    warehouseType: item.warehouseType,
    governorate: item.governorate,
    city: item.city,
    district: item.districtArea,
    fullAddress: item.fullAddress,
    warehouseLicenseNumber: item.warehouseLicenseNumber,
    licenseIssueDate: formatDisplayDate(item.licenseIssueDate),
    licenseExpiryDate: formatDisplayDate(item.licenseExpiryDate),
    hasColdStorage: item.hasColdStorage,
    hasQuarantineArea: item.hasQuarantineArea,
    hasDeliveryService: item.hasDeliveryService,
    factoryStatus: item.warehouseStatus,
    createdAt: formatDisplayDate(item.createdAt),
    updatedAt: formatDisplayDate(item.updatedAt),
  };
}

export function mapPharmacyProfile(item) {
  return {
    pharmacyName: item.officialPharmacyName,
    pharmacyType: item.pharmacyType,
    governorate: item.governorate,
    city: item.city,
    district: item.districtArea,
    fullAddress: item.fullAddress,
    defaultWarehouse: item.defaultWarehouse,
    hasColdStorage: item.hasColdStorage,
    pharmacyLicenseNumber: item.pharmacyLicenseNumber,
    licenseIssueDate: formatDisplayDate(item.licenseIssueDate),
    licenseExpiryDate: formatDisplayDate(item.licenseExpiryDate),
    syndicateId: item.pharmacistSyndicateId,
    factoryStatus: item.pharmacyStatus,
    createdAt: formatDisplayDate(item.createdAt),
    updatedAt: formatDisplayDate(item.updatedAt),
  };
}
// BatchListItemDto -> table row shape used by WarehouseDashboard's Batches tab

// AlertListItemDto -> table row shape used by WarehouseDashboard's Alerts tab

// Full detail versions for the drawer (BatchDetailsDto / AlertDetailsDto)
export const mapBatchDetails = (dto) => ({
  id: dto.id,
  productName: dto.productInfo?.productName,
  batchNumber: dto.batchInfo?.batchNumber,
  factory: dto.batchInfo?.factoryName,
  batchStatus: dto.batchInfo?.batchStatus,
  lastUpdate: dto.batchInfo?.updatedAt ? dto.batchInfo.updatedAt.split('T')[0] : '',
});

export const mapAlertDetails = (dto) => ({
  id: dto.id,
  alertType: dto.alertType,
  severity: dto.severity,
  entityType: dto.entityType,
  date: dto.createdAt ? dto.createdAt.split('T')[0] : '',
  status: dto.alertStatus,
});