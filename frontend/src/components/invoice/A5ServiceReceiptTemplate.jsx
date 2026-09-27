import logo from '../../assets/logo.png';

/**
 * A5 Service Receipt Template — 210mm × 148mm LANDSCAPE
 * Used when Sri Sai Jewels receives jewellery for service/repair.
 *
 * moduleType: 'SERVICE'
 * NOT a sales invoice. No GST / sales Terms & Conditions.
 *
 * Layout: compact table-based, fits on one A5 landscape page for typical entries.
 * Font: Inter, 8–10px for content cells.
 */
export default function A5ServiceReceiptTemplate({ service, shopSettings = {} }) {
  if (!service) return null;

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
  } = service;

  const shop = {
    name:    shopSettings.shop_name    || 'Sri Sai Jewels',
    address: shopSettings.shop_address || "1-138(2), Rama Laxman Arcade, Near Old Bus Stand, Syndicate Bank Road, Uppinangady - 574 241",
    phone:   shopSettings.shop_phone   || '7795030026 / 8970844634',
    gstin:   shopSettings.gstin        || '29EGCPK5465H1Z2',
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const formattedDelivery = estimatedDeliveryDate
    ? new Date(estimatedDeliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const displayServices = [
    ...serviceTypes.filter(s => s !== 'Other'),
    ...(serviceTypes.includes('Other') && otherService ? [otherService] : []),
  ].join(', ') || '—';

  const isGold     = category === 'Gold';
  const accentColor = isGold ? '#C9A84C' : '#94A3B8';
  const bgColor     = isGold ? '#FDF8EE' : '#F8FAFC';
  const borderColor = isGold ? '#F0E4C4' : '#E2E8F0';
  const darkBg      = isGold ? '#1A1205' : '#1E293B';
  const labelColor  = isGold ? '#7A6A4A' : '#64748B';
  const textColor   = isGold ? '#8B6914' : '#334155';

  const fmt = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '—' : `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const fmtWt = (v) => {
    const n = parseFloat(v);
    return isNaN(n) || n === 0 ? '—' : `${n.toFixed(3)} g`;
  };

  const statusColor = {
    'Received':   '#64748B',
    'In Service': '#2563EB',
    'Ready':      '#D97706',
    'Delivered':  '#16A34A',
  }[status] || '#64748B';

  /* shared cell style helpers */
  const TH = (extra = {}) => ({
    color: accentColor,
    background: darkBg,
    padding: '4px 5px',
    fontWeight: 600,
    fontSize: 7.5,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    verticalAlign: 'top',
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    ...extra,
  });
  const TD = (extra = {}) => ({
    padding: '4px 5px',
    fontSize: 8.5,
    verticalAlign: 'top',
    lineHeight: 1.35,
    wordBreak: 'break-word',
    borderBottom: `1px solid ${borderColor}`,
    ...extra,
  });

  const Row = ({ label, value, bold = false }) => (
    <tr>
      <td style={{ ...TD(), color: labelColor, width: '38%', fontWeight: 500 }}>{label}</td>
      <td style={{ ...TD(), fontWeight: bold ? 700 : 400 }}>{value}</td>
    </tr>
  );

  return (
    <div
      className="a5-invoice"
      style={{
        fontFamily: "'Inter', sans-serif",
        color: '#000',
        background: '#fff',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ───── HEADER ───── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 6 }}>
        <tbody>
          <tr>
            {/* Shop info */}
            <td style={{ verticalAlign: 'top', width: '55%', padding: '0 8px 6px 0', borderBottom: `2px solid ${accentColor}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <img src={logo} alt="Logo" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: textColor, fontFamily: "'Playfair Display', serif" }}>{shop.name}</div>
                  <div style={{ fontSize: 7, color: labelColor, lineHeight: 1.5, marginTop: 1 }}>{shop.address}</div>
                  <div style={{ fontSize: 7, color: labelColor }}>Ph: {shop.phone}</div>
                  <div style={{ fontSize: 7, color: labelColor }}>GSTIN: {shop.gstin}</div>
                </div>
              </div>
            </td>
            {/* Bill info */}
            <td style={{ verticalAlign: 'top', textAlign: 'right', padding: '0 0 6px 8px', borderBottom: `2px solid ${accentColor}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: textColor, letterSpacing: '0.04em' }}>SERVICE RECEIPT</div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{serviceBillNumber}</div>
              <div style={{ fontSize: 7.5, color: labelColor, marginTop: 2 }}>{formattedDate}{time ? ` · ${time}` : ''}</div>
              {status && (
                <div style={{ marginTop: 4, display: 'inline-block', padding: '1px 7px', borderRadius: 20, fontSize: 7, fontWeight: 600, background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}55` }}>
                  {status}
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ───── CUSTOMER DETAILS ───── */}
      <div style={{ background: bgColor, padding: '5px 8px', borderLeft: `3px solid ${accentColor}`, marginBottom: 5, borderRadius: 3 }}>
        <div style={{ fontSize: 6.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: labelColor, fontWeight: 600, marginBottom: 2 }}>Customer Details</div>
        <div style={{ fontSize: 9, fontWeight: 700 }}>{customerName || '—'}</div>
        <div style={{ fontSize: 7.5, color: labelColor }}>
          Mobile: {mobile || '—'}
          {address ? ` · ${address}` : ''}
        </div>
      </div>

      {/* ───── ITEM + SERVICE (two-column) ───── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 5 }}>
        <thead>
          <tr>
            <th style={TH({ width: '30%' })}>Item / Article</th>
            <th style={TH({ width: '15%' })}>Category</th>
            <th style={TH({ width: '15%' })}>Weight</th>
            <th style={TH({ width: '40%' })}>Kind of Service</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...TD(), fontWeight: 700, fontSize: 9 }}>{item || '—'}</td>
            <td style={{ ...TD() }}>
              <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 20, background: isGold ? 'rgba(201,168,76,0.15)' : 'rgba(148,163,184,0.15)', color: textColor, fontWeight: 600, fontSize: 7.5 }}>{category || '—'}</span>
            </td>
            <td style={{ ...TD(), fontWeight: 600 }}>{fmtWt(weight)}</td>
            <td style={{ ...TD(), fontSize: 8.5, fontWeight: 600, color: textColor }}>{displayServices}</td>
          </tr>
        </tbody>
      </table>

      {/* ───── AMOUNTS ───── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 5 }}>
        <thead>
          <tr>
            <th style={TH({ width: '25%' })}>Estimate Amt</th>
            <th style={TH({ width: '25%' })}>Est. Delivery</th>
            <th style={TH({ width: '20%' })}>Final Amt</th>
            <th style={TH({ width: '15%' })}>Received</th>
            <th style={TH({ width: '15%' })}>Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...TD(), fontWeight: 600 }}>{fmt(estimateAmount)}</td>
            <td style={{ ...TD() }}>{formattedDelivery}</td>
            <td style={{ ...TD(), fontWeight: 600 }}>{finalAmount ? fmt(finalAmount) : '—'}</td>
            <td style={{ ...TD(), color: '#16A34A', fontWeight: 600 }}>{amountReceived ? fmt(amountReceived) : '—'}</td>
            <td style={{ ...TD(), color: parseFloat(balanceAmount) > 0 ? '#DC2626' : '#16A34A', fontWeight: 700 }}>
              {(finalAmount || amountReceived) ? fmt(balanceAmount) : '—'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ───── NOTES ───── */}
      {notes && (
        <div style={{ background: bgColor, padding: '4px 7px', borderRadius: 3, marginBottom: 5, border: `1px solid ${borderColor}`, fontSize: 7.5 }}>
          <span style={{ fontWeight: 600, color: labelColor }}>Notes: </span>{notes}
        </div>
      )}

      {/* ───── SIGNATURES ───── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', textAlign: 'center', paddingTop: 28, borderTop: '1px solid #000', fontSize: 7.5, color: '#888' }}>Customer Signature</td>
            <td style={{ width: '50%', textAlign: 'center', paddingTop: 28, borderTop: '1px solid #000', fontSize: 7.5, color: '#888' }}>Authorised Signatory</td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: 'center', marginTop: 6, fontSize: 6.5, color: '#A89060' }}>
        SERVICE RECEIPT — NOT a Sales Invoice &nbsp;·&nbsp; {shop.name}
      </div>
    </div>
  );
}
