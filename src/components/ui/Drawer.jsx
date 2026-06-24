import { X } from 'lucide-react';
import { useEffect } from 'react';

const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right', // left, right
  width = '480px',
  showClose = true,
  closeOnOverlay = true,
  footer,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(2px)',
        zIndex: 'var(--z-modal)',
      }}
      onClick={() => closeOnOverlay && onClose?.()}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [position]: 0,
          width: '100%',
          maxWidth: width,
          backgroundColor: 'var(--bg-card)',
          borderLeft: position === 'right' ? '1px solid var(--border-primary)' : 'none',
          borderRight: position === 'left' ? '1px solid var(--border-primary)' : 'none',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          animation: `slideIn${position === 'right' ? 'Right' : 'Left'} 0.2s ease`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--spacing-lg)',
              borderBottom: '1px solid var(--border-primary)',
            }}
          >
            {title && (
              <h2
                style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                style={{
                  padding: 'var(--spacing-xs)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            flex: 1,
            padding: 'var(--spacing-lg)',
            overflowY: 'auto',
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-lg)',
              borderTop: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            {footer}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          @keyframes slideInLeft {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Drawer;
