const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = 'var(--radius-md)',
  style = {},
}) => {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--bg-card-hover)',
        ...style,
      }}
    />
  );
};

export const SkeletonCard = () => (
  <div
    style={{
      padding: 'var(--spacing-lg)',
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-primary)',
    }}
  >
    <Skeleton height="16px" width="40%" style={{ marginBottom: 'var(--spacing-md)' }} />
    <Skeleton height="32px" width="60%" style={{ marginBottom: 'var(--spacing-sm)' }} />
    <Skeleton height="12px" width="30%" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div
    style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-primary)',
      overflow: 'hidden',
    }}
  >
    {/* Header */}
    <div
      style={{
        display: 'flex',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        borderBottom: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      {[20, 30, 25, 15, 10].map((width, i) => (
        <Skeleton key={i} width={`${width}%`} height="14px" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          borderBottom: rowIndex < rows - 1 ? '1px solid var(--border-secondary)' : 'none',
        }}
      >
        {[20, 30, 25, 15, 10].map((width, i) => (
          <Skeleton key={i} width={`${width}%`} height="16px" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonChart = () => (
  <div
    style={{
      padding: 'var(--spacing-lg)',
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-primary)',
    }}
  >
    <Skeleton height="16px" width="30%" style={{ marginBottom: 'var(--spacing-lg)' }} />
    <Skeleton height="200px" width="100%" />
  </div>
);

export default Skeleton;
