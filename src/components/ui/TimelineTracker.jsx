import { CheckCircle, Clock, Circle, AlertCircle } from 'lucide-react';

const TimelineTracker = ({ events = [], orientation = 'vertical' }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} style={{ color: 'var(--accent-success)' }} />;
      case 'current':
        return <Clock size={18} style={{ color: 'var(--accent-primary)' }} className="animate-pulse" />;
      case 'error':
        return <AlertCircle size={18} style={{ color: 'var(--accent-danger)' }} />;
      default:
        return <Circle size={18} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  const getLineColor = (status) => {
    switch (status) {
      case 'completed':
        return 'var(--accent-success)';
      case 'current':
        return 'var(--accent-primary)';
      default:
        return 'var(--border-primary)';
    }
  };

  if (orientation === 'horizontal') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          position: 'relative',
          padding: 'var(--spacing-lg) 0',
        }}
      >
        {/* Line */}
        <div
          style={{
            position: 'absolute',
            top: 'calc(var(--spacing-lg) + 9px)',
            left: '40px',
            right: '40px',
            height: '2px',
            backgroundColor: 'var(--border-primary)',
          }}
        />

        {events.map((event, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: event.status === 'completed' 
                  ? 'rgba(34, 197, 94, 0.15)'
                  : event.status === 'current'
                  ? 'rgba(0, 194, 168, 0.15)'
                  : 'var(--bg-card)',
                border: `2px solid ${getLineColor(event.status)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getStatusIcon(event.status)}
            </div>
            <div style={{ marginTop: 'var(--spacing-sm)', textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500,
                  color: event.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)',
                }}
              >
                {event.title}
              </div>
              {event.date && (
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                  }}
                >
                  {event.date}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {events.map((event, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            position: 'relative',
            paddingBottom: index < events.length - 1 ? 'var(--spacing-lg)' : 0,
          }}
        >
          {/* Line */}
          {index < events.length - 1 && (
            <div
              style={{
                position: 'absolute',
                left: '18px',
                top: '36px',
                bottom: 0,
                width: '2px',
                backgroundColor: getLineColor(event.status),
              }}
            />
          )}

          {/* Icon */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: event.status === 'completed' 
                ? 'rgba(34, 197, 94, 0.15)'
                : event.status === 'current'
                ? 'rgba(0, 194, 168, 0.15)'
                : 'var(--bg-card)',
              border: `2px solid ${getLineColor(event.status)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {getStatusIcon(event.status)}
          </div>

          {/* Content */}
          <div style={{ flex: 1, paddingTop: '6px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 500,
                  color: event.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)',
                }}
              >
                {event.title}
              </div>
              {event.date && (
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {event.date}
                </div>
              )}
            </div>
            {event.description && (
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                }}
              >
                {event.description}
              </div>
            )}
            {event.location && (
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                }}
              >
                {event.location}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineTracker;
