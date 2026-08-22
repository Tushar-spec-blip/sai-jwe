import { Badge } from '../components/common/Badge';
import { mockInvoices } from '../data/mockData';
import { formatCurrency } from '../utils/billingCalculator';

export default function Payments() {
  const allPayments = mockInvoices.flatMap(inv =>
    (inv.payments || []).map(p => ({
      ...p,
      invoice_number: inv.invoice_number,
      customer_name: inv.customer_name,
      payment_status: inv.payment_status,
      invoice_date: inv.invoice_date,
    }))
  );

  const totalCash = allPayments.filter(p => p.payment_method === 'Cash').reduce((s, p) => s + p.amount, 0);
  const totalUPI = allPayments.filter(p => p.payment_method === 'UPI').reduce((s, p) => s + p.amount, 0);
  const totalCard = allPayments.filter(p => p.payment_method === 'Card').reduce((s, p) => s + p.amount, 0);
  const totalBank = allPayments.filter(p => p.payment_method === 'Bank Transfer').reduce((s, p) => s + p.amount, 0);

  const summaryStats = [
    { label: 'Cash', amount: totalCash, color: '#16a34a', bg: '#dcfce7' },
    { label: 'UPI', amount: totalUPI, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Card', amount: totalCard, color: '#8b5cf6', bg: '#f3e8ff' },
    { label: 'Bank Transfer', amount: totalBank, color: '#d97706', bg: '#fef3c7' },
  ];

  const pendingInvoices = mockInvoices.filter(inv => inv.payment_status !== 'PAID');

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Payments</h2>
          <p>Payment records and pending collections</p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="quick-actions" style={{ marginBottom: 24 }}>
        {summaryStats.map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '18px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.01em' }}>{formatCurrency(s.amount)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* All Payments */}
        <div className="card">
          <div className="card-header"><h3>Payment Records</h3></div>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {allPayments.map((p, i) => (
                  <tr key={i}>
                    <td className="td-primary">{p.invoice_number}</td>
                    <td style={{ fontSize: 13 }}>{p.customer_name}</td>
                    <td>
                      <span className="badge badge-gold">{p.payment_method}</span>
                    </td>
                    <td><strong>{formatCurrency(p.amount)}</strong></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(p.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Collections */}
        <div className="card">
          <div className="card-header"><h3>Pending Collections</h3></div>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="td-primary">{inv.invoice_number}</td>
                    <td style={{ fontSize: 13 }}>{inv.customer_name}</td>
                    <td style={{ fontSize: 13 }}>{formatCurrency(inv.grand_total)}</td>
                    <td><strong style={{ color: '#dc2626' }}>{formatCurrency(inv.balance_amount)}</strong></td>
                    <td><Badge status={inv.payment_status} /></td>
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
