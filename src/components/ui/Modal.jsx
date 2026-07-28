import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm, md, lg, xl, full
  showClose = true,
  closeOnOverlay = true,
  footer,
}) => {
  const sizes = {
    sm: '400px',
    md: '560px',
    lg: '720px',
    xl: '900px',
    full: '95vw',
  };

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

  // ── Rendered via a portal straight into document.body ───────────────────
  // Why: `position: fixed` is positioned relative to the nearest ancestor
  // that has a `transform`, `filter`, `perspective`, or `will-change:
  // transform` set — NOT the viewport — if such an ancestor exists.
  // Page wrappers using classes like `animate-fadeIn` very often apply a
  // transform (e.g. translateY) for the entrance animation. If this Modal
  // were rendered inline inside that wrapper, "inset: 0" would resolve
  // against the wrapper's box instead of the screen, making the modal
  // appear clipped/squashed instead of centered on the viewport.
  // Using createPortal renders this markup as a direct child of <body>,
  // completely outside that wrapper, so centering and full-viewport
  // coverage always work regardless of what animations/transforms any
  // parent component applies.
  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-lg)',
        zIndex: 'var(--z-modal, 1000)',
        boxSizing: 'border-box',
      }}
      onClick={() => closeOnOverlay && onClose?.()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: `min(${sizes[size] || sizes.md}, calc(100vw - 2 * var(--spacing-lg)))`,
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-fadeIn"
      >
        {/* Header */}
        {(title || showClose) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-lg)',
              borderBottom: '1px solid var(--border-primary)',
              boxSizing: 'border-box',
            }}
          >
            {title && (
              <h2
                style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: 0,
                  minWidth: 0,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                style={{
                  flexShrink: 0,
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
            minWidth: 0,
            minHeight: 0,
            padding: 'var(--spacing-lg)',
            overflowY: 'auto',
            overflowX: 'hidden',
            boxSizing: 'border-box',
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
              flexWrap: 'wrap',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-lg)',
              borderTop: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-secondary)',
              boxSizing: 'border-box',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;