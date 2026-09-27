import logo from '../../assets/logo.png';

/**
 * 80mm Thermal Gold / Silver Testing Report Template
 * Compact layout for thermal receipt printers (72mm printable width).
 *
 * moduleType: 'TESTING_REPORT'
 * NOT a sales invoice.
 */
export default function Thermal80TestingReportTemplate({ report, shopSettings = {} }) {
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
    name:    shopSettings.shop_name    || 'SRI SAI JEWELS',
    phone:   shopSettings.shop_phone   || '7795030026 / 8970844634',
    address: shopSettings.shop_address || "1-138(2), Rama Laxman Arcade\nNear Old Bus Stand\nSyndicate Bank Road\nUppinangady - 574 241",
    gstin:   shopSettings.gstin        || '29EGCPK5465H1Z2',
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' });

  const typeLabel = type === 'GOLD' ? 'Gold' : 'Silver';

  const fmtWt = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '—' : `${n.toFixed(3)} gms`;
  };

  const fmtPct = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '—' : `${n}%`;
  };

  return (
    <div className="thermal-invoice">

      {/* Shop Header */}
      <div className="thermal-header">
        <img src={logo} alt="Logo" className="thermal-logo" />
        <div className="thermal-shop-name">{shop.name}</div>
        <div className="thermal-shop-sub" style={{ whiteSpace: 'pre-line' }}>{shop.address}</div>
        <div className="thermal-shop-sub">Ph: {shop.phone}</div>
        <div className="thermal-shop-sub">GSTIN: {shop.gstin}</div>
      </div>

      <hr className="thermal-divider" />

      {/* Report Title */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 11, marginBottom: 2 }}>
        GOLD / SILVER
      </div>
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 11, marginBottom: 4 }}>
        TESTING REPORT
      </div>

      <hr className="thermal-divider" />

      {/* Report Info */}
      <div className="thermal-row"><span>Report No:</span><span><strong>{reportNumber || '—'}</strong></span></div>
      <div className="thermal-row"><span>Date:</span><span>{formattedDate}</span></div>
      <div className="thermal-row"><span>Testing Center:</span><span>{testingCenter || '—'}</span></div>

      <hr className="thermal-divider" />

      {/* Customer */}
      <div className="thermal-row"><span>Customer:</span><span><strong>{customerName || '—'}</strong></span></div>
      {mobile && <div className="thermal-row"><span>Mobile:</span><span>{mobile}</span></div>}

      <hr className="thermal-divider" />

      {/* Metal Details */}
      <div className="thermal-row"><span>Type:</span><span><strong>{typeLabel}</strong></span></div>

      <hr className="thermal-divider" style={{ borderStyle: 'dotted' }} />

      <div className="thermal-row"><span>Before Melt:</span><span>{fmtWt(beforeMelt)}</span></div>
      <div className="thermal-row"><span>After Melt:</span><span>{fmtWt(afterMelt)}</span></div>

      <hr className="thermal-divider" style={{ borderStyle: 'dotted' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 11, margin: '4px 0' }}>
        <span>Melting Loss:</span><span>{fmtWt(meltingLoss)}</span>
      </div>

      <hr className="thermal-divider" />

      <div className="thermal-row"><span>Purity:</span><span><strong>{fmtPct(purity)}</strong></span></div>

      <hr className="thermal-divider" style={{ borderStyle: 'dotted' }} />

      <div className="thermal-row"><span>Exchange:</span><span>{fmtWt(exchange)}</span></div>
      <div className="thermal-row"><span>Exchange Purity:</span><span>{exchangePurity || '—'}</span></div>
      <div className="thermal-row"><span>To:</span><span>{to || '—'}</span></div>

      <hr className="thermal-divider" />

      {/* Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, fontSize: 9 }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: 3, marginTop: 20 }}>Customer<br />Signature</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: 3, marginTop: 20 }}>Authorised<br />Signatory</div>
        </div>
      </div>

      <hr className="thermal-divider" />

      <div className="thermal-footer">
        <div>Gold / Silver Testing Report</div>
        <div>NOT a Sales Invoice</div>
        <div style={{ marginTop: 4 }}>{shop.name}</div>
      </div>
    </div>
  );
}
