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
} from 'lucide-react';
import { useUIStore, useNotificationStore } from '../../store';
import { staffApi } from '../../api';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Drawer from '../../components/ui/Drawer';
import { SkeletonCard } from '../../components/common/Skeleton';

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
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'INSPECTOR',
    department: '',
    facility: '',
    password: '',
    status: 'active',
  });

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

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email || !newStaff.password) {
      showError('Name, email, and password are required');
      return;
    }

    try {
      setCreatingStaff(true);
      const response = await staffApi.create(newStaff);

      if (response.success) {
        success('Staff member added successfully');
        setAddStaffOpen(false);
        setNewStaff({
          name: '',
          email: '',
          phone: '',
          role: 'INSPECTOR',
          department: '',
          facility: '',
          password: '',
          status: 'active',
        });
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
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{row.email}</div>
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
      width: '100px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <button
            onClick={() => handleViewDetails(row)}
            style={{
              padding: 'var(--spacing-xs)',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => { setSelectedStaff(row); setDeleteModalOpen(true); }}
            style={{
              padding: 'var(--spacing-xs)',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--accent-danger)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
            }}
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
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            Staff Management
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Manage system users and their access permissions
          </p>
        </div>
        <Button variant="primary" leftIcon={Plus} onClick={() => setAddStaffOpen(true)}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
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

            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
                  <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedStaff.email}</div>
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

      <Modal
        isOpen={addStaffOpen}
        onClose={() => setAddStaffOpen(false)}
        title="Add Staff Member"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddStaffOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddStaff} loading={creatingStaff}>
              Create Staff Member
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--spacing-md)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Full Name
              </label>
              <input
                type="text"
                value={newStaff.name}
                onChange={(e) => setNewStaff((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Adam Youssef"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={newStaff.email}
                onChange={(e) => setNewStaff((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="staff@ministry.gov.eg"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={newStaff.phone}
                onChange={(e) => setNewStaff((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+20 100 000 0000"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Role
              </label>
              <select
                value={newStaff.role}
                onChange={(e) => setNewStaff((prev) => ({ ...prev, role: e.target.value }))}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <option value="INSPECTOR">Inspector</option>
                <option value="ANALYST">Analyst</option>
                <option value="AUDITOR">Auditor</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="MOH_ADMIN">MOH Admin</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Department
              </label>
              <input
                type="text"
                value={newStaff.department}
                onChange={(e) => setNewStaff((prev) => ({ ...prev, department: e.target.value }))}
                placeholder="Operations"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Facility
              </label>
              <input
                type="text"
                value={newStaff.facility}
                onChange={(e) => setNewStaff((prev) => ({ ...prev, facility: e.target.value }))}
                placeholder="Cairo Central"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              Temporary Password
            </label>
            <input
              type="password"
              value={newStaff.password}
              onChange={(e) => setNewStaff((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Set initial password"
              style={{
                width: '100%',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-size-sm)',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              Status
            </label>
            <select
              value={newStaff.status}
              onChange={(e) => setNewStaff((prev) => ({ ...prev, status: e.target.value }))}
              style={{
                width: '100%',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Staff;
