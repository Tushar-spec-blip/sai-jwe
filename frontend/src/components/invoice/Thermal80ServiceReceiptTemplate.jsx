import logo from '../../assets/logo.png';

/**
 * 80mm Thermal Service Receipt Template
 * Compact layout for thermal receipt printers (72mm printable width).
 *
 * moduleType: 'SERVICE'
 * NOT a sales invoice.
 */
export default function Thermal80ServiceReceiptTemplate({ service, shopSettings = {} }) {
  if (!service) return null;

  const {
    serviceBillNumber,
    date,
    time,
    customerName,
    mobile,
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
    name:    shopSettings.shop_name    || 'SRI SAI JEWELS',
    phone:   shopSettings.shop_phone   || '7795030026 / 8970844634',
    address: shopSettings.shop_address || "1-138(2), Rama Laxman Arcade, Near Old Bus Stand\nSyndicate Bank Road, Uppinangady - 574 241",
    gstin:   shopSettings.gstin        || '29EGCPK5465H1Z2',
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' });

  const formattedDelivery = estimatedDeliveryDate
    ? new Date(estimatedDeliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })
    : '—';

  const displayServices = [
    ...serviceTypes.filter(s => s !== 'Other'),
    ...(serviceTypes.includes('Other') && otherService ? [otherService] : []),
  ].join(', ') || '—';

  const fmt = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '—' : `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const fmtWt = (v) => {
    const n = parseFloat(v);
    return isNaN(n) || n === 0 ? '—' : `${n.toFixed(3)} g`;
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

      {/* Receipt Type */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 11, marginBottom: 4 }}>
        SERVICE RECEIPT
      </div>

      <hr className="thermal-divider" />

      {/* Bill Info */}
      <div className="thermal-row"><span>Bill No:</span><span><strong>{serviceBillNumber}</strong></span></div>
      <div className="thermal-row"><span>Date:</span><span>{formattedDate}{time ? ` ${time}` : ''}</span></div>
      {status && (
        <div className="thermal-row"><span>Status:</span><span><strong>{status}</strong></span></div>
      )}

      <hr className="thermal-divider" />

      {/* Customer */}
      <div style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 2 }}>Customer Details</div>
      <div className="thermal-row"><span>Name:</span><span>{customerName || '—'}</span></div>
      {mobile && <div className="thermal-row"><span>Mobile:</span><span>{mobile}</span></div>}

      <hr className="thermal-divider" />

      {/* Item */}
      <div style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 2 }}>Item Details</div>
      <div className="thermal-row"><span>Item:</span><span><strong>{item || '—'}</strong></span></div>
      <div className="thermal-row"><span>Category:</span><span>{category || '—'}</span></div>
      <div className="thermal-row"><span>Weight:</span><span>{fmtWt(weight)}</span></div>

      <hr className="thermal-divider" />

      {/* Service Type */}
      <div style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 2 }}>Kind of Service</div>
      <div style={{ fontSize: 10, marginBottom: 4, lineHeight: 1.5 }}>{displayServices}</div>

      <hr className="thermal-divider" />

      {/* Amounts */}
      <div className="thermal-row"><span>Estimate:</span><span>{fmt(estimateAmount)}</span></div>
      <div className="thermal-row"><span>Est. Delivery:</span><span>{formattedDelivery}</span></div>

      {(finalAmount || amountReceived) && (
        <>
          <hr className="thermal-divider" style={{ borderStyle: 'dotted' }} />
          {finalAmount && <div className="thermal-row"><span>Final Amount:</span><span><strong>{fmt(finalAmount)}</strong></span></div>}
          {amountReceived && <div className="thermal-row"><span>Amount Received:</span><span>{fmt(amountReceived)}</span></div>}
          <hr className="thermal-divider" />
          <div className="thermal-total">
            BALANCE: {fmt(balanceAmount)}
          </div>
        </>
      )}

      {notes && (
        <>
          <hr className="thermal-divider" style={{ borderStyle: 'dotted' }} />
          <div style={{ fontSize: 9 }}>Notes: {notes}</div>
        </>
      )}

      <hr className="thermal-divider" />

      {/* Signature Lines */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, marginBottom: 4, fontSize: 9 }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: 3, marginTop: 20 }}>Customer<br />Signature</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: 3, marginTop: 20 }}>Authorised<br />Signatory</div>
        </div>
      </div>

      <hr className="thermal-divider" />

      {/* Footer */}
      <div className="thermal-footer">
        <div>Service Receipt</div>
        <div>NOT a Sales Invoice</div>
        <div style={{ marginTop: 4 }}>{shop.name}</div>
      </div>
    </div>
  );
}
