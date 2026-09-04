import { useState } from 'react';
import { Eye, Printer, Search, Trash2, Plus } from 'lucide-react';
import storageService from '../services/storageService';
import { formatCurrency, formatWeight } from '../utils/billingCalculator';
import { useMetalRates } from '../context/MetalRatesContext';
import { useSettings } from '../context/SettingsContext';
import PurchasePrintPreviewModal from '../components/invoice/PurchasePrintPreviewModal';

// ============================================================
// TRANSACTION TYPES
// GOLD_PURCHASE  — Sri Sai Jewels buys gold from customer
// SILVER_PURCHASE — Sri Sai Jewels buys silver from customer
// These are SEPARATE from GOLD_SALE and SILVER_SALE.
// ============================================================

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Deducted to bill'];

const GOLD_PURITIES = ['24K', '22K', '18K', '14K', 'Other'];
const SILVER_PURITIES = ['999', 'Other'];

// ============================================================
// HELPERS
// ============================================================

function createBlankItem(transactionType, defaultRate = '') {
  return {
    description: '',
    purity: transactionType === 'GOLD_PURCHASE' ? '22K' : '999',
    gross_weight: '',
    stone_weight: '',
    purchase_rate: defaultRate,
  };
}

function createBlankForm(transactionType, defaultRate = '') {
  return {
    customer_name: '',
    customer_phone: '',
    purchase_date: new Date().toISOString().split('T')[0],
    deduction_notes: '',
    payment_method: 'Cash',
    notes: '',
    items: [createBlankItem(transactionType, defaultRate)],
  };
}

function calcItem(item) {
  const gross = parseFloat(item.gross_weight) || 0;
  const stone = parseFloat(item.stone_weight) || 0;
  const net = Math.max(0, gross - stone);
  const rate = parseFloat(item.purchase_rate) || 0;
  const amount = parseFloat((net * rate).toFixed(2));
  return { gross, stone, net, rate, amount };
}

