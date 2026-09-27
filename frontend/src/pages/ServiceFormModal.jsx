import { useState, useEffect, useCallback } from 'react';
import { X, Search, Plus, User, ChevronDown } from 'lucide-react';
import storageService from '../services/storageService';

// ============================================================
// SERVICE TYPES
// ============================================================
const SERVICE_TYPE_OPTIONS = [
  'Repair',
  'Polishing',
  'Resizing',
  'Soldering',
  'Stone Setting',
  'Cleaning',
  'Other',
];

const STATUS_OPTIONS = ['Received', 'In Service', 'Ready', 'Delivered'];

const STATUS_STYLES = {
  'Received':   { bg: 'rgba(100,116,139,0.12)', color: '#475569', border: 'rgba(100,116,139,0.4)' },
  'In Service': { bg: 'rgba(37,99,235,0.1)',    color: '#1D4ED8', border: 'rgba(37,99,235,0.35)' },
  'Ready':      { bg: 'rgba(217,119,6,0.12)',   color: '#B45309', border: 'rgba(217,119,6,0.4)' },
  'Delivered':  { bg: 'rgba(22,163,74,0.12)',   color: '#15803D', border: 'rgba(22,163,74,0.4)' },
};

// ============================================================
// HELPERS
// ============================================================
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function nowTimeStr() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function buildBlankForm(billNumber) {
  return {
    serviceBillNumber: billNumber || '',
    date: todayStr(),
    time: nowTimeStr(),
    customerId: null,
    customerName: '',
    mobile: '',
    address: '',
    item: '',
    category: 'Gold',
    weight: '',
    serviceTypes: [],
    otherService: '',
    estimateAmount: '',
    estimatedDeliveryDate: '',
    finalAmount: '',
    amountReceived: '',
    status: 'Received',
    notes: '',
    moduleType: 'SERVICE',
  };
}

