import { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Search,
  Filter,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { useUIStore, useNotificationStore, useAuthStore } from '../../store';
import { approvalsApi } from '../../api';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { SkeletonCard } from '../../components/common/Skeleton';

const Approvals = () => {
  const { setPageTitle, setBreadcrumbs } = useUIStore();
  const { success, error: showError } = useNotificationStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: 'pending', type: '' });
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setPageTitle('Approval Center');
    setBreadcrumbs(['Home', 'Approvals']);
  }, []);

  useEffect(() => {
    fetchApprovals();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await approvalsApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      if (response.success) {
        setApprovals(response.data.approvals || []);
        setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
      }
    } catch (err) {
      showError(err.message || 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await approvalsApi.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      // Stats are secondary
    }
  };

  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    setDetailModalOpen(true);
  };

  const openActionModal = (approval, type) => {
    setSelectedApproval(approval);
    setActionType(type);
    setActionReason('');
    setActionModalOpen(true);
  };

  const handleAction = async () => {
    if (!selectedApproval || !actionType) return;
    
    try {
      setProcessing(true);
      const response = await approvalsApi.processApproval(selectedApproval.id, {
        action: actionType,
        reason: actionReason,
        approvedBy: user?.id,
      });
      
      if (response.success) {
        success(`Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
        setActionModalOpen(false);
        setSelectedApproval(null);
        setActionType(null);
        setActionReason('');
        fetchApprovals();
        fetchStats();
      }
    } catch (err) {
      showError(err.message || 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    { 
      key: 'requestId', 
      label: 'Request ID', 
      width: '140px',
      render: (value) => (
        <span style={{ fontFamily: 'monospace', color: 'var(--accent-primary)' }}>{value}</span>
      )
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
          <FileText size={14} style={{ color: 'var(--text-muted)' }} />
          {value}
        </div>
      )
    },
    { key: 'requestedBy', label: 'Requested By' },
    { key: 'facility', label: 'Facility' },
    { 
      key: 'createdAt', 
      label: 'Submitted',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    { 
      key: 'priority', 
      label: 'Priority',
      render: (value) => (
        <span style={{ 
          color: value === 'high' ? 'var(--accent-danger)' : 
                 value === 'medium' ? 'var(--accent-warning)' : 
                 'var(--text-secondary)',
          fontWeight: 500,
          textTransform: 'capitalize',
        }}>
          {value || 'Normal'}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => <StatusBadge status={value} size="sm" />
    },
    {
      key: 'actions',
      label: '',
      width: '180px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <button
            onClick={() => handleViewDetails(row)}
            style={{
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
            }}
          >
            <Eye size={14} />
          </button>
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => openActionModal(row, 'approve')}
                style={{
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  backgroundColor: 'var(--accent-success)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-xs)',
                }}
              >
                <CheckCircle size={14} />
              </button>
              <button
                onClick={() => openActionModal(row, 'reject')}
                style={{
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  backgroundColor: 'var(--accent-danger)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-xs)',
                }}
              >
                <XCircle size={14} />
              </button>
            </>
          )}
        </div>
      )
    },
  ];

  const statCards = [
    { label: 'Pending', value: stats?.pending || '-', color: 'var(--accent-warning)' },
    { label: 'Approved Today', value: stats?.approvedToday || '-', color: 'var(--accent-success)' },
    { label: 'Rejected', value: stats?.rejected || '-', color: 'var(--accent-danger)' },
    { label: 'Avg Response', value: stats?.avgResponse || '-', color: 'var(--accent-info)' },
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
            Approval Center
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Review and process pending approval requests
          </p>
        </div>
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
            placeholder="Search requests..."
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <option value="">All Types</option>
          <option value="shipment">Shipment</option>
          <option value="inventory">Inventory</option>
          <option value="transfer">Transfer</option>
          <option value="disposal">Disposal</option>
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
          data={approvals}
          loading={loading}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            onChange: (page) => setPagination(prev => ({ ...prev, page })),
          }}
          emptyMessage="No approval requests found"
        />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedApproval(null); }}
        title="Request Details"
        size="md"
      >
        {selectedApproval && (
          <div>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                <div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Request ID</span>
                  <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                    {selectedApproval.requestId}
                  </div>
                </div>
                <StatusBadge status={selectedApproval.status} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedApproval.type}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Requested By</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedApproval.requestedBy}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Facility</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedApproval.facility}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Priority</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{selectedApproval.priority || 'Normal'}</div>
              </div>
            </div>
            {selectedApproval.description && (
              <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Description</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                  {selectedApproval.description}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => { setActionModalOpen(false); setSelectedApproval(null); setActionType(null); }}
        title={actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
        size="sm"
      >
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
            {actionType === 'approve' 
              ? 'Are you sure you want to approve this request?' 
              : 'Please provide a reason for rejecting this request.'}
          </p>
          {actionType === 'reject' && (
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              style={{
                width: '100%',
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-size-sm)',
                minHeight: '100px',
                resize: 'vertical',
                marginBottom: 'var(--spacing-lg)',
              }}
            />
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
            <Button variant="secondary" onClick={() => { setActionModalOpen(false); setSelectedApproval(null); }}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'approve' ? 'success' : 'danger'} 
              onClick={handleAction}
              loading={processing}
              disabled={actionType === 'reject' && !actionReason.trim()}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Approvals;
