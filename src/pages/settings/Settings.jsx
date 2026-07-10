import { useEffect, useState } from 'react';
import { Bell, Shield, Palette, Save } from 'lucide-react';
import { useUIStore, useNotificationStore } from '../../store';
import { settingsApi } from '../../api';
import Button from '../../components/ui/Button';

const SettingsPage = () => {
  const { setPageTitle, setBreadcrumbs, theme, setTheme } = useUIStore();
  const { success, error: showError } = useNotificationStore();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');

  const [settings, setSettings] = useState({
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
  });

  useEffect(() => {
    setPageTitle('Settings');
    setBreadcrumbs(['Home', 'Settings']);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.get();
      if (response.success) {
        setSettings((prev) => ({
          ...prev,
          notifications: { ...prev.notifications, ...response.data?.notifications },
          security: { ...prev.security, ...response.data?.security },
        }));
      }
    } catch (err) {
      // fallback to defaults silently
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.update(settings);
      if (response.success) {
        success('تم حفظ الإعدادات بنجاح');
      } else {
        throw new Error(response.message || 'فشل الحفظ');
      }
    } catch (err) {
      showError(err.message || 'حصل خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {[
              { key: 'emailAlerts', label: 'Email Alerts', description: 'استقبال التنبيهات المهمة عبر الإيميل' },
              { key: 'pushNotifications', label: 'Push Notifications', description: 'تفعيل إشعارات المتصفح' },
              { key: 'criticalAlerts', label: 'Critical Alerts', description: 'التنبيه الفوري للأحداث الحرجة' },
              { key: 'weeklyReports', label: 'Weekly Reports', description: 'استقبال تقرير أسبوعي ملخص' },
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {item.description}
                  </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input
                    type="checkbox"
                    checked={settings.notifications[item.key]}
                    onChange={(e) => setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, [item.key]: e.target.checked },
                    }))}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings.notifications[item.key] ? 'var(--accent-primary)' : 'var(--border-primary)',
                      borderRadius: '24px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: settings.notifications[item.key] ? '23px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </span>
                </label>
              </div>
            ))}
          </div>
        );

      case 'security':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Two-Factor Authentication
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  طبقة حماية إضافية على حسابك
                </div>
              </div>
              <Button
                variant={settings.security.twoFactorEnabled ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => setSettings((prev) => ({
                  ...prev,
                  security: { ...prev.security, twoFactorEnabled: !prev.security.twoFactorEnabled },
                }))}
              >
                {settings.security.twoFactorEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--spacing-xs)',
                }}
              >
                Session Timeout (minutes)
              </label>
              <select
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings((prev) => ({
                  ...prev,
                  security: { ...prev.security, sessionTimeout: e.target.value },
                }))}
                style={{
                  width: '100%',
                  maxWidth: '200px',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div
              style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--spacing-sm)',
                }}
              >
                Change Password
              </div>
              <Button variant="secondary" size="sm">
                Update Password
              </Button>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--spacing-md)',
                }}
              >
                Theme
              </label>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                {['dark', 'light', 'system'].map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => setTheme(themeOption)}
                    style={{
                      flex: 1,
                      padding: 'var(--spacing-lg)',
                      backgroundColor: theme === themeOption ? 'var(--accent-secondary)' : 'var(--bg-secondary)',
                      border: `2px solid ${theme === themeOption ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {themeOption}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-fadeIn">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            Settings
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            إعدادات التنبيهات والأمان والمظهر
          </p>
        </div>
        <Button variant="primary" leftIcon={Save} onClick={handleSave} loading={loading}>
          Save Changes
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: 'var(--spacing-lg)',
        }}
      >
        <div
          style={{
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-primary)',
            height: 'fit-content',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                width: '100%',
                padding: 'var(--spacing-md)',
                backgroundColor: activeTab === tab.id ? 'var(--accent-secondary)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                textAlign: 'left',
                marginBottom: 'var(--spacing-xs)',
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div
          style={{
            padding: 'var(--spacing-xl)',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            {tabs.find((tab) => tab.id === activeTab)?.label}
          </h2>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;