import { useEffect, useState } from 'react';
import { 
  Truck, 
  Plus, 
  Filter, 
  Download, 
  Search,
  MapPin,
  Clock,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { useUIStore, useNotificationStore } from '../../store';
import { shipmentsApi } from '../../api';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Drawer from '../../components/ui/Drawer';
import TimelineTracker from '../../components/ui/TimelineTracker';
import { SkeletonCard } from '../../components/common/Skeleton';

const Shipments = () => {
  const { setPageTitle, setBreadcrumbs } = useUIStore();
  const { error: showError } = useNotificationStore();

  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setPageTitle('Shipment Tracking');
    setBreadcrumbs(['Home', 'Shipments']);
  }, []);

  useEffect(() => {
    fetchShipments();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await shipmentsApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      if (response.success) {
        setShipments(response.data.shipments || []);
        setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
      }
    } catch (err) {
      showError(err.message || 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await shipmentsApi.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      // Stats are secondary
    }
  };

  const handleViewDetails = (shipment) => {
    setSelectedShipment(shipment);
    setDrawerOpen(true);
  };

  const columns = [
    { 
      key: 'id', 
      label: 'Shipment ID', 
      width: '140px',
      render: (value) => (
        <span style={{ fontFamily: 'monospace', color: 'var(--accent-primary)' }}>{value}</span>
      )
    },
    { 
      key: 'origin', 
      label: 'Origin',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
          <MapPin size={14} style={{ color: 'var(--accent-success)' }} />
          {value}
        </div>
      )
    },
    { 
      key: 'destination', 
      label: 'Destination',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
          <MapPin size={14} style={{ color: 'var(--accent-danger)' }} />
          {value}
        </div>
      )
    },
    { key: 'carrier', label: 'Carrier' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => <StatusBadge status={value} size="sm" />
    },
    { 
      key: 'eta', 
      label: 'ETA',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>
          <Clock size={14} />
          {value || '-'}
        </div>
      )
    },
    { 
      key: 'items', 
      label: 'Items', 
      align: 'right',
      render: (value) => value?.toLocaleString() || '-'
    },
    {
      key: 'actions',
      label: '',
      width: '80px',
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
    { label: 'In Transit', value: stats?.inTransit || '-', color: 'var(--accent-primary)' },
    { label: 'Delivered Today', value: stats?.deliveredToday || '-', color: 'var(--accent-success)' },
    { label: 'Pending', value: stats?.pending || '-', color: 'var(--accent-warning)' },
    { label: 'Delayed', value: stats?.delayed || '-', color: 'var(--accent-danger)' },
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
            Shipment Tracking
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Monitor and manage pharmaceutical shipments in real-time
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <Button variant="secondary" leftIcon={Download}>
            Export
          </Button>
          <Button variant="primary" leftIcon={Plus}>
            New Shipment
          </Button>
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
            placeholder="Search shipments..."
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
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="delayed">Delayed</option>
          <option value="cancelled">Cancelled</option>
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
          data={shipments}
          loading={loading}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            onChange: (page) => setPagination(prev => ({ ...prev, page })),
          }}
          emptyMessage="No shipments found"
        />
      </div>

      {/* Details Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedShipment(null); }}
        title="Shipment Details"
        size="lg"
      >
        {selectedShipment && (
          <div style={{ padding: 'var(--spacing-md)' }}>
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                <div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Shipment ID</span>
                  <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                    {selectedShipment.id}
                  </div>
                </div>
                <StatusBadge status={selectedShipment.status} size="lg" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
              <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
                  <MapPin size={14} style={{ color: 'var(--accent-success)' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Origin</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)', fontWeight: 500 }}>{selectedShipment.origin}</div>
              </div>
              <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
                  <MapPin size={14} style={{ color: 'var(--accent-danger)' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destination</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-primary)', fontWeight: 500 }}>{selectedShipment.destination}</div>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)', textTransform: 'uppercase' }}>
                Tracking Timeline
              </h4>
              <TimelineTracker
                events={selectedShipment.timeline || [
                  { status: 'complete', title: 'Order Created', description: 'Shipment initiated', timestamp: '2024-01-15 09:00' },
                  { status: 'complete', title: 'Picked Up', description: 'Collected from Cairo Central', timestamp: '2024-01-15 11:30' },
                  { status: 'current', title: 'In Transit', description: 'En route to destination', timestamp: '2024-01-15 14:00' },
                  { status: 'pending', title: 'Delivery', description: 'Expected arrival', timestamp: 'ETA: 2024-01-16 10:00' },
                ]}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Carrier</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedShipment.carrier || 'MOH Logistics'}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Items</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedShipment.items?.toLocaleString() || '-'} units</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ETA</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{selectedShipment.eta || '-'}</div>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Temperature</span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent-success)' }}>2-8°C (Normal)</div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Shipments;
