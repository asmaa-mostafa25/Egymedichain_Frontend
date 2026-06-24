// Environment configuration
const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  API_TIMEOUT: 30000,
  
  // Authentication
  TOKEN_KEY: 'egy_medichain_token',
  REFRESH_TOKEN_KEY: 'egy_medichain_refresh_token',
  USER_KEY: 'egy_medichain_user',
  
  // App Configuration
  APP_NAME: 'EGY-MediChain',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'National Ministry of Health Pharmaceutical Supply Chain Control System',
  
  // Roles
  ROLES: {
    MOH_ADMIN: 'MOH_ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
    INSPECTOR: 'INSPECTOR',
    ANALYST: 'ANALYST',
    AUDITOR: 'AUDITOR',
  },
  
  // Role Labels
  ROLE_LABELS: {
    MOH_ADMIN: 'Ministry Administrator',
    SUPER_ADMIN: 'Super Administrator',
    INSPECTOR: 'Field Inspector',
    ANALYST: 'Data Analyst',
    AUDITOR: 'System Auditor',
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
