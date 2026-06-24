import { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  TrendingUp,
  BarChart2,
  PieChart,
  Clock,
} from 'lucide-react';
import { useUIStore, useNotificationStore } from '../../store';
import { reportsApi } from '../../api';
import DataTable from '../../components/ui/DataTable';
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
  BarChart,
  Bar,
} from 'recharts';

const Reports = () => {
  const { setPageTitle, setBreadcrumbs } = useUIStore();
  const { success, error: showError } = useNotificationStore();

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ type: '', dateRange: '30d' });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setPageTitle('Reports & Analytics');
    setBreadcrumbs(['Home', 'Reports']);
  }, []);

  useEffect(() => {
    fetchReports();
    fetchStats();
    fetchChartData();
  }, [pagination.page, filters]);

  const getFallbackReports = (response) => {
    const payload = response?.data ?? response;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.reports)) {
      return payload.reports;
    }

    if (Array.isArray(payload?.data?.reports)) {
      return payload.data.reports;
    }

    try {
      const storedReports = localStorage.getItem('egy_medichain_local_reports');
      const parsedReports = storedReports ? JSON.parse(storedReports) : [];
      return Array.isArray(parsedReports) ? parsedReports : [];
    } catch {
      return [];
    }
  };

  const getFallbackReportTotal = (response) => {
    const payload = response?.data ?? response;

    if (typeof payload?.total === 'number') {
      return payload.total;
    }

    if (typeof payload?.data?.total === 'number') {
      return payload.data.total;
    }

    return getFallbackReports(response).length;
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      if (response.success) {
        const nextReports = getFallbackReports(response);
        const nextTotal = getFallbackReportTotal(response);

        setReports(nextReports);
        setPagination(prev => ({ ...prev, total: nextTotal }));
      }
    } catch (err) {
      showError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reportsApi.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      // Stats are secondary
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await reportsApi.getAnalytics({ period: filters.dateRange });
      if (response.success) {
        setChartData(response.data);
      }
    } catch (err) {
      // Chart data is secondary
    }
  };

  const triggerDownload = (blob, filename) => {
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  };

  const getBlobFileName = (report, blob) => {
    const safeName = (report?.name || report?.type || 'report')
      .toString()
      .trim()
      .replace(/[^a-z0-9]+/gi, '-');

    const contentType = blob?.type || 'application/pdf';
    const ext = contentType.includes('csv')
      ? 'csv'
      : contentType.includes('json')
        ? 'json'
        : 'pdf';

    return `${safeName || 'report'}-${report?.id || Date.now()}.${ext}`;
  };

  const handleGenerateReport = async (type) => {
    try {
      setGenerating(true);
      const response = await reportsApi.generate({ type, dateRange: filters.dateRange });
      if (response.success) {
        const fallbackReports = getFallbackReports({});
        setReports(fallbackReports);
        setPagination(prev => ({ ...prev, total: fallbackReports.length }));
        success('Report generation started');
        await Promise.all([fetchReports(), fetchStats(), fetchChartData()]);
      } else {
        showError(response.message || 'Failed to generate report');
      }
    } catch (err) {
      showError(err.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report) => {
    try {
      const response = await reportsApi.download(report.id);
      const blob = response?.data ?? response;

      if (!(blob instanceof Blob)) {
        throw new Error('No downloadable content returned');
      }

      triggerDownload(blob, getBlobFileName(report, blob));
      success('Download started');
    } catch (err) {
      showError(err.message || 'Failed to download report');
    }
  };

  const handleExportReports = () => {
    if (!reports.length) {
      showError('No reports available to export');
      return;
    }

    const headers = ['Report Name', 'Type', 'Generated By', 'Created', 'Size', 'Status'];
    const rows = reports.map((report) => [
      report.name || '',
      report.type || '',
      report.generatedBy || '',
      report.createdAt || '',
      report.size || '',
      report.status || '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `reports-${new Date().toISOString().slice(0, 10)}.csv`);
    success('Export started');
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Report Name',
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{value}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{row.type}</div>
          </div>
        </div>
      )
    },
    { key: 'generatedBy', label: 'Generated By' },
    { 
      key: 'createdAt', 
      label: 'Created',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    { 
      key: 'size', 
      label: 'Size',
      align: 'right',
      render: (value) => value || '-'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => <StatusBadge status={value} size="sm" />
    },
    {
      key: 'actions',
      label: '',
      width: '100px',
      render: (_, row) => (
        <button
          onClick={() => handleDownload(row)}
          disabled={row.status !== 'ready'}
          style={{
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            backgroundColor: row.status === 'ready' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            border: 'none',
            color: row.status === 'ready' ? 'white' : 'var(--text-muted)',
            cursor: row.status === 'ready' ? 'pointer' : 'not-allowed',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
          }}
        >
          <Download size={14} />
          Download
        </button>
      )
    },
  ];

  const reportTypes = [
    { id: 'inventory', label: 'Inventory Report', icon: BarChart2 },
    { id: 'shipments', label: 'Shipments Report', icon: TrendingUp },
    { id: 'compliance', label: 'Compliance Report', icon: FileText },
    { id: 'audit', label: 'Audit Report', icon: PieChart },
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
            Reports & Analytics
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Generate and download system reports and analytics
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* Quick Generate Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleGenerateReport(type.id)}
            disabled={generating}
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-primary)',
              cursor: generating ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              <type.icon size={20} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
              {type.label}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
              Click to generate
            </div>
          </button>
        ))}
      </div>

      {/* Analytics Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        {loading ? (
          <>
            <SkeletonChart />
            <SkeletonCard />
          </>
        ) : (
          <>
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
                Supply Chain Performance
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData?.performance || [
                  { name: 'Jan', shipments: 120, deliveries: 115 },
                  { name: 'Feb', shipments: 150, deliveries: 142 },
                  { name: 'Mar', shipments: 180, deliveries: 175 },
                  { name: 'Apr', shipments: 165, deliveries: 160 },
                  { name: 'May', shipments: 200, deliveries: 195 },
                  { name: 'Jun', shipments: 220, deliveries: 210 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-muted)" 
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Bar dataKey="shipments" fill="#00C2A8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deliveries" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
                Key Metrics
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {[
                  { label: 'On-Time Delivery', value: '94.5%', color: 'var(--accent-success)' },
                  { label: 'Compliance Rate', value: '99.2%', color: 'var(--accent-primary)' },
                  { label: 'Inventory Accuracy', value: '97.8%', color: 'var(--accent-info)' },
                  { label: 'Avg Processing Time', value: '2.4h', color: 'var(--accent-warning)' },
                ].map((metric, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--spacing-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{metric.label}</span>
                    <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: metric.color }}>{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Reports Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: 'var(--spacing-lg)',
            borderBottom: '1px solid var(--border-primary)',
          }}
        >
          <h3
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Generated Reports
          </h3>
        </div>
        <DataTable
          columns={columns}
          data={reports}
          loading={loading}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            onChange: (page) => setPagination(prev => ({ ...prev, page })),
          }}
          onExport={handleExportReports}
          emptyMessage="No reports generated yet"
        />
      </div>
    </div>
  );
};

export default Reports;
