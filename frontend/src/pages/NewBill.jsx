import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, CheckCircle, UserCheck, UserPlus, User } from 'lucide-react';
import { mockCustomers, mockProducts, mockMetalRates } from '../data/mockData';
import { calculateInvoice, calculateItem, calculatePaymentStatus, formatCurrency } from '../utils/billingCalculator';
import PrintPreviewModal from '../components/invoice/PrintPreviewModal';
import { useSettings } from '../context/SettingsContext';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer'];

const newItem = () => ({
  _id: Math.random(),
  product_id: null,
  item_code: '',
  description: '',
  metal: 'Gold',
  purity: '22K',
  gross_weight: '',
  stone_weight: 0,
  gold_rate: 6500,
  wastage_percent: 2,
  making_charge: '',
  stone_charge: 0,
  discount: 0,
});

export default function NewBill({ onNavigate }) {
  const { settings } = useSettings();
  const [customerList, setCustomerList] = useState(mockCustomers);

  // Customer selection modes: 'walkin' | 'existing' | 'new'
  const [customerMode, setCustomerMode] = useState('walkin');
  const [selectedCustomer, setSelectedCustomer] = useState({ name: 'Walk-in Customer', phone: '', address: '', gstin: '' });

  // Quick inline new customer form
  const [newCustForm, setNewCustForm] = useState({ name: '', phone: '', address: '', gstin: '' });

  // Search existing customer dropdown filter
  const [customerSearch, setCustomerSearch] = useState('');

  const [items, setItems] = useState([newItem()]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [gstRate, setGstRate] = useState(parseFloat(settings.gst_rate) || 3);
  const [payments, setPayments] = useState([{ method: 'Cash', amount: '' }]);
  const [notes, setNotes] = useState('');
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Sync GST rate if settings change
  useEffect(() => {
    if (settings.gst_rate !== undefined) {
      setGstRate(parseFloat(settings.gst_rate) || 3);
    }
  }, [settings.gst_rate]);

  const filteredCustomers = customerList.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  // Calculate invoice totals
  const calc = calculateInvoice(
    items.map(item => ({
      ...item,
      gross_weight: parseFloat(item.gross_weight) || 0,
      stone_weight: parseFloat(item.stone_weight) || 0,
      gold_rate: parseFloat(item.gold_rate) || 0,
      wastage_percent: parseFloat(item.wastage_percent) || 0,
      making_charge: parseFloat(item.making_charge) || 0,
      stone_charge: parseFloat(item.stone_charge) || 0,
      discount: parseFloat(item.discount) || 0,
    })),
    { globalDiscount: parseFloat(globalDiscount) || 0, gstRate }
  );

  const paymentDetails = calculatePaymentStatus(
    calc.grandTotal,
    payments.map(p => ({ amount: parseFloat(p.amount) || 0 }))
  );

  const setItem = (id, field, value) => {
    setItems(prev => prev.map(it => it._id === id ? { ...it, [field]: value } : it));
  };

  const addItem = () => setItems(prev => [...prev, newItem()]);
  const removeItem = (id) => setItems(prev => prev.length > 1 ? prev.filter(it => it._id !== id) : prev);

  const addPaymentRow = () => setPayments(prev => [...prev, { method: 'Cash', amount: '' }]);
  const setPayment = (i, field, value) => setPayments(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  const removePayment = (i) => setPayments(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev);

  const handleSelectProduct = (item_id, product) => {
    const rate = mockMetalRates.find(r => r.metal === product.metal && r.purity === product.purity);
    setItems(prev => prev.map(it => it._id === item_id ? {
      ...it,
      product_id: product.id,
      item_code: product.item_code,
      description: product.name,
      metal: product.metal,
      purity: product.purity,
      gross_weight: product.gross_weight,
      stone_weight: product.stone_weight,
      gold_rate: rate?.rate_per_gram || it.gold_rate,
      wastage_percent: product.wastage_percent,
      making_charge: product.making_charge,
    } : it));
  };

  const handleQuickAddCustomer = (e) => {
    e.preventDefault();
    if (!newCustForm.name.trim() || !newCustForm.phone.trim()) {
      alert('Please provide Customer Name and Phone number.');
      return;
    }
    const created = {
      id: Date.now(),
      name: newCustForm.name.trim(),
      phone: newCustForm.phone.trim(),
      address: newCustForm.address.trim(),
      gstin: newCustForm.gstin.trim(),
      created_at: new Date().toISOString(),
    };
    setCustomerList(prev => [created, ...prev]);
    setSelectedCustomer(created);
    setCustomerMode('existing');
    setNewCustForm({ name: '', phone: '', address: '', gstin: '' });
  };

  const handleSaveBill = () => {
    if (items.every(it => !it.description)) {
      alert('Please add at least one item description to the bill.');
      return;
    }

    const invoiceItems = calc.items.map(it => ({
      ...it,
      gross_weight: parseFloat(it.gross_weight) || 0,
      stone_weight: parseFloat(it.stone_weight) || 0,
      net_weight: it.net_weight,
      gold_rate: parseFloat(it.gold_rate) || 0,
      metal_value: it.metal_value,
      wastage_percent: parseFloat(it.wastage_percent) || 0,
      wastage_amount: it.wastage_amount,
      making_charge: parseFloat(it.making_charge) || 0,
      stone_charge: parseFloat(it.stone_charge) || 0,
      discount: parseFloat(it.discount) || 0,
      item_total: it.item_total,
    }));

    const prefix = settings.invoice_prefix || 'INV-';
    const invoice = {
      id: Date.now(),
      invoice_number: `${prefix}${Date.now().toString().slice(-4)}`,
      customer_id: selectedCustomer?.id || null,
      customer_name: selectedCustomer?.name || 'Walk-in Customer',
      customer_phone: selectedCustomer?.phone || '',
      customer_address: selectedCustomer?.address || '',
      customer_gstin: selectedCustomer?.gstin || '',
      invoice_date: new Date().toISOString().split('T')[0],
      items: invoiceItems,
      subtotal: calc.subtotal,
      discount: calc.globalDiscount,
      gst_rate: gstRate,
      gst_amount: calc.gstAmount,
      grand_total: calc.grandTotal,
      paid_amount: paymentDetails.paidAmount,
      balance_amount: paymentDetails.balanceAmount,
      payment_status: paymentDetails.paymentStatus,
      payments: payments.filter(p => parseFloat(p.amount) > 0).map(p => ({ payment_method: p.method, amount: parseFloat(p.amount) })),
      notes,
    };

    setSavedInvoice(invoice);
    setShowPreview(true);
  };

  const handleNewBill = () => {
    setCustomerMode('walkin');
    setSelectedCustomer({ name: 'Walk-in Customer', phone: '', address: '', gstin: '' });
    setItems([newItem()]);
    setGlobalDiscount(0);
    setPayments([{ method: 'Cash', amount: '' }]);
    setNotes('');
    setSavedInvoice(null);
    setShowPreview(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>New Bill</h2>
          <p>Create a new billing invoice</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => onNavigate('/bills')}>View All Bills</button>
        </div>
      </div>

      <div className="billing-layout">
        {/* Left: Bill Form */}
        <div>
          {/* Step 1: Simplified Customer Selection */}
          <div className="billing-section">
            <div className="billing-section-header">
              <span className="billing-section-number">1</span>
              <h3>Customer Details</h3>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
                {selectedCustomer ? `Selected: ${selectedCustomer.name}` : 'Walk-in Customer'}
              </span>
            </div>

            <div className="billing-section-body">
              {/* Mode Toggle Tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${customerMode === 'walkin' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setCustomerMode('walkin');
                    setSelectedCustomer({ name: 'Walk-in Customer', phone: '', address: '', gstin: '' });
                  }}
                >
                  <User size={14} /> Walk-in Customer
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${customerMode === 'existing' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCustomerMode('existing')}
                >
                  <UserCheck size={14} /> Select Registered Customer
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${customerMode === 'new' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCustomerMode('new')}
                >
                  <UserPlus size={14} /> + Add New Customer Inline
                </button>
              </div>

              {/* Mode A: Walk-in */}
              {customerMode === 'walkin' && (
                <div style={{ background: 'var(--cream)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Walk-in Customer (Default)</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No contact details required. Ideal for quick retail cash sales.</div>
                  </div>
                  <span className="badge badge-gold">Ready</span>
                </div>
              )}

              {/* Mode B: Select Existing Customer */}
              {customerMode === 'existing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div className="search-bar" style={{ maxWidth: '100%', flex: 1 }}>
                      <Search />
                      <input
                        placeholder="Type customer name or phone to filter list..."
                        value={customerSearch}
                        onChange={e => setCustomerSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Choose Customer <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={selectedCustomer?.id || ''}
                      onChange={e => {
                        const found = customerList.find(c => String(c.id) === e.target.value);
                        if (found) setSelectedCustomer(found);
                      }}
                    >
                      <option value="">-- Choose Customer ({filteredCustomers.length} available) --</option>
                      {filteredCustomers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} — Ph: {c.phone} {c.address ? `(${c.address})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCustomer && selectedCustomer.name !== 'Walk-in Customer' && (
                    <div style={{ padding: '10px 14px', background: 'rgba(201,168,76,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gold)', fontSize: 13 }}>
                      <strong>{selectedCustomer.name}</strong> • Phone: {selectedCustomer.phone}
                      {selectedCustomer.address && <span> • Address: {selectedCustomer.address}</span>}
                      {selectedCustomer.gstin && <span> • GSTIN: {selectedCustomer.gstin}</span>}
                    </div>
                  )}
                </div>
              )}

              {/* Mode C: Inline Quick Add New Customer */}
              {customerMode === 'new' && (
                <form onSubmit={handleQuickAddCustomer} style={{ background: 'var(--cream)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--gold-dark)' }}>
                    Fast Customer Registration (Saves directly to your system)
                  </div>
                  <div className="form-row" style={{ marginBottom: 10 }}>
                    <div className="form-group">
                      <label className="form-label">Name <span className="required">*</span></label>
                      <input
                        className="form-input"
                        placeholder="Customer full name"
                        value={newCustForm.name}
                        onChange={e => setNewCustForm(p => ({ ...p, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number <span className="required">*</span></label>
                      <input
                        className="form-input"
                        type="tel"
                        inputMode="tel"
                        placeholder="Mobile number"
                        value={newCustForm.phone}
                        onChange={e => setNewCustForm(p => ({ ...p, phone: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row" style={{ marginBottom: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Address (Optional)</label>
                      <input
                        className="form-input"
                        placeholder="City / Address"
                        value={newCustForm.address}
                        onChange={e => setNewCustForm(p => ({ ...p, address: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GSTIN (Optional)</label>
                      <input
                        className="form-input"
                        placeholder="GST Number if applicable"
                        value={newCustForm.gstin}
                        onChange={e => setNewCustForm(p => ({ ...p, gstin: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary btn-sm">
                      <CheckCircle size={14} /> Save & Select Customer
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Step 2: Items */}
          <div className="billing-section">
            <div className="billing-section-header">
              <span className="billing-section-number">2</span>
              <h3>Jewellery Items</h3>
              <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={addItem}>
                <Plus size={13} /> Add Item
              </button>
            </div>
            <div className="billing-section-body">
              {items.map((item, idx) => {
                const calcItem = calculateItem({
                  gross_weight: parseFloat(item.gross_weight) || 0,
                  stone_weight: parseFloat(item.stone_weight) || 0,
                  gold_rate: parseFloat(item.gold_rate) || 0,
                  wastage_percent: parseFloat(item.wastage_percent) || 0,
                  making_charge: parseFloat(item.making_charge) || 0,
                  stone_charge: parseFloat(item.stone_charge) || 0,
                  discount: parseFloat(item.discount) || 0,
                });

                return (
                  <div className="bill-item-row" key={item._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-muted)' }}>Item #{idx + 1}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <select className="form-select" style={{ width: 'auto', minWidth: 180, padding: '5px 28px 5px 10px', fontSize: 12 }}
                          onChange={e => {
                            const prod = mockProducts.find(p => p.id === parseInt(e.target.value));
                            if (prod) handleSelectProduct(item._id, prod);
                          }}>
                          <option value="">Select from inventory...</option>
                          {mockProducts.filter(p => p.status === 'AVAILABLE').map(p => (
                            <option key={p.id} value={p.id}>{p.item_code} — {p.name}</option>
                          ))}
                        </select>
                        <button className="btn btn-danger btn-sm" onClick={() => removeItem(item._id)} aria-label="Remove item">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="bill-item-grid">
                      <div className="form-group">
                        <label className="form-label">Item Code</label>
                        <input className="form-input" value={item.item_code} onChange={e => setItem(item._id, 'item_code', e.target.value)} placeholder="RNG-001" />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Description <span className="required">*</span></label>
                        <input className="form-input" value={item.description} onChange={e => setItem(item._id, 'description', e.target.value)} placeholder="e.g. Gold Ring - Floral Design" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Purity</label>
                        <select className="form-select" value={item.purity} onChange={e => setItem(item._id, 'purity', e.target.value)}>
                          {['24K', '22K', '18K', '14K', '999', 'Other'].map(p => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Gross Weight (g)</label>
                        <input className="form-input" type="number" inputMode="decimal" step="0.001" value={item.gross_weight} onChange={e => setItem(item._id, 'gross_weight', e.target.value)} placeholder="0.000" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Stone Weight (g)</label>
                        <input className="form-input" type="number" inputMode="decimal" step="0.001" value={item.stone_weight} onChange={e => setItem(item._id, 'stone_weight', e.target.value)} placeholder="0.000" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Net Weight (g)</label>
                        <input className="form-input" value={calcItem.net_weight.toFixed(3)} disabled style={{ color: 'var(--gold-dark)', fontWeight: 700 }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Gold Rate (Rs./g)</label>
                        <input className="form-input" type="number" inputMode="numeric" step="1" value={item.gold_rate} onChange={e => setItem(item._id, 'gold_rate', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Wastage %</label>
                        <input className="form-input" type="number" inputMode="decimal" step="0.1" value={item.wastage_percent} onChange={e => setItem(item._id, 'wastage_percent', e.target.value)} placeholder="0.0" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Making Charge (Rs.)</label>
                        <input className="form-input" type="number" inputMode="numeric" step="1" value={item.making_charge} onChange={e => setItem(item._id, 'making_charge', e.target.value)} placeholder="0" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Stone Charge (Rs.)</label>
                        <input className="form-input" type="number" inputMode="numeric" step="1" value={item.stone_charge} onChange={e => setItem(item._id, 'stone_charge', e.target.value)} placeholder="0" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Item Discount (Rs.)</label>
                        <input className="form-input" type="number" inputMode="numeric" step="1" value={item.discount} onChange={e => setItem(item._id, 'discount', e.target.value)} placeholder="0" />
                      </div>
                    </div>

                    {/* Live calculation preview */}
                    <div className="bill-item-calculation">
                      <div className="calc-row"><span className="label">Gold Value</span><span className="value">{formatCurrency(calcItem.metal_value)}</span></div>
                      <div className="calc-row"><span className="label">Wastage ({item.wastage_percent}%)</span><span className="value">+ {formatCurrency(calcItem.wastage_amount)}</span></div>
                      <div className="calc-row"><span className="label">Making Charge</span><span className="value">+ {formatCurrency(calcItem.making_charge)}</span></div>
                      {calcItem.stone_charge > 0 && <div className="calc-row"><span className="label">Stone Charge</span><span className="value">+ {formatCurrency(calcItem.stone_charge)}</span></div>}
                      {calcItem.discount > 0 && <div className="calc-row"><span className="label">Discount</span><span className="value" style={{ color: '#16a34a' }}>- {formatCurrency(calcItem.discount)}</span></div>}
                      <div className="calc-row calc-total"><span className="label" style={{ color: 'inherit' }}>Item Total</span><span className="value">{formatCurrency(calcItem.item_total)}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Global Discount + GST */}
          <div className="billing-section">
            <div className="billing-section-header">
              <span className="billing-section-number">3</span>
              <h3>Discount & GST</h3>
            </div>
            <div className="billing-section-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Overall Discount (Rs.)</label>
                  <input className="form-input" type="number" inputMode="numeric" step="1" value={globalDiscount} onChange={e => setGlobalDiscount(e.target.value)} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Rate (%)</label>
                  <input className="form-input" type="number" inputMode="decimal" step="0.01" value={gstRate} onChange={e => setGstRate(parseFloat(e.target.value) || 0)} />
                  <span className="form-hint">Default from Settings: {settings.gst_rate}%</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." />
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Payment */}
          <div className="billing-section">
            <div className="billing-section-header">
              <span className="billing-section-number">4</span>
              <h3>Payment</h3>
              <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={addPaymentRow}>
                <Plus size={13} /> Add Method
              </button>
            </div>
            <div className="billing-section-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m}
                    className={`payment-method-btn ${payments[0]?.method === m ? 'selected' : ''}`}
                    onClick={() => setPayment(0, 'method', m)}
                    type="button"
                  >{m}</button>
                ))}
              </div>

              {payments.map((p, i) => (
                <div key={i} className="form-row" style={{ marginBottom: 8, alignItems: 'flex-end' }}>
                  <div className="form-group">
                    <label className="form-label">{i === 0 ? 'Payment Method' : `Method ${i + 1}`}</label>
                    <select className="form-select" value={p.method} onChange={e => setPayment(i, 'method', e.target.value)}>
                      {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (Rs.)</label>
                    <input className="form-input" type="number" inputMode="numeric" step="1" value={p.amount} onChange={e => setPayment(i, 'amount', e.target.value)} placeholder="0" />
                  </div>
                  {i > 0 && (
                    <button className="btn btn-danger btn-sm" onClick={() => removePayment(i)} style={{ marginBottom: 0 }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary Panel */}
        <div>
          <div className="bill-summary-panel">
            <div className="bill-summary-header">
              <h3>Bill Summary</h3>
            </div>
            <div className="bill-summary-body">
              <div className="summary-line">
                <span className="s-label">Customer</span>
                <span className="s-value" style={{ fontSize: 13 }}>{selectedCustomer?.name || 'Walk-in'}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Items</span>
                <span className="s-value">{items.length}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Subtotal</span>
                <span className="s-value">{formatCurrency(calc.subtotal)}</span>
              </div>
              {calc.globalDiscount > 0 && (
                <div className="summary-line">
                  <span className="s-label">Discount</span>
                  <span className="s-value" style={{ color: '#16a34a' }}>-{formatCurrency(calc.globalDiscount)}</span>
                </div>
              )}
              <div className="summary-line">
                <span className="s-label">Taxable Amount</span>
                <span className="s-value">{formatCurrency(calc.taxableAmount)}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">GST ({gstRate}%)</span>
                <span className="s-value">{formatCurrency(calc.gstAmount)}</span>
              </div>

              <div className="summary-grand-total">
                <span className="gt-label">Grand Total</span>
                <span className="gt-value">{formatCurrency(calc.grandTotal)}</span>
              </div>
            </div>

            {/* Payment Summary */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment</div>
              <div className="summary-line">
                <span className="s-label">Paid</span>
                <span className="s-value" style={{ color: '#16a34a' }}>{formatCurrency(paymentDetails.paidAmount)}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Balance</span>
                <span className="s-value" style={{ color: paymentDetails.balanceAmount > 0 ? '#dc2626' : '#16a34a' }}>
                  {formatCurrency(paymentDetails.balanceAmount)}
                </span>
              </div>
              <div className="summary-line">
                <span className="s-label">Status</span>
                <span className={`badge ${paymentDetails.paymentStatus === 'PAID' ? 'badge-paid' : paymentDetails.paymentStatus === 'PARTIAL' ? 'badge-partial' : 'badge-pending'}`}>
                  {paymentDetails.paymentStatus}
                </span>
              </div>
            </div>

            {/* Save + Print Buttons */}
            <div style={{ padding: '0 20px 20px' }}>
              {savedInvoice ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', marginBottom: 12, fontSize: 13, fontWeight: 600 }}>
                    <CheckCircle size={16} /> Bill saved successfully!
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button className="btn btn-primary w-full" onClick={() => setShowPreview(true)} style={{ width: '100%', justifyContent: 'center' }}>
                      📄 Print A4 Invoice
                    </button>
                    <button className="btn btn-secondary w-full" onClick={() => setShowPreview(true)} style={{ width: '100%', justifyContent: 'center' }}>
                      🧾 Print 80mm Receipt
                    </button>
                    <button className="btn btn-ghost w-full" onClick={handleNewBill} style={{ width: '100%', justifyContent: 'center' }}>
                      + New Bill
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={handleSaveBill}>
                  Save Bill & Generate Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Summary Bar */}
      <div className="mobile-sticky-summary">
        <div>
          <div className="mss-label">Total Amount ({items.length} items)</div>
          <div className="mss-value">{formatCurrency(calc.grandTotal)}</div>
        </div>
        {savedInvoice ? (
          <button className="btn btn-primary btn-sm" onClick={() => setShowPreview(true)}>
            📄 View Invoice
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={handleSaveBill}>
            Generate Invoice
          </button>
        )}
      </div>

      {/* Print Preview */}
      {showPreview && savedInvoice && (
        <PrintPreviewModal
          invoice={savedInvoice}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
