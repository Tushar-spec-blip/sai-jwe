import { useState } from 'react';
import { Search, Eye, Printer, ShoppingCart, ShoppingBag } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import storageService from '../services/storageService';
import { formatCurrency } from '../utils/billingCalculator';
import PrintPreviewModal from '../components/invoice/PrintPreviewModal';

const STATUS_OPTIONS = ['', 'PAID', 'PARTIAL', 'PENDING'];

export default function Bills({ onNavigate }) {
  const [invoices, setInvoices] = useState(() => storageService.getInvoices());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [previewFormat, setPreviewFormat] = useState('A4');

  const openPreview = (inv, format = 'A4') => {
    setPreviewFormat(format);
    setPreviewInvoice(inv);
  };

  const filtered = invoices.filter(inv => {
    const matchSearch = !search ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || inv.payment_status === filterStatus;
    const matchType = !filterType || inv.sale_type === filterType || (filterType === 'GOLD' && (!inv.sale_type || inv.sale_type === 'GOLD'));
    const matchFrom = !filterFrom || inv.invoice_date >= filterFrom;
    const matchTo = !filterTo || inv.invoice_date <= filterTo;
    return matchSearch && matchStatus && matchType && matchFrom && matchTo;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Bills / Invoices</h2>
          <p>Sales invoices and billing history</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => onNavigate('/new-bill')}>
            + New Sale
          </button>
        </div>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="card-header" style={{ gap: 10, flexWrap: 'wrap' }}>
          <div className="search-bar">
            <Search />
            <input placeholder="Search invoice no. or customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto', minWidth: 130, padding: '8px 32px 8px 12px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.filter(s => s).map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto', minWidth: 130, padding: '8px 32px 8px 12px' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Sale Types</option>
            <option value="GOLD">Gold Sale</option>
            <option value="SILVER">Silver Sale</option>
          </select>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>From:</span>
            <input type="date" className="form-input" style={{ width: 140, padding: '7px 10px' }} value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>To:</span>
            <input type="date" className="form-input" style={{ width: 140, padding: '7px 10px' }} value={filterTo} onChange={e => setFilterTo(e.target.value)} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} invoices</span>
        </div>

        {/* Table */}
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <div className="scroll-hint">
            <span>Scroll horizontally to view details →</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Sale Type</th>
                <th>Grand Total</th>
                <th>Paid Amount</th>
                <th>Balance</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const isSilver = inv.sale_type === 'SILVER';
                return (
                  <tr key={inv.id}>
                    <td><span className="td-primary">{inv.invoice_number}</span></td>
                    <td style={{ fontSize: 13 }}>
                      {new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div className="td-primary">{inv.customer_name}</div>
                      <div className="td-secondary">{inv.customer_phone}</div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 10px',
                        borderRadius: 12,
                        background: isSilver ? 'rgba(148,163,184,0.18)' : 'rgba(201,168,76,0.18)',
                        color: isSilver ? '#334155' : '#8B6914',
                        border: isSilver ? '1px solid rgba(148,163,184,0.35)' : '1px solid rgba(201,168,76,0.35)',
                      }}>
                        {isSilver ? 'Silver Sale ⬜' : 'Gold Sale 🪙'}
                      </span>
                    </td>
                    <td><strong>{formatCurrency(inv.grand_total)}</strong></td>
                    <td style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>{formatCurrency(inv.paid_amount)}</td>
                    <td style={{ color: inv.balance_amount > 0 ? '#dc2626' : '#16a34a', fontWeight: 600, fontSize: 13 }}>
                      {formatCurrency(inv.balance_amount)}
                    </td>
                    <td><Badge status={inv.payment_status} /></td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-sm" title="View Invoice" onClick={() => openPreview(inv, 'A4')}>
                          <Eye size={14} />
                        </button>
                        <button className="btn btn-secondary btn-sm" title="Print A4" onClick={() => openPreview(inv, 'A4')}>
                          <Printer size={14} /> A4
                        </button>
                        <button className="btn btn-secondary btn-sm" title="Reprint 80mm" onClick={() => openPreview(inv, '80mm')}>
                          🧾 Reprint
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {previewInvoice && (
        <PrintPreviewModal
          invoice={previewInvoice}
          isOpen={!!previewInvoice}
          initialFormat={previewFormat}
          onClose={() => setPreviewInvoice(null)}
        />
      )}
    </div>
  );
}
