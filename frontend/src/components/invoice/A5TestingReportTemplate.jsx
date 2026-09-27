import logo from '../../assets/logo.png';

/**
 * A5 Gold / Silver Testing Report Template — 210mm × 148mm LANDSCAPE
 *
 * moduleType: 'TESTING_REPORT'
 * NOT a sales invoice. No GST / sales Terms & Conditions.
 *
 * Layout: two-column header, label-value rows, compact for one A5 landscape page.
 */
export default function A5TestingReportTemplate({ report, shopSettings = {} }) {
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
    address: shopSettings.shop_address || "1-138(2), Rama Laxman Arcade, Near Old Bus Stand, Syndicate Bank Road, Uppinangady - 574 241",
    phone:   shopSettings.shop_phone   || '7795030026 / 8970844634',
    gstin:   shopSettings.gstin        || '29EGCPK5465H1Z2',
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const isGold      = type === 'GOLD';
  const typeLabel   = isGold ? 'Gold' : 'Silver';
  const accentColor = isGold ? '#C9A84C' : '#94A3B8';
  const bgColor     = isGold ? '#FDF8EE' : '#F8FAFC';
  const borderColor = isGold ? '#F0E4C4' : '#E2E8F0';
  const darkBg      = isGold ? '#1A1205' : '#1E293B';
  const labelColor  = isGold ? '#7A6A4A' : '#64748B';
  const textColor   = isGold ? '#8B6914' : '#334155';

  const fmtWt = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '—' : `${n.toFixed(3)} gms`;
  };

  const fmtPct = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '—' : `${n} %`;
  };

  /* shared cell styles */
  const TH = (extra = {}) => ({
    color: accentColor,
    background: darkBg,
    padding: '4px 6px',
    fontWeight: 600,
    fontSize: 7.5,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    verticalAlign: 'top',
    lineHeight: 1.3,
    ...extra,
  });
  const TD_label = {
    padding: '4px 6px',
    fontSize: 8,
    color: labelColor,
    fontWeight: 500,
    verticalAlign: 'top',
    borderBottom: `1px solid ${borderColor}`,
    width: '35%',
  };
  const TD_value = {
    padding: '4px 6px',
    fontSize: 9,
    fontWeight: 600,
    verticalAlign: 'top',
    borderBottom: `1px solid ${borderColor}`,
  };

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
      {/* ── HEADER ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 6 }}>
        <tbody>
          <tr>
            {/* Left: Shop info */}
            <td style={{ verticalAlign: 'top', width: '60%', padding: '0 8px 6px 0', borderBottom: `2px solid ${accentColor}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                <img src={logo} alt="Logo" style={{ width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: textColor, fontFamily: "'Playfair Display', serif" }}>{shop.name}</div>
                  <div style={{ fontSize: 7, color: labelColor, lineHeight: 1.5, marginTop: 1 }}>{shop.address}</div>
                  <div style={{ fontSize: 7, color: labelColor }}>Ph: {shop.phone} &nbsp;|&nbsp; GSTIN: {shop.gstin}</div>
                </div>
              </div>
            </td>
            {/* Right: Report heading */}
            <td style={{ verticalAlign: 'top', textAlign: 'right', padding: '0 0 6px 8px', borderBottom: `2px solid ${accentColor}` }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: textColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {typeLabel} Testing Report
              </div>
              <div style={{ fontSize: 7.5, color: labelColor, marginTop: 3 }}>Date: {formattedDate}</div>
              <div style={{ marginTop: 4, display: 'inline-block', padding: '1px 8px', borderRadius: 20, fontSize: 7, fontWeight: 700, background: bgColor, color: textColor, border: `1px solid ${accentColor}55` }}>
                {typeLabel}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── REPORT INFO + CUSTOMER (two columns) ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 5 }}>
        <thead>
          <tr>
            <th style={TH({ width: '25%' })}>Report No.</th>
            <th style={TH({ width: '25%' })}>Testing Center</th>
            <th style={TH({ width: '25%' })}>Customer</th>
            <th style={TH({ width: '25%' })}>Mobile</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...TD_value, fontWeight: 700, fontSize: 9 }}>{reportNumber || '—'}</td>
            <td style={TD_value}>{testingCenter || '—'}</td>
            <td style={{ ...TD_value, fontWeight: 700 }}>{customerName || '—'}</td>
            <td style={TD_value}>{mobile || '—'}</td>
          </tr>
        </tbody>
      </table>

      {/* ── METAL DETAILS ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 5 }}>
        <thead>
          <tr>
            <th colSpan={2} style={TH()}>Metal Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={TD_label}>Type</td>
            <td style={TD_value}>
              <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: 999, fontSize: 8, fontWeight: 700, background: bgColor, color: textColor, border: `1px solid ${accentColor}44` }}>
                {typeLabel}
              </span>
            </td>
          </tr>
          <tr>
            <td style={TD_label}>Before Melt</td>
            <td style={TD_value}>{fmtWt(beforeMelt)}</td>
          </tr>
          <tr>
            <td style={TD_label}>After Melt</td>
            <td style={TD_value}>{fmtWt(afterMelt)}</td>
          </tr>
          <tr>
            <td style={{ ...TD_label, background: bgColor, fontWeight: 600 }}>Melting Loss</td>
            <td style={{ ...TD_value, background: bgColor, fontWeight: 700, color: textColor }}>{fmtWt(meltingLoss)}</td>
          </tr>
          <tr>
            <td style={TD_label}>Purity</td>
            <td style={TD_value}>{fmtPct(purity)}</td>
          </tr>
          <tr>
            <td style={TD_label}>Exchange</td>
            <td style={TD_value}>{fmtWt(exchange)}</td>
          </tr>
          <tr>
            <td style={TD_label}>Exchange Purity</td>
            <td style={TD_value}>{exchangePurity || '—'}</td>
          </tr>
          <tr>
            <td style={TD_label}>To</td>
            <td style={TD_value}>{to || '—'}</td>
          </tr>
        </tbody>
      </table>

      {/* ── SIGNATURES ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 14 }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', textAlign: 'center', paddingTop: 26, borderTop: '1px solid #000', fontSize: 7.5, color: '#888' }}>Customer Signature</td>
            <td style={{ width: '50%', textAlign: 'center', paddingTop: 26, borderTop: '1px solid #000', fontSize: 7.5, color: '#888' }}>Authorised Signatory</td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: 'center', marginTop: 5, fontSize: 6.5, color: '#A89060' }}>
        Gold / Silver Testing Report — NOT a Sales Invoice &nbsp;·&nbsp; {shop.name}
      </div>
    </div>
  );
}
