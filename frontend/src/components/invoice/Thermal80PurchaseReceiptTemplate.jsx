import logo from '../../assets/logo.png';
import { formatCurrency, formatWeight } from '../../utils/billingCalculator';

/**
 * 80mm Thermal Old Purchase Receipt Template
 * Compact layout for thermal receipt printers.
 * 
 * transactionType: 'GOLD_PURCHASE' | 'SILVER_PURCHASE'
 * This is NOT a customer sales invoice.
 */
export default function Thermal80PurchaseReceiptTemplate({ purchase, shopSettings = {} }) {
  if (!purchase) return null;

  const isGold = purchase.transactionType === 'GOLD_PURCHASE';
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
    name: shopSettings.shop_name || 'SRI SAI JEWELS',
    phone: shopSettings.shop_phone || '+91 98765 43210',
    address: shopSettings.shop_address || '123, Temple Street, Chennai',
    gstin: shopSettings.gstin || '33AABCS1234F1Z5',
  };

  const formattedDate = purchase_date
    ? new Date(purchase_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' });

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

      {/* Receipt Type */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 11, marginBottom: 4 }}>
        {receiptHeading}
      </div>

      <hr className="thermal-divider" />

      {/* Purchase Info */}
      <div className="thermal-row"><span>Receipt No:</span><span><strong>{purchase_number}</strong></span></div>
      <div className="thermal-row"><span>Date:</span><span>{formattedDate}</span></div>
      <div className="thermal-row"><span>Purchased From:</span><span>{customer_name || 'Customer'}</span></div>
      {customer_phone && (
        <div className="thermal-row"><span>Phone:</span><span>{customer_phone}</span></div>
      )}

      <hr className="thermal-divider" />

      {/* Items */}
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div className="thermal-item-name">{item.description}</div>
          {item.purity && (
            <div className="thermal-row"><span>Purity:</span><span>{item.purity}</span></div>
          )}
          <div className="thermal-row"><span>Gross Wt:</span><span>{formatWeight(item.gross_weight)}</span></div>
          {item.stone_weight > 0 && (
            <div className="thermal-row"><span>Stone Wt:</span><span>{formatWeight(item.stone_weight)}</span></div>
          )}
          <div className="thermal-row"><span>Net Wt:</span><span><strong>{formatWeight(item.net_weight)}</strong></span></div>
          <div className="thermal-row"><span>{rateLabel}:</span><span>Rs. {item.purchase_rate}/g</span></div>
          <hr className="thermal-divider" style={{ borderStyle: 'dotted' }} />
          <div className="thermal-row" style={{ fontWeight: 'bold' }}>
            <span>Purchase Amt:</span><span>{formatCurrency(item.purchase_amount)}</span>
          </div>
          {i < items.length - 1 && <hr className="thermal-divider" />}
        </div>
      ))}

      <hr className="thermal-divider" />

      {/* Totals */}
      <div className="thermal-row"><span>Purchase Amount:</span><span><strong>{formatCurrency(purchase_amount)}</strong></span></div>
      {deduction_notes && (
        <div className="thermal-row"><span>Deduction:</span><span>—</span></div>
      )}

      <hr className="thermal-divider" />

      <div className="thermal-total">PAYABLE: {formatCurrency(final_payable)}</div>

      <hr className="thermal-divider" />

      {/* Payment */}
      <div className="thermal-row"><span>Payment:</span><span>{payment_method || '—'}</span></div>
      <div className="thermal-row"><span>Paid to Customer:</span><span><strong>{formatCurrency(final_payable)}</strong></span></div>

      {deduction_notes && (
        <>
          <hr className="thermal-divider" style={{ borderStyle: 'dotted' }} />
          <div style={{ fontSize: 10 }}>Adj: {deduction_notes}</div>
        </>
      )}

      {notes && (
        <>
          <hr className="thermal-divider" style={{ borderStyle: 'dotted' }} />
          <div style={{ fontSize: 10 }}>Notes: {notes}</div>
        </>
      )}

      <hr className="thermal-divider" />

      {/* Signature Lines */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, marginBottom: 4, fontSize: 9 }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: 3, marginTop: 20 }}>Customer<br />(Seller)</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: 3, marginTop: 20 }}>Authorised<br />Signatory</div>
        </div>
      </div>

      <hr className="thermal-divider" />

      {/* Footer */}
      <div className="thermal-footer">
        <div>Old Purchase Receipt</div>
        <div>NOT a sales invoice</div>
        <div style={{ marginTop: 4 }}>{shop.name}</div>
      </div>
    </div>
  );
}
