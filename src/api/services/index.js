// ضع هذا الملف في: src/api/services/index.js
// الهدف: تحويل كل خدمة من الشكل (بترجع البيانات مباشرة أو ترمي خطأ)
// إلى الشكل المستخدم في الكومبوننتس: { success: true, data } عند النجاح،
// وترمي Error عند الفشل (يتم إمساكها بـ try/catch في الكومبوننت زي ما هي).

import { authService } from './authService';
import { factoriesService, factoryDashboardService } from './factoriesService';
import { pharmaciesService, pharmacyDashboardService } from './pharmaciesService';
import { warehousesService, warehouseDashboardService } from './warehousesService';
import { batchesService } from './batchesService';
import { alertsService } from './alertsService';
import {
  registrationRequestsApi as registrationRequestsService,
} from './registrationRequestsApi';
import { reportsService } from './reportsService';
import { staffApi as staffService } from './staff.api';
import { adminService, overviewService } from './admin';
import { settingsApi as settingsService } from './settings.api';

// يلف كل دالة في الخدمة بحيث ترجع { success: true, data }
function wrapApi(service) {
  const wrapped = {};
  for (const key of Object.keys(service)) {
    const original = service[key];
    if (typeof original !== 'function') continue;
    wrapped[key] = async (...args) => {
      const data = await original(...args);
      return { success: true, data };
    };
  }
  return wrapped;
}

export const authApi = wrapApi(authService);
export const factoriesApi = wrapApi(factoriesService);
export const factoryDashboardApi = wrapApi(factoryDashboardService);
export const pharmaciesApi = wrapApi(pharmaciesService);
export const pharmacyDashboardApi = wrapApi(pharmacyDashboardService);
export const warehousesApi = wrapApi(warehousesService);
export const warehouseDashboardApi = wrapApi(warehouseDashboardService);
export const batchesApi = wrapApi(batchesService);
export const alertsApi = wrapApi(alertsService);
export const registrationRequestsApi = wrapApi(registrationRequestsService);
export const reportsApi = wrapApi(reportsService);
export const staffApi = wrapApi(staffService);
export const adminApi = wrapApi(adminService);
export const overviewApi = wrapApi(overviewService);

export const settingsApi = {
  get: async () => ({ success: true, data: await settingsService.get() }),
  getAll: async () => ({ success: true, data: await settingsService.get() }),
  update: async (data) => ({ success: true, data: await settingsService.update(data) }),
};