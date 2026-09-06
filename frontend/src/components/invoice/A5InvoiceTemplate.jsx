import logo from '../../assets/logo.png';
import { formatCurrency, formatWeight, numberToWords } from '../../utils/billingCalculator';

/**
 * A5 Invoice Template — 210mm × 148mm LANDSCAPE
 *
 * Layout:
 *  ┌─────────────────────────────────────────────────────────┐
 *  │ LOGO + SHOP DETAILS          │ INVOICE INFO             │
 *  ├─────────────────────────────────────────────────────────┤
 *  │ CUSTOMER / BILL TO                                      │
 *  ├─────────────────────────────────────────────────────────┤
 *  │                   ITEM TABLE                            │
 *  ├───────────────────────────┬─────────────────────────────┤
 *  │ BILL SUMMARY / TOTALS     │ PAYMENT DETAILS             │
 *  │                           │ TERMS & CONDITIONS          │
 *  ├───────────────────────────┴─────────────────────────────┤
 *  │ AMOUNT IN WORDS                                         │
 *  ├───────────────────────────┬─────────────────────────────┤
 *  │ Customer Signature        │ Authorised Signatory        │
 *  └───────────────────────────┴─────────────────────────────┘
 *
 * Print CSS: @page { size: A5 landscape; } — handled in PrintPreviewModal.
 * Table: width:100%, table-layout:fixed, no horizontal overflow.
 * Column widths sum to 100%.
 */
