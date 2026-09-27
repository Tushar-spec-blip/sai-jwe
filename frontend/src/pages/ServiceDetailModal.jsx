import { X, Printer } from 'lucide-react';

// ============================================================
// STATUS BADGE helper
// ============================================================
const STATUS_STYLES = {
  'Received':   { bg: 'rgba(100,116,139,0.12)', color: '#475569' },
  'In Service': { bg: 'rgba(37,99,235,0.1)',    color: '#1D4ED8' },
  'Ready':      { bg: 'rgba(217,119,6,0.12)',   color: '#B45309' },
  'Delivered':  { bg: 'rgba(22,163,74,0.12)',   color: '#15803D' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES['Received'];
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 14px',
      borderRadius: 999,
      fontWeight: 700,
      fontSize: 12,
      background: s.bg,
      color: s.color,
      letterSpacing: '0.03em',
    }}>
      {status}
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12, paddingBottom: 10, borderBottom: '1px solid var(--border-light)' }}>
      <div style={{ width: 160, flexShrink: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, paddingTop: 1 }}>{label}</div>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text-dark)' }}>{value || '—'}</div>
    </div>
  );
}

// ============================================================
// SERVICE DETAIL MODAL — read-only view
// ============================================================
export default function ServiceDetailModal({ service, isOpen, onClose, onEdit, onPrint }) {
  if (!isOpen || !service) return null;

  const {
    serviceBillNumber,
    date,
    time,
    customerName,
    mobile,
    address,
    item,
    category,
    weight,
    serviceTypes = [],
    otherService,
    estimateAmount,
    estimatedDeliveryDate,
    finalAmount,
    amountReceived,
    balanceAmount,
    status,
    notes,
    createdAt,
    updatedAt,
  } = service;

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const formattedDelivery = estimatedDeliveryDate
    ? new Date(estimatedDeliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const displayServices = [
    ...serviceTypes.filter(s => s !== 'Other'),
    ...(serviceTypes.includes('Other') && otherService ? [otherService] : []),
  ].join(', ') || '—';

  const fmt = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '—' : `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const fmtWt = (v) => {
    const n = parseFloat(v);
    return isNaN(n) || n === 0 ? '—' : `${n.toFixed(3)} g`;
  };

  const isGold     = category === 'Gold';
  const accentColor = isGold ? '#8B6914' : '#334155';
  const accentBg    = isGold ? 'rgba(201,168,76,0.08)' : 'rgba(148,163,184,0.08)';
  const accentBdr   = isGold ? 'rgba(201,168,76,0.35)' : 'rgba(148,163,184,0.35)';

  const sectionHeader = (title) => (
    <div style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
      color: 'var(--gold-dark)', borderBottom: '1.5px solid var(--border)', paddingBottom: 5, marginBottom: 12, marginTop: 20,
    }}>
      {title}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xl" style={{ maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Service Details</h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{serviceBillNumber}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {onEdit && (
              <button className="btn btn-secondary btn-sm" onClick={() => onEdit(service)}>Edit</button>
            )}
            {onPrint && (
              <button className="btn btn-primary btn-sm" onClick={() => onPrint(service)}>
                <Printer size={14} /> Print
              </button>
            )}
            <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>

          {/* Bill Info Banner */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
            background: accentBg, border: `1.5px solid ${accentBdr}`, borderRadius: 'var(--radius-md)',
            padding: '12px 18px', marginBottom: 6,
          }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: accentColor }}>{serviceBillNumber}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {formattedDate} {time ? `· ${time}` : ''}
              </div>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Customer */}
          {sectionHeader('Customer Details')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <DetailRow label="Customer Name" value={customerName} />
            <DetailRow label="Mobile Number" value={mobile} />
            {address && <DetailRow label="Address" value={address} />}
          </div>

          {/* Item */}
          {sectionHeader('Item Details')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <DetailRow label="Item / Article" value={item} />
            <DetailRow
              label="Category"
              value={
                <span style={{
                  display: 'inline-block', padding: '2px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: isGold ? 'rgba(201,168,76,0.15)' : 'rgba(148,163,184,0.15)',
                  color: accentColor,
                }}>
                  {category}
                </span>
              }
            />
            <DetailRow label="Item Weight" value={fmtWt(weight)} />
          </div>

          {/* Service Type */}
          {sectionHeader('Kind of Service')}
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {displayServices.split(', ').map((s, i) => (
                <span key={i} style={{
                  padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: 'rgba(201,168,76,0.12)', color: 'var(--gold-dark)',
                  border: '1px solid rgba(201,168,76,0.35)',
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Estimate & Payment */}
          {sectionHeader('Estimate & Payment')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginTop: 6 }}>
            {[
              { label: 'Estimate Amount', value: fmt(estimateAmount) },
              { label: 'Estimated Delivery', value: formattedDelivery },
              { label: 'Final Amount', value: fmt(finalAmount), color: 'var(--text-dark)' },
              { label: 'Amount Received', value: fmt(amountReceived), color: '#16A34A' },
              { label: 'Balance Amount', value: fmt(balanceAmount), color: parseFloat(balanceAmount) > 0 ? '#DC2626' : '#16A34A' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: 'var(--cream)', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: color || 'var(--text-dark)' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Notes */}
          {notes && (
            <>
              {sectionHeader('Notes')}
              <div style={{
                background: 'var(--cream)', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)', fontSize: 13, lineHeight: 1.6, color: 'var(--text-medium)',
              }}>
                {notes}
              </div>
            </>
          )}

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
          {onEdit && <button className="btn btn-primary" onClick={() => onEdit(service)}>Edit Service</button>}
        </div>
      </div>
    </div>
  );
}
