import { useState } from 'react';
import { Eye, Printer, Search, RotateCcw, CheckCircle, Plus } from 'lucide-react';
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

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer'];

const GOLD_PURITIES = ['24K', '22K', '18K', '14K', 'Other'];
const SILVER_PURITIES = ['999', 'Other'];

function createBlankPurchaseForm(transactionType, defaultRate = 0) {
  return {
    transactionType, // 'GOLD_PURCHASE' | 'SILVER_PURCHASE'
    customer_name: '',
    customer_phone: '',
    purchase_date: new Date().toISOString().split('T')[0],
    description: '',
    purity: transactionType === 'GOLD_PURCHASE' ? '22K' : '999',
    gross_weight: '',
    stone_weight: '',
    purchase_rate: defaultRate || '',
    deduction_notes: '',
    payment_method: 'Cash',
    notes: '',
  };
}

// ============================================================
// GOLD PURCHASE FORM
// ============================================================
function GoldPurchaseForm({ onBack, onSave, defaultRate }) {
  const [form, setForm] = useState(createBlankPurchaseForm('GOLD_PURCHASE', defaultRate));

  const [deduction, setDeduction] = useState('');

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const grossWt = parseFloat(form.gross_weight) || 0;
  const stoneWt = parseFloat(form.stone_weight) || 0;
  const netWt = Math.max(0, grossWt - stoneWt);
  const purchaseRate = parseFloat(form.purchase_rate) || 0;
  const purchaseAmount = parseFloat((netWt * purchaseRate).toFixed(2));
  const deductionNum = Math.max(0, parseFloat(deduction) || 0);
  const deductionVal = Math.min(deductionNum, purchaseAmount);
  const finalPayable = Math.max(0, purchaseAmount - deductionVal);
  const deductionError = deductionNum > purchaseAmount && purchaseAmount > 0
    ? 'Deduction cannot exceed the payable amount.'
    : null;

  const handleSave = () => {
    if (!form.customer_name.trim()) {
      alert('Please enter the Customer Name.');
      return;
    }
    if (!form.description.trim()) {
      alert('Please enter the Item / Description.');
      return;
    }
    if (grossWt <= 0) {
      alert('Please enter a valid Gross Weight.');
      return;
    }
    if (purchaseRate <= 0) {
      alert('Please enter a valid Purchase Gold Rate.');
      return;
    }

    const prefix = 'PUR-';
    const record = {
      id: `${prefix}${Date.now().toString().slice(-4)}`,
      purchase_number: `${prefix}${Date.now().toString().slice(-4)}`,
      transactionType: 'GOLD_PURCHASE',
      transaction_type_label: 'Gold Purchase',
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      purchase_date: form.purchase_date,
      items: [
        {
          description: form.description.trim(),
          purity: form.purity,
          gross_weight: grossWt,
          stone_weight: stoneWt,
          net_weight: netWt,
          purchase_rate: purchaseRate,
          purchase_amount: purchaseAmount,
        },
      ],
      total_net_weight: netWt,
      purchase_rate: purchaseRate,
      purchase_amount: purchaseAmount,
      deduction: deductionVal,
      deduction_notes: form.deduction_notes.trim(),
      final_payable: finalPayable,
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
                    onChange={e => set('customer_name', e.target.value)}
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
                    onChange={e => set('customer_phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date <span className="required">*</span></label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.purchase_date}
                    onChange={e => set('purchase_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Gold Details */}
          <div className="billing-section">
            <div className="billing-section-header">
              <span className="billing-section-number">2</span>
              <h3>Gold Details</h3>
            </div>
            <div className="billing-section-body">
              <div className="bill-item-grid">
                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                  <label className="form-label">Item / Description <span className="required">*</span></label>
                  <input
                    className="form-input"
                    placeholder="e.g. Old Gold Ring, Old Gold Chain, etc."
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purity</label>
                  <select className="form-select" value={form.purity} onChange={e => set('purity', e.target.value)}>
                    {GOLD_PURITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Gross Weight (g) <span className="required">*</span></label>
                  <input
                    className="form-input"
                    type="number"
                    inputMode="decimal"
                    step="0.001"
                    placeholder="0.000"
                    value={form.gross_weight}
                    onChange={e => set('gross_weight', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stone Weight (g)</label>
                  <input
                    className="form-input"
                    type="number"
                    inputMode="decimal"
                    step="0.001"
                    placeholder="0.000"
                    value={form.stone_weight}
                    onChange={e => set('stone_weight', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Net Weight (g)</label>
                  <input
                    className="form-input"
                    value={netWt > 0 ? netWt.toFixed(3) : ''}
                    disabled
                    style={{ color: 'var(--gold-dark)', fontWeight: 700 }}
                    placeholder="Auto-calculated"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Gold Rate (Rs./g) <span className="required">*</span></label>
                  <input
                    className="form-input"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    placeholder="e.g. 6200"
                    value={form.purchase_rate}
                    onChange={e => set('purchase_rate', e.target.value)}
                  />
                  <span className="form-hint">Rate paid to customer per gram of net gold weight</span>
                </div>
              </div>

              {/* Live Calculation Preview */}
              {netWt > 0 && purchaseRate > 0 && (
                <div className="bill-item-calculation" style={{ marginTop: 12 }}>
                  <div className="calc-row">
                    <span className="label">Net Weight</span>
                    <span className="value">{netWt.toFixed(3)} g</span>
                  </div>
                  <div className="calc-row">
                    <span className="label">Gold Rate</span>
                    <span className="value">Rs. {purchaseRate}/g</span>
                  </div>
                  <div className="calc-row calc-total">
                    <span className="label" style={{ color: 'inherit' }}>Calculated Purchase Amount</span>
                    <span className="value">{formatCurrency(purchaseAmount)}</span>
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
                  onChange={e => set('deduction_notes', e.target.value)}
                />
                <span className="form-hint">Applicable deduction fields will be added in a future update</span>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  className="form-input"
                  placeholder="Any additional notes about this purchase..."
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
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

              {/* Deduction block */}
              <div style={{ background: 'var(--cream)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 16 }}>
                <div className="summary-line" style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-dark)' }}>Purchase Amount</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--gold-dark)' }}>{purchaseAmount > 0 ? formatCurrency(purchaseAmount) : '—'}</span>
                </div>
                <div className="form-row" style={{ marginBottom: 6, alignItems: 'flex-end', gap: 12 }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Deduction (₹)</label>
                    <input
                      id="gold-purchase-deduction-input"
                      className="form-input"
                      type="number"
                      inputMode="numeric"
                      step="1"
                      min="0"
                      value={deduction}
                      onChange={e => {
                        const raw = e.target.value;
                        if (raw === '' || raw === '-') { setDeduction(''); return; }
                        const v = parseFloat(raw);
                        if (!isNaN(v) && v >= 0) setDeduction(raw);
                      }}
                      placeholder="0"
                      style={{ borderColor: deductionError ? '#dc2626' : undefined }}
                    />
                    {deductionError && (
                      <span className="form-hint" style={{ color: '#dc2626' }}>{deductionError}</span>
                    )}
                  </div>
                </div>
                <div className="summary-line" style={{ borderTop: '1px dashed var(--border-light)', paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-dark)' }}>Final Payable to Customer</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: '#16a34a' }}>{purchaseAmount > 0 ? formatCurrency(finalPayable) : '—'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`payment-method-btn ${form.payment_method === m ? 'selected' : ''}`}
                    onClick={() => set('payment_method', m)}
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
                <span className="s-label">Item</span>
                <span className="s-value" style={{ fontSize: 13 }}>{form.description || '—'}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Purity</span>
                <span className="s-value">{form.purity}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Net Weight</span>
                <span className="s-value">{netWt > 0 ? `${netWt.toFixed(3)} g` : '—'}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Gold Rate</span>
                <span className="s-value">{purchaseRate > 0 ? `Rs. ${purchaseRate}/g` : '—'}</span>
              </div>
              <div className="summary-line" style={{ borderTop: '1px solid var(--border-light)', paddingTop: 6 }}>
                <span className="s-label" style={{ fontWeight: 600 }}>Purchase Amount</span>
                <span className="s-value" style={{ fontWeight: 600 }}>{purchaseAmount > 0 ? formatCurrency(purchaseAmount) : '—'}</span>
              </div>
              {deductionVal > 0 && (
                <div className="summary-line">
                  <span className="s-label" style={{ color: '#dc2626' }}>Deduction</span>
                  <span className="s-value" style={{ color: '#dc2626' }}>-{formatCurrency(deductionVal)}</span>
                </div>
              )}
              <div className="summary-grand-total">
                <span className="gt-label">PAYABLE TO CUSTOMER</span>
                <span className="gt-value">{finalPayable > 0 ? formatCurrency(finalPayable) : '—'}</span>
              </div>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                Payment: <strong>{form.payment_method}</strong>
              </div>
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
          <div className="mss-value">{finalPayable > 0 ? formatCurrency(finalPayable) : '—'}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleSave}>Save Receipt</button>
      </div>
    </div>
  );
}

// ============================================================
// SILVER PURCHASE FORM
// ============================================================
function SilverPurchaseForm({ onBack, onSave, defaultRate }) {
  const [form, setForm] = useState(createBlankPurchaseForm('SILVER_PURCHASE', defaultRate));

  const [deduction, setDeduction] = useState('');

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const grossWt = parseFloat(form.gross_weight) || 0;
  const stoneWt = parseFloat(form.stone_weight) || 0;
  const netWt = Math.max(0, grossWt - stoneWt);
  const purchaseRate = parseFloat(form.purchase_rate) || 0;
  const purchaseAmount = parseFloat((netWt * purchaseRate).toFixed(2));
  const deductionNum = Math.max(0, parseFloat(deduction) || 0);
  const deductionVal = Math.min(deductionNum, purchaseAmount);
  const finalPayable = Math.max(0, purchaseAmount - deductionVal);
  const deductionError = deductionNum > purchaseAmount && purchaseAmount > 0
    ? 'Deduction cannot exceed the payable amount.'
    : null;

  const handleSave = () => {
    if (!form.customer_name.trim()) {
      alert('Please enter the Customer Name.');
      return;
    }
    if (!form.description.trim()) {
      alert('Please enter the Item / Description.');
      return;
    }
    if (grossWt <= 0) {
      alert('Please enter a valid Gross Weight.');
      return;
    }
    if (purchaseRate <= 0) {
      alert('Please enter a valid Purchase Silver Rate.');
      return;
    }

    const prefix = 'PUR-';
    const record = {
      id: `${prefix}${Date.now().toString().slice(-4)}`,
      purchase_number: `${prefix}${Date.now().toString().slice(-4)}`,
      transactionType: 'SILVER_PURCHASE',
      transaction_type_label: 'Silver Purchase',
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      purchase_date: form.purchase_date,
      items: [
        {
          description: form.description.trim(),
          purity: form.purity,
          gross_weight: grossWt,
          stone_weight: stoneWt,
          net_weight: netWt,
          purchase_rate: purchaseRate,
          purchase_amount: purchaseAmount,
        },
      ],
      total_net_weight: netWt,
      purchase_rate: purchaseRate,
      purchase_amount: purchaseAmount,
      deduction: deductionVal,
      deduction_notes: form.deduction_notes.trim(),
      final_payable: finalPayable,
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
                    onChange={e => set('customer_name', e.target.value)}
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
                    onChange={e => set('customer_phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date <span className="required">*</span></label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.purchase_date}
                    onChange={e => set('purchase_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Silver Details */}
          <div className="billing-section">
            <div className="billing-section-header">
              <span className="billing-section-number">2</span>
              <h3>Silver Details</h3>
            </div>
            <div className="billing-section-body">
              <div className="bill-item-grid">
                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                  <label className="form-label">Item / Description <span className="required">*</span></label>
                  <input
                    className="form-input"
                    placeholder="e.g. Old Silver Anklets, Old Silver Vessel, etc."
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purity (if applicable)</label>
                  <select className="form-select" value={form.purity} onChange={e => set('purity', e.target.value)}>
                    {SILVER_PURITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Gross Weight (g) <span className="required">*</span></label>
                  <input
                    className="form-input"
                    type="number"
                    inputMode="decimal"
                    step="0.001"
                    placeholder="0.000"
                    value={form.gross_weight}
                    onChange={e => set('gross_weight', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stone Weight (g)</label>
                  <input
                    className="form-input"
                    type="number"
                    inputMode="decimal"
                    step="0.001"
                    placeholder="0.000"
                    value={form.stone_weight}
                    onChange={e => set('stone_weight', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Net Weight (g)</label>
                  <input
                    className="form-input"
                    value={netWt > 0 ? netWt.toFixed(3) : ''}
                    disabled
                    style={{ color: '#334155', fontWeight: 700 }}
                    placeholder="Auto-calculated"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Silver Rate (Rs./g) <span className="required">*</span></label>
                  <input
                    className="form-input"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    placeholder="e.g. 78"
                    value={form.purchase_rate}
                    onChange={e => set('purchase_rate', e.target.value)}
                  />
                  <span className="form-hint">Silver rate paid to customer per gram of net weight</span>
                </div>
              </div>

              {/* Live Calculation Preview */}
              {netWt > 0 && purchaseRate > 0 && (
                <div className="bill-item-calculation" style={{ marginTop: 12 }}>
                  <div className="calc-row">
                    <span className="label">Net Weight</span>
                    <span className="value">{netWt.toFixed(3)} g</span>
                  </div>
                  <div className="calc-row">
                    <span className="label">Silver Rate</span>
                    <span className="value">Rs. {purchaseRate}/g</span>
                  </div>
                  <div className="calc-row calc-total">
                    <span className="label" style={{ color: 'inherit' }}>Calculated Purchase Amount</span>
                    <span className="value">{formatCurrency(purchaseAmount)}</span>
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
                  onChange={e => set('deduction_notes', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  className="form-input"
                  placeholder="Any additional notes..."
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
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

              {/* Deduction block */}
              <div style={{ background: 'var(--cream)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 16 }}>
                <div className="summary-line" style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-dark)' }}>Purchase Amount</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#334155' }}>{purchaseAmount > 0 ? formatCurrency(purchaseAmount) : '—'}</span>
                </div>
                <div className="form-row" style={{ marginBottom: 6, alignItems: 'flex-end', gap: 12 }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Deduction (₹)</label>
                    <input
                      id="silver-purchase-deduction-input"
                      className="form-input"
                      type="number"
                      inputMode="numeric"
                      step="1"
                      min="0"
                      value={deduction}
                      onChange={e => {
                        const raw = e.target.value;
                        if (raw === '' || raw === '-') { setDeduction(''); return; }
                        const v = parseFloat(raw);
                        if (!isNaN(v) && v >= 0) setDeduction(raw);
                      }}
                      placeholder="0"
                      style={{ borderColor: deductionError ? '#dc2626' : undefined }}
                    />
                    {deductionError && (
                      <span className="form-hint" style={{ color: '#dc2626' }}>{deductionError}</span>
                    )}
                  </div>
                </div>
                <div className="summary-line" style={{ borderTop: '1px dashed var(--border-light)', paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-dark)' }}>Final Payable to Customer</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: '#16a34a' }}>{purchaseAmount > 0 ? formatCurrency(finalPayable) : '—'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`payment-method-btn ${form.payment_method === m ? 'selected' : ''}`}
                    onClick={() => set('payment_method', m)}
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
                <span className="s-label">Item</span>
                <span className="s-value" style={{ fontSize: 13 }}>{form.description || '—'}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Purity</span>
                <span className="s-value">{form.purity}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Net Weight</span>
                <span className="s-value">{netWt > 0 ? `${netWt.toFixed(3)} g` : '—'}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Silver Rate</span>
                <span className="s-value">{purchaseRate > 0 ? `Rs. ${purchaseRate}/g` : '—'}</span>
              </div>
              <div className="summary-line" style={{ borderTop: '1px solid var(--border-light)', paddingTop: 6 }}>
                <span className="s-label" style={{ fontWeight: 600 }}>Purchase Amount</span>
                <span className="s-value" style={{ fontWeight: 600 }}>{purchaseAmount > 0 ? formatCurrency(purchaseAmount) : '—'}</span>
              </div>
              {deductionVal > 0 && (
                <div className="summary-line">
                  <span className="s-label" style={{ color: '#dc2626' }}>Deduction</span>
                  <span className="s-value" style={{ color: '#dc2626' }}>-{formatCurrency(deductionVal)}</span>
                </div>
              )}
              <div className="summary-grand-total">
                <span className="gt-label">PAYABLE TO CUSTOMER</span>
                <span className="gt-value">{finalPayable > 0 ? formatCurrency(finalPayable) : '—'}</span>
              </div>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                Payment: <strong>{form.payment_method}</strong>
              </div>
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
          <div className="mss-value">{finalPayable > 0 ? formatCurrency(finalPayable) : '—'}</div>
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
              <th>Net Weight</th>
              <th>Rate</th>
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
                  <td style={{ fontWeight: 600 }}>{formatWeight(p.total_net_weight)}</td>
                  <td style={{ fontSize: 13 }}>Rs. {p.purchase_rate}/g</td>
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
                Buy old gold jewellery from a customer
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
                Buy old silver jewellery from a customer
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

  // ── STEP B: Form + post-save ──
  if (savedReceipt) {
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
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            {savedReceipt.purchase_number} — {savedReceipt.transaction_type_label}
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

  // ── STEP B: Active form ──
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
