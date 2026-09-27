import { useState, useCallback } from 'react';
import { Plus, Search, Eye, Pencil, Printer, ChevronDown } from 'lucide-react';
import storageService from '../services/storageService';
import ServiceFormModal from './ServiceFormModal';
import ServiceDetailModal from './ServiceDetailModal';
import ServicePrintPreviewModal from '../components/invoice/ServicePrintPreviewModal';

// ============================================================
// CONSTANTS
// ============================================================
const STATUS_OPTIONS = ['Received', 'In Service', 'Ready', 'Delivered'];

const STATUS_STYLES = {
  'Received':   { bg: 'rgba(100,116,139,0.1)',  color: '#475569', border: 'rgba(100,116,139,0.35)' },
  'In Service': { bg: 'rgba(37,99,235,0.1)',    color: '#1D4ED8', border: 'rgba(37,99,235,0.35)' },
  'Ready':      { bg: 'rgba(217,119,6,0.12)',   color: '#B45309', border: 'rgba(217,119,6,0.4)' },
  'Delivered':  { bg: 'rgba(22,163,74,0.12)',   color: '#15803D', border: 'rgba(22,163,74,0.4)' },
};

// ============================================================
// STATUS BADGE
// ============================================================
function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES['Received'];
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 999,
      fontWeight: 700,
      fontSize: 11,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

// ============================================================
// INLINE STATUS DROPDOWN — for quick status update in the table
// ============================================================
function InlineStatusSelect({ currentStatus, onChange }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={currentStatus}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          padding: '4px 24px 4px 10px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          border: `1.5px solid ${STATUS_STYLES[currentStatus]?.border || 'var(--border)'}`,
          background: STATUS_STYLES[currentStatus]?.bg || 'transparent',
          color: STATUS_STYLES[currentStatus]?.color || 'var(--text-dark)',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {STATUS_OPTIONS.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <ChevronDown
        size={10}
        style={{
          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: STATUS_STYLES[currentStatus]?.color || 'var(--text-muted)',
        }}
      />
    </div>
  );
}

