import { useState, useEffect, useCallback } from 'react';
import { X, Search, Plus, User } from 'lucide-react';
import storageService from '../services/storageService';

// ============================================================
// HELPERS — float-safe weight calculation
// ============================================================

/**
 * Safely subtract two decimal weights and round to 3 decimal places.
 * Avoids JavaScript floating-point issues like 25.3 - 24.6 = 0.6999999998
 */
function safeMeltingLoss(before, after) {
  const b = parseFloat(before) || 0;
  const a = parseFloat(after)  || 0;
  const result = Math.round((b - a) * 1000) / 1000;
  return result < 0 ? 0 : result;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function buildBlankForm() {
  return {
    date: todayStr(),
    customerId: null,
    customerName: '',
    mobile: '',
    testingCenter: '',
    reportNumber: '',
    type: 'GOLD',
    beforeMelt: '',
    afterMelt: '',
    purity: '',
    exchange: '',
    exchangePurity: '999',
    to: '',
    moduleType: 'TESTING_REPORT',
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
        c.name.toLowerCase().includes(lower) || c.phone.includes(q)
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
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', maxHeight: 220, overflowY: 'auto', marginTop: 4 }}>
          {results.map(c => (
            <div key={c.id} style={{ padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 10 }}
              onMouseDown={() => { onSelect(c); setQuery(''); setShowDropdown(false); }}>
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
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: '10px 14px', marginTop: 4, fontSize: 13, color: 'var(--text-muted)' }}>
          No customer found. Click "+ New Customer" to add.
        </div>
      )}
    </div>
  );
}

// ============================================================
// INLINE NEW CUSTOMER FORM
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
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => {
          if (!form.name.trim() || !form.phone.trim()) return;
          const saved = storageService.addCustomer({ name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() });
          onSave(saved);
        }}>Save &amp; Select</button>
      </div>
    </div>
  );
}

