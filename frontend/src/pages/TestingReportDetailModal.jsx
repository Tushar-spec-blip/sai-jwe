import { X, Printer } from 'lucide-react';

function DetailRow({ label, value, highlight = false, valueColor }) {
  return (
    <div style={{ display: 'flex', gap: 12, paddingBottom: 10, borderBottom: '1px solid var(--border-light)', alignItems: 'flex-start' }}>
      <div style={{ width: 170, flexShrink: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, paddingTop: 1 }}>{label}</div>
      <div style={{
        flex: 1, fontSize: highlight ? 16 : 14,
        fontWeight: highlight ? 700 : 500,
        color: valueColor || (highlight ? 'var(--gold-dark)' : 'var(--text-dark)'),
        background: highlight ? 'rgba(201,168,76,0.08)' : 'transparent',
        padding: highlight ? '2px 8px' : 0,
        borderRadius: highlight ? 6 : 0,
      }}>
        {value || '—'}
      </div>
    </div>
  );
}

/**
 * Testing Report Detail Modal — read-only view
 */
export default function TestingReportDetailModal({ report, isOpen, onClose, onEdit, onPrint }) {
  if (!isOpen || !report) return null;

  const {
    date,
    customerName,
    mobile,
    testingCenter,
    reportNumber,
    type,
    beforeMelt,
    afterMelt,
    meltingLoss,
    purity,
    exchange,
    exchangePurity,
    to,
    createdAt,
    updatedAt,
  } = report;

  const isGold    = type === 'GOLD';
  const typeLabel = isGold ? 'Gold' : 'Silver';

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const fmtWt = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '—' : `${n.toFixed(3)} gms`;
  };

  const fmtPct = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '—' : `${n} %`;
  };

  const accentColor = isGold ? '#8B6914' : '#334155';
  const accentHex   = isGold ? '#C9A84C' : '#94A3B8';
  const accentBg    = isGold ? 'rgba(201,168,76,0.08)' : 'rgba(148,163,184,0.08)';
  const accentBdr   = isGold ? 'rgba(201,168,76,0.35)' : 'rgba(148,163,184,0.35)';

  const sectionHeader = (title) => (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-dark)', borderBottom: '1.5px solid var(--border)', paddingBottom: 5, marginBottom: 12, marginTop: 20 }}>
      {title}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xl" style={{ maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Testing Report Details</h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Report No. {reportNumber} — {typeLabel}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {onEdit && <button className="btn btn-secondary btn-sm" onClick={() => onEdit(report)}>Edit</button>}
            {onPrint && (
              <button className="btn btn-primary btn-sm" onClick={() => onPrint(report)}>
                <Printer size={14} /> Print
              </button>
            )}
            <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>

          {/* Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, background: accentBg, border: `1.5px solid ${accentBdr}`, borderRadius: 'var(--radius-md)', padding: '12px 18px', marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600 }}>Gold / Silver Testing Report</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: accentColor, marginTop: 2 }}>Report No. {reportNumber}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{formattedDate}</div>
            </div>
            <span style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 999, fontWeight: 700, fontSize: 13, background: isGold ? 'rgba(201,168,76,0.15)' : 'rgba(148,163,184,0.15)', color: accentColor, border: `1px solid ${accentHex}55` }}>
              {typeLabel}
            </span>
          </div>

          {/* Report Info */}
          {sectionHeader('Report Information')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <DetailRow label="Testing Report Number" value={reportNumber} bold />
            <DetailRow label="Date" value={formattedDate} />
            <DetailRow label="Testing Center" value={testingCenter} />
          </div>

          {/* Customer */}
          {sectionHeader('Customer Details')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <DetailRow label="Customer Name" value={customerName} />
            <DetailRow label="Mobile Number" value={mobile} />
          </div>

          {/* Metal Details */}
          {sectionHeader('Metal Details')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <DetailRow label="Type" value={
              <span style={{ display: 'inline-block', padding: '2px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: isGold ? 'rgba(201,168,76,0.15)' : 'rgba(148,163,184,0.15)', color: accentColor }}>{typeLabel}</span>
            } />
            <DetailRow label="Before Melt" value={fmtWt(beforeMelt)} />
            <DetailRow label="After Melt" value={fmtWt(afterMelt)} />
            <DetailRow label="Melting Loss" value={fmtWt(meltingLoss)} highlight />
            <DetailRow label="Purity" value={fmtPct(purity)} />
            <DetailRow label="Exchange" value={fmtWt(exchange)} />
            <DetailRow label="Exchange Purity" value={exchangePurity} />
            <DetailRow label="To" value={to} />
          </div>

          {/* Timestamps */}
          {(createdAt || updatedAt) && (
            <div style={{ marginTop: 20, fontSize: 11, color: 'var(--text-muted)' }}>
              {createdAt && <div>Created: {new Date(createdAt).toLocaleString('en-IN')}</div>}
              {updatedAt && <div>Last Updated: {new Date(updatedAt).toLocaleString('en-IN')}</div>}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          {onEdit && <button className="btn btn-primary" onClick={() => onEdit(report)}>Edit Report</button>}
        </div>
      </div>
    </div>
  );
}
