import logo from '../../assets/logo.png';
import { formatCurrency, formatWeight } from '../../utils/billingCalculator';

/**
 * 80mm Thermal Invoice Template
 * Compact layout optimized for 80mm thermal receipt printers.
 * Separate component — NOT a scaled-down A4.
 * Uses same saved invoice data as A4 template.
 */
export default function Thermal80InvoiceTemplate({ invoice, shopSettings = {} }) {
  if (!invoice) return null;

  const {
    invoice_number, invoice_date, customer_name,
    items = [], payments = [],
    subtotal, discount, gst_rate, gst_amount, grand_total,
    paid_amount, balance_amount, payment_status,
  } = invoice;

  const shop = {
    name: shopSettings.shop_name || 'SRI SAI JEWELS',
    phone: shopSettings.shop_phone || '+91 98765 43210',
    address: shopSettings.shop_address || '123, Temple Street, Chennai',
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
    ? new Date(invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' });

  const paymentMethodStr = payments.map(p => p.payment_method).join(' / ') || '—';

  return (
    <div className="thermal-invoice">
      {/* Shop Header */}
      <div className="thermal-header">
        <img src={logo} alt="Logo" className="thermal-logo" style={{ filter: 'none' }} />
        <div className="thermal-shop-name">{shop.name}</div>
        <div className="thermal-shop-sub">{shop.address}</div>
        <div className="thermal-shop-sub">Ph: {shop.phone}</div>
        <div className="thermal-shop-sub">GSTIN: {shop.gstin}</div>
      </div>

      <hr className="thermal-divider" />

      {/* Invoice Info */}
      <div className="thermal-row"><span>Invoice:</span><span><strong>{invoice_number}</strong></span></div>
      <div className="thermal-row"><span>Date:</span><span>{formattedDate}</span></div>
      <div className="thermal-row"><span>Customer:</span><span>{customer_name || 'Walk-in'}</span></div>

      <hr className="thermal-divider" />

      {/* Items — conditional on sale_type */}
      {items.map((item, i) => {
        const isSilverItem = item.sale_type === 'SILVER' || invoice.sale_type === 'SILVER';
        const isWeightMode = item.wastage_mode === 'weight';
        const vaDisplay = isWeightMode
          ? formatWeight(item.wastage_weight)
          : `${parseFloat(item.wastage_percent || 0)}%`;

        return (
          <div key={i} style={{ marginBottom: 8 }}>
            <div className="thermal-item-name">{item.description}</div>
            <div className="thermal-row"><span>Purity:</span><span>{item.purity}</span></div>
            <div className="thermal-row"><span>Gross Wt:</span><span>{formatWeight(item.gross_weight)}</span></div>
            {item.stone_weight > 0 && <div className="thermal-row"><span>Stone Wt:</span><span>{formatWeight(item.stone_weight)}</span></div>}
            <div className="thermal-row"><span>Net Wt:</span><span><strong>{formatWeight(item.net_weight)}</strong></span></div>
            {isSilverItem ? (
              <div className="thermal-row"><span>Silver Rate:</span><span>Rs. {item.gold_rate}/g</span></div>
            ) : (
              <>
                <div className="thermal-row"><span>Gold Rate:</span><span>Rs. {item.gold_rate}/g</span></div>
                <div className="thermal-row"><span>VA:</span><span>{vaDisplay}</span></div>
                {item.making_charge > 0 && <div className="thermal-row"><span>Making:</span><span>{formatCurrency(item.making_charge)}</span></div>}
              </>
            )}
            {item.stone_charge > 0 && <div className="thermal-row"><span>Stone:</span><span>{formatCurrency(item.stone_charge)}</span></div>}
            {item.discount > 0 && <div className="thermal-row"><span>Discount:</span><span>-{formatCurrency(item.discount)}</span></div>}
            <hr className="thermal-divider" style={{ borderStyle: 'dotted' }} />
            <div className="thermal-row" style={{ fontWeight: 'bold' }}>
              <span>Item Amount:</span><span>{formatCurrency(item.item_total)}</span>
            </div>
            {i < items.length - 1 && <hr className="thermal-divider" />}
          </div>
        );
      })}

      <hr className="thermal-divider" />

      {/* Totals Section */}
      {invoice.sale_type === 'SILVER' && (
        <div className="thermal-row"><span>Silver Value:</span><span>{formatCurrency(items.reduce((s, it) => s + (it.metal_value || 0), 0))}</span></div>
      )}
      <div className="thermal-row"><span>Before Tax:</span><span><strong>{formatCurrency(beforeTax)}</strong></span></div>
      <div className="thermal-row"><span>CGST @ {cgstRateVal.toFixed(2)}%:</span><span>{formatCurrency(cgstAmountVal)}</span></div>
      <div className="thermal-row"><span>SGST @ {sgstRateVal.toFixed(2)}%:</span><span>{formatCurrency(sgstAmountVal)}</span></div>
      <div className="thermal-row"><span>After Tax:</span><span><strong>{formatCurrency(afterTaxVal)}</strong></span></div>
      {invoice.deduction > 0 && (
        <div className="thermal-row" style={{ color: '#dc2626' }}><span>Deduction:</span><span>-{formatCurrency(invoice.deduction)}</span></div>
      )}

      <hr className="thermal-divider" />

      <div className="thermal-total">TOTAL: {formatCurrency(invoice.deduction > 0 ? invoice.final_payable : grand_total)}</div>

      <hr className="thermal-divider" />

      {/* Payment */}
      <div className="thermal-row"><span>Payment:</span><span>{paymentMethodStr}</span></div>
      <div className="thermal-row"><span>Paid:</span><span>{formatCurrency(paid_amount)}</span></div>
      {balance_amount > 0 && <div className="thermal-row"><span>Balance:</span><span><strong>{formatCurrency(balance_amount)}</strong></span></div>}
      <div className="thermal-row"><span>Status:</span><span><strong>{payment_status}</strong></span></div>

      <hr className="thermal-divider" />

      {/* Footer */}
      <div className="thermal-footer">
        <div>Thank you for shopping</div>
        <div>with {shop.name}!</div>
        <div style={{ marginTop: 4 }}>Visit us again ✨</div>
      </div>
    </div>
  );
}
