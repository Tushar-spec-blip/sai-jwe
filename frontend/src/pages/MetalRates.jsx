import { useState } from 'react';
import { useMetalRates } from '../context/MetalRatesContext';
import { formatCurrency } from '../utils/billingCalculator';
import { Pencil, Save, X, Info } from 'lucide-react';

export default function MetalRates() {
  const { rates, updateRate } = useMetalRates();
  const [editingId, setEditingId] = useState(null);
  const [tempRates, setTempRates] = useState({});

  const startEdit = (rate) => {
    setEditingId(rate.id);
    setTempRates(prev => ({ ...prev, [rate.id]: rate.rate_per_gram }));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveRate = (id) => {
    const val = tempRates[id];
    if (val !== undefined) {
      updateRate(id, val);
    }
    setEditingId(null);
  };

  const setTemp = (id, val) => {
    setTempRates(prev => ({ ...prev, [id]: val }));
  };

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
          <strong>Important:</strong> Changing rates here automatically updates defaults for <strong>new bills</strong>. Previously saved invoices permanently retain the rate used at the time of billing.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {rates.map(rate => {
          const isEditing = editingId === rate.id;
          const currentVal = tempRates[rate.id] !== undefined ? tempRates[rate.id] : rate.rate_per_gram;

          return (
            <div key={rate.id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: `2px solid ${isEditing ? 'var(--gold)' : 'var(--border-light)'}`, padding: '24px', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-dark)' }}>
                    {rate.purity} {rate.metal}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Last updated: {new Date(rate.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                {!isEditing && (
                  <button className="btn btn-secondary btn-sm" onClick={() => startEdit(rate)}>
                    <Pencil size={13} /> Edit Rate
                  </button>
                )}
              </div>

              {isEditing ? (
                <div>
                  <label className="form-label">Rate per gram (Rs.)</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <input
                      className="form-input"
                      type="number"
                      step="1"
                      value={currentVal}
                      onChange={e => setTemp(rate.id, e.target.value)}
                      autoFocus
                      style={{ fontSize: 18, fontWeight: 700 }}
                    />
                    <button className="btn btn-primary" onClick={() => saveRate(rate.id)}>
                      <Save size={14} /> Save
                    </button>
                    <button className="btn btn-ghost" onClick={cancelEdit}>
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
          );
        })}
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
