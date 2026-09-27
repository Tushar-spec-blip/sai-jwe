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

  const cancelEdit = () => setEditingId(null);

  const saveRate = (id) => {
    const val = tempRates[id];
    if (val !== undefined) updateRate(id, val);
    setEditingId(null);
  };

  const setTemp = (id, val) => setTempRates(prev => ({ ...prev, [id]: val }));

  const goldRates   = rates.filter(r => r.metal === 'Gold');
  const silverRates = rates.filter(r => r.metal === 'Silver');

  const RateCard = ({ rate }) => {
    const isEditing   = editingId === rate.id;
    const currentVal  = tempRates[rate.id] !== undefined ? tempRates[rate.id] : rate.rate_per_gram;
    const isGold      = rate.metal === 'Gold';
    const accentColor = isGold ? 'var(--gold)' : '#94A3B8';
    const accentDark  = isGold ? 'var(--gold-dark)' : '#334155';
    const accentBg    = isGold ? 'rgba(201,168,76,0.05)' : 'rgba(148,163,184,0.05)';

    return (
      <div style={{
        background: isEditing ? accentBg : 'white',
        borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${isEditing ? accentColor : 'var(--border-light)'}`,
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.2s ease',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-dark)' }}>
            {rate.purity}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Last updated: {new Date(rate.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>

        {isEditing ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 10, fontSize: 13, color: 'var(--text-muted)', pointerEvents: 'none' }}>₹</span>
              <input
                className="form-input"
                type="number"
                step="1"
                value={currentVal}
                onChange={e => setTemp(rate.id, e.target.value)}
                autoFocus
                style={{ fontSize: 16, fontWeight: 700, width: 120, paddingLeft: 26 }}
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => saveRate(rate.id)}>
              <Save size={14} /> Save
            </button>
            <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: accentDark, fontVariantNumeric: 'tabular-nums' }}>
                {rate.rate_per_gram > 0 ? formatCurrency(rate.rate_per_gram) : <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>Not set</span>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>per gram</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(rate)}>
              <Pencil size={13} /> Edit
            </button>
          </div>
        )}
      </div>
    );
  };

  const SectionCard = ({ title, subtitle, accentColor, accentBg, rateList }) => (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-lg)',
      border: `2px solid ${accentColor}44`,
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
    }}>
      {/* Section Header */}
      <div style={{ background: accentBg, padding: '16px 20px', borderBottom: `1.5px solid ${accentColor}33` }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: accentColor }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>
      </div>
      {/* Rates list */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rateList.map(rate => <RateCard key={rate.id} rate={rate} />)}
      </div>
    </div>
  );

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        <SectionCard
          title="GOLD RATES"
          subtitle="Rate per gram for Gold purities"
          accentColor="var(--gold-dark)"
          accentBg="rgba(201,168,76,0.07)"
          rateList={goldRates}
        />

        <SectionCard
          title="SILVER RATES"
          subtitle="Rate per gram for Silver purities"
          accentColor="#64748B"
          accentBg="rgba(148,163,184,0.07)"
          rateList={silverRates}
        />
      </div>

      {/* Rate History Table */}
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
                    <td>
                      {r.rate_per_gram > 0
                        ? <strong>{formatCurrency(r.rate_per_gram)}</strong>
                        : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Not set</span>
                      }
                    </td>
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
