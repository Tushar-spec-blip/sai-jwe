import { useState } from 'react';
import { Save, CheckCircle, RotateCcw } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import storageService from '../services/storageService';

const TABS = ['Shop Details', 'Billing', 'GST', 'Printing'];

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('Shop Details');
  // Local draft — edits stay local until Save is clicked
  const [draft, setDraft] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const set = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    updateSettings(draft);   // push to global context → all pages see new values
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDiscard = () => {
    setDraft({ ...settings });
  };

  const handleResetDemoData = () => {
    if (window.confirm("Reset all demo data? This will remove changes made in this browser.")) {
      storageService.resetDemoData();
      window.location.reload();
    }
  };

  const isDirty = JSON.stringify(draft) !== JSON.stringify(settings);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Settings</h2>
          <p>Configure your shop details and billing preferences</p>
        </div>
        <div className="page-header-actions">
          {isDirty && (
            <button className="btn btn-secondary" onClick={handleDiscard}>
              Discard Changes
            </button>
          )}
          <button className="btn btn-primary" onClick={handleSave}>
            {saved
              ? <><CheckCircle size={15} /> Saved!</>
              : <><Save size={15} /> Save Settings</>
            }
          </button>
        </div>
      </div>

      {saved && (
        <div className="alert" style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', marginBottom: 16 }}>
          <CheckCircle size={16} /> Settings saved and applied successfully!
        </div>
      )}

      {isDirty && !saved && (
        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          <span>⚠️</span>
          <span>You have unsaved changes. Click <strong>Save Settings</strong> to apply them.</span>
        </div>
      )}

      <div className="tab-bar">
        {TABS.map(tab => (
          <div
            key={tab}
            className={`tab-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">

          {/* ── Shop Details ── */}
          {activeTab === 'Shop Details' && (
            <div style={{ maxWidth: 560 }}>
              <h3 style={{ marginBottom: 20, fontSize: 16 }}>Shop Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Shop Name</label>
                  <input
                    className="form-input"
                    value={draft.shop_name}
                    onChange={e => set('shop_name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-textarea"
                    value={draft.shop_address}
                    onChange={e => set('shop_address', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    value={draft.shop_phone}
                    onChange={e => set('shop_phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GSTIN</label>
                  <input
                    className="form-input"
                    value={draft.gstin}
                    onChange={e => set('gstin', e.target.value)}
                    placeholder="GST Number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Billing ── */}
          {activeTab === 'Billing' && (
            <div style={{ maxWidth: 560 }}>
              <h3 style={{ marginBottom: 20, fontSize: 16 }}>Billing Configuration</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Invoice Prefix</label>
                  <input
                    className="form-input"
                    value={draft.invoice_prefix}
                    onChange={e => set('invoice_prefix', e.target.value)}
                    placeholder="INV-"
                  />
                  <span className="form-hint">Example: INV-0001, BILL-0001</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Rounding Method</label>
                  <select
                    className="form-select"
                    value={draft.rounding_method}
                    onChange={e => set('rounding_method', e.target.value)}
                  >
                    <option value="nearest">Round to nearest rupee</option>
                    <option value="up">Round up</option>
                    <option value="down">Round down</option>
                    <option value="none">No rounding</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Making Charge Method</label>
                  <select
                    className="form-select"
                    value={draft.making_charge_method}
                    onChange={e => set('making_charge_method', e.target.value)}
                  >
                    <option value="fixed">Fixed Amount (Rs.)</option>
                    <option value="per_gram">Per Gram</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Wastage Method</label>
                  <select
                    className="form-select"
                    value={draft.wastage_method}
                    onChange={e => set('wastage_method', e.target.value)}
                  >
                    <option value="percentage">Percentage of Gold Value</option>
                    <option value="weight">By Weight</option>
                    <option value="fixed">Fixed Value</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── GST ── */}
          {activeTab === 'GST' && (
            <div style={{ maxWidth: 400 }}>
              <h3 style={{ marginBottom: 20, fontSize: 16 }}>GST Configuration</h3>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Default GST Rate (%)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  value={draft.gst_rate}
                  onChange={e => set('gst_rate', e.target.value)}
                  style={{ fontSize: 18, fontWeight: 700 }}
                />
                <span className="form-hint">Standard jewellery GST rate is 3%</span>
              </div>
              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 13, color: '#92400e' }}>
                <strong>Note:</strong> Changing the GST rate here will only apply to <strong>new invoices</strong>. Previously saved invoices will retain their original GST rate permanently.
              </div>

              {/* Live preview */}
              <div style={{ marginTop: 20, padding: '14px 18px', background: 'var(--cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Preview on a Rs. 1,00,000 sale:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>GST ({draft.gst_rate}%)</span>
                  <strong>Rs. {(100000 * parseFloat(draft.gst_rate || 0) / 100).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, marginTop: 6 }}>
                  <span>Grand Total</span>
                  <span>Rs. {(100000 + 100000 * parseFloat(draft.gst_rate || 0) / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Printing ── */}
          {activeTab === 'Printing' && (
            <div style={{ maxWidth: 400 }}>
              <h3 style={{ marginBottom: 20, fontSize: 16 }}>Print Settings</h3>
              <div className="form-group">
                <label className="form-label">Default Invoice Format</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  {['A4', '80mm'].map(fmt => (
                    <div
                      key={fmt}
                      onClick={() => set('default_invoice_format', fmt)}
                      style={{
                        padding: '16px 24px',
                        border: `2px solid ${draft.default_invoice_format === fmt ? 'var(--gold)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        background: draft.default_invoice_format === fmt ? 'rgba(201,168,76,0.08)' : 'white',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{fmt === 'A4' ? '📄' : '🧾'}</div>
                      <div style={{ fontWeight: 600, color: draft.default_invoice_format === fmt ? 'var(--gold-dark)' : 'var(--text-dark)' }}>
                        {fmt}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {fmt === 'A4' ? 'Standard A4 Paper' : 'Thermal Printer'}
                      </div>
                    </div>
                  ))}
                </div>
                <span className="form-hint" style={{ marginTop: 10, display: 'block' }}>
                  This sets the default print option shown when you print an invoice.
                </span>
              </div>
            </div>
          )}

          {/* Reset Demo Data Section */}
          <div style={{ marginTop: 36, paddingTop: 20, borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-dark)' }}>Reset Demo Data</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Reset customers, invoices, old purchases, and metal rates back to initial mock data.
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ color: '#dc2626', borderColor: '#fca5a5' }}
              onClick={handleResetDemoData}
            >
              <RotateCcw size={13} /> Reset Demo Data
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
