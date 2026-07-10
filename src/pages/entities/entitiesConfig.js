// src/pages/entities/entitiesConfig.js
import { factoriesService } from '../../api/services/factoriesService';
import { warehousesService } from '../../api/services/warehousesService';
import { pharmaciesService } from '../../api/services/pharmaciesService';
import {
  mapFactoryRow, mapWarehouseRow, mapPharmacyRow,
  mapFactoryProfile, mapWarehouseProfile, mapPharmacyProfile,
} from '../../api/mappers';

export const ENTITY_API = {
  factories: {
    service: factoriesService,
    mapRow: mapFactoryRow,
    mapProfile: mapFactoryProfile,
  },
  warehouses: {
    service: warehousesService,
    mapRow: mapWarehouseRow,
    mapProfile: mapWarehouseProfile,
  },
  pharmacies: {
    service: pharmaciesService,
    mapRow: mapPharmacyRow,
    mapProfile: mapPharmacyProfile,
  },
};