import logo from '../../assets/logo.png';

/**
 * A4 Gold / Silver Testing Report Template
 *
 * moduleType: 'TESTING_REPORT'
 * NOT a sales invoice. No GST / sales Terms & Conditions.
 */
export default function A4TestingReportTemplate({ report, shopSettings = {} }) {
  if (!report) return null;

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
  } = report;

  const shop = {
    name:    shopSettings.shop_name    || 'Sri Sai Jewels',
    address: shopSettings.shop_address || "1-138(2), 'Rama Laxman Arcade', Near Old Bus Stand\nSyndicate Bank Road, Uppinangady - 574 241, D.K.",
    phone:   shopSettings.shop_phone   || '7795030026 / 8970844634',
    gstin:   shopSettings.gstin        || '29EGCPK5465H1Z2',
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const isGold      = type === 'GOLD';
  const typeLabel   = isGold ? 'Gold' : 'Silver';
  const accentColor = isGold ? '#8B6914' : '#334155';
  const accentHex   = isGold ? '#C9A84C' : '#94A3B8';
  const bgColor     = isGold ? '#FDF8EE' : '#F8FAFC';
  const borderColor = isGold ? '#F0E4C4' : '#E2E8F0';
  const darkBg      = isGold ? '#1A1205' : '#1E293B';
  const labelColor  = '#7A6A4A';

  const fmtWt = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '—' : `${n.toFixed(3)} gms`;
  };

  const fmtPct = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '—' : `${n} %`;
  };

  const DataRow = ({ label, value, bold = false, highlight = false }) => (
    <tr>
      <td style={{
        padding: '10px 16px', fontSize: 13, color: labelColor, width: '40%',
        borderBottom: `1px solid ${borderColor}`, fontWeight: 500,
      }}>
        {label}
      </td>
      <td style={{
        padding: '10px 16px', fontSize: highlight ? 16 : 14,
        fontWeight: bold || highlight ? 700 : 500,
        color: highlight ? accentColor : '#1A1208',
        borderBottom: `1px solid ${borderColor}`,
        background: highlight ? bgColor : 'transparent',
      }}>
        {value || '—'}
      </td>
    </tr>
  );

  return (
    <div className="a4-invoice" style={{ fontFamily: "'Inter', sans-serif", color: '#1A1208', background: '#fff', padding: 0 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, paddingBottom: 18, borderBottom: `2px solid ${accentHex}` }}>
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
          <div style={{ fontSize: 16, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {typeLabel} Testing Report
          </div>
          <div style={{ fontSize: 13, color: '#7A6A4A', marginTop: 6 }}>Date: {formattedDate}</div>
          <div style={{ marginTop: 10, display: 'inline-block', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: isGold ? 'rgba(201,168,76,0.15)' : 'rgba(148,163,184,0.15)', color: accentColor, border: `1px solid ${accentHex}55` }}>
            {typeLabel}
          </div>
        </div>
      </div>

      {/* ── Report & Customer Details ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: bgColor, padding: '14px 18px', borderRadius: 8, borderLeft: `3px solid ${accentHex}` }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: labelColor, fontWeight: 600, marginBottom: 8 }}>Report Information</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 12, color: labelColor, width: 130, flexShrink: 0 }}>Report Number</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{reportNumber || '—'}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 12, color: labelColor, width: 130, flexShrink: 0 }}>Testing Center</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{testingCenter || '—'}</span>
            </div>
          </div>
        </div>
        <div style={{ background: bgColor, padding: '14px 18px', borderRadius: 8, borderLeft: `3px solid ${accentHex}` }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: labelColor, fontWeight: 600, marginBottom: 8 }}>Customer Details</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{customerName || '—'}</div>
          <div style={{ fontSize: 13, color: labelColor, marginTop: 3 }}>Mobile: {mobile || '—'}</div>
        </div>
      </div>

      {/* ── Metal Details Table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr>
            <th colSpan={2} style={{ background: darkBg, color: accentHex, padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Metal Details
            </th>
          </tr>
        </thead>
        <tbody>
          <DataRow label="Type" value={typeLabel} bold />
          <DataRow label="Before Melt" value={fmtWt(beforeMelt)} bold />
          <DataRow label="After Melt" value={fmtWt(afterMelt)} bold />
          <DataRow label="Melting Loss" value={fmtWt(meltingLoss)} bold highlight />
          <DataRow label="Purity" value={fmtPct(purity)} bold />
          <DataRow label="Exchange" value={fmtWt(exchange)} />
          <DataRow label="Exchange Purity" value={exchangePurity || '—'} />
          <DataRow label="To" value={to} />
        </tbody>
      </table>

      {/* ── Signatures ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginTop: 50, paddingTop: 16, borderTop: `1px solid ${borderColor}` }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', marginTop: 50, paddingTop: 6, fontSize: 11, color: '#888' }}>Customer Signature</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', marginTop: 50, paddingTop: 6, fontSize: 11, color: '#888' }}>Authorised Signatory</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: '#A89060' }}>
        Gold / Silver Testing Report — {shop.name} &nbsp;·&nbsp; NOT a Sales Invoice
      </div>
    </div>
  );
}
