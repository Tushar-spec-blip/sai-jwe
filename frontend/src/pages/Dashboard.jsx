import { useState } from 'react';
import { TrendingUp, Receipt, Users, Clock, Percent, Plus, UserPlus, Package, Eye, Printer, ChevronRight } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { mockDashboardStats, mockInvoices, mockMetalRates, mockPendingPayments } from '../data/mockData';
import { formatCurrency } from '../utils/billingCalculator';
import PrintPreviewModal from '../components/invoice/PrintPreviewModal';

const STAT_CONFIG = [
  {
    label: "Today's Sales", key: 'todaySales', icon: TrendingUp,
    color: '#C9A84C', bg: 'rgba(201,168,76,0.12)', format: 'currency'
  },
  {
    label: "Today's Bills", key: 'todayBills', icon: Receipt,
    color: '#3b82f6', bg: '#eff6ff', format: 'number'
  },
  {
    label: 'Total Customers', key: 'totalCustomers', icon: Users,
    color: '#8b5cf6', bg: '#f3e8ff', format: 'number'
  },
  {
    label: 'Pending Payments', key: 'pendingPayments', icon: Clock,
    color: '#ef4444', bg: '#fee2e2', format: 'currency'
  },
  {
    label: "Today's GST", key: 'todayGst', icon: Percent,
    color: '#10b981', bg: '#d1fae5', format: 'currency'
  },
];

export default function Dashboard({ onNavigate }) {
  const stats = mockDashboardStats;
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleViewInvoice = (inv) => {
    setSelectedInvoice(inv);
    setIsPreviewOpen(true);
  };

  return (
    <div>
      {/* Stats Grid */}
      <div className="dashboard-stats">
        {STAT_CONFIG.map((s) => {
          const Icon = s.icon;
          const value = stats[s.key];
          return (
            <div className="stat-card" key={s.key}>
              <div className="stat-icon-wrap" style={{ background: s.bg }}>
                <Icon size={24} color={s.color} />
              </div>
              <div className="stat-info">
                <div className="stat-value">
                  {s.format === 'currency' ? formatCurrency(value) : value.toLocaleString('en-IN')}
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {[
          { label: '+ New Bill', icon: Plus, color: '#C9A84C', bg: 'rgba(201,168,76,0.12)', path: '/new-bill' },
          { label: '+ Add Customer', icon: UserPlus, color: '#3b82f6', bg: '#eff6ff', path: '/customers' },
          { label: '+ Add Jewellery', icon: Package, color: '#8b5cf6', bg: '#f3e8ff', path: '/inventory' },
          { label: 'View Bills', icon: Eye, color: '#10b981', bg: '#d1fae5', path: '/bills' },
        ].map((qa) => {
          const Icon = qa.icon;
          return (
            <button key={qa.label} className="quick-action-btn" onClick={() => onNavigate(qa.path)}>
              <div className="qa-icon" style={{ background: qa.bg }}>
                <Icon size={22} color={qa.color} />
              </div>
              <span className="qa-label">{qa.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-grid">
        {/* Recent Invoices */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3>Recent Invoices</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('/bills')}>
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="scroll-hint">
            <span>Scroll horizontally to view details →</span>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockInvoices.slice(0, 6).map((inv) => (
                  <tr key={inv.id}>
                    <td><span className="td-primary">{inv.invoice_number}</span></td>
                    <td>
                      <div className="td-primary">{inv.customer_name}</div>
                      <div className="td-secondary">{inv.customer_phone}</div>
                    </td>
                    <td>{new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td><strong>{formatCurrency(inv.grand_total)}</strong></td>
                    <td><Badge status={inv.payment_status} /></td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-sm" title="View Invoice" onClick={() => handleViewInvoice(inv)}>
                          <Eye size={14} />
                        </button>
                        <button className="btn btn-ghost btn-sm" title="Print" onClick={() => handleViewInvoice(inv)}>
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pending Payments + Metal Rates */}
      <div className="dashboard-grid">
        {/* Pending Payments */}
        <div className="card">
          <div className="card-header">
            <h3>Pending Payments</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('/payments')}>View All</button>
          </div>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Invoice</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockPendingPayments.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div className="td-primary">{p.customer}</div>
                    </td>
                    <td className="td-secondary">{p.invoice}</td>
                    <td><strong style={{ color: '#dc2626' }}>{formatCurrency(p.balance)}</strong></td>
                    <td><Badge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Metal Rates */}
        <div className="card">
          <div className="card-header">
            <h3>Current Metal Rates</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('/metal-rates')}>
              Manage Rates
            </button>
          </div>
          <div className="card-body">
            <div className="metal-rates-grid">
              {mockMetalRates.map((rate) => (
                <div key={rate.id} className="metal-rate-item">
                  <div>
                    <div className="metal-rate-label">{rate.purity} {rate.metal}</div>
                    <div className="metal-rate-purity">per gram</div>
                  </div>
                  <div className="metal-rate-value">{formatCurrency(rate.rate_per_gram)}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
              Last updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <PrintPreviewModal
          invoice={selectedInvoice}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
