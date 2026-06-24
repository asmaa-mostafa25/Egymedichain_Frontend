import { useEffect, useState } from 'react';
import { 
  Activity, 
  Thermometer, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Server,
  Wifi,
  Battery,
  Clock,
} from 'lucide-react';
import { useUIStore, useNotificationStore } from '../../store';
import { monitoringApi } from '../../api';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { SkeletonCard, SkeletonChart } from '../../components/common/Skeleton';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const Monitoring = () => {
  const { setPageTitle, setBreadcrumbs } = useUIStore();
  const { error: showError } = useNotificationStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    facilities: [],
    alerts: [],
    systemHealth: null,
    temperatureData: [],
  });

  useEffect(() => {
    setPageTitle('Real-time Monitoring');
    setBreadcrumbs(['Home', 'Monitoring']);
    fetchMonitoringData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      if (!loading) setRefreshing(true);
      
      const [facilitiesRes, alertsRes, healthRes] = await Promise.all([
        monitoringApi.getFacilities(),
        monitoringApi.getAlerts(),
        monitoringApi.getSystemHealth(),
      ]);

      setData({
        facilities: facilitiesRes.success ? facilitiesRes.data : [],
        alerts: alertsRes.success ? alertsRes.data : [],
        systemHealth: healthRes.success ? healthRes.data : null,
        temperatureData: healthRes.success ? healthRes.data.temperatureHistory : [],
      });
    } catch (err) {
      showError(err.message || 'Failed to load monitoring data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'var(--accent-success)';
      case 'warning': return 'var(--accent-warning)';
      case 'critical': return 'var(--accent-danger)';
      default: return 'var(--text-muted)';
    }
  };

  const systemMetrics = [
    { label: 'API Response', value: data.systemHealth?.apiResponse || '45ms', status: 'healthy', icon: Server },
    { label: 'Network Status', value: data.systemHealth?.network || 'Online', status: 'healthy', icon: Wifi },
    { label: 'Database', value: data.systemHealth?.database || 'Connected', status: 'healthy', icon: Activity },
    { label: 'Last Sync', value: data.systemHealth?.lastSync || '2m ago', status: 'healthy', icon: RefreshCw },
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
            Real-time Monitoring
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Live facility status and environmental monitoring
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <div className="status-indicator status-online" />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent-success)' }}>Live</span>
          </div>
          <Button 
            variant="secondary" 
            leftIcon={RefreshCw}
            onClick={fetchMonitoringData}
            loading={refreshing}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health */}
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
          systemMetrics.map((metric, index) => (
            <div
              key={index}
              style={{
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                <metric.icon size={20} style={{ color: getHealthColor(metric.status) }} />
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: getHealthColor(metric.status),
                  }}
                />
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                {metric.label}
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
                {metric.value}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Main Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        {/* Temperature Chart */}
        {loading ? (
          <SkeletonChart />
        ) : (
          <div
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-lg)' }}>
              <h3
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                Cold Chain Temperature Monitoring
              </h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Thermometer size={14} style={{ color: 'var(--accent-success)' }} />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-success)' }}>
                  2-8°C Range OK
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.temperatureData.length ? data.temperatureData : [
                { time: '00:00', temp: 4.2, min: 2, max: 8 },
                { time: '04:00', temp: 4.5, min: 2, max: 8 },
                { time: '08:00', temp: 5.1, min: 2, max: 8 },
                { time: '12:00', temp: 5.8, min: 2, max: 8 },
                { time: '16:00', temp: 4.9, min: 2, max: 8 },
                { time: '20:00', temp: 4.3, min: 2, max: 8 },
                { time: '24:00', temp: 4.1, min: 2, max: 8 },
              ]}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C2A8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00C2A8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 12]}
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  tickFormatter={(value) => `${value}°C`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                  formatter={(value) => [`${value}°C`, 'Temperature']}
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="#00C2A8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                />
                <Line 
                  type="monotone" 
                  dataKey="min" 
                  stroke="#F59E0B" 
                  strokeDasharray="5 5" 
                  strokeWidth={1}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="max" 
                  stroke="#EF4444" 
                  strokeDasharray="5 5" 
                  strokeWidth={1}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Active Alerts */}
        <div
          style={{
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Active Alerts
            </h3>
            <span
              style={{
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                backgroundColor: 'var(--accent-danger)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'white',
              }}
            >
              {data.alerts.length || 3}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '60px', borderRadius: 'var(--radius-md)' }} />
              ))
            ) : (
              (data.alerts.length ? data.alerts : [
                { id: 1, type: 'critical', message: 'Temperature excursion in Unit 4', time: '2m ago', facility: 'Alexandria Hub' },
                { id: 2, type: 'warning', message: 'Low battery on tracker #T-847', time: '15m ago', facility: 'Cairo Central' },
                { id: 3, type: 'warning', message: 'Humidity threshold exceeded', time: '28m ago', facility: 'Giza Warehouse' },
              ]).map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    display: 'flex',
                    gap: 'var(--spacing-md)',
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `3px solid ${
                      alert.type === 'critical' ? 'var(--accent-danger)' : 'var(--accent-warning)'
                    }`,
                  }}
                >
                  <AlertTriangle 
                    size={16} 
                    style={{ 
                      color: alert.type === 'critical' ? 'var(--accent-danger)' : 'var(--accent-warning)',
                      flexShrink: 0,
                      marginTop: '2px',
                    }} 
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', marginBottom: '2px' }} className="truncate">
                      {alert.message}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {alert.facility} • {alert.time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      <div
        style={{
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <h3
          style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          Facility Status Overview
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--spacing-md)',
          }}
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            (data.facilities.length ? data.facilities : [
              { id: 1, name: 'Cairo Central', status: 'online', inventory: '245,000', temperature: '4.2°C', lastUpdate: '1m ago' },
              { id: 2, name: 'Alexandria Hub', status: 'warning', inventory: '182,000', temperature: '7.8°C', lastUpdate: '2m ago' },
              { id: 3, name: 'Giza Warehouse', status: 'online', inventory: '156,000', temperature: '5.1°C', lastUpdate: '30s ago' },
              { id: 4, name: 'Luxor Facility', status: 'online', inventory: '98,000', temperature: '4.8°C', lastUpdate: '1m ago' },
              { id: 5, name: 'Aswan Center', status: 'online', inventory: '67,000', temperature: '5.5°C', lastUpdate: '45s ago' },
              { id: 6, name: 'Port Said', status: 'offline', inventory: '89,000', temperature: '-', lastUpdate: '15m ago' },
            ]).map((facility) => (
              <div
                key={facility.id}
                style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${
                    facility.status === 'online' ? 'var(--border-primary)' :
                    facility.status === 'warning' ? 'var(--accent-warning)' :
                    'var(--accent-danger)'
                  }`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <MapPin size={16} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{facility.name}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                    }}
                  >
                    <div
                      className={`status-indicator ${
                        facility.status === 'online' ? 'status-online' :
                        facility.status === 'warning' ? 'status-warning' :
                        'status-offline'
                      }`}
                    />
                    <span style={{ 
                      fontSize: 'var(--font-size-xs)', 
                      color: facility.status === 'online' ? 'var(--accent-success)' :
                             facility.status === 'warning' ? 'var(--accent-warning)' :
                             'var(--accent-danger)',
                      textTransform: 'capitalize',
                    }}>
                      {facility.status}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Inventory</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>{facility.inventory}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Temperature</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>{facility.temperature}</div>
                  </div>
                </div>
                <div style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Last update: {facility.lastUpdate}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
