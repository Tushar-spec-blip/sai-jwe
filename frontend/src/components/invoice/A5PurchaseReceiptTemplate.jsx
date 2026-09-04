import logo from '../../assets/logo.png';
import { formatCurrency, formatWeight, numberToWords } from '../../utils/billingCalculator';

/**
 * A5 Old Purchase Receipt Template — 148mm × 210mm portrait
 * Used when Sri Sai Jewels BUYS old jewellery FROM a customer.
 *
 * transactionType: 'GOLD_PURCHASE' | 'SILVER_PURCHASE'
 *
 * Multi-item: rows use breakInside:avoid; content flows onto additional A5 pages.
 * Table: width:100%, table-layout:fixed, NO minWidth. All 8 columns fit inside A5.
 * Column widths sum to exactly 100%.
 */
export default function A5PurchaseReceiptTemplate({ purchase, shopSettings = {} }) {
  if (!purchase) return null;

  const isGold = purchase.transactionType === 'GOLD_PURCHASE';
  const metal = isGold ? 'Gold' : 'Silver';
  const receiptHeading = isGold ? 'OLD GOLD PURCHASE RECEIPT' : 'OLD SILVER PURCHASE RECEIPT';
  const rateLabel = isGold ? 'Gold Rate' : 'Silver Rate';

  const {
    purchase_number, purchase_date,
    customer_name, customer_phone,
    items = [],
    final_payable, purchase_amount,
    payment_method, notes, deduction_notes,
  } = purchase;

  const shop = {
    name:    shopSettings.shop_name    || 'Sri Sai Jewels',
    address: shopSettings.shop_address || '123, Temple Street, Chennai - 600001',
    phone:   shopSettings.shop_phone   || '+91 98765 43210',
    gstin:   shopSettings.gstin        || '33AABCS1234F1Z5',
  };

  const formattedDate = purchase_date
    ? new Date(purchase_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const totalNetWeight = items.reduce((s, it) => s + (parseFloat(it.net_weight) || 0), 0);

  const accentColor = isGold ? '#C9A84C' : '#94A3B8';
  const bgColor     = isGold ? '#FDF8EE'  : '#F8FAFC';
  const borderColor = isGold ? '#F0E4C4'  : '#E2E8F0';
  const darkBg      = isGold ? '#1A1205'  : '#1E293B';
  const labelColor  = isGold ? '#7A6A4A'  : '#64748B';
  const textColor   = isGold ? '#8B6914'  : '#334155';

  /* ── shared cell styles ── */
  const TH = (extra = {}) => ({
    color: accentColor,
    background: darkBg,
    padding: '4px 3px',
    fontWeight: 600,
    fontSize: 7.5,
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    verticalAlign: 'top',
    lineHeight: 1.3,
    ...extra,
  });
  const TD = (extra = {}) => ({
    padding: '4px 3px',
    fontSize: 8,
    verticalAlign: 'top',
    lineHeight: 1.35,
    wordBreak: 'break-word',
    borderBottom: `1px solid ${borderColor}`,
    ...extra,
  });

  return (
    <div
      className="a5-invoice"
      style={{
        fontFamily: "'Inter', sans-serif",
        color: '#000',
        background: '#fff',
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden',
      }}
    >

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, paddingBottom: 9, borderBottom: `2px solid ${accentColor}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1, minWidth: 0 }}>
          <img src={logo} alt="Sri Sai Jewels" style={{ width: 38, height: 38, objectFit: 'contain', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: textColor }}>{shop.name}</div>
            <div style={{ fontSize: 8.5, color: labelColor, lineHeight: 1.55 }}>
              <div>{shop.address}</div>
              <div>Ph: {shop.phone}</div>
              <div>GSTIN: {shop.gstin}</div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 8 }}>
          <div style={{
            fontSize: 7.5,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 3,
            background: isGold ? 'rgba(201,168,76,0.15)' : 'rgba(148,163,184,0.2)',
            padding: '2px 6px',
            borderRadius: 3,
            display: 'inline-block',
            fontWeight: 700,
            color: textColor,
            wordBreak: 'break-word',
            maxWidth: 130,
          }}>
            {receiptHeading}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 3 }}>{purchase_number}</div>
          <div style={{ fontSize: 9, color: '#888', marginTop: 2 }}>Date: {formattedDate}</div>
          <div style={{
            marginTop: 4,
            padding: '2px 7px',
            background: isGold ? 'rgba(201,168,76,0.12)' : 'rgba(100,116,139,0.10)',
            borderRadius: 4,
            display: 'inline-block',
            fontSize: 8.5,
            fontWeight: 700,
            color: textColor,
            border: `1px solid ${isGold ? 'rgba(201,168,76,0.35)' : 'rgba(148,163,184,0.4)'}`,
          }}>
            {isGold ? 'Gold Purchase' : 'Silver Purchase'}
          </div>
        </div>
      </div>

      {/* ── Purchased From ── */}
      <div style={{ background: bgColor, padding: '6px 10px', borderRadius: 5, marginBottom: 9, borderLeft: `3px solid ${accentColor}` }}>
        <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: labelColor, marginBottom: 2, fontWeight: 600 }}>Purchased From</div>
        <div style={{ fontSize: 11, fontWeight: 700 }}>{customer_name || 'Customer'}</div>
        {customer_phone && <div style={{ fontSize: 9, color: '#555', marginTop: 1 }}>Ph: {customer_phone}</div>}
      </div>

      {/* ── Items Table ══
          8 columns:
          #(3%)  Desc(24%)  Purity(7%)  Gr.Wt(11%)  St.Wt(10%)  Net Wt(10%)  Rate(14%)  Amount(21%)  = 100%
      ── */}
      <div style={{ marginBottom: 9, width: '100%', boxSizing: 'border-box' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', boxSizing: 'border-box' }}>
          <colgroup>
            <col style={{ width: '3%'  }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '7%'  }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '21%' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={TH()}>#</th>
              <th style={TH()}>Item / Desc.</th>
              <th style={TH()}>Purity</th>
              <th style={TH()}>Gross Wt</th>
              <th style={TH()}>Stone Wt</th>
              <th style={TH()}>Net Wt</th>
              <th style={TH()}>{rateLabel}</th>
              <th style={TH({ textAlign: 'right' })}>Purch. Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#888', padding: 10, fontSize: 9 }}>No items</td></tr>
            ) : items.map((item, i) => (
              <tr key={i} style={{ breakInside: 'avoid' }}>
                <td style={TD({ whiteSpace: 'nowrap', color: '#888' })}>{i + 1}</td>
                <td style={TD({ fontWeight: 600 })}>{item.description}</td>
                <td style={TD()}>{item.purity}</td>
                <td style={TD()}>{formatWeight(item.gross_weight)}</td>
                <td style={TD()}>{formatWeight(item.stone_weight)}</td>
                <td style={TD({ fontWeight: 600 })}>{formatWeight(item.net_weight)}</td>
                <td style={TD()}>Rs.{item.purchase_rate}/g</td>
                <td style={TD({ fontWeight: 700, textAlign: 'right' })}>{formatCurrency(item.purchase_amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `1px solid ${accentColor}`, background: bgColor }}>
              <td colSpan={5} style={{ padding: '4px 3px' }}></td>
              <td style={{ padding: '4px 3px', fontWeight: 700, fontSize: 9 }}>{totalNetWeight.toFixed(3)} g</td>
              <td style={{ padding: '4px 3px', fontSize: 8, color: '#888' }}>Total Net Wt.</td>
              <td style={{ padding: '4px 3px', fontWeight: 700, textAlign: 'right', fontSize: 9 }}>{formatCurrency(purchase_amount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Purchase Totals ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <table style={{ width: '55%', fontSize: 10, borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ color: labelColor, paddingRight: 10, paddingBottom: 2, fontSize: 9.5 }}>
                {items.length > 1 ? `Purchase Amount (${items.length} items)` : 'Purchase Amount'}
              </td>
              <td style={{ textAlign: 'right', fontWeight: 600, paddingBottom: 2 }}>{formatCurrency(purchase_amount)}</td>
            </tr>
            {deduction_notes && (
              <tr>
                <td style={{ color: '#dc2626', fontSize: 9, paddingRight: 10, paddingBottom: 2 }}>Deduction / Adjustment</td>
                <td style={{ textAlign: 'right', color: '#dc2626', fontSize: 9, paddingBottom: 2 }}>—</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} style={{ padding: 0, paddingTop: 4 }}>
                <div style={{
                  background: darkBg,
                  color: accentColor,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '6px 10px',
                  borderRadius: 5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                }}>
                  <span>PAYABLE TO CUSTOMER</span>
                  <span>{formatCurrency(final_payable)}</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Amount in Words ── */}
      <div style={{ background: bgColor, padding: '5px 10px', borderRadius: 5, fontSize: 9, marginBottom: 8, wordBreak: 'break-word', boxSizing: 'border-box' }}>
        <strong>Amount Payable in Words: </strong>{numberToWords(final_payable)}
      </div>

      {/* ── Deduction Notes ── */}
      {deduction_notes && (
        <div style={{ marginBottom: 8, padding: '5px 10px', background: '#fff8f0', border: '1px solid #fcd34d', borderRadius: 5, fontSize: 9, wordBreak: 'break-word', boxSizing: 'border-box' }}>
          <strong>Deduction / Adjustment Notes: </strong>{deduction_notes}
        </div>
      )}

      {/* ── Payment Details ── */}
      <div style={{ padding: '6px 10px', background: bgColor, borderRadius: 5, border: `1px solid ${borderColor}`, marginBottom: 8, boxSizing: 'border-box' }}>
        <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: labelColor, marginBottom: 4, fontWeight: 600 }}>Payment Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px', fontSize: 9.5 }}>
          <div><span style={{ color: '#888' }}>Method: </span><strong>{payment_method || '—'}</strong></div>
          <div><span style={{ color: '#888' }}>Paid to Customer: </span><strong style={{ color: '#16a34a' }}>{formatCurrency(final_payable)}</strong></div>
        </div>
      </div>

      {notes && (
        <div style={{ marginBottom: 8, padding: '5px 10px', background: '#fffbea', border: '1px solid #fcd34d', borderRadius: 5, fontSize: 9, wordBreak: 'break-word', boxSizing: 'border-box' }}>
          <strong>Notes: </strong>{notes}
        </div>
      )}

      {/* ── Disclaimer ── */}
      <div style={{ marginBottom: 8, padding: '5px 10px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 5, fontSize: 8.5, color: '#0369a1', wordBreak: 'break-word', boxSizing: 'border-box' }}>
        <strong>Note:</strong> This is an Old Purchase Receipt issued by {shop.name}. This confirms the purchase of old {metal.toLowerCase()} jewellery from the customer above. This is NOT a customer sales invoice.
      </div>

      {/* ── Signatures ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16, paddingTop: 10, borderTop: `1px solid ${borderColor}`, boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', marginTop: 24, paddingTop: 4, fontSize: 9, color: '#888' }}>Customer Signature<br />(Seller)</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', marginTop: 24, paddingTop: 4, fontSize: 9, color: '#888' }}>Authorised Signatory<br />{shop.name}</div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: 'center', marginTop: 10, fontSize: 8.5, color: '#999', borderTop: '1px solid #e5e7eb', paddingTop: 6 }}>
        {shop.name} — Old Purchase Receipt • Thank you for trusting us with your old jewellery.
        <br />This is a computer-generated purchase receipt.
      </div>
    </div>
  );
}
