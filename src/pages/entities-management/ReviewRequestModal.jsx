import { useMemo, useState } from 'react';
import { Eye, Download, X, Check, FileText } from 'lucide-react';

const ReviewRequestModal = ({
  open,
  item,
  onClose,
  showError,
  onAction,
  entityLabel = 'Request',
  headerTitle = 'Request Details',
  requestFields = [],
  documents = [],
}) => {
  const [activeSection, setActiveSection] = useState('Request Information');

  const docCount = documents?.length || 0;

  const normalizedFields = useMemo(() => {
    return Array.isArray(requestFields) ? requestFields : [];
  }, [requestFields]);

  if (!open) return null;

  const handleViewDoc = (doc) => {
    if (!doc?.url) {
      showError?.('Document not available yet');
      return;
    }
    window.open(doc.url, '_blank');
  };

  const handleDownloadDoc = (doc) => {
    if (!doc?.url) {
      showError?.('Document not available for download yet');
      return;
    }
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    link.click();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 9999,
        paddingTop: 40,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92vw',
          maxWidth: 460,
          background: '#fff',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0,0,0,0.25)',
          maxHeight: '90vh',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 20px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
  style={{
    width: 56,
    height: 56,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    border: '2px solid #E5E7EB',
  }}
>
  <img
    src="/images/logo.png"
    alt="Hospital"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }}
  />
</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>{headerTitle}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{entityLabel} request</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', flexShrink: 0 }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', padding: '0 20px' }}>
          {['Request Information', 'Documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              style={{
                padding: '10px 14px',
                border: 'none',
                borderBottom: activeSection === tab ? '2px solid #004399' : '2px solid transparent',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: activeSection === tab ? 600 : 400,
                color: activeSection === tab ? '#004399' : '#6B7280',
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {activeSection === 'Request Information' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {normalizedFields.map(([label, value]) => (
                <div key={label}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{label}</label>
                  <input value={value ?? ''} readOnly style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 13, color: '#374151', background: '#fff', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              ))}
            </div>
          )}

          {activeSection === 'Documents' && (
            <div>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>{docCount} documents attached to this request</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {documents.map((doc) => (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#FAFAFA' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: '#FEE2E2', color: '#DC2626', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {doc.type || 'FILE'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{doc.size || '--'} · {doc.date || '--'}</div>
                    </div>
                    <button onClick={() => handleViewDoc(doc)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                      <Eye size={12} /> View
                    </button>
                    <button onClick={() => handleDownloadDoc(doc)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                      <Download size={12} /> Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '14px 20px', borderTop: '1px solid #F0F0F0' }}>
          <button onClick={() => onAction?.('reject', item)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#EF4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Reject
          </button>
          <button onClick={() => onAction?.('approve', item)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#1D4ED8', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Approve
          </button>
          <button onClick={() => onAction?.('inspection', item)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#F59E0B', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Request Inspection
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewRequestModal;