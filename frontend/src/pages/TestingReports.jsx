import { useState, useCallback } from 'react';
import { Plus, Search, Eye, Pencil, Printer } from 'lucide-react';
import storageService from '../services/storageService';
import TestingReportFormModal from './TestingReportFormModal';
import TestingReportDetailModal from './TestingReportDetailModal';
import TestingReportPrintPreviewModal from '../components/invoice/TestingReportPrintPreviewModal';

// ============================================================
// HELPERS
// ============================================================
function fmtWt(v) {
  const n = parseFloat(v);
  return isNaN(n) ? '—' : `${n.toFixed(3)} g`;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ============================================================
// TESTING REPORTS PAGE
// ============================================================
export default function TestingReports() {
  const [reports, setReports] = useState(() => storageService.getTestingReports());

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [printTarget, setPrintTarget] = useState(null);

  const reload = useCallback(() => {
    setReports(storageService.getTestingReports());
  }, []);

  // Filtered list
  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      String(r.reportNumber).toLowerCase().includes(q) ||
      r.customerName?.toLowerCase().includes(q) ||
      r.mobile?.includes(search) ||
      r.testingCenter?.toLowerCase().includes(q);
    const matchType = !filterType || r.type === filterType;
    const matchFrom = !filterFrom || r.date >= filterFrom;
    const matchTo   = !filterTo   || r.date <= filterTo;
    return matchSearch && matchType && matchFrom && matchTo;
  });

  const handleEdit = (report) => {
    setEditTarget(report);
    setViewTarget(null);
    setShowForm(true);
  };

  const handleFormSave = () => {
    reload();
    setShowForm(false);
    setEditTarget(null);
  };

  // Summary counts
  const goldCount   = reports.filter(r => r.type === 'GOLD').length;
  const silverCount = reports.filter(r => r.type === 'SILVER').length;

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Gold / Silver Testing Reports</h2>
          <p>Create, view and print gold and silver testing reports</p>
        </div>
        <div className="page-header-actions">
          <button
            id="btn-new-testing-report"
            className="btn btn-primary"
            onClick={() => { setEditTarget(null); setShowForm(true); }}
          >
            <Plus size={16} /> New Testing Report
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {reports.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 18 }}>
          {[
            { label: 'Total Reports', count: reports.length, color: 'var(--gold-dark)', bg: 'rgba(201,168,76,0.1)' },
            { label: 'Gold', count: goldCount, color: '#8B6914', bg: 'rgba(201,168,76,0.15)' },
            { label: 'Silver', count: silverCount, color: '#334155', bg: 'rgba(148,163,184,0.15)' },
          ].map(({ label, count, color, bg }) => (
            <div key={label} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── History Card ── */}
      <div className="card">
        <div className="card-header" style={{ borderBottom: '1.5px solid var(--border)', paddingBottom: 14, marginBottom: 0 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Testing Report History</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 10 }}>
            {/* Search */}
            <div className="search-bar" style={{ flex: '1 1 220px', minWidth: 0 }}>
              <Search size={15} />
              <input
                id="testing-report-search"
                placeholder="Search report no., customer or testing center…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Type filter */}
            <select
              id="testing-report-filter-type"
              className="form-select"
              style={{ width: 'auto', minWidth: 110, padding: '8px 32px 8px 12px' }}
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
            </select>

            {/* Date range filter */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>From:</span>
              <input type="date" className="form-input" style={{ width: 140, padding: '7px 10px' }} value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>To:</span>
              <input type="date" className="form-input" style={{ width: 140, padding: '7px 10px' }} value={filterTo} onChange={e => setFilterTo(e.target.value)} />
            </div>

            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {filtered.length} report{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <div className="scroll-hint"><span>Scroll horizontally to view all columns →</span></div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
              {reports.length === 0
                ? <><div style={{ fontWeight: 600, marginBottom: 6 }}>No testing reports yet</div><div style={{ fontSize: 13 }}>Click <strong>+ New Testing Report</strong> to create the first report.</div></>
                : <><div style={{ fontWeight: 600 }}>No results match your filters</div><div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting the search or filters.</div></>
              }
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Report No.</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Testing Center</th>
                  <th>Type</th>
                  <th>Before Melt</th>
                  <th>After Melt</th>
                  <th>Melting Loss</th>
                  <th>Purity</th>
                  <th>Exchange</th>
                  <th>Exch. Purity</th>
                  <th>To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const isGold    = r.type === 'GOLD';
                  const typeLabel = isGold ? 'Gold' : 'Silver';
                  const purity    = parseFloat(r.purity);
                  return (
                    <tr key={r.id}>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gold-dark)' }}>{r.reportNumber}</span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDate(r.date)}</td>
                      <td><div style={{ fontWeight: 600, fontSize: 13 }}>{r.customerName || '—'}</div></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.mobile || '—'}</td>
                      <td style={{ fontSize: 13 }}>{r.testingCenter || '—'}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: isGold ? 'rgba(201,168,76,0.15)' : 'rgba(148,163,184,0.15)',
                          color: isGold ? '#8B6914' : '#334155',
                        }}>
                          {typeLabel}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{fmtWt(r.beforeMelt)}</td>
                      <td style={{ fontSize: 12 }}>{fmtWt(r.afterMelt)}</td>
                      <td style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-dark)' }}>{fmtWt(r.meltingLoss)}</td>
                      <td style={{ fontSize: 12 }}>{isNaN(purity) ? '—' : `${purity}%`}</td>
                      <td style={{ fontSize: 12 }}>{fmtWt(r.exchange)}</td>
                      <td style={{ fontSize: 12 }}>{r.exchangePurity || '—'}</td>
                      <td style={{ fontSize: 12 }}>{r.to || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} title="View details" onClick={() => setViewTarget(r)}>
                            <Eye size={13} />
                          </button>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} title="Edit report" onClick={() => handleEdit(r)}>
                            <Pencil size={13} />
                          </button>
                          <button className="btn btn-primary btn-sm" style={{ padding: '4px 8px' }} title="Print report" onClick={() => setPrintTarget(r)}>
                            <Printer size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <TestingReportFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTarget(null); }}
        onSave={handleFormSave}
        editReport={editTarget}
      />

      <TestingReportDetailModal
        report={viewTarget}
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={handleEdit}
        onPrint={(r) => { setPrintTarget(r); setViewTarget(null); }}
      />

      <TestingReportPrintPreviewModal
        report={printTarget}
        isOpen={!!printTarget}
        onClose={() => setPrintTarget(null)}
      />
    </div>
  );
}
