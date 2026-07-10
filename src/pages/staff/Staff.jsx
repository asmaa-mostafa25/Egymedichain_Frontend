import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Mail,
  Phone,
  Building,
  Shield,
  Eye,
  Trash2,
  IdCard,
  Cake,
  GraduationCap,
  Briefcase,
  CalendarDays,
  ShieldCheck,
  KeyRound,
  Info,
  RotateCcw,
} from 'lucide-react';
import { useUIStore, useNotificationStore } from '../../store';
import { staffApi } from '../../api';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Drawer from '../../components/ui/Drawer';
import { SkeletonCard } from '../../components/common/Skeleton';

// ─── Password generation ────────────────────────────────────────────────────
// Security notes:
// - Uses crypto.getRandomValues (CSPRNG), NOT Math.random, so the password
//   cannot be predicted/replayed by an attacker who observes other outputs.
// - 14 chars drawn from a 70+ character alphabet, with at least one
//   uppercase / lowercase / digit / symbol guaranteed, giving well over
//   80 bits of entropy — far beyond what's brute-forceable.
// - The generated value never gets logged, never rendered in the UI, and is
//   held in a local variable only for the duration of the API call, then
//   dropped — it's not kept in component state, so it can't leak via
//   React devtools, error reports, or a stray console.log elsewhere.
// - The backend is expected to hash it (e.g. bcrypt/argon2) before storing,
//   send it to the STAFF MEMBER'S PERSONAL email only (never the official
//   one, since that inbox may be inaccessible if they're locked out), and
//   mark the account to force a password change on first login — the
//   generated string is a one-time bootstrap credential, not a long-term
//   password.
const generateSecurePassword = (length = 14) => {
  const groups = {
    lower: 'abcdefghijkmnopqrstuvwxyz',
    upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
    digit: '23456789',
    symbol: '!@#$%^&*-_=+?',
  };
  const all = Object.values(groups).join('');
  const randomChar = (charset) => {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    return charset[bytes[0] % charset.length];
  };

  // Guarantee at least one of each category, then fill the rest randomly.
  const required = Object.values(groups).map(randomChar);
  const rest = Array.from({ length: length - required.length }, () => randomChar(all));
  const combined = [...required, ...rest];

  // Shuffle (Fisher–Yates) using the same CSPRNG so category order isn't predictable.
  for (let i = combined.length - 1; i > 0; i--) {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    const j = bytes[0] % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join('');
};

// Suggests an official ministry email from the staff member's name.
// Transliterated/Latin names -> "first.last@ministry.gov.eg".
// The admin can always override this before submitting.
const suggestOfficialEmail = (fullName) => {
  const clean = (fullName || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // keep this simple: Latin letters only
    .split(/\s+/)
    .filter(Boolean);
  if (clean.length === 0) return '';
  const handle = clean.length === 1 ? clean[0] : `${clean[0]}.${clean[clean.length - 1]}`;
  return `${handle}@ministry.gov.eg`;
};

const EMPTY_STAFF = {
  name: '',
  personalEmail: '',
  officialEmail: '',
  phone: '',
  role: 'INSPECTOR',
  department: '',
  facility: '',
  status: 'active',
  // ── Fields the Ministry of Health requires on file for every employee ──
  nationalId: '',
  dateOfBirth: '',
  qualification: '',
  jobGrade: '',
  hireDate: '',
  insuranceNumber: '',
};

const inputStyle = {
  width: '100%',
  padding: 'var(--spacing-sm) var(--spacing-md)',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-primary)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: 'var(--font-size-sm)',
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-xs)',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--text-secondary)',
  marginBottom: 'var(--spacing-xs)',
};

