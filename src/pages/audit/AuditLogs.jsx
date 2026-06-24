import { useEffect, useState } from 'react';
import { 
  History, 
  Search,
  Filter,
  Download,
  Eye,
  User,
  Clock,
  FileText,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import { useUIStore, useNotificationStore } from '../../store';
import { auditApi } from '../../api';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { SkeletonCard } from '../../components/common/Skeleton';

const AuditLog = () => {
  const { setPageTitle, setBreadcrumbs } = useUIStore();
  const { error: showError } = useNotificationStore();

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ search: '', action: '', user: '', dateRange: '7d' });
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    setPageTitle('Audit Log');
    setBreadcrumbs(['Home', 'Audit']);
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await auditApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      if (response.success) {
        setLogs(response.data.logs || []);
        setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
      }
    } catch (err) {
      showError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await auditApi.getStats({ dateRange: filters.dateRange });
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      // Stats are secondary
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'create':
        return <FileText size={14} style={{ color: 'var(--accent-success)' }} />;
      case 'update':
        return <History size={14} style={{ color: 'var(--accent-info)' }} />;
      case 'delete':
        return <AlertTriangle size={14} style={{ color: 'var(--accent-danger)' }} />;
      case 'login':
        return <Shield size={14} style={{ color: 'var(--accent-primary)' }} />;
      default:
        return <Clock size={14} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  const columns = [
    { 
      key: 'timestamp', 
      label: 'Timestamp',
      width: '180px',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>
          <Clock size={14} style={{ color: 'var(--text-muted)' }} />
          {value ? new Date(value).toLocaleString() : '-'}
        </div>
      )
    },
    { 
      key: 'user', 
      label: 'User',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {value?.charAt(0) || '?'}
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{value}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{row.role}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'action', 
      label: 'Action',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
          {getActionIcon(value)}
          <span style={{ textTransform: 'capitalize' }}>{value}</span>
        </div>
      )
    },
    { key: 'resource', label: 'Resource' },
    { key: 'description', label: 'Description' },
    { 
      key: 'ipAddress', 
      label: 'IP Address',
      render: (value) => (
        <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          {value || '-'}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      width: '60px',
      render: (_, row) => (
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
      )
    },
  ];

  const statCards = [
    { label: 'Total Events', value: stats?.totalEvents?.toLocaleString() || '-', color: 'var(--text-primary)' },
    { label: 'Logins', value: stats?.logins || '-', color: 'var(--accent-primary)' },
    { label: 'Changes', value: stats?.changes || '-', color: 'var(--accent-warning)' },
    { label: 'Security Events', value: stats?.securityEvents || '-', color: 'var(--accent-danger)' },
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
            Audit Log
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Complete record of all system activities and changes
          </p>
        </div>
        <Button variant="secondary" leftIcon={Download}>
          Export Logs
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
            placeholder="Search logs..."
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
          value={filters.action}
          onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
        </select>
        <select
          value={filters.dateRange}
          onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
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
          data={logs}
          loading={loading}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            onChange: (page) => setPagination(prev => ({ ...prev, page })),
          }}
          emptyMessage="No audit logs found"
        />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedLog(null); }}
        title="Audit Log Details"
        size="md"
      >
        {selectedLog && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timestamp</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {selectedLog.timestamp ? new Date(selectedLog.timestamp).toLocaleString() : '-'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedLog.user}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{selectedLog.action}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Resource</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedLog.resource}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>IP Address</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{selectedLog.ipAddress}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User Agent</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedLog.userAgent || '-'}</div>
              </div>
            </div>
            <div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Description</span>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                {selectedLog.description}
              </div>
            </div>
            {selectedLog.changes && (
              <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Changes</span>
                <pre
                  style={{
                    marginTop: 'var(--spacing-xs)',
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-secondary)',
                    overflow: 'auto',
                  }}
                >
                  {JSON.stringify(selectedLog.changes, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLog;
