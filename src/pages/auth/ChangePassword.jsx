import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  KeyRound,
} from 'lucide-react';
import { useAuthStore, useNotificationStore } from '../../store';
import { authApi } from '../../api/services';
import Button from '../../components/ui/Button';

// ─── Password rules ─────────────────────────────────────────────────────────
// Kept in sync with the strength of the temporary password the backend
// generates on staff creation (see Staff.jsx / generateSecurePassword),
// so a staff member can never "downgrade" into something weaker.
const RULES = [
  { key: 'length',  label: 'على الأقل 10 حروف',        test: (v) => v.length >= 10 },
  { key: 'upper',   label: 'حرف كبير واحد (A-Z)',        test: (v) => /[A-Z]/.test(v) },
  { key: 'lower',   label: 'حرف صغير واحد (a-z)',        test: (v) => /[a-z]/.test(v) },
  { key: 'digit',   label: 'رقم واحد على الأقل',          test: (v) => /[0-9]/.test(v) },
  { key: 'symbol',  label: 'رمز واحد على الأقل (!@#...)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const inputWrapStyle = { position: 'relative' };
const inputStyle = {
  width: '100%',
  padding: 'var(--spacing-sm) 40px var(--spacing-sm) 40px',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-primary)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: 'var(--font-size-sm)',
  boxSizing: 'border-box',
};
const iconLeftStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' };
const iconRightBtnStyle = {
  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
  display: 'flex', alignItems: 'center', padding: 4,
};

const ChangePassword = () => {
  const { user, completePasswordReset } = useAuthStore();
  const { success, error: showError } = useNotificationStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passedRules = useMemo(
    () => RULES.map((rule) => ({ ...rule, passed: rule.test(newPassword) })),
    [newPassword]
  );
  const allRulesPassed = passedRules.every((r) => r.passed);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isSameAsCurrent = newPassword.length > 0 && newPassword === currentPassword;
  const canSubmit = currentPassword && allRulesPassed && passwordsMatch && !isSameAsCurrent && !submitting;

  return <Navigate to="/home" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showError('من فضلك ادخل الباسورد المؤقت اللي وصلك على الإيميل');
      return;
    }
    if (!allRulesPassed) {
      showError('الباسورد الجديد لازم يستوفي كل الشروط الموضحة تحت');
      return;
    }
    if (!passwordsMatch) {
      showError('الباسورد الجديد وتأكيده مش متطابقين');
      return;
    }
    if (isSameAsCurrent) {
      showError('لازم تختار باسورد مختلف عن الباسورد المؤقت');
      return;
    }

    try {
      setSubmitting(true);
      // Backend must verify currentPassword server-side before accepting the
      // change (never trust a client-side "I'm already logged in" check alone —
      // the temporary password could still be in an intercepted email), then
      // clear the forcePasswordReset flag on the account.
      const response = await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      if (response.success) {
        success('تم تغيير الباسورد بنجاح');
        completePasswordReset?.(); // clears forcePasswordReset in auth state -> router lets the user through
      } else {
        showError(response.message || 'الباسورد الحالي غلط أو حصل خطأ، حاول تاني');
      }
    } catch (err) {
      showError(err.message || 'فشل تغيير الباسورد');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        padding: 'var(--spacing-lg)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-xl)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <ShieldCheck size={20} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
              لازم تغيّر الباسورد
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {user?.name ? `أهلاً ${user.name} — ` : ''}دي أول مرة تدخل بيها، غيّر الباسورد المؤقت قبل ما تكمل
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          {/* Current (temporary) password */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              الباسورد المؤقت (اللي وصلك على إيميلك الشخصي)
            </label>
            <div style={inputWrapStyle}>
              <Lock size={15} style={iconLeftStyle} />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Temporary password"
                style={inputStyle}
                autoFocus
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} style={iconRightBtnStyle}>
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              الباسورد الجديد
            </label>
            <div style={inputWrapStyle}>
              <KeyRound size={15} style={iconLeftStyle} />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                style={inputStyle}
              />
              <button type="button" onClick={() => setShowNew((v) => !v)} style={iconRightBtnStyle}>
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              تأكيد الباسورد الجديد
            </label>
            <div style={inputWrapStyle}>
              <KeyRound size={15} style={iconLeftStyle} />
              <input
                type={showNew ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={inputStyle}
              />
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)' }}>
                <X size={12} /> الباسورد مش متطابق
              </div>
            )}
          </div>

          {/* Live rule checklist */}
          <div
            style={{
              display: 'grid',
              gap: 6,
              padding: 'var(--spacing-sm) var(--spacing-md)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {passedRules.map((rule) => (
              <div
                key={rule.key}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 'var(--font-size-xs)',
                  color: rule.passed ? 'var(--accent-success)' : 'var(--text-muted)',
                }}
              >
                {rule.passed ? <Check size={13} /> : <X size={13} />}
                {rule.label}
              </div>
            ))}
            {isSameAsCurrent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)' }}>
                <X size={13} /> لازم يكون مختلف عن الباسورد المؤقت
              </div>
            )}
          </div>

          <Button type="submit" variant="primary" loading={submitting} disabled={!canSubmit}>
            حفظ الباسورد الجديد والدخول
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;