const Staff = () => {
  const { setPageTitle, setBreadcrumbs } = useUIStore();
  const { success, error: showError } = useNotificationStore();

  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [officialEmailTouched, setOfficialEmailTouched] = useState(false);
  const [newStaff, setNewStaff] = useState(EMPTY_STAFF);

  // ── Reset Password state ────────────────────────────────────────────────
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);

  useEffect(() => {
    setPageTitle('Staff Management');
    setBreadcrumbs(['Home', 'Staff']);
  }, [setPageTitle, setBreadcrumbs]);

  useEffect(() => {
    fetchStaff();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      if (response.success) {
        setStaff(response.data.staff || []);
        setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
      }
    } catch (err) {
      showError(err.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await staffApi.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      // Stats are secondary
    }
  };

  const handleViewDetails = (member) => {
    setSelectedStaff(member);
    setDrawerOpen(true);
  };

  const handleNameChange = (value) => {
    setNewStaff((prev) => ({
      ...prev,
      name: value,
      // Keep the suggested official email in sync unless the admin has
      // deliberately overridden it.
      officialEmail: officialEmailTouched ? prev.officialEmail : suggestOfficialEmail(value),
    }));
  };

  const handleOfficialEmailChange = (value) => {
    setOfficialEmailTouched(true);
    setNewStaff((prev) => ({ ...prev, officialEmail: value }));
  };

  const resetAddStaffForm = () => {
    setNewStaff(EMPTY_STAFF);
    setOfficialEmailTouched(false);
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.personalEmail || !newStaff.officialEmail || !newStaff.nationalId) {
      showError('الاسم، الإيميل الشخصي، الإيميل الرسمي، والرقم القومي حقول إجبارية');
      return;
    }
    if (!isValidEmail(newStaff.personalEmail)) {
      showError('من فضلك ادخل إيميل شخصي صحيح — هيتبعتله بيانات الدخول');
      return;
    }
    if (!isValidEmail(newStaff.officialEmail)) {
      showError('من فضلك ادخل إيميل رسمي صحيح');
      return;
    }

    // Generated fresh, right before the request — never stored in state,
    // never rendered, and sent to the backend over the (assumed) TLS API
    // connection. The backend hashes it before persisting and emails the
    // plaintext once to the staff member's personal address only, with a
    // forced password-change requirement on first login.
    const temporaryPassword = generateSecurePassword();

    try {
      setCreatingStaff(true);
      const response = await staffApi.create({
        ...newStaff,
        password: temporaryPassword,
        forcePasswordReset: true,
        sendCredentialsTo: 'personalEmail',
      });

      if (response.success) {
        success(`تم إنشاء الحساب — الإيميل الرسمي وكلمة السر اتبعتوا على ${newStaff.personalEmail}`);
        setAddStaffOpen(false);
        resetAddStaffForm();
        setPagination((prev) => ({ ...prev, page: 1 }));
        fetchStaff();
      } else {
        showError(response.message || 'Failed to add staff member');
      }
    } catch (err) {
      showError(err.message || 'Failed to add staff member');
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    try {
      await staffApi.delete(selectedStaff.id);
      success('Staff member removed successfully');
      setDeleteModalOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err) {
      showError(err.message || 'Failed to remove staff member');
    }
  };

  // ── Reset Password: admin-initiated, for staff who lost/forgot access ──
  // Same generation + delivery model as account creation: a fresh CSPRNG
  // password is created, sent once to the staff member's personal email,
  // and never shown on screen or kept in state.
  const openResetPassword = (member) => {
    setResetTarget(member);
    setResetPasswordOpen(true);
  };

  const closeResetPassword = () => {
    if (resettingPassword) return; // don't allow closing mid-request
    setResetPasswordOpen(false);
    setResetTarget(null);
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;

    if (!resetTarget.personalEmail) {
      showError('لا يوجد إيميل شخصي مسجل لهذا الموظف — من فضلك حدّثه أولًا قبل إعادة تعيين كلمة السر');
      return;
    }

    const newPassword = generateSecurePassword();

    try {
      setResettingPassword(true);
      const response = await staffApi.resetPassword(resetTarget.id, {
        password: newPassword,
        forcePasswordReset: true,
        sendCredentialsTo: 'personalEmail',
      });

      if (response.success) {
        success(`تم تغيير كلمة السر — الباسورد الجديد اتبعت على ${resetTarget.personalEmail}`);
        setResetPasswordOpen(false);
        setResetTarget(null);
      } else {
        showError(response.message || 'فشل تغيير كلمة السر');
      }
    } catch (err) {
      showError(err.message || 'فشل تغيير كلمة السر');
    } finally {
      setResettingPassword(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'MOH_ADMIN': 'var(--accent-danger)',
      'SUPER_ADMIN': 'var(--accent-primary)',
      'INSPECTOR': 'var(--accent-warning)',
      'ANALYST': 'var(--accent-info)',
      'AUDITOR': 'var(--accent-success)',
    };
    return colors[role] || 'var(--text-muted)';
  };

  const iconButtonStyle = (color) => ({
    padding: 'var(--spacing-xs)',
    backgroundColor: 'transparent',
    border: 'none',
    color,
    cursor: 'pointer',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const columns = [
    { 
      key: 'name', 
      label: 'Name',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {value?.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{value}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{row.officialEmail || row.email}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'Role',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
          <Shield size={14} style={{ color: getRoleColor(value) }} />
          <span style={{ color: getRoleColor(value), fontWeight: 500 }}>
            {value?.replace('_', ' ')}
          </span>
        </div>
      )
    },
    { 
      key: 'department', 
      label: 'Department',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
          <Building size={14} style={{ color: 'var(--text-muted)' }} />
          {value}
        </div>
      )
    },
    { key: 'facility', label: 'Facility' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => <StatusBadge status={value} size="sm" />
    },
    { 
      key: 'lastActive', 
      label: 'Last Active',
      render: (value) => value || 'Never'
    },
    {
      key: 'actions',
      label: '',
      width: '130px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <button
            title="View Details"
            onClick={() => handleViewDetails(row)}
            style={iconButtonStyle('var(--text-muted)')}
          >
            <Eye size={16} />
          </button>
          <button
            title="Reset Password"
            onClick={() => openResetPassword(row)}
            style={iconButtonStyle('var(--accent-warning)')}
          >
            <KeyRound size={16} />
          </button>
          <button
            title="Remove"
            onClick={() => { setSelectedStaff(row); setDeleteModalOpen(true); }}
            style={iconButtonStyle('var(--accent-danger)')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    },
  ];

  const statCards = [
    { label: 'Total Staff', value: stats?.total || '-', color: 'var(--accent-primary)' },
    { label: 'Active', value: stats?.active || '-', color: 'var(--accent-success)' },
    { label: 'Inactive', value: stats?.inactive || '-', color: 'var(--text-muted)' },
    { label: 'New This Month', value: stats?.newThisMonth || '-', color: 'var(--accent-info)' },
  ];

  return (
    <div className="animate-fadeIn">
  {/* Header */}
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
    }}
  >
    <div>
      <h1
        style={{
          margin: 0,
          fontSize: '38px',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.5px',
        }}
      >
        <span style={{ color: '#004399' }}>Staff </span>
        <span style={{ color: '#111827' }}>Management</span>
      </h1>

      <p
        style={{
          marginTop: '8px',
          fontSize: '15px',
          color: 'var(--text-muted)',
        }}
      >
        Manage system users and their access permissions
      </p>
    </div>

    <Button
      variant="primary"
      icon={Plus}
      onClick={() => setAddStaffOpen(true)}
    >
      Add Staff Member
    </Button>
  </div>

  {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          statCards.map((stat, index) => (
            <div
              key={index}
              style={{
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-md)',
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search staff..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            style={{
              width: '100%',
              padding: 'var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 36px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-sm)',
            }}
          />
        </div>
        <select
          value={filters.role}
          onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <option value="">All Roles</option>
          <option value="MOH_ADMIN">MOH Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="INSPECTOR">Inspector</option>
          <option value="ANALYST">Analyst</option>
          <option value="AUDITOR">Auditor</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Data Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)',
          overflow: 'hidden',
        }}
      >
        <DataTable
          columns={columns}
          data={staff}
          loading={loading}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            onChange: (page) => setPagination(prev => ({ ...prev, page })),
          }}
          emptyMessage="No staff members found"
        />
      </div>

      {/* Details Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedStaff(null); }}
        title="Staff Details"
        size="md"
      >
        {selectedStaff && (
          <div style={{ padding: 'var(--spacing-md)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xl)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--accent-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  {selectedStaff.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedStaff.name}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{selectedStaff.role?.replace('_', ' ')}</div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={KeyRound}
                onClick={() => openResetPassword(selectedStaff)}
              >
                Reset Password
              </Button>
            </div>

            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
                  <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Official Email</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedStaff.officialEmail || selectedStaff.email}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
                  <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Personal Email</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedStaff.personalEmail || '-'}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
                  <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedStaff.phone || '-'}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
                  <IdCard size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>National ID</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedStaff.nationalId || '-'}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
                  <Cake size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date of Birth</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedStaff.dateOfBirth || '-'}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
                  <GraduationCap size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Qualification</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedStaff.qualification || '-'}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
                  <Briefcase size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Job Grade</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedStaff.jobGrade || '-'}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
                  <CalendarDays size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hire Date</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedStaff.hireDate || '-'}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Insurance Number</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedStaff.insuranceNumber || '-'}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
                  <Building size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedStaff.department}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Facility</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedStaff.facility}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</span>
                <div style={{ marginTop: 'var(--spacing-xs)' }}><StatusBadge status={selectedStaff.status} /></div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setSelectedStaff(null); }}
        title="Confirm Removal"
        size="sm"
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          Are you sure you want to remove <strong>{selectedStaff?.name}</strong> from the system? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
          <Button variant="secondary" onClick={() => { setDeleteModalOpen(false); setSelectedStaff(null); }}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Remove
          </Button>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetPasswordOpen}
        onClose={closeResetPassword}
        title="Reset Password"
        size="sm"
      >
        {resetTarget && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-lg)',
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  flexShrink: 0,
                }}
              >
                {resetTarget.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{resetTarget.name}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{resetTarget.officialEmail || resetTarget.email}</div>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)' }}>
              هيتولّد باسورد جديد آمن تلقائيًا لهذا الموظف، وهيتلغي الباسورد القديم فورًا.
            </p>

            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-xs)',
                alignItems: 'flex-start',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                الباسورد الجديد هيتبعت مباشرة على البريد الشخصي:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{resetTarget.personalEmail || 'غير مسجل'}</strong>
                {' '}— وهيتطلب من الموظف يغيّره أول ما يسجّل دخول. مفيش حد بيشوف الباسورد في الشاشة.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
              <Button variant="secondary" onClick={closeResetPassword} disabled={resettingPassword}>
                Cancel
              </Button>
              <Button
                variant="primary"
                leftIcon={RotateCcw}
                onClick={handleResetPassword}
                loading={resettingPassword}
              >
                Reset & Send
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Staff Modal */}
      <Modal
        isOpen={addStaffOpen}
        onClose={() => { setAddStaffOpen(false); resetAddStaffForm(); }}
        title="Add Staff Member"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setAddStaffOpen(false); resetAddStaffForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddStaff} loading={creatingStaff}>
              Create & Send Credentials
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>

          {/* ── Live ID-badge preview — mirrors the Ministry staff card this record will produce ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px dashed var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                flexShrink: 0,
              }}
            >
              {newStaff.name?.trim()?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--text-primary)' }}>
                {newStaff.name || 'New staff member'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', fontSize: 'var(--font-size-xs)', color: getRoleColor(newStaff.role) }}>
                <Shield size={12} />
                {newStaff.role?.replace('_', ' ')}
                {newStaff.department && <span style={{ color: 'var(--text-muted)' }}>· {newStaff.department}</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Login will be</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)', fontWeight: 500 }}>
                {newStaff.officialEmail || 'name@ministry.gov.eg'}
              </div>
            </div>
          </div>

          {/* ── Section 1: Identity ── */}
          <div
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                <IdCard size={14} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Identity</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Who this record belongs to</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Adam Youssef"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}><IdCard size={14} /> National ID (الرقم القومي)</label>
                <input
                  type="text"
                  value={newStaff.nationalId}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, nationalId: e.target.value }))}
                  placeholder="29001011234567"
                  maxLength={14}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}><Cake size={14} /> Date of Birth</label>
                <input
                  type="date"
                  value={newStaff.dateOfBirth}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+20 100 000 0000"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* ── Section 2: Account & Login — the section that actually gets emailed, so it's visually called out ── */}
          <div
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--accent-primary)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 0 0 1px color-mix(in srgb, var(--accent-primary) 15%, transparent)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                  flexShrink: 0,
                }}
              >
                <KeyRound size={14} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Account & Login</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Where the credentials get sent</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={labelStyle}><Mail size={14} /> Personal Email</label>
                <input
                  type="email"
                  value={newStaff.personalEmail}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, personalEmail: e.target.value }))}
                  placeholder="employee@gmail.com"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}><Mail size={14} /> Official Email (auto-suggested, editable)</label>
                <input
                  type="email"
                  value={newStaff.officialEmail}
                  onChange={(e) => handleOfficialEmailChange(e.target.value)}
                  placeholder="firstname.lastname@ministry.gov.eg"
                  style={inputStyle}
                />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-xs)',
                alignItems: 'flex-start',
                marginTop: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)',
              }}
            >
              <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                هيتولّد باسورد آمن تلقائيًا وهيتبعت مع الإيميل الرسمي على البريد الشخصي المكتوب فوق بس —
                مفيش حد بيشوفه في الشاشة، وهيتطلب من الموظف يغيّره أول ما يسجّل دخول. ولو ضاع منه، الأدمن يقدر يعمل
                Reset Password في أي وقت من صفحة الموظف.
              </span>
            </div>
          </div>

          {/* ── Section 3: Employment details the Ministry keeps on file ── */}
          <div
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                <Briefcase size={14} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Employment Details</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Role, placement, and HR record</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={labelStyle}>Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, role: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="INSPECTOR">Inspector</option>
                  <option value="ANALYST">Analyst</option>
                  <option value="AUDITOR">Auditor</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="MOH_ADMIN">MOH Admin</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}><GraduationCap size={14} /> Qualification (المؤهل الدراسي)</label>
                <input
                  type="text"
                  value={newStaff.qualification}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, qualification: e.target.value }))}
                  placeholder="e.g. Bachelor of Pharmacy"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}><Briefcase size={14} /> Job Grade (الدرجة الوظيفية)</label>
                <input
                  type="text"
                  value={newStaff.jobGrade}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, jobGrade: e.target.value }))}
                  placeholder="e.g. Grade A / First Class"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}><CalendarDays size={14} /> Hire Date (تاريخ التعيين)</label>
                <input
                  type="date"
                  value={newStaff.hireDate}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, hireDate: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}><ShieldCheck size={14} /> Insurance Number (الرقم التأميني)</label>
                <input
                  type="text"
                  value={newStaff.insuranceNumber}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, insuranceNumber: e.target.value }))}
                  placeholder="e.g. 123456789"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}><Building size={14} /> Department</label>
                <input
                  type="text"
                  value={newStaff.department}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, department: e.target.value }))}
                  placeholder="Operations"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Facility</label>
                <input
                  type="text"
                  value={newStaff.facility}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, facility: e.target.value }))}
                  placeholder="Cairo Central"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={newStaff.status}
                  onChange={(e) => setNewStaff((prev) => ({ ...prev, status: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Staff;