// ============================================================
// ITEM CARD — shared by both Gold and Silver forms
// ============================================================
function PurchaseItemCard({
  index,
  item,
  transactionType,
  totalItems,
  onChange,
  onRemove,
}) {
  const isGold = transactionType === 'GOLD_PURCHASE';
  const purities = isGold ? GOLD_PURITIES : SILVER_PURITIES;
  const rateLabel = isGold ? 'Purchase Gold Rate (Rs./g)' : 'Purchase Silver Rate (Rs./g)';
  const ratePlaceholder = isGold ? 'e.g. 6200' : 'e.g. 78';
  const descPlaceholder = isGold
    ? 'e.g. Old Gold Ring, Old Gold Chain…'
    : 'e.g. Old Silver Anklets, Old Silver Vessel…';

  const { net, rate, amount } = calcItem(item);

  const set = (field, value) => onChange(index, { ...item, [field]: value });

  const accentColor = isGold ? '#8B6914' : '#334155';
  const accentBg = isGold ? 'rgba(201,168,76,0.08)' : 'rgba(148,163,184,0.08)';
  const accentBorder = isGold ? 'rgba(201,168,76,0.35)' : 'rgba(148,163,184,0.35)';

  return (
    <div style={{
      border: `1.5px solid ${accentBorder}`,
      borderRadius: 'var(--radius-lg)',
      marginBottom: 16,
      overflow: 'hidden',
      background: 'var(--bg-card)',
    }}>
      {/* Item Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: accentBg,
        padding: '10px 16px',
        borderBottom: `1px solid ${accentBorder}`,
      }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: accentColor }}>
          Item {index + 1}
        </span>
        <button
          type="button"
          title={totalItems <= 1 ? 'At least one item is required' : 'Remove this item'}
          disabled={totalItems <= 1}
          onClick={() => onRemove(index)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: totalItems <= 1 ? 'transparent' : 'rgba(220,38,38,0.08)',
            border: `1px solid ${totalItems <= 1 ? 'var(--border-light)' : 'rgba(220,38,38,0.25)'}`,
            color: totalItems <= 1 ? 'var(--text-muted)' : '#dc2626',
            borderRadius: 'var(--radius-md)',
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 600,
            cursor: totalItems <= 1 ? 'not-allowed' : 'pointer',
            opacity: totalItems <= 1 ? 0.45 : 1,
            transition: 'all 0.15s',
          }}
        >
          <Trash2 size={12} />
          Remove Item
        </button>
      </div>

      {/* Item Fields */}
      <div style={{ padding: '16px' }}>
        <div className="bill-item-grid">
          {/* Description — spans 3 cols */}
          <div className="form-group" style={{ gridColumn: 'span 3' }}>
            <label className="form-label">Item / Description <span className="required">*</span></label>
            <input
              className="form-input"
              placeholder={descPlaceholder}
              value={item.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Purity */}
          <div className="form-group">
            <label className="form-label">{isGold ? 'Purity' : 'Purity (if applicable)'}</label>
            <select
              className="form-select"
              value={item.purity}
              onChange={e => set('purity', e.target.value)}
            >
              {purities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Gross Weight */}
          <div className="form-group">
            <label className="form-label">Gross Weight (g) <span className="required">*</span></label>
            <input
              className="form-input"
              type="number"
              inputMode="decimal"
              step="0.001"
              placeholder="0.000"
              value={item.gross_weight}
              onChange={e => set('gross_weight', e.target.value)}
            />
          </div>

          {/* Stone Weight */}
          <div className="form-group">
            <label className="form-label">Stone Weight (g)</label>
            <input
              className="form-input"
              type="number"
              inputMode="decimal"
              step="0.001"
              placeholder="0.000"
              value={item.stone_weight}
              onChange={e => set('stone_weight', e.target.value)}
            />
          </div>

          {/* Net Weight — calculated */}
          <div className="form-group">
            <label className="form-label">Net Weight (g)</label>
            <input
              className="form-input"
              value={net > 0 ? net.toFixed(3) : ''}
              disabled
              style={{ color: accentColor, fontWeight: 700 }}
              placeholder="Auto-calculated"
            />
          </div>

          {/* Purchase Rate */}
          <div className="form-group">
            <label className="form-label">{rateLabel} <span className="required">*</span></label>
            <input
              className="form-input"
              type="number"
              inputMode="numeric"
              step="1"
              placeholder={ratePlaceholder}
              value={item.purchase_rate}
              onChange={e => set('purchase_rate', e.target.value)}
            />
            <span className="form-hint">
              {isGold ? 'Rate paid to customer per gram of net gold weight' : 'Silver rate paid to customer per gram of net weight'}
            </span>
          </div>
        </div>

        {/* Live Calculation for this item */}
        {net > 0 && rate > 0 && (
          <div className="bill-item-calculation" style={{ marginTop: 12 }}>
            <div className="calc-row">
              <span className="label">Net Weight</span>
              <span className="value">{net.toFixed(3)} g</span>
            </div>
            <div className="calc-row">
              <span className="label">{isGold ? 'Gold Rate' : 'Silver Rate'}</span>
              <span className="value">Rs. {rate}/g</span>
            </div>
            <div className="calc-row calc-total">
              <span className="label" style={{ color: 'inherit' }}>Item {index + 1} Purchase Amount</span>
              <span className="value">{formatCurrency(amount)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// GOLD PURCHASE FORM — multi-item
// ============================================================
function GoldPurchaseForm({ onBack, onSave, defaultRate }) {
  const [form, setForm] = useState(createBlankForm('GOLD_PURCHASE', defaultRate));

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleItemChange = (index, updatedItem) => {
    setForm(prev => {
      const items = [...prev.items];
      items[index] = updatedItem;
      return { ...prev, items };
    });
  };

  const handleAddItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, createBlankItem('GOLD_PURCHASE', defaultRate)],
    }));
  };

  const handleRemoveItem = (index) => {
    setForm(prev => {
      if (prev.items.length <= 1) return prev;
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items };
    });
  };

  // Computed totals
  const calcedItems = form.items.map(calcItem);
  const totalNetWeight = calcedItems.reduce((s, c) => s + c.net, 0);
  const totalAmount = parseFloat(calcedItems.reduce((s, c) => s + c.amount, 0).toFixed(2));

  const handleSave = () => {
    if (!form.customer_name.trim()) {
      alert('Please enter the Customer Name.');
      return;
    }
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      const { gross, rate } = calcedItems[i];
      if (!item.description.trim()) {
        alert(`Please enter the Item / Description for Item ${i + 1}.`);
        return;
      }
      if (gross <= 0) {
        alert(`Please enter a valid Gross Weight for Item ${i + 1}.`);
        return;
      }
      if (rate <= 0) {
        alert(`Please enter a valid Purchase Gold Rate for Item ${i + 1}.`);
        return;
      }
    }

    const prefix = 'PUR-';
    const purchaseNumber = `${prefix}${Date.now().toString().slice(-6)}`;
    const record = {
      id: purchaseNumber,
      purchase_number: purchaseNumber,
      transactionType: 'GOLD_PURCHASE',
      transaction_type_label: 'Gold Purchase',
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      purchase_date: form.purchase_date,
      items: form.items.map((item, i) => {
        const c = calcedItems[i];
        return {
          description: item.description.trim(),
          purity: item.purity,
          gross_weight: c.gross,
          stone_weight: c.stone,
          net_weight: c.net,
          purchase_rate: c.rate,
          purchase_amount: c.amount,
        };
      }),
      total_net_weight: totalNetWeight,
      purchase_amount: totalAmount,
      deduction_notes: form.deduction_notes.trim(),
      final_payable: totalAmount,
      payment_method: form.payment_method,
      notes: form.notes.trim(),
      created_at: form.purchase_date,
    };

    onSave(record);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Old Purchase — Gold Purchase</h2>
          <p>Record old gold jewellery purchased from a customer</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={onBack}>← Change Type</button>
        </div>
      </div>

      {/* Transaction Type Badge */}
      <div style={{ marginBottom: 20 }}>
        <span style={{
          display: 'inline-block',
          background: 'rgba(201,168,76,0.15)',
          border: '1.5px solid rgba(201,168,76,0.5)',
          color: '#8B6914',
          fontWeight: 700,
          fontSize: 12,
          padding: '4px 14px',
          borderRadius: 20,
          letterSpacing: '0.04em',
        }}>
          🪙 GOLD PURCHASE &nbsp;|&nbsp; transactionType = GOLD_PURCHASE
        </span>
      </div>

      <div className="billing-layout">
        <div>
          {/* Step 1: Customer */}
          <div className="billing-section">
            <div className="billing-section-header">
              <span className="billing-section-number">1</span>
              <h3>Customer (Seller)</h3>
            </div>
            <div className="billing-section-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Customer Name <span className="required">*</span></label>
                  <input
                    className="form-input"
                    placeholder="Name of the customer selling the jewellery"
                    value={form.customer_name}
                    onChange={e => setField('customer_name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    type="tel"
                    inputMode="tel"
                    placeholder="Mobile number"
                    value={form.customer_phone}
                    onChange={e => setField('customer_phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date <span className="required">*</span></label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.purchase_date}
                    onChange={e => setField('purchase_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Gold Items */}
          <div className="billing-section">
            <div className="billing-section-header">
              <span className="billing-section-number">2</span>
              <h3>Gold Items</h3>
            </div>
            <div className="billing-section-body">
              {form.items.map((item, index) => (
                <PurchaseItemCard
                  key={index}
                  index={index}
                  item={item}
                  transactionType="GOLD_PURCHASE"
                  totalItems={form.items.length}
                  onChange={handleItemChange}
                  onRemove={handleRemoveItem}
                />
              ))}

              {/* Add Another Item */}
              <button
                type="button"
                onClick={handleAddItem}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '9px 18px',
                  borderStyle: 'dashed',
                }}
              >
                <Plus size={15} />
                Add Another Item
              </button>

              {/* Items Total Preview */}
              {form.items.length > 1 && totalAmount > 0 && (
                <div style={{
                  marginTop: 16,
                  padding: '12px 16px',
                  background: 'rgba(201,168,76,0.08)',
                  border: '1.5px solid rgba(201,168,76,0.3)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#8B6914', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Items Subtotal
                  </div>
                  {calcedItems.map((c, i) => c.amount > 0 && (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: 'var(--text-muted)' }}>
                      <span>Item {i + 1} — {form.items[i].description || '(no description)'}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{formatCurrency(c.amount)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(201,168,76,0.3)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14, color: '#8B6914' }}>
                    <span>Total Purchase Amount</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Adjustments & Notes */}
          <div className="billing-section">
            <div className="billing-section-header">
              <span className="billing-section-number">3</span>
              <h3>Adjustments &amp; Notes</h3>
            </div>
            <div className="billing-section-body">
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Deduction / Adjustment Notes</label>
                <input
                  className="form-input"
                  placeholder="e.g. Deduction for purity testing, melting charge, etc. (Optional)"
                  value={form.deduction_notes}
                  onChange={e => setField('deduction_notes', e.target.value)}
                />
                <span className="form-hint">Applicable deduction fields will be added in a future update</span>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  className="form-input"
                  placeholder="Any additional notes about this purchase..."
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Step 4: Payment */}
          <div className="billing-section">
            <div className="billing-section-header">
              <span className="billing-section-number">4</span>
              <h3>Payment Method</h3>
            </div>
            <div className="billing-section-body">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`payment-method-btn ${form.payment_method === m ? 'selected' : ''}`}
                    onClick={() => setField('payment_method', m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Selected: <strong>{form.payment_method}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary Panel */}
        <div>
          <div className="bill-summary-panel">
            <div className="bill-summary-header">
              <h3>Purchase Summary</h3>
            </div>
            <div className="bill-summary-body">
              <div className="summary-line" style={{ background: 'rgba(201,168,76,0.1)', padding: '6px 10px', borderRadius: 'var(--radius-md)', marginBottom: 10 }}>
                <span className="s-label" style={{ fontWeight: 600, color: 'var(--gold-dark)' }}>Transaction Type</span>
                <span className="badge badge-gold">Gold Purchase 🪙</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Customer</span>
                <span className="s-value" style={{ fontSize: 13 }}>{form.customer_name || '—'}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Number of Items</span>
                <span className="s-value" style={{ fontWeight: 600 }}>{form.items.length}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Total Net Weight</span>
                <span className="s-value" style={{ fontWeight: 600 }}>{totalNetWeight > 0 ? `${totalNetWeight.toFixed(3)} g` : '—'}</span>
              </div>
              <div className="summary-line" style={{ borderTop: '1px solid var(--border-light)', paddingTop: 6, marginTop: 4 }}>
                <span className="s-label" style={{ fontWeight: 600 }}>Total Purchase Amount</span>
                <span className="s-value" style={{ fontWeight: 600 }}>{totalAmount > 0 ? formatCurrency(totalAmount) : '—'}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Payment Method</span>
                <span className="s-value" style={{ fontSize: 13 }}>{form.payment_method}</span>
              </div>
              <div className="summary-grand-total">
                <span className="gt-label">PAYABLE TO CUSTOMER</span>
                <span className="gt-value">{totalAmount > 0 ? formatCurrency(totalAmount) : '—'}</span>
              </div>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', background: '#8B6914', borderColor: '#8B6914' }}
                onClick={handleSave}
              >
                Save Gold Purchase Receipt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Summary */}
      <div className="mobile-sticky-summary">
        <div>
          <div className="mss-label">Payable to Customer</div>
          <div className="mss-value">{totalAmount > 0 ? formatCurrency(totalAmount) : '—'}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleSave}>Save Receipt</button>
      </div>
    </div>
  );
}

// ============================================================
// SILVER PURCHASE FORM — multi-item
// ============================================================
function SilverPurchaseForm({ onBack, onSave, defaultRate }) {
  const [form, setForm] = useState(createBlankForm('SILVER_PURCHASE', defaultRate));

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleItemChange = (index, updatedItem) => {
    setForm(prev => {
      const items = [...prev.items];
      items[index] = updatedItem;
      return { ...prev, items };
    });
  };

  const handleAddItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, createBlankItem('SILVER_PURCHASE', defaultRate)],
    }));
  };

  const handleRemoveItem = (index) => {
    setForm(prev => {
      if (prev.items.length <= 1) return prev;
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items };
    });
  };

  // Computed totals
  const calcedItems = form.items.map(calcItem);
  const totalNetWeight = calcedItems.reduce((s, c) => s + c.net, 0);
  const totalAmount = parseFloat(calcedItems.reduce((s, c) => s + c.amount, 0).toFixed(2));

  const handleSave = () => {
    if (!form.customer_name.trim()) {
      alert('Please enter the Customer Name.');
      return;
    }
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      const { gross, rate } = calcedItems[i];
      if (!item.description.trim()) {
        alert(`Please enter the Item / Description for Item ${i + 1}.`);
        return;
      }
      if (gross <= 0) {
        alert(`Please enter a valid Gross Weight for Item ${i + 1}.`);
        return;
      }
      if (rate <= 0) {
        alert(`Please enter a valid Purchase Silver Rate for Item ${i + 1}.`);
        return;
      }
    }

    const prefix = 'PUR-';
    const purchaseNumber = `${prefix}${Date.now().toString().slice(-6)}`;
    const record = {
      id: purchaseNumber,
      purchase_number: purchaseNumber,
      transactionType: 'SILVER_PURCHASE',
      transaction_type_label: 'Silver Purchase',
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      purchase_date: form.purchase_date,
      items: form.items.map((item, i) => {
        const c = calcedItems[i];
        return {
          description: item.description.trim(),
          purity: item.purity,
          gross_weight: c.gross,
          stone_weight: c.stone,
          net_weight: c.net,
          purchase_rate: c.rate,
          purchase_amount: c.amount,
        };
      }),
      total_net_weight: totalNetWeight,
      purchase_amount: totalAmount,
      deduction_notes: form.deduction_notes.trim(),
      final_payable: totalAmount,
      payment_method: form.payment_method,
      notes: form.notes.trim(),
      created_at: form.purchase_date,
    };

    onSave(record);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Old Purchase — Silver Purchase</h2>
          <p>Record old silver jewellery purchased from a customer</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={onBack}>← Change Type</button>
        </div>
      </div>

      {/* Transaction Type Badge */}
      <div style={{ marginBottom: 20 }}>
        <span style={{
          display: 'inline-block',
          background: 'rgba(148,163,184,0.15)',
          border: '1.5px solid rgba(148,163,184,0.5)',
          color: '#334155',
          fontWeight: 700,
          fontSize: 12,
          padding: '4px 14px',
          borderRadius: 20,
          letterSpacing: '0.04em',
        }}>
          ⬜ SILVER PURCHASE &nbsp;|&nbsp; transactionType = SILVER_PURCHASE
        </span>
      </div>

      <div className="billing-layout">
        <div>
          {/* Step 1: Customer */}
          <div className="billing-section">
            <div className="billing-section-header">
              <span className="billing-section-number">1</span>
              <h3>Customer (Seller)</h3>
            </div>
            <div className="billing-section-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Customer Name <span className="required">*</span></label>
                  <input
                    className="form-input"
                    placeholder="Name of the customer selling the jewellery"
                    value={form.customer_name}
                    onChange={e => setField('customer_name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    type="tel"
                    inputMode="tel"
                    placeholder="Mobile number"
                    value={form.customer_phone}
                    onChange={e => setField('customer_phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date <span className="required">*</span></label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.purchase_date}
                    onChange={e => setField('purchase_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Silver Items */}
          <div className="billing-section">
            <div className="billing-section-header">
              <span className="billing-section-number">2</span>
              <h3>Silver Items</h3>
            </div>
            <div className="billing-section-body">
              {form.items.map((item, index) => (
                <PurchaseItemCard
                  key={index}
                  index={index}
                  item={item}
                  transactionType="SILVER_PURCHASE"
                  totalItems={form.items.length}
                  onChange={handleItemChange}
                  onRemove={handleRemoveItem}
                />
              ))}

              {/* Add Another Item */}
              <button
                type="button"
                onClick={handleAddItem}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '9px 18px',
                  borderStyle: 'dashed',
                }}
              >
                <Plus size={15} />
                Add Another Item
              </button>

              {/* Items Total Preview */}
              {form.items.length > 1 && totalAmount > 0 && (
                <div style={{
                  marginTop: 16,
                  padding: '12px 16px',
                  background: 'rgba(148,163,184,0.08)',
                  border: '1.5px solid rgba(148,163,184,0.3)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#334155', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Items Subtotal
                  </div>
                  {calcedItems.map((c, i) => c.amount > 0 && (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: 'var(--text-muted)' }}>
                      <span>Item {i + 1} — {form.items[i].description || '(no description)'}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{formatCurrency(c.amount)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(148,163,184,0.3)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14, color: '#334155' }}>
                    <span>Total Purchase Amount</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Notes */}
          <div className="billing-section">
            <div className="billing-section-header">
              <span className="billing-section-number">3</span>
              <h3>Notes</h3>
            </div>
            <div className="billing-section-body">
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Deduction / Adjustment Notes</label>
                <input
                  className="form-input"
                  placeholder="e.g. Any applicable deduction notes (Optional)"
                  value={form.deduction_notes}
                  onChange={e => setField('deduction_notes', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  className="form-input"
                  placeholder="Any additional notes..."
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Step 4: Payment */}
          <div className="billing-section">
            <div className="billing-section-header">
              <span className="billing-section-number">4</span>
              <h3>Payment Method</h3>
            </div>
            <div className="billing-section-body">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`payment-method-btn ${form.payment_method === m ? 'selected' : ''}`}
                    onClick={() => setField('payment_method', m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Selected: <strong>{form.payment_method}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary Panel */}
        <div>
          <div className="bill-summary-panel">
            <div className="bill-summary-header">
              <h3>Purchase Summary</h3>
            </div>
            <div className="bill-summary-body">
              <div className="summary-line" style={{ background: '#f1f5f9', padding: '6px 10px', borderRadius: 'var(--radius-md)', marginBottom: 10 }}>
                <span className="s-label" style={{ fontWeight: 600, color: '#334155' }}>Transaction Type</span>
                <span className="badge badge-silver">Silver Purchase ⬜</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Customer</span>
                <span className="s-value" style={{ fontSize: 13 }}>{form.customer_name || '—'}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Number of Items</span>
                <span className="s-value" style={{ fontWeight: 600 }}>{form.items.length}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Total Net Weight</span>
                <span className="s-value" style={{ fontWeight: 600 }}>{totalNetWeight > 0 ? `${totalNetWeight.toFixed(3)} g` : '—'}</span>
              </div>
              <div className="summary-line" style={{ borderTop: '1px solid var(--border-light)', paddingTop: 6, marginTop: 4 }}>
                <span className="s-label" style={{ fontWeight: 600 }}>Total Purchase Amount</span>
                <span className="s-value" style={{ fontWeight: 600 }}>{totalAmount > 0 ? formatCurrency(totalAmount) : '—'}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Payment Method</span>
                <span className="s-value" style={{ fontSize: 13 }}>{form.payment_method}</span>
              </div>
              <div className="summary-grand-total">
                <span className="gt-label">PAYABLE TO CUSTOMER</span>
                <span className="gt-value">{totalAmount > 0 ? formatCurrency(totalAmount) : '—'}</span>
              </div>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                onClick={handleSave}
              >
                Save Silver Purchase Receipt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Summary */}
      <div className="mobile-sticky-summary">
        <div>
          <div className="mss-label">Payable to Customer</div>
          <div className="mss-value">{totalAmount > 0 ? formatCurrency(totalAmount) : '—'}</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleSave}>Save Receipt</button>
      </div>
    </div>
  );
}

// ============================================================
// OLD PURCHASE HISTORY TABLE
// ============================================================
function PurchaseHistory({ purchases, onViewReceipt }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const filtered = purchases.filter(p => {
    const matchSearch = !search ||
      p.purchase_number.toLowerCase().includes(search.toLowerCase()) ||
      p.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || p.transactionType === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="card" style={{ marginTop: 32 }}>
      <div className="card-header" style={{ gap: 10, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Old Purchase History</div>
        <div className="search-bar" style={{ flex: 1, minWidth: 180 }}>
          <Search />
          <input
            placeholder="Search receipt no. or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 160, padding: '8px 32px 8px 12px' }}
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="GOLD_PURCHASE">Gold Purchase</option>
          <option value="SILVER_PURCHASE">Silver Purchase</option>
        </select>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} records</span>
      </div>
      <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
        <div className="scroll-hint">
          <span>Scroll horizontally to view details →</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Purchase No.</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Metal</th>
              <th>Items</th>
              <th>Total Net Weight</th>
              <th>Purchase Amount</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                  No purchase records found
                </td>
              </tr>
            ) : filtered.map(p => {
              const isGold = p.transactionType === 'GOLD_PURCHASE';
              const itemCount = Array.isArray(p.items) ? p.items.length : 1;
              return (
                <tr key={p.id}>
                  <td><span className="td-primary">{p.purchase_number}</span></td>
                  <td style={{ fontSize: 13 }}>
                    {new Date(p.purchase_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="td-primary">{p.customer_name}</div>
                    <div className="td-secondary">{p.customer_phone}</div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 10px',
                      borderRadius: 12,
                      background: isGold ? 'rgba(201,168,76,0.15)' : 'rgba(148,163,184,0.15)',
                      color: isGold ? '#8B6914' : '#334155',
                      border: isGold ? '1px solid rgba(201,168,76,0.35)' : '1px solid rgba(148,163,184,0.35)',
                    }}>
                      {p.transaction_type_label}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: isGold ? '#8B6914' : '#334155', fontSize: 13 }}>
                    {isGold ? '🪙 Gold' : '⬜ Silver'}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>
                    <span style={{
                      display: 'inline-block',
                      background: isGold ? 'rgba(201,168,76,0.12)' : 'rgba(148,163,184,0.12)',
                      color: isGold ? '#8B6914' : '#334155',
                      borderRadius: 10,
                      padding: '2px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatWeight(p.total_net_weight)}</td>
                  <td><strong>{formatCurrency(p.final_payable)}</strong></td>
                  <td style={{ fontSize: 13 }}>{p.payment_method}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm" title="View Receipt" onClick={() => onViewReceipt(p, 'A4')}>
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-secondary btn-sm" title="Print A4 Receipt" onClick={() => onViewReceipt(p, 'A4')}>
                        <Printer size={14} /> A4
                      </button>
                      <button className="btn btn-secondary btn-sm" title="Print 80mm Receipt" onClick={() => onViewReceipt(p, '80mm')}>
                        🧾
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// MAIN OLD PURCHASE PAGE
// ============================================================
export default function OldPurchase() {
  const { getRateFor } = useMetalRates();
  const { settings } = useSettings();

  // purchaseType: null (selection) | 'GOLD_PURCHASE' | 'SILVER_PURCHASE'
  const [purchaseType, setPurchaseType] = useState(null);
  const [savedReceipt, setSavedReceipt] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFormat, setPreviewFormat] = useState('A4');
  const [previewPurchase, setPreviewPurchase] = useState(null);

  // Live purchases list from persistent storage
  const [purchases, setPurchases] = useState(() => storageService.getOldPurchases());

  const goldRate = getRateFor('Gold', '22K') || 6500;
  const silverRate = getRateFor('Silver', '999') || 85;

  const handleSave = (record) => {
    const newRecord = storageService.addOldPurchase(record);
    setPurchases(storageService.getOldPurchases());
    setSavedReceipt(newRecord);
    setPreviewFormat('A4');
    setPreviewPurchase(newRecord);
    setShowPreview(true);
  };

  const handleViewReceipt = (p, fmt = 'A4') => {
    setPreviewPurchase(p);
    setPreviewFormat(fmt);
    setShowPreview(true);
  };

  const handleNewPurchase = () => {
    setSavedReceipt(null);
    setPurchaseType(null);
  };

  // ── STEP A: Purchase Type Selection ──
  if (!purchaseType) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <h2>Old Purchase</h2>
            <p>Sri Sai Jewels buys old jewellery from customers</p>
          </div>
          <div className="page-header-actions" style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-primary"
              style={{ background: '#8B6914', borderColor: '#8B6914' }}
              onClick={() => setPurchaseType('GOLD_PURCHASE')}
            >
              + Gold Purchase
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setPurchaseType('SILVER_PURCHASE')}
            >
              + Silver Purchase
            </button>
          </div>
        </div>

        {/* Important Note */}
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          marginBottom: 28,
          fontSize: 13,
          color: '#991b1b',
        }}>
          <strong>Note:</strong> Old Purchase is a completely separate workflow from New Sale. In this section, Sri Sai Jewels is <strong>purchasing</strong> old jewellery <strong>from</strong> the customer — not selling to them.
        </div>

        {/* Type Selection Cards */}
        <div style={{ maxWidth: 760, margin: '0 auto 0', padding: '0 8px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 6 }}>OLD PURCHASE</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Select Purchase Type</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 36 }}>
            {/* GOLD PURCHASE CARD */}
            <div
              id="btn-gold-purchase"
              onClick={() => setPurchaseType('GOLD_PURCHASE')}
              style={{
                background: 'linear-gradient(135deg, #FFFDF5 0%, #FAF2D8 100%)',
                border: '2px solid #C9A84C',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 24px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            >
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.1) 100%)', border: '1.5px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(201,168,76,0.15)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="rgba(201,168,76,0.25)" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#8B6914', marginBottom: 8 }}>GOLD PURCHASE</h3>
              <p style={{ fontSize: 13, color: '#7A6A4A', lineHeight: 1.6, marginBottom: 16 }}>
                Buy old gold jewellery from a customer.<br />
                <span style={{ fontSize: 12, color: '#9A8050' }}>Supports multiple items per transaction.</span>
              </p>
              <div style={{ fontSize: 12, color: '#8B6914', background: 'rgba(201,168,76,0.1)', padding: '4px 10px', borderRadius: 8, marginBottom: 16, display: 'inline-block' }}>
                Live Gold Rate: Rs. {goldRate}/g (22K)
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', background: '#8B6914', borderColor: '#8B6914' }}>
                Start Gold Purchase →
              </button>
            </div>

            {/* SILVER PURCHASE CARD */}
            <div
              id="btn-silver-purchase"
              onClick={() => setPurchaseType('SILVER_PURCHASE')}
              style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
                border: '2px solid #94A3B8',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 24px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            >
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(148,163,184,0.25) 0%, rgba(148,163,184,0.1) 100%)', border: '1.5px solid rgba(148,163,184,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(148,163,184,0.15)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" fill="rgba(148,163,184,0.25)" />
                  <circle cx="12" cy="12" r="5" strokeDasharray="2 2" />
                  <path d="M12 9v6M9.5 14h5" />
                </svg>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#334155', marginBottom: 8 }}>SILVER PURCHASE</h3>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 16 }}>
                Buy old silver jewellery from a customer.<br />
                <span style={{ fontSize: 12, color: '#7A8A9A' }}>Supports multiple items per transaction.</span>
              </p>
              <div style={{ fontSize: 12, color: '#334155', background: 'rgba(148,163,184,0.12)', padding: '4px 10px', borderRadius: 8, marginBottom: 16, display: 'inline-block' }}>
                Live Silver Rate: Rs. {silverRate}/g (999)
              </div>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Start Silver Purchase →
              </button>
            </div>
          </div>
        </div>

        {/* Purchase History */}
        <PurchaseHistory purchases={purchases} onViewReceipt={handleViewReceipt} />

        {/* Print Preview Modal */}
        {showPreview && previewPurchase && (
          <PurchasePrintPreviewModal
            purchase={previewPurchase}
            isOpen={showPreview}
            initialFormat={previewFormat}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    );
  }

  // ── STEP B: Post-save success screen ──
  if (savedReceipt) {
    const itemCount = Array.isArray(savedReceipt.items) ? savedReceipt.items.length : 1;
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <h2>Old Purchase — Receipt Saved</h2>
            <p>{savedReceipt.transaction_type_label} receipt generated successfully</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={handleNewPurchase}>
              + New Purchase
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: '40px auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Receipt Saved!</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
            {savedReceipt.purchase_number} — {savedReceipt.transaction_type_label}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'} &nbsp;·&nbsp; Total Net Weight: {formatWeight(savedReceipt.total_net_weight)} &nbsp;·&nbsp; {formatCurrency(savedReceipt.final_payable)}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn btn-primary"
              style={{ justifyContent: 'center', padding: '12px', background: '#8B6914', borderColor: '#8B6914' }}
              onClick={() => { setPreviewFormat('A4'); setPreviewPurchase(savedReceipt); setShowPreview(true); }}
            >
              📄 Print A4 Purchase Receipt
            </button>
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'center', padding: '12px' }}
              onClick={() => { setPreviewFormat('80mm'); setPreviewPurchase(savedReceipt); setShowPreview(true); }}
            >
              🧾 Print 80mm Purchase Receipt
            </button>
            <button
              className="btn btn-ghost"
              style={{ justifyContent: 'center', padding: '12px' }}
              onClick={handleNewPurchase}
            >
              + Start Another Purchase
            </button>
          </div>
        </div>

        {/* Print Preview */}
        {showPreview && previewPurchase && (
          <PurchasePrintPreviewModal
            purchase={previewPurchase}
            isOpen={showPreview}
            initialFormat={previewFormat}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    );
  }

  // ── STEP C: Active form ──
  return (
    <>
      {purchaseType === 'GOLD_PURCHASE' ? (
        <GoldPurchaseForm
          onBack={() => setPurchaseType(null)}
          onSave={handleSave}
          defaultRate={goldRate}
        />
      ) : (
        <SilverPurchaseForm
          onBack={() => setPurchaseType(null)}
          onSave={handleSave}
          defaultRate={silverRate}
        />
      )}

      {showPreview && previewPurchase && (
        <PurchasePrintPreviewModal
          purchase={previewPurchase}
          isOpen={showPreview}
          initialFormat={previewFormat}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
