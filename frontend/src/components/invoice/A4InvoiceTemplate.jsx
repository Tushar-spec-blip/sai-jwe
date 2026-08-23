import logo from '../../assets/logo.png';
import { formatCurrency, formatWeight, numberToWords } from '../../utils/billingCalculator';

/**
 * A4 Invoice Template
 * Professional print-ready layout for A4 paper.
 * Uses exact saved invoice data — no recalculation.
 */
export default function A4InvoiceTemplate({ invoice, shopSettings = {} }) {
  if (!invoice) return null;

  const {
    invoice_number, invoice_date, customer_name, customer_phone,
    customer_address, customer_gstin, items = [], payments = [],
    subtotal, discount, gst_rate, gst_amount, grand_total,
    paid_amount, balance_amount, payment_status, notes,
  } = invoice;

  const shop = {
    name: shopSettings.shop_name || 'Sri Sai Jewels',
    address: shopSettings.shop_address || '123, Temple Street, Chennai - 600001',
    phone: shopSettings.shop_phone || '+91 98765 43210',
    gstin: shopSettings.gstin || '33AABCS1234F1Z5',
  };

  const beforeTax = invoice.before_tax !== undefined ? invoice.before_tax : Math.max(0, (subtotal || 0) - (discount || 0));
  const gstRateVal = parseFloat(gst_rate) || 3;
  const cgstRateVal = invoice.cgst_rate !== undefined ? invoice.cgst_rate : (gstRateVal / 2);
  const sgstRateVal = invoice.sgst_rate !== undefined ? invoice.sgst_rate : (gstRateVal / 2);
  const cgstAmountVal = invoice.cgst_amount !== undefined ? invoice.cgst_amount : (beforeTax * (cgstRateVal / 100));
  const sgstAmountVal = invoice.sgst_amount !== undefined ? invoice.sgst_amount : (beforeTax * (sgstRateVal / 100));
  const afterTaxVal = invoice.after_tax !== undefined ? invoice.after_tax : (beforeTax + cgstAmountVal + sgstAmountVal);

  const formattedDate = invoice_date
    ? new Date(invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const paymentMethodStr = payments.map(p => `${p.payment_method} ${formatCurrency(p.amount)}`).join(', ') || '—';

  return (
    <div className="a4-invoice" style={{ fontFamily: "'Inter', sans-serif", color: '#000', background: '#fff' }}>
      {/* Header */}
      <div className="invoice-header">
        <div>
          <img src={logo} alt="Sri Sai Jewels" className="invoice-shop-logo" />
          <div className="invoice-shop-name">{shop.name}</div>
          <div className="invoice-shop-details">
            <div>{shop.address}</div>
            <div>Phone: {shop.phone}</div>
            <div>GSTIN: {shop.gstin}</div>
          </div>
        </div>
        <div className="invoice-meta">
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Tax Invoice</div>
          <div className="invoice-number">{invoice_number}</div>
          <div className="invoice-date">Date: {formattedDate}</div>
          <div style={{ marginTop: 10, padding: '6px 12px', background: payment_status === 'PAID' ? '#dcfce7' : payment_status === 'PARTIAL' ? '#fef3c7' : '#fee2e2', borderRadius: 6, display: 'inline-block', fontSize: 11, fontWeight: 700, color: payment_status === 'PAID' ? '#16a34a' : payment_status === 'PARTIAL' ? '#d97706' : '#dc2626' }}>
            {payment_status}
          </div>
        </div>
      </div>

      {/* Customer */}
      <div className="invoice-customer">
        <h4>Bill To</h4>
        <div className="customer-name">{customer_name || 'Walk-in Customer'}</div>
        {customer_phone && <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>Phone: {customer_phone}</div>}
        {customer_address && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{customer_address}</div>}
        {customer_gstin && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>GSTIN: {customer_gstin}</div>}
      </div>

      {/* Items Table — conditional on sale_type */}
      <div className="invoice-table" style={{ marginBottom: 16 }}>
        {invoice.sale_type === 'SILVER' ? (
          /* ===== SILVER SALE TABLE ===== */
          <table>
            <thead>
              <tr>
                <th style={{ width: '4%' }}>#</th>
                <th style={{ width: '28%' }}>Description</th>
                <th style={{ width: '8%' }}>Purity</th>
                <th style={{ width: '11%' }}>Gross Wt.</th>
                <th style={{ width: '10%' }}>Stone Wt.</th>
                <th style={{ width: '10%' }}>Net Wt.</th>
                <th style={{ width: '13%' }}>Silver Rate</th>
                <th style={{ width: '10%' }}>Stone</th>
                <th style={{ width: '13%', textAlign: 'right' }}>Item Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No items</td></tr>
              ) : items.map((item, i) => (
                <tr key={i}>
                  <td style={{ color: '#888' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{item.description}</td>
                  <td>{item.purity}</td>
                  <td>{formatWeight(item.gross_weight)}</td>
                  <td>{formatWeight(item.stone_weight)}</td>
                  <td style={{ fontWeight: 600 }}>{formatWeight(item.net_weight)}</td>
                  <td>Rs. {item.gold_rate}/g</td>
                  <td>{formatCurrency(item.stone_charge)}</td>
                  <td style={{ fontWeight: 700, textAlign: 'right' }}>{formatCurrency(item.item_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* ===== GOLD SALE TABLE ===== */
          <table>
            <thead>
              <tr>
                <th style={{ width: '4%' }}>#</th>
                <th style={{ width: '24%' }}>Description</th>
                <th style={{ width: '8%' }}>Purity</th>
                <th style={{ width: '10%' }}>Gross Wt.</th>
                <th style={{ width: '9%' }}>Stone Wt.</th>
                <th style={{ width: '9%' }}>Net Wt.</th>
                <th style={{ width: '11%' }}>Gold Rate</th>
                <th style={{ width: '8%' }}>VA</th>
                <th style={{ width: '9%' }}>Making</th>
                <th style={{ width: '7%' }}>Stone</th>
                <th style={{ width: '11%', textAlign: 'right' }}>Item Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No items</td></tr>
              ) : items.map((item, i) => {
                const isWeightMode = item.wastage_mode === 'weight';
                const vaDisplay = isWeightMode
                  ? formatWeight(item.wastage_weight)
                  : `${parseFloat(item.wastage_percent || 0)}%`;
                return (
                  <tr key={i}>
                    <td style={{ color: '#888' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{item.description}</td>
                    <td>{item.purity}</td>
                    <td>{formatWeight(item.gross_weight)}</td>
                    <td>{formatWeight(item.stone_weight)}</td>
                    <td style={{ fontWeight: 600 }}>{formatWeight(item.net_weight)}</td>
                    <td>Rs. {item.gold_rate}/g</td>
                    <td style={{ fontWeight: 600 }}>{vaDisplay}</td>
                    <td>{formatCurrency(item.making_charge)}</td>
                    <td>{formatCurrency(item.stone_charge)}</td>
                    <td style={{ fontWeight: 700, textAlign: 'right' }}>{formatCurrency(item.item_total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Totals Section with CGST & SGST Split */}
      <div className="invoice-totals">
        <table className="invoice-totals-table">
          <tbody>
            {invoice.sale_type === 'SILVER' ? (
              <tr><td className="label-col">Silver Value</td><td className="value-col">{formatCurrency(items.reduce((s, it) => s + (it.metal_value || 0), 0))}</td></tr>
            ) : (
              <tr><td className="label-col">Subtotal</td><td className="value-col">{formatCurrency(subtotal)}</td></tr>
            )}
            {discount > 0 && <tr><td className="label-col">Discount</td><td className="value-col" style={{ color: '#16a34a' }}>-{formatCurrency(discount)}</td></tr>}
            <tr style={{ borderTop: '1px solid #e5e7eb' }}>
              <td className="label-col" style={{ paddingTop: 6, fontWeight: 600 }}>Before Tax</td>
              <td className="value-col" style={{ paddingTop: 6, fontWeight: 600 }}>{formatCurrency(beforeTax)}</td>
            </tr>
            <tr>
              <td className="label-col">CGST @ {cgstRateVal.toFixed(2)}%</td>
              <td className="value-col">{formatCurrency(cgstAmountVal)}</td>
            </tr>
            <tr>
              <td className="label-col">SGST @ {sgstRateVal.toFixed(2)}%</td>
              <td className="value-col">{formatCurrency(sgstAmountVal)}</td>
            </tr>
            <tr style={{ borderTop: '1px dashed #e5e7eb' }}>
              <td className="label-col" style={{ paddingTop: 4, fontWeight: 600 }}>After Tax</td>
              <td className="value-col" style={{ paddingTop: 4, fontWeight: 600 }}>{formatCurrency(afterTaxVal)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="invoice-grand-total">
              <td>TOTAL</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(grand_total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Amount in Words */}
      <div className="invoice-amount-words">
        <strong>Amount in Words: </strong>{numberToWords(grand_total)}
      </div>

      {/* Payment Details */}
      <div className="invoice-payment">
        <h4>Payment Details</h4>
        <div style={{ display: 'flex', gap: 30, fontSize: 13 }}>
          <div><span style={{ color: '#888' }}>Method: </span><strong>{paymentMethodStr}</strong></div>
          <div><span style={{ color: '#888' }}>Paid: </span><strong style={{ color: '#16a34a' }}>{formatCurrency(paid_amount)}</strong></div>
          <div><span style={{ color: '#888' }}>Balance: </span><strong style={{ color: balance_amount > 0 ? '#dc2626' : '#16a34a' }}>{formatCurrency(balance_amount)}</strong></div>
          <div><span style={{ color: '#888' }}>Status: </span><strong>{payment_status}</strong></div>
        </div>
      </div>

      {notes && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#fffbea', border: '1px solid #fcd34d', borderRadius: 6, fontSize: 12 }}>
          <strong>Notes: </strong>{notes}
        </div>
      )}

      {/* Signatures */}
      <div className="invoice-signatures">
        <div className="invoice-sig-box">
          <div className="invoice-sig-line">Customer Signature</div>
        </div>
        <div className="invoice-sig-box">
          <div className="invoice-sig-line">Authorised Signatory<br />{shop.name}</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#999', borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
        Thank you for your purchase! • All sales are subject to our standard terms and conditions.
        <br />This is a computer-generated invoice and does not require a signature if digitally verified.
      </div>
    </div>
  );
}
