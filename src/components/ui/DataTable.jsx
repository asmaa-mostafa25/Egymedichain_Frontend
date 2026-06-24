import { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  MoreVertical,
} from 'lucide-react';
import { SkeletonTable } from '../common/Skeleton';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  sortable = true,
  searchable = true,
  filterable = false,
  pagination = true,
  pageSize = 10,
  totalItems = 0,
  currentPage = 1,
  onPageChange,
  onSort,
  onSearch,
  onFilter,
  onRowClick,
  onExport,
  emptyMessage = 'No data available',
  actions,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    onSort?.({ key, direction });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  if (loading) {
    return <SkeletonTable rows={pageSize} />;
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)',
        overflow: 'hidden',
      }}
    >
      {/* Table Header Actions */}
      {(searchable || filterable || onExport) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            borderBottom: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            {searchable && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-secondary)',
                  minWidth: '240px',
                }}
              >
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            )}

            {filterable && (
              <button
                onClick={onFilter}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <Filter size={16} />
                Filters
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            {onExport && (
              <button
                onClick={onExport}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--accent-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500,
                }}
              >
                <Download size={16} />
                Export
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    textAlign: column.align || 'left',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid var(--border-primary)',
                    cursor: column.sortable !== false && sortable ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    width: column.width,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    {column.label}
                    {sortable && column.sortable !== false && sortConfig.key === column.key && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp size={14} /> 
                        : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th
                  style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    textAlign: 'right',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid var(--border-primary)',
                    width: '80px',
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    borderBottom: rowIndex < data.length - 1 ? '1px solid var(--border-secondary)' : 'none',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-primary)',
                        textAlign: column.align || 'left',
                      }}
                    >
                      {column.render 
                        ? column.render(row[column.key], row) 
                        : row[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td
                      style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        textAlign: 'right',
                      }}
                    >
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  style={{
                    padding: 'var(--spacing-2xl)',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalItems > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            borderTop: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-muted)',
            }}
          >
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{' '}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <button
              onClick={() => onPageChange?.(1)}
              disabled={currentPage === 1}
              style={{
                padding: 'var(--spacing-xs)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-sm)',
                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: 'var(--spacing-xs)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-sm)',
                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <div
              style={{
                padding: 'var(--spacing-xs) var(--spacing-md)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-primary)',
              }}
            >
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: 'var(--spacing-xs)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-sm)',
                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-secondary)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => onPageChange?.(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: 'var(--spacing-xs)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-sm)',
                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-secondary)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
