import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPICard = ({
  title,
  value,
  change,
  changeType = 'neutral', // positive, negative, neutral
  icon: Icon,
  subtitle,
  loading = false,
  onClick,
}) => {
  const getTrendIcon = () => {
    if (changeType === 'positive') return TrendingUp;
    if (changeType === 'negative') return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (changeType === 'positive') return 'var(--accent-success)';
    if (changeType === 'negative') return 'var(--accent-danger)';
    return 'var(--text-muted)';
  };

  const TrendIcon = getTrendIcon();

  if (loading) {
    return (
      <div
        style={{
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <div className="skeleton" style={{ height: '14px', width: '50%', marginBottom: 'var(--spacing-md)', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ height: '32px', width: '70%', marginBottom: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ height: '12px', width: '40%', borderRadius: 'var(--radius-sm)' }} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)',
        transition: 'all var(--transition-fast)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-primary)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Background Gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(0, 194, 168, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          {title}
        </div>
        {Icon && (
          <div
            style={{
              padding: 'var(--spacing-sm)',
              backgroundColor: 'var(--accent-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Icon size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 'var(--spacing-sm)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        {change !== undefined && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              backgroundColor: changeType === 'positive' 
                ? 'rgba(34, 197, 94, 0.1)' 
                : changeType === 'negative'
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(100, 116, 139, 0.1)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <TrendIcon size={12} style={{ color: getTrendColor() }} />
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 500,
                color: getTrendColor(),
              }}
            >
              {change}
            </span>
          </div>
        )}
        {subtitle && (
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-muted)',
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default KPICard;
