import { Shield, Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-lg)',
        zIndex: 9999,
      }}
    >
      {/* Logo */}
      <img
  src="/images/logo.png"
  alt="Logo"
  style={{
   width: '80px',
height: '80px',
    borderRadius: 'var(--radius-lg)',
    objectFit: 'cover',
    boxShadow: '0 0 40px rgba(0, 194, 168, 0.3)',
  }}
/>

      {/* Spinner */}
      <Loader2 
        size={24} 
        style={{ color: 'var(--accent-primary)' }} 
        className="animate-spin" 
      />

      {/* Text */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-xs)',
          }}
        >
          EGY-MediChain
        </div>
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-muted)',
          }}
        >
          Loading system...
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