export default function A5InvoiceTemplate({ invoice, shopSettings = {} }) {
  if (!invoice) return null;

  const {
    invoice_number, invoice_date, customer_name, customer_phone,
    customer_address, customer_gstin, items = [], payments = [],
    subtotal, discount, gst_rate, grand_total,
    paid_amount, balance_amount, payment_status, notes,
  } = invoice;

  const shop = {
    name:    shopSettings.shop_name    || 'Sri Sai Jewels',
    address: shopSettings.shop_address || "1-138(2), 'Rama Laxman Arcade', Near Old Bus Stand\nSyndicate Bank Road, Uppinangady - 574 241, D.K.",
    phone:   shopSettings.shop_phone   || '7795030026 / 8970844634',
    gstin:   shopSettings.gstin        || '29EGCPK5465H1Z2',
  };

  const beforeTax     = invoice.before_tax    !== undefined ? invoice.before_tax    : Math.max(0, (subtotal || 0) - (discount || 0));
  const gstRateVal    = parseFloat(gst_rate)  || 3;
  const cgstRateVal   = invoice.cgst_rate     !== undefined ? invoice.cgst_rate     : gstRateVal / 2;
  const sgstRateVal   = invoice.sgst_rate     !== undefined ? invoice.sgst_rate     : gstRateVal / 2;
  const cgstAmountVal = invoice.cgst_amount   !== undefined ? invoice.cgst_amount   : beforeTax * (cgstRateVal / 100);
  const sgstAmountVal = invoice.sgst_amount   !== undefined ? invoice.sgst_amount   : beforeTax * (sgstRateVal / 100);
  const afterTaxVal   = invoice.after_tax     !== undefined ? invoice.after_tax     : beforeTax + cgstAmountVal + sgstAmountVal;

  const formattedDate = invoice_date
    ? new Date(invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const paymentMethodStr = payments.map(p => `${p.payment_method} ${formatCurrency(p.amount)}`).join(', ') || '—';
  const statusColor = payment_status === 'PAID' ? '#16a34a' : payment_status === 'PARTIAL' ? '#d97706' : '#dc2626';
  const statusBg    = payment_status === 'PAID' ? '#dcfce7' : payment_status === 'PARTIAL' ? '#fef3c7' : '#fee2e2';

  /* ── shared cell styles ── */
  const TH = (extra = {}) => ({
    color: '#C9A84C',
    background: '#1A1205',
    padding: '3px 3px',
    fontWeight: 600,
    fontSize: 7,
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    verticalAlign: 'top',
    lineHeight: 1.3,
    textAlign: 'left',
    ...extra,
  });
  const TD = (extra = {}) => ({
    padding: '3px 3px',
    fontSize: 8,
    verticalAlign: 'top',
    lineHeight: 1.3,
    wordBreak: 'break-word',
    borderBottom: '1px solid #F0E4C4',
    ...extra,
  });

  /* Terms & Conditions — Sales invoices only */
  const TermsAndConditions = () => (
    <div style={{ marginTop: 0 }}>
      <div style={{ fontSize: 7.5, fontWeight: 700, color: '#7A6A4A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
        Terms &amp; Conditions :
      </div>
      <div style={{ fontSize: 7.5, color: '#444', lineHeight: 1.6 }}>
        <div>1) Exchange with 3 days without damage.</div>
        <div>2) Non-refundable.</div>
        <div>3) Order item not exchangable &amp; Non-refundable.</div>
      </div>
    </div>
  );

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

      {/* ── Header: Logo + Shop | Invoice Info ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, paddingBottom: 7, borderBottom: '2px solid #C9A84C' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, flex: 1, minWidth: 0 }}>
          <img src={logo} alt="Sri Sai Jewels" style={{ width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#8B6914' }}>{shop.name}</div>
            <div style={{ fontSize: 8, color: '#7A6A4A', lineHeight: 1.5 }}>
              <div>{shop.address}</div>
              <div>Ph: {shop.phone}</div>
              <div>GSTIN: {shop.gstin}</div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 8 }}>
          <div style={{ fontSize: 7.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 2 }}>Tax Invoice</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>{invoice_number}</div>
          <div style={{ fontSize: 8.5, color: '#888', marginBottom: 3 }}>Date: {formattedDate}</div>
          <div style={{ padding: '2px 6px', background: statusBg, borderRadius: 4, display: 'inline-block', fontSize: 8, fontWeight: 700, color: statusColor }}>
            {payment_status}
          </div>
        </div>
      </div>

      {/* ── Customer ── */}
      <div style={{ background: '#FDF8EE', padding: '5px 10px', borderRadius: 4, marginBottom: 7, borderLeft: '3px solid #C9A84C' }}>
        <div style={{ fontSize: 7.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6A4A', marginBottom: 2, fontWeight: 600 }}>Bill To</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 10, fontWeight: 700 }}>{customer_name || 'Walk-in Customer'}</div>
          {customer_phone   && <div style={{ fontSize: 8.5, color: '#555' }}>Ph: {customer_phone}</div>}
          {customer_address && <div style={{ fontSize: 8.5, color: '#666' }}>{customer_address}</div>}
          {customer_gstin   && <div style={{ fontSize: 8.5, color: '#666' }}>GSTIN: {customer_gstin}</div>}
        </div>
      </div>

      {/* ── Items Table ── */}
      <div style={{ marginBottom: 7, width: '100%', boxSizing: 'border-box' }}>
        {invoice.sale_type === 'SILVER' ? (

          /* ══ Silver Sale — 9 columns ══
             #(3%)  Desc(28%)  Purity(7%)  Gr.Wt(10%)  St.Wt(9%)  Net Wt(9%)  Silver Rate(14%)  Stone(9%)  Amount(11%)  = 100%
          */
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', boxSizing: 'border-box' }}>
            <colgroup>
              <col style={{ width: '3%'  }} />
              <col style={{ width: '28%' }} />
              <col style={{ width: '7%'  }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '9%'  }} />
              <col style={{ width: '9%'  }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '9%'  }} />
              <col style={{ width: '11%' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={TH()}>#</th>
                <th style={TH()}>Description</th>
                <th style={TH()}>Purity</th>
                <th style={TH()}>Gross Wt</th>
                <th style={TH()}>Stone Wt</th>
                <th style={TH()}>Net Wt</th>
                <th style={TH()}>Silver Rate</th>
                <th style={TH()}>Stone</th>
                <th style={TH({ textAlign: 'right' })}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: '#888', padding: 10, fontSize: 8.5 }}>No items</td></tr>
              ) : items.map((item, i) => (
                <tr key={i} style={{ breakInside: 'avoid' }}>
                  <td style={TD({ whiteSpace: 'nowrap', color: '#888' })}>{i + 1}</td>
                  <td style={TD({ fontWeight: 600 })}>{item.description}</td>
                  <td style={TD()}>{item.purity}</td>
                  <td style={TD()}>{formatWeight(item.gross_weight)}</td>
                  <td style={TD()}>{formatWeight(item.stone_weight)}</td>
                  <td style={TD({ fontWeight: 600 })}>{formatWeight(item.net_weight)}</td>
                  <td style={TD()}>Rs.{item.gold_rate}/g</td>
                  <td style={TD()}>{formatCurrency(item.stone_charge)}</td>
                  <td style={TD({ fontWeight: 700, textAlign: 'right' })}>{formatCurrency(item.item_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

        ) : (

          /* ══ Gold Sale — 11 columns ══
             #(3%)  Desc(24%)  Purity(6%)  Gr.Wt(8%)  St.Wt(7%)  Net Wt(8%)  Gold Rate(13%)  VA(6%)  Making(9%)  Stone(7%)  Amount(9%)  = 100%
          */
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', boxSizing: 'border-box' }}>
            <colgroup>
              <col style={{ width: '3%'  }} />
              <col style={{ width: '24%' }} />
              <col style={{ width: '6%'  }} />
              <col style={{ width: '8%'  }} />
              <col style={{ width: '7%'  }} />
              <col style={{ width: '8%'  }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '6%'  }} />
              <col style={{ width: '9%'  }} />
              <col style={{ width: '7%'  }} />
              <col style={{ width: '9%'  }} />
            </colgroup>
            <thead>
              <tr>
                <th style={TH()}>#</th>
                <th style={TH()}>Description</th>
                <th style={TH()}>Purity</th>
                <th style={TH()}>Gross Wt</th>
                <th style={TH()}>Stone Wt</th>
                <th style={TH()}>Net Wt</th>
                <th style={TH()}>Gold Rate</th>
                <th style={TH()}>VA</th>
                <th style={TH()}>Making</th>
                <th style={TH()}>Stone</th>
                <th style={TH({ textAlign: 'right' })}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', color: '#888', padding: 10, fontSize: 8.5 }}>No items</td></tr>
              ) : items.map((item, i) => {
                const isWeightMode = item.wastage_mode === 'weight';
                const vaDisplay = isWeightMode
                  ? formatWeight(item.wastage_weight)
                  : `${parseFloat(item.wastage_percent || 0)}%`;
                return (
                  <tr key={i} style={{ breakInside: 'avoid' }}>
                    <td style={TD({ whiteSpace: 'nowrap', color: '#888' })}>{i + 1}</td>
                    <td style={TD({ fontWeight: 600 })}>{item.description}</td>
                    <td style={TD()}>{item.purity}</td>
                    <td style={TD()}>{formatWeight(item.gross_weight)}</td>
                    <td style={TD()}>{formatWeight(item.stone_weight)}</td>
                    <td style={TD({ fontWeight: 600 })}>{formatWeight(item.net_weight)}</td>
                    <td style={TD()}>Rs.{item.gold_rate}/g</td>
                    <td style={TD({ fontWeight: 600 })}>{vaDisplay}</td>
                    <td style={TD()}>{formatCurrency(item.making_charge)}</td>
                    <td style={TD()}>{formatCurrency(item.stone_charge)}</td>
                    <td style={TD({ fontWeight: 700, textAlign: 'right' })}>{formatCurrency(item.item_total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Bottom 2-column section: Bill Summary | Payment Details + T&C ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 7, boxSizing: 'border-box' }}>

        {/* LEFT — Bill Summary / Totals */}
        <div>
          <table style={{ width: '100%', fontSize: 9, borderCollapse: 'collapse' }}>
            <tbody>
              {invoice.sale_type === 'SILVER' ? (
                <tr>
                  <td style={{ color: '#7A6A4A', paddingRight: 8, paddingBottom: 2, fontSize: 8.5 }}>Silver Value</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, paddingBottom: 2 }}>{formatCurrency(items.reduce((s, it) => s + (it.metal_value || 0), 0))}</td>
                </tr>
              ) : (
                <tr>
                  <td style={{ color: '#7A6A4A', paddingRight: 8, paddingBottom: 2, fontSize: 8.5 }}>Subtotal</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, paddingBottom: 2 }}>{formatCurrency(subtotal)}</td>
                </tr>
              )}
              {discount > 0 && (
                <tr>
                  <td style={{ color: '#16a34a', paddingRight: 8, paddingBottom: 2, fontSize: 8.5 }}>Discount</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a', paddingBottom: 2 }}>-{formatCurrency(discount)}</td>
                </tr>
              )}
              <tr style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ paddingTop: 2, fontWeight: 600, paddingRight: 8, paddingBottom: 2, fontSize: 8.5 }}>Before Tax</td>
                <td style={{ paddingTop: 2, textAlign: 'right', fontWeight: 600, paddingBottom: 2 }}>{formatCurrency(beforeTax)}</td>
              </tr>
              <tr>
                <td style={{ color: '#7A6A4A', paddingRight: 8, paddingBottom: 2, fontSize: 8.5 }}>CGST @ {cgstRateVal.toFixed(2)}%</td>
                <td style={{ textAlign: 'right', fontWeight: 600, paddingBottom: 2 }}>{formatCurrency(cgstAmountVal)}</td>
              </tr>
              <tr>
                <td style={{ color: '#7A6A4A', paddingRight: 8, paddingBottom: 2, fontSize: 8.5 }}>SGST @ {sgstRateVal.toFixed(2)}%</td>
                <td style={{ textAlign: 'right', fontWeight: 600, paddingBottom: 2 }}>{formatCurrency(sgstAmountVal)}</td>
              </tr>
              <tr style={{ borderTop: '1px dashed #e5e7eb' }}>
                <td style={{ paddingTop: 2, fontWeight: 600, paddingRight: 8, paddingBottom: 2, fontSize: 8.5 }}>After Tax</td>
                <td style={{ paddingTop: 2, textAlign: 'right', fontWeight: 600, paddingBottom: 2 }}>{formatCurrency(afterTaxVal)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ padding: 0, paddingTop: 4 }}>
                  <div style={{ background: '#1A1205', color: '#C9A84C', fontSize: 11, fontWeight: 700, padding: '5px 8px', borderRadius: 4, display: 'flex', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                    <span>TOTAL</span>
                    <span>{formatCurrency(grand_total)}</span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* RIGHT — Payment Details + Terms & Conditions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Payment Details */}
          <div style={{ padding: '5px 8px', background: '#FDF8EE', borderRadius: 4, border: '1px solid #F0E4C4', boxSizing: 'border-box' }}>
            <div style={{ fontSize: 7.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A6A4A', marginBottom: 4, fontWeight: 600 }}>Payment Details</div>
            <div style={{ fontSize: 8.5 }}>
              <div style={{ marginBottom: 1 }}><span style={{ color: '#888' }}>Method: </span><strong>{paymentMethodStr}</strong></div>
              <div style={{ marginBottom: 1 }}><span style={{ color: '#888' }}>Paid: </span><strong style={{ color: '#16a34a' }}>{formatCurrency(paid_amount)}</strong></div>
              <div style={{ marginBottom: 1 }}><span style={{ color: '#888' }}>Balance: </span><strong style={{ color: balance_amount > 0 ? '#dc2626' : '#16a34a' }}>{formatCurrency(balance_amount)}</strong></div>
              <div><span style={{ color: '#888' }}>Status: </span><strong>{payment_status}</strong></div>
            </div>
          </div>

          {/* Terms & Conditions — Sales invoices only */}
          <div style={{ padding: '5px 8px', background: '#FFFBF0', borderRadius: 4, border: '1px solid #F0E4C4', boxSizing: 'border-box' }}>
            <TermsAndConditions />
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div style={{ marginBottom: 6, padding: '4px 8px', background: '#fffbea', border: '1px solid #fcd34d', borderRadius: 4, fontSize: 8.5, wordBreak: 'break-word', boxSizing: 'border-box' }}>
          <strong>Notes: </strong>{notes}
        </div>
      )}

      {/* ── Amount in Words ── */}
      <div style={{ background: '#FDF8EE', padding: '4px 8px', borderRadius: 4, fontSize: 8.5, marginBottom: 7, wordBreak: 'break-word', boxSizing: 'border-box' }}>
        <strong>Amount in Words: </strong>{numberToWords(grand_total)}
      </div>

      {/* ── Signatures ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8, paddingTop: 8, borderTop: '1px solid #F0E4C4', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', marginTop: 22, paddingTop: 4, fontSize: 8.5, color: '#888' }}>Customer Signature</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', marginTop: 22, paddingTop: 4, fontSize: 8.5, color: '#888' }}>Authorised Signatory<br />{shop.name}</div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: 'center', marginTop: 6, fontSize: 8, color: '#999', borderTop: '1px solid #e5e7eb', paddingTop: 5 }}>
        Thank you for your purchase! • This is a computer-generated invoice.
      </div>
    </div>
  );
}
