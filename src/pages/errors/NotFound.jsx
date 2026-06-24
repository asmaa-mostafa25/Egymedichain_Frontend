import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';

const NotFound = () => {
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
            fontSize: '120px',
            fontWeight: 800,
            color: 'var(--accent-primary)',
            lineHeight: 1,
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          Page Not Found
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--spacing-xl)',
          }}
        >
          The page you are looking for does not exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="primary" leftIcon={Home}>
              Go to Dashboard
            </Button>
          </Link>
          <Button variant="secondary" leftIcon={ArrowLeft} onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
