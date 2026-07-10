// Environment configuration
const env = import.meta.env;
const isDemoAuthEnabled = env.VITE_ENABLE_DEMO_AUTH === undefined ? true : env.VITE_ENABLE_DEMO_AUTH === 'true';

const config = {
  // API Configuration
  API_BASE_URL: env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  API_TIMEOUT: Number(env.VITE_API_TIMEOUT || 30000),
  ENABLE_DEMO_AUTH: isDemoAuthEnabled,
  
  // Authentication
  TOKEN_KEY: 'egy_medichain_token',
  REFRESH_TOKEN_KEY: 'egy_medichain_refresh_token',
  USER_KEY: 'egy_medichain_user',
  
  // App Configuration
  APP_NAME: 'EGY-MediChain',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'National Ministry of Health Pharmaceutical Supply Chain Control System',
  
  // Roles
  // أضفها أو استبدل قسم ROLES في config.js
ROLES: {
  SUPER_ADMIN: 'SuperAdmin',
  MINISTRY_ADMIN: 'MinistryAdmin',
  FACTORY_USER: 'FactoryUser',
  WAREHOUSE_USER: 'WarehouseUser',
  PHARMACY_USER: 'PharmacyUser',
},
  
  // Role Labels
 ROLE_LABELS: {
  SUPER_ADMIN: 'Super Administrator',
  MINISTRY_ADMIN: 'Ministry Administrator',
  FACTORY_USER: 'Factory User',
  WAREHOUSE_USER: 'Warehouse User',
  PHARMACY_USER: 'Pharmacy User',
},
  
  // Status Codes
  STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    EXPIRED: 'expired',
  },
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  
  // Date Formats
  DATE_FORMAT: 'yyyy-MM-dd',
  DATETIME_FORMAT: 'yyyy-MM-dd HH:mm:ss',
  DISPLAY_DATE_FORMAT: 'MMM dd, yyyy',
  DISPLAY_DATETIME_FORMAT: 'MMM dd, yyyy HH:mm',
};

export default config;
