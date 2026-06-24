import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary', // primary, secondary, ghost, danger, success
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--accent-primary) 0%, #00A896 100%)',
      color: '#0A0F1C',
      border: 'none',
      hoverBackground: 'linear-gradient(135deg, #00A896 0%, var(--accent-primary) 100%)',
    },
    secondary: {
      background: 'var(--accent-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-primary)',
      hoverBackground: 'var(--bg-sidebar-hover)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: 'none',
      hoverBackground: 'var(--bg-input)',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.15)',
      color: 'var(--accent-danger)',
      border: '1px solid var(--accent-danger)',
      hoverBackground: 'rgba(239, 68, 68, 0.25)',
    },
    success: {
      background: 'rgba(34, 197, 94, 0.15)',
      color: 'var(--accent-success)',
      border: '1px solid var(--accent-success)',
      hoverBackground: 'rgba(34, 197, 94, 0.25)',
    },
  };

  const sizes = {
    sm: {
      padding: 'var(--spacing-xs) var(--spacing-md)',
      fontSize: 'var(--font-size-xs)',
      height: '32px',
      iconSize: 14,
    },
    md: {
      padding: 'var(--spacing-sm) var(--spacing-lg)',
      fontSize: 'var(--font-size-sm)',
      height: '40px',
      iconSize: 16,
    },
    lg: {
      padding: 'var(--spacing-md) var(--spacing-xl)',
      fontSize: 'var(--font-size-base)',
      height: '48px',
      iconSize: 18,
    },
  };

  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[size] || sizes.md;

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-sm)',
        padding: sizeStyle.padding,
        height: sizeStyle.height,
        background: variantStyle.background,
        color: variantStyle.color,
        border: variantStyle.border,
        borderRadius: 'var(--radius-md)',
        fontSize: sizeStyle.fontSize,
        fontWeight: 500,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all var(--transition-fast)',
        width: fullWidth ? '100%' : 'auto',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = variantStyle.hoverBackground;
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = variantStyle.background;
        }
      }}
      {...props}
    >
      {loading ? (
        <Loader2 size={sizeStyle.iconSize} className="animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={sizeStyle.iconSize} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={sizeStyle.iconSize} />}
        </>
      )}
    </button>
  );
};

export default Button;
