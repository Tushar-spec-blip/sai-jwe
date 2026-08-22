import { useState } from 'react';
import { mockMetalRates } from '../data/mockData';
import { formatCurrency } from '../utils/billingCalculator';
import { Pencil, Save, X, Info } from 'lucide-react';

export default function MetalRates() {
  const [rates, setRates] = useState(mockMetalRates.map(r => ({ ...r, editing: false, tempRate: r.rate_per_gram })));

  const startEdit = (id) => setRates(prev => prev.map(r => r.id === id ? { ...r, editing: true, tempRate: r.rate_per_gram } : r));
  const cancelEdit = (id) => setRates(prev => prev.map(r => r.id === id ? { ...r, editing: false } : r));
  const saveRate = (id) => {
    setRates(prev => prev.map(r => r.id === id ? {
      ...r, editing: false, rate_per_gram: parseFloat(r.tempRate) || r.rate_per_gram,
      updated_at: new Date().toISOString().split('T')[0],
    } : r));
  };
  const setTemp = (id, val) => setRates(prev => prev.map(r => r.id === id ? { ...r, tempRate: val } : r));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Metal Rates</h2>
          <p>Update today's gold and silver rates for billing</p>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        <Info size={16} />
        <div>
          <strong>Important:</strong> Changing rates here does not affect previously saved invoices. Each invoice permanently stores the rate used at the time of billing.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {rates.map(rate => (
          <div key={rate.id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: `2px solid ${rate.editing ? 'var(--gold)' : 'var(--border-light)'}`, padding: '24px', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-dark)' }}>
                  {rate.purity} {rate.metal}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Last updated: {new Date(rate.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              {!rate.editing && (
                <button className="btn btn-secondary btn-sm" onClick={() => startEdit(rate.id)}>
                  <Pencil size={13} /> Edit Rate
                </button>
              )}
            </div>

            {rate.editing ? (
              <div>
                <label className="form-label">Rate per gram (Rs.)</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <input
                    className="form-input"
                    type="number"
                    step="1"
                    value={rate.tempRate}
                    onChange={e => setTemp(rate.id, e.target.value)}
                    autoFocus
                    style={{ fontSize: 18, fontWeight: 700 }}
                  />
                  <button className="btn btn-primary" onClick={() => saveRate(rate.id)}>
                    <Save size={14} /> Save
                  </button>
                  <button className="btn btn-ghost" onClick={() => cancelEdit(rate.id)}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 700, color: 'var(--gold-dark)', letterSpacing: '-0.01em' }}>
                  {formatCurrency(rate.rate_per_gram)}
                </span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>per gram</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rate History Placeholder */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <h3>Rate History</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Full rate history will be available in Phase 2</span>
        </div>
        <div className="card-body">
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Metal</th>
                  <th>Purity</th>
                  <th>Rate / Gram</th>
                  <th>Updated On</th>
                </tr>
              </thead>
              <tbody>
                {rates.map(r => (
                  <tr key={r.id}>
                    <td className="td-primary">{r.metal}</td>
                    <td><span className="badge badge-gold">{r.purity}</span></td>
                    <td><strong>{formatCurrency(r.rate_per_gram)}</strong></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(r.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