// ============================================================
// TESTING REPORT FORM MODAL
// ============================================================
export default function TestingReportFormModal({ isOpen, onClose, onSave, editReport = null }) {
  const [form, setForm] = useState(() => buildBlankForm());
  const [errors, setErrors] = useState({});
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [meltingWarning, setMeltingWarning] = useState('');

  // Initialize form on open
  useEffect(() => {
    if (isOpen) {
      if (editReport) {
        setForm({ ...editReport });
      } else {
        setForm(buildBlankForm());
      }
      setErrors({});
      setMeltingWarning('');
      setShowNewCustomer(false);
    }
  }, [isOpen, editReport]);

  if (!isOpen) return null;

  const set = (key, value) => setForm(prev => {
    const next = { ...prev, [key]: value };
    // Recalculate melting loss whenever before/after melt changes
    if (key === 'beforeMelt' || key === 'afterMelt') {
      const bv = key === 'beforeMelt' ? value : prev.beforeMelt;
      const av = key === 'afterMelt'  ? value : prev.afterMelt;
      const b  = parseFloat(bv) || 0;
      const a  = parseFloat(av)  || 0;
      if (a > b && bv !== '' && av !== '') {
        setMeltingWarning('After Melt cannot be greater than Before Melt.');
      } else {
        setMeltingWarning('');
      }
    }
    return next;
  });

  // Calculated melting loss (float-safe, 3 dp)
  const computedMeltingLoss = safeMeltingLoss(form.beforeMelt, form.afterMelt);

  const validate = () => {
    const e = {};
    if (!form.date) e.date = 'Date is required';
    if (!form.customerName.trim()) e.customerName = 'Customer name is required';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required';
    if (!form.testingCenter.trim()) e.testingCenter = 'Testing Center is required';
    if (!form.reportNumber.trim()) e.reportNumber = 'Report Number is required';
    if (!form.type) e.type = 'Type is required';
    if (form.beforeMelt === '' || isNaN(parseFloat(form.beforeMelt))) e.beforeMelt = 'Before Melt is required';
    if (form.afterMelt === '' || isNaN(parseFloat(form.afterMelt))) e.afterMelt = 'After Melt is required';
    if (parseFloat(form.afterMelt) > parseFloat(form.beforeMelt)) e.afterMelt = 'After Melt cannot exceed Before Melt';
    if (form.purity === '' || isNaN(parseFloat(form.purity))) e.purity = 'Purity % is required';
    if (parseFloat(form.purity) < 0 || parseFloat(form.purity) > 100) e.purity = 'Purity must be between 0 and 100';
    if (form.exchange === '' || isNaN(parseFloat(form.exchange))) e.exchange = 'Exchange is required';
    if (!form.exchangePurity) e.exchangePurity = 'Exchange Purity is required';
    if (!form.to.trim()) e.to = '"To" field is required';
    return e;
  };

  const handleCustomerSelect = (customer) => {
    setForm(prev => ({ ...prev, customerId: customer.id, customerName: customer.name, mobile: customer.phone }));
    setShowNewCustomer(false);
  };

  const handleClearCustomer = () => {
    setForm(prev => ({ ...prev, customerId: null, customerName: '', mobile: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const record = {
      ...form,
      meltingLoss: computedMeltingLoss,
      createdAt: editReport?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editReport) {
      storageService.updateTestingReport(record);
    } else {
      record.id = Date.now();
      storageService.addTestingReport(record);
    }
    onSave(record);
    onClose();
  };

  const sectionHeader = (title) => (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold-dark)', borderBottom: '1.5px solid var(--border)', paddingBottom: 6, marginBottom: 14 }}>
      {title}
    </div>
  );

  const isGold = form.type === 'GOLD';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xl" style={{ maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>{editReport ? 'Edit Testing Report' : 'New Testing Report'}</h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {editReport ? `Editing Report: ${editReport.reportNumber}` : 'Gold / Silver Testing Report Entry'}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ── TESTING REPORT INFORMATION ── */}
            <section>
              {sectionHeader('Testing Report Information')}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date <span className="required">*</span></label>
                  <input type="date" className={`form-input ${errors.date ? 'input-error' : ''}`} value={form.date} onChange={e => set('date', e.target.value)} />
                  {errors.date && <span className="error-text">{errors.date}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Testing Report Number <span className="required">*</span></label>
                  <input
                    className={`form-input ${errors.reportNumber ? 'input-error' : ''}`}
                    value={form.reportNumber}
                    onChange={e => set('reportNumber', e.target.value)}
                    placeholder="e.g. 203 or TR-205"
                  />
                  {errors.reportNumber && <span className="error-text">{errors.reportNumber}</span>}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Enter the report number manually</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Testing Center <span className="required">*</span></label>
                  <input
                    className={`form-input ${errors.testingCenter ? 'input-error' : ''}`}
                    value={form.testingCenter}
                    onChange={e => set('testingCenter', e.target.value)}
                    placeholder="e.g. Pooja"
                  />
                  {errors.testingCenter && <span className="error-text">{errors.testingCenter}</span>}
                </div>
              </div>
            </section>

            {/* ── CUSTOMER DETAILS ── */}
            <section>
              {sectionHeader('Customer Details')}

              {form.customerName && !showNewCustomer ? (
                <div style={{ background: 'var(--cream)', border: '1.5px solid var(--gold)', borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} color="var(--gold)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{form.customerName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{form.mobile}</div>
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleClearCustomer}>Change</button>
                </div>
              ) : !showNewCustomer ? (
                <>
                  <CustomerSearch onSelect={handleCustomerSelect} onAddNew={() => setShowNewCustomer(true)} />
                  {(errors.customerName || errors.mobile) && (
                    <span className="error-text" style={{ display: 'block', marginTop: 4 }}>{errors.customerName || errors.mobile}</span>
                  )}
                </>
              ) : null}

              {showNewCustomer && (
                <InlineNewCustomerForm onSave={handleCustomerSelect} onCancel={() => setShowNewCustomer(false)} />
              )}

              {!form.customerId && !showNewCustomer && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>— or fill manually below —</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Customer Name <span className="required">*</span></label>
                      <input className={`form-input ${errors.customerName ? 'input-error' : ''}`} value={form.customerName} onChange={e => set('customerName', e.target.value)} placeholder="Customer name" />
                      {errors.customerName && <span className="error-text">{errors.customerName}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile <span className="required">*</span></label>
                      <input className={`form-input ${errors.mobile ? 'input-error' : ''}`} value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="Mobile number" />
                      {errors.mobile && <span className="error-text">{errors.mobile}</span>}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* ── METAL DETAILS ── */}
            <section>
              {sectionHeader('Metal Details')}

              {/* Type */}
              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Type <span className="required">*</span></label>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  {[{ value: 'GOLD', label: 'Gold' }, { value: 'SILVER', label: 'Silver' }].map(({ value, label }) => {
                    const isSelected  = form.type === value;
                    const accentBg    = value === 'GOLD' ? 'rgba(201,168,76,0.15)' : 'rgba(148,163,184,0.15)';
                    const accentBdr   = value === 'GOLD' ? '#C9A84C' : '#94A3B8';
                    const accentTxt   = value === 'GOLD' ? '#8B6914' : '#334155';
                    return (
                      <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 18px', borderRadius: 'var(--radius-md)', border: `2px solid ${isSelected ? accentBdr : 'var(--border)'}`, background: isSelected ? accentBg : 'transparent', color: isSelected ? accentTxt : 'var(--text-medium)', fontWeight: isSelected ? 700 : 400, transition: 'var(--transition)', userSelect: 'none' }}>
                        <input type="radio" name="type" value={value} checked={form.type === value} onChange={() => set('type', value)} style={{ accentColor: accentBdr, width: 16, height: 16 }} />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Weights */}
              <div className="form-row" style={{ alignItems: 'flex-start' }}>
                <div className="form-group">
                  <label className="form-label">Before Melt (gms) <span className="required">*</span></label>
                  <input
                    type="number" step="0.001" min="0"
                    className={`form-input ${errors.beforeMelt ? 'input-error' : ''}`}
                    value={form.beforeMelt}
                    onChange={e => set('beforeMelt', e.target.value)}
                    placeholder="e.g. 25.300"
                  />
                  {errors.beforeMelt && <span className="error-text">{errors.beforeMelt}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">After Melt (gms) <span className="required">*</span></label>
                  <input
                    type="number" step="0.001" min="0"
                    className={`form-input ${errors.afterMelt ? 'input-error' : ''}`}
                    value={form.afterMelt}
                    onChange={e => set('afterMelt', e.target.value)}
                    placeholder="e.g. 24.600"
                  />
                  {errors.afterMelt && <span className="error-text">{errors.afterMelt}</span>}
                  {meltingWarning && !errors.afterMelt && (
                    <span className="error-text">{meltingWarning}</span>
                  )}
                </div>
                {/* Melting Loss — READ ONLY / auto-calculated */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Melting Loss (gms)
                    <span style={{ fontSize: 10, background: 'rgba(201,168,76,0.15)', color: 'var(--gold-dark)', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>AUTO</span>
                  </label>
                  <div style={{
                    background: parseFloat(form.afterMelt) > parseFloat(form.beforeMelt) && form.afterMelt !== '' && form.beforeMelt !== ''
                      ? 'rgba(220,38,38,0.06)' : 'rgba(201,168,76,0.08)',
                    border: `1.5px solid ${parseFloat(form.afterMelt) > parseFloat(form.beforeMelt) && form.afterMelt !== '' && form.beforeMelt !== ''
                      ? 'rgba(220,38,38,0.3)' : 'rgba(201,168,76,0.3)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 14px',
                    fontSize: 16,
                    fontWeight: 700,
                    color: parseFloat(form.afterMelt) > parseFloat(form.beforeMelt) ? '#DC2626' : 'var(--gold-dark)',
                    fontVariantNumeric: 'tabular-nums',
                    minHeight: 42,
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {(form.beforeMelt !== '' && form.afterMelt !== '') ? `${computedMeltingLoss.toFixed(3)} gms` : '—'}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Before Melt − After Melt</span>
                </div>
              </div>

              {/* Purity */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Purity (%) <span className="required">*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number" step="0.1" min="0" max="100"
                      className={`form-input ${errors.purity ? 'input-error' : ''}`}
                      value={form.purity}
                      onChange={e => set('purity', e.target.value)}
                      placeholder="e.g. 91.6"
                      style={{ paddingRight: 32 }}
                    />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none' }}>%</span>
                  </div>
                  {errors.purity && <span className="error-text">{errors.purity}</span>}
                </div>
              </div>

              {/* Exchange */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Exchange (gms) <span className="required">*</span></label>
                  <input
                    type="number" step="0.001" min="0"
                    className={`form-input ${errors.exchange ? 'input-error' : ''}`}
                    value={form.exchange}
                    onChange={e => set('exchange', e.target.value)}
                    placeholder="e.g. 23.200"
                  />
                  {errors.exchange && <span className="error-text">{errors.exchange}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Exchange Purity <span className="required">*</span></label>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    {['995', '999'].map(opt => {
                      const isSelected = form.exchangePurity === opt;
                      return (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 18px', borderRadius: 'var(--radius-md)', border: `2px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`, background: isSelected ? 'rgba(201,168,76,0.15)' : 'transparent', color: isSelected ? 'var(--gold-dark)' : 'var(--text-medium)', fontWeight: isSelected ? 700 : 400, transition: 'var(--transition)', userSelect: 'none' }}>
                          <input type="radio" name="exchangePurity" value={opt} checked={form.exchangePurity === opt} onChange={() => set('exchangePurity', opt)} style={{ accentColor: 'var(--gold)', width: 16, height: 16 }} />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                  {errors.exchangePurity && <span className="error-text">{errors.exchangePurity}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">To <span className="required">*</span></label>
                  <input
                    className={`form-input ${errors.to ? 'input-error' : ''}`}
                    value={form.to}
                    onChange={e => set('to', e.target.value)}
                    placeholder="e.g. Shop"
                  />
                  {errors.to && <span className="error-text">{errors.to}</span>}
                </div>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editReport ? 'Save Changes' : 'Save Testing Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
