// src/pages/RegistrationRequests/ReviewRequestModal.jsx
import { useState, useEffect } from 'react';
import { X, Check, XCircle, FileWarning, Download, FileText, Loader2 } from 'lucide-react';

// ─── Props (كما تُستخدم في WarehouseDashboard) ─────────────────────────────
// open: boolean
// item: object | null            → الصف المختار (الرد الكامل من getById لو اتحمّل)
// onClose: () => void
// showError: (msg) => void
// headerTitle: string
// entityLabel: string
// requestFields: [label, value][]  → أزواج تُعرض كما هي
// documents: { id, name, type, size, date, url }[]
// onAction: (action: 'approve'|'reject'|'inspection', item, extra?) => void
//   extra بيحمل rejectionReason أو adminNotes حسب الحالة

const ReviewRequestModal = ({
  open,
  item,
  onClose,
  showError,
  headerTitle = 'Registration Request',
  entityLabel = 'Request',
  requestFields = [],
  documents = [],
  onAction,
}) => {
  const [mode, setMode] = useState(null); // null | 'reject' | 'inspection'
  const [reasonText, setReasonText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // إعادة الضبط كل ما يتغير العنصر أو تتقفل النافذة
  useEffect(() => {
    setMode(null);
    setReasonText('');
    setSubmitting(false);
    setDownloadingId(null);
  }, [item, open]);

  if (!open || !item) return null;

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await onAction('approve', item);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!reasonText.trim()) {
      showError?.('يجب كتابة سبب الرفض');
      return;
    }
    setSubmitting(true);
    try {
      await onAction('reject', item, { rejectionReason: reasonText.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmInspection = async () => {
    if (!reasonText.trim()) {
      showError?.('يجب كتابة ملاحظة توضح المستندات المطلوبة');
      return;
    }
    setSubmitting(true);
    try {
      await onAction('inspection', item, { adminNotes: reasonText.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── تحميل المستند فعليًا بدل فتحه في تاب جديد فقط ─────────────────────
  const handleDownload = async (doc) => {
    if (!doc.url || downloadingId) return;
    setDownloadingId(doc.id);
    try {
      const res = await fetch(doc.url);
      if (!res.ok) throw new Error('فشل تحميل الملف');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = doc.name || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // fallback: لو فشل التحميل (CORS مثلاً) افتح الملف في تاب جديد
      showError?.('تعذر تحميل الملف مباشرة، سيتم فتحه في نافذة جديدة');
      window.open(doc.url, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloadingId(null);
    }
  };

  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20,
  };

  const cardStyle = {
    background: '#fff', borderRadius: 18, width: '100%', maxWidth: 620,
    maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  };

  const btnBase = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
    borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
    border: 'none', opacity: submitting ? 0.6 : 1,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{entityLabel}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginTop: 2 }}>{headerTitle}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            <X size={16} />
          </button>
        </div>

        {/* Request fields */}
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {requestFields.filter(([, v]) => v !== undefined && v !== null && v !== '').map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{String(value)}</div>
            </div>
          ))}
        </div>

        {/* Documents */}
        {documents.length > 0 && (
          <div style={{ padding: '0 24px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Documents ({documents.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {documents.map((doc) => {
                const isDownloading = downloadingId === doc.id;
                return (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #F0F0F0', borderRadius: 10, background: '#F9FAFB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <FileText size={16} color="#6B7280" />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#111827', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{[doc.type, doc.size, doc.date].filter(Boolean).join(' · ')}</div>
                      </div>
                    </div>
                    {doc.url ? (
                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        disabled={isDownloading}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
                          color: '#1D4ED8', fontWeight: 600, background: 'none', border: 'none',
                          cursor: isDownloading ? 'not-allowed' : 'pointer', flexShrink: 0,
                          opacity: isDownloading ? 0.6 : 1, padding: 0,
                        }}
                      >
                        {isDownloading ? (
                          <Loader2 size={13} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Download size={13} />
                        )}
                        {isDownloading ? 'جاري التحميل...' : 'View'}
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>No file</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reason / notes input (يظهر فقط عند الرفض أو طلب مستندات) */}
        {mode && (
          <div style={{ padding: '0 24px 20px' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              {mode === 'reject' ? 'Rejection reason' : 'Notes for additional documents'}
            </label>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              rows={3}
              placeholder={mode === 'reject' ? 'اكتب سبب الرفض...' : 'وضّح المستندات الإضافية المطلوبة...'}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid #F1F5F9' }}>
          {mode ? (
            <>
              <button disabled={submitting} onClick={() => { setMode(null); setReasonText(''); }} style={{ ...btnBase, background: '#fff', border: '1px solid #E5E7EB', color: '#374151' }}>
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={mode === 'reject' ? handleConfirmReject : handleConfirmInspection}
                style={{ ...btnBase, background: mode === 'reject' ? '#DC2626' : '#D97706', color: '#fff' }}
              >
                {mode === 'reject' ? <XCircle size={14} /> : <FileWarning size={14} />}
                Confirm
              </button>
            </>
          ) : (
            <>
              <button disabled={submitting} onClick={() => setMode('inspection')} style={{ ...btnBase, background: '#FEF3C7', color: '#B45309' }}>
                <FileWarning size={14} /> Request Documents
              </button>
              <button disabled={submitting} onClick={() => setMode('reject')} style={{ ...btnBase, background: '#FEE2E2', color: '#DC2626' }}>
                <XCircle size={14} /> Reject
              </button>
              <button disabled={submitting} onClick={handleApprove} style={{ ...btnBase, background: '#059669', color: '#fff' }}>
                <Check size={14} /> Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewRequestModal;