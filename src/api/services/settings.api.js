const SETTINGS_KEY = 'egy_medichain_settings';

const defaultSettings = {
  notifications: {
    emailAlerts: true,
    pushNotifications: true,
    criticalAlerts: true,
    weeklyReports: false,
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: '30',
  },
  profile: {
    name: '',
    email: '',
    phone: '',
    department: '',
    avatar: '',
  },
};

function readLocal() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : { ...defaultSettings };
  } catch {
    return { ...defaultSettings };
  }
}

function writeLocal(data) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
}

// TODO: Backend endpoints missing in swagger.json — no /settings routes defined.
// Settings are persisted locally until backend support is added.
export const settingsApi = {
  get: async () => readLocal(),
  getAll: async () => readLocal(),
  update: async (data) => {
    const next = { ...readLocal(), ...data };
    writeLocal(next);
    return next;
  },
  getUserPreferences: async () => readLocal(),
  updateUserPreferences: async (data) => settingsApi.update(data),
  getNotificationSettings: async () => readLocal().notifications,
  updateNotificationSettings: async (notifications) =>
    settingsApi.update({ notifications }),
  getSystemConfig: async () => readLocal().security,
  updateSystemConfig: async (security) => settingsApi.update({ security }),
};

export default settingsApi;
