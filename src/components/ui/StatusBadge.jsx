const statusStyles = {
  // General statuses
  active: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-success)', dot: true },
  inactive: { bg: 'rgba(100, 116, 139, 0.15)', color: 'var(--text-muted)', dot: true },
  pending: { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-warning)', dot: true },
  approved: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-success)' },
  rejected: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)' },
  
  // Shipment statuses
  in_transit: { bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-info)', dot: true },
  delivered: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-success)' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)' },
  
  // Inventory statuses
  in_stock: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-success)' },
  low_stock: { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-warning)' },
  out_of_stock: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)' },
  expired: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)' },
  
  // Priority levels
  critical: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)', dot: true },
  high: { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-warning)' },
  medium: { bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-info)' },
  low: { bg: 'rgba(100, 116, 139, 0.15)', color: 'var(--text-muted)' },
  
  // Compliance
  compliant: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-success)' },
  non_compliant: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)' },
  
  // Default
  default: { bg: 'rgba(100, 116, 139, 0.15)', color: 'var(--text-secondary)' },
};

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
  expired: 'Expired',
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  compliant: 'Compliant',
  non_compliant: 'Non-Compliant',
};

const StatusBadge = ({ status, label, size = 'md', showDot = null }) => {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_') || 'default';
  const style = statusStyles[normalizedStatus] || statusStyles.default;
  const displayLabel = label || statusLabels[normalizedStatus] || status;
  const shouldShowDot = showDot !== null ? showDot : style.dot;

  const sizes = {
    sm: {
      padding: '2px 8px',
      fontSize: 'var(--font-size-xs)',
      dotSize: '6px',
    },
    md: {
      padding: '4px 10px',
      fontSize: 'var(--font-size-xs)',
      dotSize: '6px',
    },
    lg: {
      padding: '6px 12px',
      fontSize: 'var(--font-size-sm)',
      dotSize: '8px',
    },
  };

  const sizeStyle = sizes[size] || sizes.md;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: sizeStyle.padding,
        backgroundColor: style.bg,
        borderRadius: 'var(--radius-full)',
        fontSize: sizeStyle.fontSize,
        fontWeight: 500,
        color: style.color,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
    >
      {shouldShowDot && (
        <span
          style={{
            width: sizeStyle.dotSize,
            height: sizeStyle.dotSize,
            borderRadius: '50%',
            backgroundColor: style.color,
            boxShadow: normalizedStatus === 'active' || normalizedStatus === 'in_transit' || normalizedStatus === 'critical'
              ? `0 0 8px ${style.color}`
              : 'none',
          }}
        />
      )}
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
