import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotificationStore } from '../../store';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: {
    bg: 'rgba(34, 197, 94, 0.1)',
    border: 'var(--accent-success)',
    icon: 'var(--accent-success)',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'var(--accent-danger)',
    icon: 'var(--accent-danger)',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'var(--accent-warning)',
    icon: 'var(--accent-warning)',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'var(--accent-info)',
    icon: 'var(--accent-info)',
  },
};

const ToastContainer = () => {
  const { toasts, removeToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--spacing-lg)',
        right: 'var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        zIndex: 'var(--z-notification)',
        maxWidth: '400px',
      }}
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || icons.info;
        const colorScheme = colors[toast.type] || colors.info;

        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--bg-card)',
              border: `1px solid ${colorScheme.border}`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
            }}
            className="animate-slideIn"
          >
            <div
              style={{
                padding: 'var(--spacing-xs)',
                backgroundColor: colorScheme.bg,
                borderRadius: 'var(--radius-full)',
              }}
            >
              <Icon size={16} style={{ color: colorScheme.icon }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {toast.title && (
                <div
                  style={{
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    marginBottom: '2px',
                  }}
                >
                  {toast.title}
                </div>
              )}
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                }}
              >
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                padding: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
