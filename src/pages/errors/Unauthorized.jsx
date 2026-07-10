import { Link } from 'react-router-dom';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';

const Unauthorized = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        padding: 'var(--spacing-xl)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--spacing-lg)',
          }}
        >
          <ShieldX size={40} style={{ color: 'var(--accent-danger)' }} />
        </div>
        <h1
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          Access Denied
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--spacing-xl)',
          }}
        >
          You do not have permission to access this resource. Please contact your administrator if you believe this is an error.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
  <Link to="/login">
    <button
      style={{
        padding: '10px 20px',
        cursor: 'pointer',
      }}
    >
      Go to Login
    </button>
  </Link>

  <button
    style={{
      padding: '10px 20px',
      cursor: 'pointer',
    }}
    onClick={() => window.history.back()}
  >
    Go Back
  </button>

        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