// ============================================================
// CUSTOMER SEARCH DROPDOWN
// ============================================================
function CustomerSearch({ onSelect, onAddNew }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const search = useCallback((q) => {
    if (!q.trim()) { setResults([]); return; }
    const all = storageService.getCustomers();
    const lower = q.toLowerCase();
    setResults(
      all.filter(c =>
        c.name.toLowerCase().includes(lower) ||
        c.phone.includes(q)
      ).slice(0, 8)
    );
  }, []);

  useEffect(() => {
    search(query);
    setShowDropdown(query.trim().length > 0);
  }, [query, search]);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search customer by name or mobile…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
          />
        </div>
        <button type="button" className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }} onClick={onAddNew}>
          <Plus size={14} /> New Customer
        </button>
      </div>

      {showDropdown && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
          maxHeight: 220, overflowY: 'auto', marginTop: 4,
        }}>
          {results.map(c => (
            <div
              key={c.id}
              style={{ padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 10 }}
              onMouseDown={() => { onSelect(c); setQuery(''); setShowDropdown(false); }}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={15} color="var(--gold)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.phone}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showDropdown && query.trim() && results.length === 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
          padding: '10px 14px', marginTop: 4, fontSize: 13, color: 'var(--text-muted)',
        }}>
          No customer found. Click "+ New Customer" to add.
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADD NEW CUSTOMER INLINE FORM
// ============================================================
function InlineNewCustomerForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, marginTop: 8 }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--gold-dark)' }}>Add New Customer</div>
      <div className="form-row" style={{ marginBottom: 10 }}>
        <div className="form-group">
          <label className="form-label">Name <span className="required">*</span></label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Customer name" />
        </div>
        <div className="form-group">
          <label className="form-label">Mobile <span className="required">*</span></label>
          <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Mobile number" />
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 10 }}>
        <label className="form-label">Address <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
        <textarea className="form-textarea" rows={2} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Customer address" />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            if (!form.name.trim() || !form.phone.trim()) return;
            const saved = storageService.addCustomer({ name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() });
            onSave(saved);
          }}
        >
          Save &amp; Select
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SERVICE FORM MODAL
// ============================================================
export default function ServiceFormModal({ isOpen, onClose, onSave, editService = null }) {
  const [form, setForm] = useState(() => buildBlankForm(''));
  const [errors, setErrors] = useState({});
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  // Initialize form on open
  useEffect(() => {
    if (isOpen) {
      if (editService) {
        setForm({ ...editService });
      } else {
        const billNumber = storageService.getNextSvcNumber();
        setForm(buildBlankForm(billNumber));
      }
      setErrors({});
      setShowNewCustomer(false);
    }
  }, [isOpen, editService]);

  if (!isOpen) return null;

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  // Auto-calculate balance
  const finalAmt     = parseFloat(form.finalAmount)     || 0;
  const receivedAmt  = parseFloat(form.amountReceived)  || 0;
  const balanceAmt   = Math.max(0, finalAmt - receivedAmt);

  const handleServiceTypeToggle = (type) => {
    const current = form.serviceTypes || [];
    if (current.includes(type)) {
      set('serviceTypes', current.filter(t => t !== type));
      if (type === 'Other') set('otherService', '');
    } else {
      set('serviceTypes', [...current, type]);
    }
  };

  const handleCustomerSelect = (customer) => {
    setForm(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      mobile: customer.phone,
      address: customer.address || '',
    }));
    setShowNewCustomer(false);
  };

  const handleNewCustomerSaved = (customer) => {
    handleCustomerSelect(customer);
    setShowNewCustomer(false);
  };

  const handleClearCustomer = () => {
    setForm(prev => ({ ...prev, customerId: null, customerName: '', mobile: '', address: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.serviceBillNumber.trim()) e.serviceBillNumber = 'Bill number is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.customerName.trim()) e.customerName = 'Customer name is required';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required';
    if (!form.item.trim()) e.item = 'Item description is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.serviceTypes || form.serviceTypes.length === 0) e.serviceTypes = 'Select at least one service type';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const serviceRecord = {
      ...form,
      balanceAmount: balanceAmt,
      createdAt: editService?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editService) {
      storageService.updateService(serviceRecord);
    } else {
      serviceRecord.id = Date.now();
      storageService.addService(serviceRecord);
    }
    onSave(serviceRecord);
    onClose();
  };

  const sectionHeader = (title) => (
    <div style={{
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
      color: 'var(--gold-dark)', borderBottom: '1.5px solid var(--border)', paddingBottom: 6, marginBottom: 14,
    }}>
      {title}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xl" style={{ maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>{editService ? 'Edit Service' : 'New Service'}</h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {editService ? `Editing: ${editService.serviceBillNumber}` : 'Jewellery Service / Repair Entry'}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ── A. Service Information ── */}
            <section>
              {sectionHeader('A. Service Information')}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Bill No. <span className="required">*</span></label>
                  <input
                    className={`form-input ${errors.serviceBillNumber ? 'input-error' : ''}`}
                    value={form.serviceBillNumber}
                    onChange={e => set('serviceBillNumber', e.target.value)}
                    placeholder="SVC-0001"
                  />
                  {errors.serviceBillNumber && <span className="error-text">{errors.serviceBillNumber}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Date <span className="required">*</span></label>
                  <input
                    type="date"
                    className={`form-input ${errors.date ? 'input-error' : ''}`}
                    value={form.date}
                    onChange={e => set('date', e.target.value)}
                  />
                  {errors.date && <span className="error-text">{errors.date}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input
                    className="form-input"
                    value={form.time}
                    onChange={e => set('time', e.target.value)}
                    placeholder="e.g. 11:30 AM"
                  />
                </div>
              </div>
            </section>

            {/* ── B. Customer Details ── */}
            <section>
              {sectionHeader('B. Customer Details')}

              {/* Customer selected */}
              {form.customerName && !showNewCustomer ? (
                <div style={{ background: 'var(--cream)', border: '1.5px solid var(--gold)', borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} color="var(--gold)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{form.customerName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{form.mobile}{form.address ? ` · ${form.address}` : ''}</div>
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleClearCustomer}>Change</button>
                </div>
              ) : !showNewCustomer ? (
                <>
                  <CustomerSearch onSelect={handleCustomerSelect} onAddNew={() => setShowNewCustomer(true)} />
                  {errors.customerName && <span className="error-text" style={{ display: 'block', marginTop: 4 }}>{errors.customerName}</span>}
                </>
              ) : null}

              {showNewCustomer && (
                <InlineNewCustomerForm
                  onSave={handleNewCustomerSaved}
                  onCancel={() => setShowNewCustomer(false)}
                />
              )}

              {/* Manual customer name + mobile if not from search */}
              {!form.customerId && !showNewCustomer && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>— or fill manually below —</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Customer Name <span className="required">*</span></label>
                      <input
                        className={`form-input ${errors.customerName ? 'input-error' : ''}`}
                        value={form.customerName}
                        onChange={e => set('customerName', e.target.value)}
                        placeholder="Customer name"
                      />
                      {errors.customerName && <span className="error-text">{errors.customerName}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile <span className="required">*</span></label>
                      <input
                        className={`form-input ${errors.mobile ? 'input-error' : ''}`}
                        value={form.mobile}
                        onChange={e => set('mobile', e.target.value)}
                        placeholder="Mobile number"
                      />
                      {errors.mobile && <span className="error-text">{errors.mobile}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
                    <input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Customer address" />
                  </div>
                </div>
              )}
            </section>

            {/* ── C. Item Details ── */}
            <section>
              {sectionHeader('C. Item Details')}
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Item / Article <span className="required">*</span></label>
                  <input
                    className={`form-input ${errors.item ? 'input-error' : ''}`}
                    value={form.item}
                    onChange={e => set('item', e.target.value)}
                    placeholder="e.g. Ring, Chain, Bangle, Necklace, Earring, Pendant…"
                  />
                  {errors.item && <span className="error-text">{errors.item}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Item Weight (gms)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    className="form-input"
                    value={form.weight}
                    onChange={e => set('weight', e.target.value)}
                    placeholder="e.g. 35.200"
                  />
                </div>
              </div>

              {/* Category Radio */}
              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  {['Gold', 'Silver'].map(cat => {
                    const isSelected = form.category === cat;
                    const accentBg    = cat === 'Gold' ? 'rgba(201,168,76,0.15)' : 'rgba(148,163,184,0.15)';
                    const accentBdr   = cat === 'Gold' ? '#C9A84C' : '#94A3B8';
                    const accentTxt   = cat === 'Gold' ? '#8B6914' : '#334155';
                    return (
                      <label
                        key={cat}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                          padding: '8px 18px', borderRadius: 'var(--radius-md)',
                          border: `2px solid ${isSelected ? accentBdr : 'var(--border)'}`,
                          background: isSelected ? accentBg : 'transparent',
                          color: isSelected ? accentTxt : 'var(--text-medium)',
                          fontWeight: isSelected ? 700 : 400,
                          transition: 'var(--transition)',
                          userSelect: 'none',
                        }}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={form.category === cat}
                          onChange={() => set('category', cat)}
                          style={{ accentColor: accentBdr, width: 16, height: 16 }}
                        />
                        {cat}
                      </label>
                    );
                  })}
                </div>
                {errors.category && <span className="error-text">{errors.category}</span>}
              </div>
            </section>

            {/* ── D. Kind of Service ── */}
            <section>
              {sectionHeader('D. Kind of Service')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {SERVICE_TYPE_OPTIONS.map(type => {
                  const checked = (form.serviceTypes || []).includes(type);
                  return (
                    <label
                      key={type}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                        padding: '7px 14px', borderRadius: 'var(--radius-md)',
                        border: `2px solid ${checked ? 'var(--gold)' : 'var(--border)'}`,
                        background: checked ? 'rgba(201,168,76,0.12)' : 'transparent',
                        color: checked ? 'var(--gold-dark)' : 'var(--text-medium)',
                        fontWeight: checked ? 600 : 400,
                        transition: 'var(--transition)',
                        userSelect: 'none',
                        fontSize: 13,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleServiceTypeToggle(type)}
                        style={{ accentColor: 'var(--gold)', width: 15, height: 15 }}
                      />
                      {type}
                    </label>
                  );
                })}
              </div>
              {errors.serviceTypes && (
                <span className="error-text" style={{ display: 'block', marginTop: 6 }}>{errors.serviceTypes}</span>
              )}

              {/* "Other" text field */}
              {(form.serviceTypes || []).includes('Other') && (
                <div className="form-group" style={{ marginTop: 12 }}>
                  <label className="form-label">Specify Other Service</label>
                  <input
                    className="form-input"
                    value={form.otherService}
                    onChange={e => set('otherService', e.target.value)}
                    placeholder="Describe the other service…"
                  />
                </div>
              )}
            </section>

            {/* ── E. Estimate & Payment ── */}
            <section>
              {sectionHeader('E. Estimate & Payment')}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Estimate Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={form.estimateAmount}
                    onChange={e => set('estimateAmount', e.target.value)}
                    placeholder="e.g. 1500"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Delivery Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.estimatedDeliveryDate}
                    onChange={e => set('estimatedDeliveryDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Final Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={form.finalAmount}
                    onChange={e => set('finalAmount', e.target.value)}
                    placeholder="Fill when service is complete"
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Leave blank until service is completed</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount Received (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={form.amountReceived}
                    onChange={e => set('amountReceived', e.target.value)}
                    placeholder="Advance or final payment"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Balance Amount (₹)</label>
                  <div style={{
                    background: balanceAmt > 0 ? 'rgba(220,38,38,0.06)' : 'rgba(22,163,74,0.06)',
                    border: `1.5px solid ${balanceAmt > 0 ? 'rgba(220,38,38,0.3)' : 'rgba(22,163,74,0.3)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 14px',
                    fontSize: 16,
                    fontWeight: 700,
                    color: balanceAmt > 0 ? '#DC2626' : '#15803D',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    ₹{balanceAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Final Amount − Amount Received</span>
                </div>
              </div>
            </section>

            {/* ── F. Item Status ── */}
            <section>
              {sectionHeader('F. Item Status')}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {STATUS_OPTIONS.map(st => {
                  const isActive = form.status === st;
                  const styles   = STATUS_STYLES[st] || STATUS_STYLES['Received'];
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => set('status', st)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: 'var(--radius-full)',
                        border: `2px solid ${isActive ? styles.color : 'var(--border)'}`,
                        background: isActive ? styles.bg : 'transparent',
                        color: isActive ? styles.color : 'var(--text-medium)',
                        fontWeight: isActive ? 700 : 400,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                      }}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── G. Notes ── */}
            <section>
              {sectionHeader('G. Notes')}
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="e.g. Stone loose on left side · Customer requested same size · Small scratch already present…"
                />
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editService ? 'Save Changes' : 'Save Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
