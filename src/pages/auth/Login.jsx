import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    const result = await login(formData);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
    clearError();
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Mobile Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-2xl)',
        }}
        className="lg:hidden"
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-info) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Shield size={24} color="#fff" />
        </div>
        <div>
          <div
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            EGY-MediChain
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-sm)',
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--text-secondary)',
          }}
        >
          Sign in to access the pharmaceutical control system
        </p>
      </div>

      {/* Error Message */}
      {(error || formError) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            padding: 'var(--spacing-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-lg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <AlertCircle size={18} style={{ color: 'var(--accent-danger)' }} />
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent-danger)' }}>
            {error || formError}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label
            style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: 'var(--spacing-sm)',
            }}
          >
            Email Address
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            <Mail size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 'var(--font-size-base)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label
            style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: 'var(--spacing-sm)',
            }}
          >
            Password
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            <Lock size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 'var(--font-size-base)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 0,
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember & Forgot */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-xl)',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              style={{
                width: '16px',
                height: '16px',
                accentColor: 'var(--accent-primary)',
              }}
            />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              Remember me
            </span>
          </label>
          <button
            type="button"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--accent-primary)',
              fontWeight: 500,
            }}
          >
            Forgot password?
          </button>
        </div>

        <div
          style={{
            marginBottom: 'var(--spacing-lg)',
            padding: 'var(--spacing-md)',
            backgroundColor: 'rgba(0, 194, 168, 0.05)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(0, 194, 168, 0.2)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            Demo access is available when the backend is offline.
            <div
              style={{
                marginTop: 'var(--spacing-xs)',
                color: 'var(--text-primary)',
                fontWeight: 600,
              }}
            >
              demo@medichain.local / demo1234
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-sm)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #00A896 100%)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-base)',
            fontWeight: 600,
            color: '#0A0F1C',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            transition: 'all var(--transition-fast)',
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Security Notice */}
      <div
        style={{
          marginTop: 'var(--spacing-2xl)',
          padding: 'var(--spacing-md)',
          backgroundColor: 'rgba(0, 194, 168, 0.05)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(0, 194, 168, 0.2)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}
        >
          This is a secure government system. Unauthorized access is prohibited and will be prosecuted.
          All activities are monitored and logged.
        </div>
      </div>
    </div>
  );
};

export default Login;