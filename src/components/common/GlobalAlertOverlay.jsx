import { AlertTriangle, X } from 'lucide-react';
import { useNotificationStore } from '../../store';

const GlobalAlertOverlay = () => {
  const { alerts, removeAlert } = useNotificationStore();

  if (alerts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 'var(--spacing-lg)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        zIndex: 'var(--z-notification)',
        maxWidth: '600px',
        width: '90%',
      }}
    >
      {alerts.map((alert) => (
        <div
          key={alert.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            backgroundColor: alert.type === 'error' 
              ? 'rgba(239, 68, 68, 0.95)' 
              : alert.type === 'warning'
              ? 'rgba(245, 158, 11, 0.95)'
              : 'rgba(59, 130, 246, 0.95)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
          }}
          className="animate-fadeIn glass"
        >
          <AlertTriangle size={20} style={{ color: '#fff', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            {alert.title && (
              <div
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: '2px',
                }}
              >
                {alert.title}
              </div>
            )}
            <div
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              {alert.message}
            </div>
          </div>
          {alert.dismissible && (
            <button
              onClick={() => removeAlert(alert.id)}
              style={{
                padding: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'background-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default GlobalAlertOverlay;
