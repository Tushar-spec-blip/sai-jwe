import logo from '../../assets/logo.png';

/**
 * A4 Service Receipt Template
 * Used when Sri Sai Jewels receives a jewellery item for service/repair.
 *
 * moduleType: 'SERVICE'
 * This is NOT a customer sales invoice. No GST / sales T&C.
 */
export default function A4ServiceReceiptTemplate({ service, shopSettings = {} }) {
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
    address: shopSettings.shop_address || "1-138(2), 'Rama Laxman Arcade', Near Old Bus Stand\nSyndicate Bank Road, Uppinangady - 574 241, D.K.",
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

  const isGold = category === 'Gold';
  const accentColor = isGold ? '#8B6914' : '#334155';
  const bgColor     = isGold ? '#FDF8EE' : '#F8FAFC';
  const borderColor = isGold ? '#F0E4C4' : '#E2E8F0';
  const darkBg      = isGold ? '#1A1205' : '#1E293B';
  const accentHex   = isGold ? '#C9A84C' : '#94A3B8';

  const fmt = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '—' : `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  return (
    <div className="a4-invoice" style={{ fontFamily: "'Inter', sans-serif", color: '#1A1208', background: '#fff', padding: 0 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 18, borderBottom: `2px solid ${accentHex}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <img src={logo} alt="Sri Sai Jewels Logo" style={{ width: 64, height: 64, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: accentColor, fontFamily: "'Playfair Display', serif" }}>{shop.name}</div>
            <div style={{ fontSize: 11, color: '#7A6A4A', lineHeight: 1.7, marginTop: 2, whiteSpace: 'pre-line' }}>{shop.address}</div>
            <div style={{ fontSize: 11, color: '#7A6A4A' }}>Ph: {shop.phone}</div>
            <div style={{ fontSize: 10, color: '#A89060', marginTop: 2 }}>GSTIN: {shop.gstin}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: accentColor }}>SERVICE RECEIPT</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{serviceBillNumber}</div>
          <div style={{ fontSize: 12, color: '#7A6A4A', marginTop: 4 }}>{formattedDate} {time ? `· ${time}` : ''}</div>
          {status && (
            <div style={{ marginTop: 8, display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}55` }}>
              {status}
            </div>
          )}
        </div>
      </div>

      {/* Customer Details */}
      <div style={{ background: bgColor, padding: '12px 16px', borderRadius: 8, marginBottom: 18, borderLeft: `3px solid ${accentHex}` }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6A4A', marginBottom: 6, fontWeight: 600 }}>Customer Details</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{customerName || '—'}</div>
        <div style={{ fontSize: 13, color: '#7A6A4A', marginTop: 2 }}>Mobile: {mobile || '—'}</div>
        {address && <div style={{ fontSize: 12, color: '#7A6A4A', marginTop: 2 }}>{address}</div>}
      </div>

      {/* Item Details */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18 }}>
        <thead>
          <tr>
            {['Item / Article', 'Category', 'Weight'].map(h => (
              <th key={h} style={{ background: darkBg, color: accentHex, padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px 12px', fontSize: 14, fontWeight: 600, borderBottom: `1px solid ${borderColor}` }}>{item || '—'}</td>
            <td style={{ padding: '10px 12px', fontSize: 13, borderBottom: `1px solid ${borderColor}` }}>
              <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, background: isGold ? 'rgba(201,168,76,0.15)' : 'rgba(148,163,184,0.15)', color: accentColor, fontWeight: 600, fontSize: 12 }}>{category || '—'}</span>
            </td>
            <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, borderBottom: `1px solid ${borderColor}` }}>{fmtWt(weight)}</td>
          </tr>
        </tbody>
      </table>

      {/* Service Type */}
      <div style={{ background: bgColor, padding: '12px 16px', borderRadius: 8, marginBottom: 18, border: `1px solid ${borderColor}` }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6A4A', fontWeight: 600, marginBottom: 6 }}>Kind of Service</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: accentColor }}>{displayServices}</div>
      </div>

      {/* Financials */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        <div style={{ background: bgColor, padding: '12px 16px', borderRadius: 8, border: `1px solid ${borderColor}` }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A6A4A', fontWeight: 600 }}>Estimate Amount</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: accentColor }}>{fmt(estimateAmount)}</div>
        </div>
        <div style={{ background: bgColor, padding: '12px 16px', borderRadius: 8, border: `1px solid ${borderColor}` }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A6A4A', fontWeight: 600 }}>Estimated Delivery Date</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{formattedDelivery}</div>
        </div>
      </div>

      {(finalAmount || amountReceived) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
          <div style={{ background: bgColor, padding: '12px 16px', borderRadius: 8, border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A6A4A', fontWeight: 600 }}>Final Amount</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{fmt(finalAmount)}</div>
          </div>
          <div style={{ background: bgColor, padding: '12px 16px', borderRadius: 8, border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A6A4A', fontWeight: 600 }}>Amount Received</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: '#16A34A' }}>{fmt(amountReceived)}</div>
          </div>
          <div style={{ background: bgColor, padding: '12px 16px', borderRadius: 8, border: `1.5px solid ${accentHex}` }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A6A4A', fontWeight: 600 }}>Balance</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: parseFloat(balanceAmount) > 0 ? '#DC2626' : '#16A34A' }}>
              {fmt(balanceAmount)}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div style={{ background: bgColor, padding: '10px 14px', borderRadius: 8, marginBottom: 18, border: `1px solid ${borderColor}` }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A6A4A', fontWeight: 600, marginBottom: 4 }}>Notes</div>
          <div style={{ fontSize: 12, color: '#3D2F10', lineHeight: 1.6 }}>{notes}</div>
        </div>
      )}

      {/* Signatures */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 40, paddingTop: 16, borderTop: `1px solid ${borderColor}` }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', marginTop: 40, paddingTop: 6, fontSize: 11, color: '#888' }}>Customer Signature</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', marginTop: 40, paddingTop: 6, fontSize: 11, color: '#888' }}>Authorised Signatory</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: '#A89060' }}>
        This is a SERVICE RECEIPT — Not a Sales Invoice &nbsp;·&nbsp; {shop.name}
      </div>
    </div>
  );
}
