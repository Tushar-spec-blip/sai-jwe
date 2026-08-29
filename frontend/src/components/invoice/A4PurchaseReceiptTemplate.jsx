import logo from '../../assets/logo.png';
import { formatCurrency, formatWeight, numberToWords } from '../../utils/billingCalculator';

/**
 * A4 Old Purchase Receipt Template
 * Used when Sri Sai Jewels BUYS old jewellery FROM a customer.
 *
 * transactionType: 'GOLD_PURCHASE' | 'SILVER_PURCHASE'
 *
 * This is NOT a customer sales invoice.
 * Heading: OLD GOLD PURCHASE RECEIPT / OLD SILVER PURCHASE RECEIPT
 */
export default function A4PurchaseReceiptTemplate({ purchase, shopSettings = {} }) {
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
    name: shopSettings.shop_name || 'Sri Sai Jewels',
    address: shopSettings.shop_address || '123, Temple Street, Chennai - 600001',
    phone: shopSettings.shop_phone || '+91 98765 43210',
    gstin: shopSettings.gstin || '33AABCS1234F1Z5',
  };

  const formattedDate = purchase_date
    ? new Date(purchase_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const totalNetWeight = items.reduce((s, it) => s + (parseFloat(it.net_weight) || 0), 0);

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
          <div style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 6, fontWeight: 700,
            background: isGold ? 'rgba(201,168,76,0.18)' : 'rgba(148,163,184,0.2)',
            padding: '4px 12px', borderRadius: 4, display: 'inline-block',
            color: isGold ? '#8B6914' : '#334155',
          }}>
            {receiptHeading}
          </div>
          <div className="invoice-number">{purchase_number}</div>
          <div className="invoice-date">Date: {formattedDate}</div>
          <div style={{
            marginTop: 10,
            padding: '5px 12px',
            background: isGold ? 'rgba(201,168,76,0.12)' : 'rgba(100,116,139,0.10)',
            borderRadius: 6,
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 700,
            color: isGold ? '#8B6914' : '#334155',
            border: isGold ? '1px solid rgba(201,168,76,0.35)' : '1px solid rgba(148,163,184,0.4)',
          }}>
            {isGold ? 'Gold Purchase' : 'Silver Purchase'}
          </div>
        </div>
      </div>

      {/* Purchased From — NOT "Bill To" */}
      <div className="invoice-customer">
        <h4>Purchased From</h4>
        <div className="customer-name">{customer_name || 'Customer'}</div>
        {customer_phone && (
          <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>Phone: {customer_phone}</div>
        )}
      </div>

      {/* Items Table */}
      <div className="invoice-table" style={{ marginBottom: 16 }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '4%' }}>#</th>
              <th style={{ width: '28%' }}>Item / Description</th>
              <th style={{ width: '8%' }}>Purity</th>
              <th style={{ width: '12%' }}>Gross Wt.</th>
              <th style={{ width: '10%' }}>Stone Wt.</th>
              <th style={{ width: '10%' }}>Net Wt.</th>
              <th style={{ width: '14%' }}>{rateLabel}</th>
              <th style={{ width: '14%', textAlign: 'right' }}>Purchase Amt.</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No items</td>
              </tr>
            ) : items.map((item, i) => (
              <tr key={i}>
                <td style={{ color: '#888' }}>{i + 1}</td>
                <td style={{ fontWeight: 600 }}>{item.description}</td>
                <td>{item.purity}</td>
                <td>{formatWeight(item.gross_weight)}</td>
                <td>{formatWeight(item.stone_weight)}</td>
                <td style={{ fontWeight: 600 }}>{formatWeight(item.net_weight)}</td>
                <td>Rs. {item.purchase_rate}/g</td>
                <td style={{ fontWeight: 700, textAlign: 'right' }}>{formatCurrency(item.purchase_amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
              <td colSpan={5} style={{ padding: '7px 10px' }}></td>
              <td style={{ fontWeight: 700, padding: '7px 10px', fontSize: 12 }}>
                {formatWeight(totalNetWeight)}
              </td>
              <td style={{ fontSize: 11, color: '#888', padding: '7px 10px' }}>Total Net Wt.</td>
              <td style={{ fontWeight: 700, textAlign: 'right', padding: '7px 10px' }}>
                {formatCurrency(purchase_amount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Purchase Totals */}
      <div className="invoice-totals">
        <table className="invoice-totals-table">
          <tbody>
            <tr>
              <td className="label-col">Purchase Amount</td>
              <td className="value-col">{formatCurrency(purchase_amount)}</td>
            </tr>
            {deduction_notes && (
              <tr>
                <td className="label-col" style={{ color: '#dc2626', fontSize: 12 }}>Deduction / Adjustment</td>
                <td className="value-col" style={{ color: '#dc2626', fontSize: 12 }}>—</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="invoice-grand-total">
              <td>AMOUNT PAYABLE TO CUSTOMER</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(final_payable)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Amount in Words */}
      <div className="invoice-amount-words">
        <strong>Amount Payable in Words: </strong>{numberToWords(final_payable)}
      </div>

      {/* Deduction Notes */}
      {deduction_notes && (
        <div style={{ marginTop: 10, padding: '8px 14px', background: '#fff8f0', border: '1px solid #fcd34d', borderRadius: 6, fontSize: 12 }}>
          <strong>Deduction / Adjustment Notes: </strong>{deduction_notes}
        </div>
      )}

      {/* Payment Details */}
      <div className="invoice-payment">
        <h4>Payment Details</h4>
        <div style={{ display: 'flex', gap: 30, fontSize: 13 }}>
          <div><span style={{ color: '#888' }}>Method: </span><strong>{payment_method || '—'}</strong></div>
          <div><span style={{ color: '#888' }}>Amount Paid to Customer: </span><strong style={{ color: '#16a34a' }}>{formatCurrency(final_payable)}</strong></div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#fffbea', border: '1px solid #fcd34d', borderRadius: 6, fontSize: 12 }}>
          <strong>Notes: </strong>{notes}
        </div>
      )}

      {/* Disclaimer Note */}
      <div style={{ marginTop: 14, padding: '8px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 6, fontSize: 11, color: '#0369a1' }}>
        <strong>Note:</strong> This is an Old Purchase Receipt issued by {shop.name}. This document confirms the purchase of old {metal.toLowerCase()} jewellery from the customer above. This is NOT a customer sales invoice.
      </div>

      {/* Signatures */}
      <div className="invoice-signatures">
        <div className="invoice-sig-box">
          <div className="invoice-sig-line">Customer Signature<br />(Seller)</div>
        </div>
        <div className="invoice-sig-box">
          <div className="invoice-sig-line">Authorised Signatory<br />{shop.name}</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#999', borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
        {shop.name} — Old Purchase Receipt • Thank you for trusting us with your old jewellery.
        <br />This is a computer-generated purchase receipt.
      </div>
    </div>
  );
}
