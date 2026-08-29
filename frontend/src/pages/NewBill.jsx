import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, CheckCircle, UserCheck, UserPlus, User, RotateCcw } from 'lucide-react';
import { mockProducts } from '../data/mockData';
import storageService from '../services/storageService';
import { calculateInvoice, calculateItem, calculatePaymentStatus, formatCurrency } from '../utils/billingCalculator';
import PrintPreviewModal from '../components/invoice/PrintPreviewModal';
import { useSettings } from '../context/SettingsContext';
import { useMetalRates } from '../context/MetalRatesContext';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Deduction'];

export default function NewBill({ onNavigate, initialSaleType }) {
  const { settings } = useSettings();
  const { rates, getRateFor } = useMetalRates();
  const [customerList, setCustomerList] = useState(() => storageService.getCustomers());

  const createNewItem = (metal = 'Gold') => {
    const isSilver = metal === 'Silver';
    const defaultPurity = isSilver ? '999' : '22K';
    const liveRate = getRateFor(isSilver ? 'Silver' : 'Gold', defaultPurity);
    return {
      _id: Math.random(),
      product_id: null,
      item_code: '',
      description: '',
      metal: isSilver ? 'Silver' : 'Gold',
      purity: defaultPurity,
      gross_weight: '',
      stone_weight: 0,
      gold_rate: liveRate || (isSilver ? 85 : 6500),
      wastage_mode: 'percentage',
      wastage_percent: isSilver ? 1 : 2,
      wastage_weight: '',
      making_charge: '',
      stone_charge: 0,
      discount: 0,
    };
  };

  // Sale Type State: null (Selection Menu) | 'GOLD' | 'SILVER'
  const [saleType, setSaleType] = useState(initialSaleType || null);

  // Customer selection modes: 'walkin' | 'existing' | 'new'
  const [customerMode, setCustomerMode] = useState('walkin');
  const [selectedCustomer, setSelectedCustomer] = useState({ name: 'Walk-in Customer', phone: '', address: '', gstin: '' });

  // Quick inline new customer form
  const [newCustForm, setNewCustForm] = useState({ name: '', phone: '', address: '', gstin: '' });

  // Search existing customer dropdown filter
  const [customerSearch, setCustomerSearch] = useState('');

  const [items, setItems] = useState([createNewItem('Gold')]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [gstRate, setGstRate] = useState(parseFloat(settings.gst_rate) || 3);
  const [payments, setPayments] = useState([{ method: 'Cash', amount: '' }]);
  const [notes, setNotes] = useState('');
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFormat, setPreviewFormat] = useState('A4');

  // Sync GST rate if settings change
  useEffect(() => {
    if (settings.gst_rate !== undefined) {
      setGstRate(parseFloat(settings.gst_rate) || 3);
    }
  }, [settings.gst_rate]);

  const handleSelectSaleType = (type) => {
    const initialMetal = type === 'SILVER' ? 'Silver' : 'Gold';
    setItems([createNewItem(initialMetal)]);
    setSaleType(type);
  };

  const handleChangeSaleType = () => {
    const hasItems = items.some(it => (it.description && it.description.trim()) || parseFloat(it.gross_weight) > 0);
    if (hasItems) {
      if (!window.confirm('Are you sure you want to change sale type? Any unsaved billing data will be reset.')) {
        return;
      }
    }
    setSaleType(null);
    setItems([]);
    setSavedInvoice(null);
    setShowPreview(false);
  };

  const filteredCustomers = customerList.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  // Calculate invoice totals (only when a sale type is active)
  const calc = calculateInvoice(
    saleType ? items.map(item => ({
      ...item,
      sale_type: saleType,
      gross_weight: parseFloat(item.gross_weight) || 0,
      stone_weight: parseFloat(item.stone_weight) || 0,
      gold_rate: parseFloat(item.gold_rate) || 0,
      wastage_mode: item.wastage_mode || 'percentage',
      wastage_percent: parseFloat(item.wastage_percent) || 0,
      wastage_weight: parseFloat(item.wastage_weight) || 0,
      making_charge: saleType === 'SILVER' ? 0 : (parseFloat(item.making_charge) || 0),
      stone_charge: parseFloat(item.stone_charge) || 0,
      discount: parseFloat(item.discount) || 0,
    })) : [],
    { globalDiscount: parseFloat(globalDiscount) || 0, gstRate, roundingMethod: settings.rounding_method || 'nearest' }
  );

  const paymentDetails = calculatePaymentStatus(
    calc.grandTotal,
    payments.map(p => ({ amount: parseFloat(p.amount) || 0 }))
  );

  const setItem = (id, field, value) => {
    setItems(prev => prev.map(it => {
      if (it._id !== id) return it;
      const updated = { ...it, [field]: value };
      if (field === 'purity') {
        const liveRate = getRateFor(it.metal, value);
        if (liveRate) updated.gold_rate = liveRate;
      }
      return updated;
    }));
  };

  const addItem = () => setItems(prev => [...prev, createNewItem(saleType === 'SILVER' ? 'Silver' : 'Gold')]);
  const removeItem = (id) => setItems(prev => prev.length > 1 ? prev.filter(it => it._id !== id) : prev);

  const clearItem = (id) => {
    const isSilver = saleType === 'SILVER';
    const initial = createNewItem(isSilver ? 'Silver' : 'Gold');
    setItems(prev => prev.map(it => it._id === id ? { ...initial, _id: id } : it));
  };

  const addPaymentRow = () => setPayments(prev => [...prev, { method: 'Cash', amount: '' }]);
  const setPayment = (i, field, value) => setPayments(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  const removePayment = (i) => setPayments(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev);

  const handleSelectProduct = (item_id, product) => {
    const liveRate = getRateFor(product.metal, product.purity);
    const net = Math.max(0, (parseFloat(product.gross_weight) || 0) - (parseFloat(product.stone_weight) || 0));
    const wasPct = parseFloat(product.wastage_percent) || 0;
    const wasWt = (net * (wasPct / 100)).toFixed(3);

    setItems(prev => prev.map(it => it._id === item_id ? {
      ...it,
      product_id: product.id,
      item_code: product.item_code,
      description: product.name,
      metal: product.metal,
      purity: product.purity,
      gross_weight: product.gross_weight,
      stone_weight: product.stone_weight,
      gold_rate: liveRate || (product.metal.toLowerCase() === 'silver' ? 85 : 6500),
      wastage_mode: 'percentage',
      wastage_percent: wasPct,
      wastage_weight: wasWt,
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
    storageService.addCustomer(created);
    setCustomerList(storageService.getCustomers());
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
      sale_type: saleType,
      gross_weight: parseFloat(it.gross_weight) || 0,
      stone_weight: parseFloat(it.stone_weight) || 0,
      net_weight: it.net_weight,
      gold_rate: parseFloat(it.gold_rate) || 0,
      metal_value: it.metal_value,
      gold_value: it.metal_value,
      wastage_mode: it.wastage_mode,
      wastage_percent: it.wastage_percent,
      wastage_weight: it.wastage_weight,
      wastage_amount: it.wastage_amount,
      making_charge: it.making_charge,
      stone_charge: parseFloat(it.stone_charge) || 0,
      discount: parseFloat(it.discount) || 0,
      item_total: it.item_total,
    }));

    const prefix = settings.invoice_prefix || 'INV-';
    const invoice = {
      id: Date.now(),
      invoice_number: `${prefix}${Date.now().toString().slice(-4)}`,
      sale_type: saleType,
      sale_type_label: saleType === 'SILVER' ? 'Silver Sale' : 'Gold Sale',
      transactionType: saleType === 'SILVER' ? 'SILVER_SALE' : 'GOLD_SALE',
      metal: saleType === 'SILVER' ? 'Silver' : 'Gold',
      customer_id: selectedCustomer?.id || null,
      customer_name: selectedCustomer?.name || 'Walk-in Customer',
      customer_phone: selectedCustomer?.phone || '',
      customer_address: selectedCustomer?.address || '',
      customer_gstin: selectedCustomer?.gstin || '',
      invoice_date: new Date().toISOString().split('T')[0],
      items: invoiceItems,
      subtotal: calc.subtotal,
      discount: calc.globalDiscount,
      before_tax: calc.beforeTax,
      gst_rate: calc.gstRate,
      cgst_rate: calc.cgstRate,
      sgst_rate: calc.sgstRate,
      cgst_amount: calc.cgstAmount,
      sgst_amount: calc.sgstAmount,
      gst_amount: calc.gstAmount,
      after_tax: calc.afterTax,
      grand_total: calc.grandTotal,
      paid_amount: paymentDetails.paidAmount,
      balance_amount: paymentDetails.balanceAmount,
      payment_status: paymentDetails.paymentStatus,
      payments: payments.filter(p => parseFloat(p.amount) > 0).map(p => ({ payment_method: p.method, amount: parseFloat(p.amount) })),
      payment_method: payments[0]?.method || 'Cash',
      notes,
    };

    storageService.addInvoice(invoice);
    setSavedInvoice(invoice);
    setShowPreview(true);
  };

  const handleNewBill = () => {
    setCustomerMode('walkin');
    setSelectedCustomer({ name: 'Walk-in Customer', phone: '', address: '', gstin: '' });
    setItems([createNewItem(saleType === 'SILVER' ? 'Silver' : 'Gold')]);
    setGlobalDiscount(0);
    setPayments([{ method: 'Cash', amount: '' }]);
    setNotes('');
    setSavedInvoice(null);
    setShowPreview(false);
  };

  // STEP A: SALE TYPE SELECTION SCREEN
  if (!saleType) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <h2>New Bill</h2>
            <p>Select transaction sale type to start billing</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => onNavigate('/bills')}>View All Bills</button>
          </div>
        </div>

        <div style={{ maxWidth: 760, margin: '30px auto 0', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 6, letterSpacing: '0.02em' }}>NEW BILL</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Select Sale Type</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {/* GOLD SALE CARD */}
            <div
              onClick={() => handleSelectSaleType('GOLD')}
              style={{
                background: 'linear-gradient(135deg, #FFFDF5 0%, #FAF2D8 100%)',
                border: '2px solid #C9A84C',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 24px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.1) 100%)', border: '1.5px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(201,168,76,0.15)' }}>
                {/* Gold Logo in Lucide stroke aesthetic */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12l3 6H3l3-6z" fill="rgba(201,168,76,0.25)" />
                  <path d="M3 9v9a2 2 0 002 2h14a2 2 0 002-2V9" />
                  <circle cx="12" cy="14" r="3" fill="rgba(201,168,76,0.3)" />
                  <path d="M12 12.5v3M10.5 14h3" />
                </svg>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#8B6914', marginBottom: 8 }}>GOLD SALE</h3>
              <p style={{ fontSize: 13, color: '#7A6A4A', lineHeight: 1.6, marginBottom: 20 }}>
                Create a new gold jewellery sale
              </p>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', background: '#8B6914', borderColor: '#8B6914' }}>
                Select Gold Sale →
              </button>
            </div>

            {/* SILVER SALE CARD */}
            <div
              onClick={() => handleSelectSaleType('SILVER')}
              style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
                border: '2px solid #94A3B8',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 24px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(148,163,184,0.25) 0%, rgba(148,163,184,0.1) 100%)', border: '1.5px solid rgba(148,163,184,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(148,163,184,0.15)' }}>
                {/* Silver Logo in Lucide stroke aesthetic */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" fill="rgba(148,163,184,0.25)" />
                  <circle cx="12" cy="12" r="5" strokeDasharray="2 2" />
                  <path d="M12 9v6M9.5 12h5" />
                </svg>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#334155', marginBottom: 8 }}>SILVER SALE</h3>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 20 }}>
                Create a new silver jewellery sale
              </p>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Select Silver Sale →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>New Bill — {saleType === 'SILVER' ? 'Silver Sale' : 'Gold Sale'}</h2>
          <p>Create a new {saleType === 'SILVER' ? 'silver' : 'gold'} jewellery billing invoice</p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleChangeSaleType} title="Return to sale type selection">
            ← Change Sale Type
          </button>
          <button className="btn btn-ghost" onClick={() => onNavigate('/bills')}>View All Bills</button>
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
                const isSilverSale = saleType === 'SILVER';
                const calcItem = calculateItem({
                  ...item,
                  sale_type: saleType,
                  gross_weight: parseFloat(item.gross_weight) || 0,
                  stone_weight: parseFloat(item.stone_weight) || 0,
                  gold_rate: parseFloat(item.gold_rate) || 0,
                  wastage_mode: item.wastage_mode || 'percentage',
                  wastage_percent: parseFloat(item.wastage_percent) || 0,
                  wastage_weight: parseFloat(item.wastage_weight) || 0,
                  making_charge: isSilverSale ? 0 : (parseFloat(item.making_charge) || 0),
                  stone_charge: parseFloat(item.stone_charge) || 0,
                  discount: parseFloat(item.discount) || 0,
                });

                const isWeightMode = (item.wastage_mode || 'percentage') === 'weight';

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
                          {mockProducts
                            .filter(p => p.status === 'AVAILABLE' && (p.metal || '').toUpperCase() === (saleType || 'GOLD'))
                            .map(p => (
                              <option key={p.id} value={p.id}>{p.item_code} — {p.name}</option>
                            ))}
                        </select>
                        {items.length > 1 ? (
                          <button className="btn btn-danger btn-sm" onClick={() => removeItem(item._id)} aria-label="Remove item" title="Remove item">
                            <Trash2 size={13} />
                          </button>
                        ) : (
                          <button className="btn btn-secondary btn-sm" onClick={() => clearItem(item._id)} aria-label="Clear fields" title="Clear all fields for this item">
                            <RotateCcw size={13} /> Clear
                          </button>
                        )}
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
                          {(saleType === 'SILVER' ? ['999', 'Other'] : ['24K', '22K', '18K', '14K', 'Other']).map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
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
                        <input className="form-input" value={calcItem.net_weight.toFixed(3)} disabled style={{ color: isSilverSale ? '#334155' : 'var(--gold-dark)', fontWeight: 700 }} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{isSilverSale ? 'Silver Rate (Rs./g)' : 'Gold Rate (Rs./g)'}</label>
                        <input className="form-input" type="number" inputMode="numeric" step="1" value={item.gold_rate} onChange={e => setItem(item._id, 'gold_rate', e.target.value)} />
                      </div>

                      {/* Wastage Type — Gold Sale only */}
                      {!isSilverSale && (
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                          <label className="form-label">Wastage Type</label>
                          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: 38 }}>
                            <button
                              type="button"
                              style={{
                                flex: 1,
                                border: 'none',
                                background: !isWeightMode ? 'var(--gold-dark)' : '#f3f4f6',
                                color: !isWeightMode ? 'white' : 'var(--text-dark)',
                                fontWeight: !isWeightMode ? 600 : 500,
                                fontSize: 12,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onClick={() => setItem(item._id, 'wastage_mode', 'percentage')}
                            >
                              Percentage (%)
                            </button>
                            <button
                              type="button"
                              style={{
                                flex: 1,
                                border: 'none',
                                borderLeft: '1px solid var(--border)',
                                background: isWeightMode ? 'var(--gold-dark)' : '#f3f4f6',
                                color: isWeightMode ? 'white' : 'var(--text-dark)',
                                fontWeight: isWeightMode ? 600 : 500,
                                fontSize: 12,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onClick={() => setItem(item._id, 'wastage_mode', 'weight')}
                            >
                              Weight (g)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Wastage input — Gold Sale only */}
                      {!isSilverSale && (
                        isWeightMode ? (
                          <div className="form-group">
                            <label className="form-label">Wastage (g)</label>
                            <input className="form-input" type="number" inputMode="decimal" step="0.001" value={item.wastage_weight} onChange={e => setItem(item._id, 'wastage_weight', e.target.value)} placeholder="0.000" />
                          </div>
                        ) : (
                          <div className="form-group">
                            <label className="form-label">Wastage (%)</label>
                            <input className="form-input" type="number" inputMode="decimal" step="0.1" value={item.wastage_percent} onChange={e => setItem(item._id, 'wastage_percent', e.target.value)} placeholder="0.0" />
                          </div>
                        )
                      )}

                      {/* Making Charge — Gold Sale only */}
                      {!isSilverSale && (
                        <div className="form-group">
                          <label className="form-label">Making Charge (Rs.)</label>
                          <input className="form-input" type="number" inputMode="numeric" step="1" value={item.making_charge} onChange={e => setItem(item._id, 'making_charge', e.target.value)} placeholder="0" />
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label">Stone Charge (Rs.)</label>
                        <input className="form-input" type="number" inputMode="numeric" step="1" value={item.stone_charge} onChange={e => setItem(item._id, 'stone_charge', e.target.value)} placeholder="0" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Item Discount (Rs.)</label>
                        <input className="form-input" type="number" inputMode="numeric" step="1" value={item.discount} onChange={e => setItem(item._id, 'discount', e.target.value)} placeholder="0" />
                      </div>
                    </div>

                    {/* Live calculation preview (Internal Shopkeeper Verification Only) */}
                    <div className="bill-item-calculation">
                      <div className="calc-row"><span className="label">{isSilverSale ? 'Silver Value' : 'Gold Value'}</span><span className="value">{formatCurrency(calcItem.metal_value)}</span></div>
                      {/* Wastage rows — Gold Sale only */}
                      {!isSilverSale && (
                        <div className="calc-row">
                          <span className="label">
                            VA ({isWeightMode ? `${calcItem.wastage_weight.toFixed(3)} g` : `${calcItem.wastage_percent}%`}) — {isWeightMode ? `${calcItem.wastage_percent.toFixed(2)}%` : `${calcItem.wastage_weight.toFixed(3)} g`}
                          </span>
                          <span className="value">+ {formatCurrency(calcItem.wastage_amount)}</span>
                        </div>
                      )}
                      {/* Making Charge — Gold Sale only */}
                      {!isSilverSale && (
                        <div className="calc-row"><span className="label">Making Charge</span><span className="value">+ {formatCurrency(calcItem.making_charge)}</span></div>
                      )}
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
                  <label className="form-label">Total GST Rate (%)</label>
                  <input className="form-input" type="number" inputMode="decimal" step="0.01" value={gstRate} onChange={e => setGstRate(parseFloat(e.target.value) || 0)} />
                  <span className="form-hint">Splits to CGST ({(gstRate / 2).toFixed(2)}%) + SGST ({(gstRate / 2).toFixed(2)}%)</span>
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
                    <label className="form-label">Paid Amount (Rs.)</label>
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
              <div className="summary-line" style={{ background: saleType === 'SILVER' ? '#f1f5f9' : 'rgba(201,168,76,0.1)', padding: '6px 10px', borderRadius: 'var(--radius-md)', marginBottom: 10 }}>
                <span className="s-label" style={{ fontWeight: 600, color: saleType === 'SILVER' ? '#334155' : 'var(--gold-dark)' }}>Sale Type</span>
                <span className={`badge ${saleType === 'SILVER' ? 'badge-silver' : 'badge-gold'}`}>
                  {saleType === 'SILVER' ? 'Silver Sale 🪙' : 'Gold Sale ✨'}
                </span>
              </div>
              <div className="summary-line">
                <span className="s-label">Customer</span>
                <span className="s-value" style={{ fontSize: 13 }}>{selectedCustomer?.name || 'Walk-in'}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Items</span>
                <span className="s-value">{items.length}</span>
              </div>
              {/* Silver Sale: show silver value; Gold Sale: show subtotal */}
              {saleType === 'SILVER' ? (
                <>
                  <div className="summary-line">
                    <span className="s-label">Silver Value</span>
                    <span className="s-value">{formatCurrency(calc.items.reduce((s, it) => s + it.metal_value, 0))}</span>
                  </div>
                  {calc.items.reduce((s, it) => s + (it.stone_charge || 0), 0) > 0 && (
                    <div className="summary-line">
                      <span className="s-label">Stone Charge</span>
                      <span className="s-value">{formatCurrency(calc.items.reduce((s, it) => s + (it.stone_charge || 0), 0))}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="summary-line">
                  <span className="s-label">Subtotal</span>
                  <span className="s-value">{formatCurrency(calc.subtotal)}</span>
                </div>
              )}
              {calc.globalDiscount > 0 && (
                <div className="summary-line">
                  <span className="s-label">Discount</span>
                  <span className="s-value" style={{ color: '#16a34a' }}>-{formatCurrency(calc.globalDiscount)}</span>
                </div>
              )}
              <div className="summary-line" style={{ borderTop: '1px solid var(--border-light)', paddingTop: 6 }}>
                <span className="s-label" style={{ fontWeight: 600 }}>Before Tax</span>
                <span className="s-value" style={{ fontWeight: 600 }}>{formatCurrency(calc.beforeTax)}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">CGST @ {calc.cgstRate.toFixed(2)}%</span>
                <span className="s-value">{formatCurrency(calc.cgstAmount)}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">SGST @ {calc.sgstRate.toFixed(2)}%</span>
                <span className="s-value">{formatCurrency(calc.sgstAmount)}</span>
              </div>
              <div className="summary-line" style={{ borderTop: '1px dashed var(--border-light)', paddingTop: 6 }}>
                <span className="s-label" style={{ fontWeight: 600 }}>After Tax</span>
                <span className="s-value" style={{ fontWeight: 600 }}>{formatCurrency(calc.afterTax)}</span>
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
                    <button className="btn btn-primary w-full" onClick={() => { setPreviewFormat('A4'); setShowPreview(true); }} style={{ width: '100%', justifyContent: 'center' }}>
                      📄 Print A4 Invoice
                    </button>
                    <button className="btn btn-secondary w-full" onClick={() => { setPreviewFormat('80mm'); setShowPreview(true); }} style={{ width: '100%', justifyContent: 'center' }}>
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
          <button className="btn btn-primary btn-sm" onClick={() => { setPreviewFormat('A4'); setShowPreview(true); }}>
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
          initialFormat={previewFormat}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