// ============================================================
// SERVICE PAGE
// ============================================================
export default function Service() {
  const [services, setServices] = useState(() => storageService.getServices());

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [printTarget, setPrintTarget] = useState(null);
  const [printFormat, setPrintFormat] = useState('A4');

  // ── Reload from storage ──
  const reload = useCallback(() => {
    setServices(storageService.getServices());
  }, []);

  // ── Filtered list ──
  const filtered = services.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      s.serviceBillNumber?.toLowerCase().includes(q) ||
      s.customerName?.toLowerCase().includes(q) ||
      s.mobile?.includes(search) ||
      s.item?.toLowerCase().includes(q);
    const matchCategory = !filterCategory || s.category === filterCategory;
    const matchStatus   = !filterStatus   || s.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  // ── Status quick update ──
  const handleStatusChange = (service, newStatus) => {
    const updated = { ...service, status: newStatus };
    storageService.updateService(updated);
    reload();
    // If currently viewing, refresh view
    if (viewTarget && viewTarget.id === service.id) setViewTarget(updated);
  };

  // ── Open edit ──
  const handleEdit = (service) => {
    setEditTarget(service);
    setViewTarget(null);
    setShowForm(true);
  };

  // ── Open print ──
  const handlePrint = (service, format = 'A4') => {
    setPrintFormat(format);
    setPrintTarget(service);
  };

  // ── Save form callback ──
  const handleFormSave = () => {
    reload();
    setShowForm(false);
    setEditTarget(null);
  };

  // ── Format helpers ──
  const fmt = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? '—' : `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatServices = (s) => {
    if (!s) return [];
    return [
      ...s.serviceTypes.filter(t => t !== 'Other'),
      ...(s.serviceTypes.includes('Other') && s.otherService ? [s.otherService] : []),
    ];
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Jewellery Service</h2>
          <p>Manage repair, polishing, resizing and other service jobs</p>
        </div>
        <div className="page-header-actions">
          <button
            id="btn-new-service"
            className="btn btn-primary"
            onClick={() => { setEditTarget(null); setShowForm(true); }}
          >
            <Plus size={16} /> New Service
          </button>
        </div>
      </div>

      {/* ── Stats Summary ── */}
      {services.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 18 }}>
          {STATUS_OPTIONS.map(st => {
            const count = services.filter(s => s.status === st).length;
            const styles = STATUS_STYLES[st];
            return (
              <div
                key={st}
                onClick={() => setFilterStatus(filterStatus === st ? '' : st)}
                style={{
                  background: 'var(--bg-card)', border: `1.5px solid ${filterStatus === st ? styles.color : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)', padding: '10px 14px', cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: styles.color }}>{count}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{st}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Service History Card ── */}
      <div className="card">
        <div className="card-header" style={{ borderBottom: '1.5px solid var(--border)', paddingBottom: 14, marginBottom: 0 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Service History</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 10 }}>
            {/* Search */}
            <div className="search-bar" style={{ flex: '1 1 220px', minWidth: 0 }}>
              <Search size={15} />
              <input
                id="service-search"
                placeholder="Search by bill no., customer, mobile or item…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              id="service-filter-category"
              className="form-select"
              style={{ width: 'auto', minWidth: 110, padding: '8px 32px 8px 12px' }}
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
            </select>

            {/* Status Filter */}
            <select
              id="service-filter-status"
              className="form-select"
              style={{ width: 'auto', minWidth: 130, padding: '8px 32px 8px 12px' }}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <div className="scroll-hint">
            <span>Scroll horizontally to view all columns →</span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔧</div>
              {services.length === 0
                ? <><div style={{ fontWeight: 600, marginBottom: 6 }}>No service records yet</div><div style={{ fontSize: 13 }}>Click <strong>+ New Service</strong> to create the first service entry.</div></>
                : <><div style={{ fontWeight: 600 }}>No results match your filters</div><div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting the search or filters.</div></>
              }
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Bill No.</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Item</th>
                  <th>Cat.</th>
                  <th>Weight</th>
                  <th>Service Type</th>
                  <th>Est. Delivery</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Final Amt</th>
                  <th style={{ textAlign: 'right' }}>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(svc => {
                  const serviceList = formatServices(svc);
                  const bal = parseFloat(svc.balanceAmount) || 0;
                  return (
                    <tr key={svc.id}>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--gold-dark)' }}>{svc.serviceBillNumber}</span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{formatDate(svc.date)}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{svc.customerName || '—'}</div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{svc.mobile || '—'}</td>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{svc.item || '—'}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                          background: svc.category === 'Gold' ? 'rgba(201,168,76,0.15)' : 'rgba(148,163,184,0.15)',
                          color: svc.category === 'Gold' ? '#8B6914' : '#334155',
                        }}>
                          {svc.category || '—'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{svc.weight ? `${parseFloat(svc.weight).toFixed(3)} g` : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                          {serviceList.slice(0, 2).map((t, i) => (
                            <span key={i} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: 'rgba(201,168,76,0.1)', color: 'var(--gold-dark)', border: '1px solid rgba(201,168,76,0.2)' }}>
                              {t}
                            </span>
                          ))}
                          {serviceList.length > 2 && (
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{serviceList.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(svc.estimatedDeliveryDate)}</td>
                      <td>
                        <InlineStatusSelect
                          currentStatus={svc.status || 'Received'}
                          onChange={(newStatus) => handleStatusChange(svc, newStatus)}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 600 }}>
                        {svc.finalAmount ? fmt(svc.finalAmount) : <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>—</span>}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: bal > 0 ? '#DC2626' : '#15803D' }}>
                        {(svc.finalAmount || svc.amountReceived) ? fmt(bal) : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px' }}
                            title="View details"
                            onClick={() => setViewTarget(svc)}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px' }}
                            title="Edit service"
                            onClick={() => handleEdit(svc)}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 8px' }}
                            title="Print service receipt"
                            onClick={() => handlePrint(svc)}
                          >
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
      <ServiceFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTarget(null); }}
        onSave={handleFormSave}
        editService={editTarget}
      />

      <ServiceDetailModal
        service={viewTarget}
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={handleEdit}
        onPrint={(svc) => handlePrint(svc)}
      />

      <ServicePrintPreviewModal
        service={printTarget}
        isOpen={!!printTarget}
        onClose={() => setPrintTarget(null)}
        initialFormat={printFormat}
      />
    </div>
  );
}
