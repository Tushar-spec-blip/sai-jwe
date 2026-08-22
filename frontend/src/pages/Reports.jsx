import { mockInvoices } from '../data/mockData';
import { formatCurrency } from '../utils/billingCalculator';

function SummaryCard({ title, value, sub, color = 'var(--gold)' }) {
  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '20px 22px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.01em' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Reports() {
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.slice(0, 7);

  const todayInvoices = mockInvoices.filter(inv => inv.invoice_date === today);
  const monthInvoices = mockInvoices.filter(inv => inv.invoice_date.startsWith(thisMonth));
  const todaySales = todayInvoices.reduce((s, inv) => s + inv.grand_total, 0);
  const monthSales = monthInvoices.reduce((s, inv) => s + inv.grand_total, 0);
  const totalSales = mockInvoices.reduce((s, inv) => s + inv.grand_total, 0);
  const totalGST = mockInvoices.reduce((s, inv) => s + inv.gst_amount, 0);
  const pendingAmount = mockInvoices.filter(i => i.payment_status !== 'PAID').reduce((s, i) => s + i.balance_amount, 0);

  const paymentMethods = ['Cash', 'UPI', 'Card', 'Bank Transfer'];
  const paymentTotals = paymentMethods.map(method => ({
    method,
    total: mockInvoices.flatMap(i => i.payments || []).filter(p => p.payment_method === method).reduce((s, p) => s + p.amount, 0),
  }));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Reports</h2>
          <p>Sales and payment summary</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary">📥 Export</button>
        </div>
      </div>

      {/* Sales Summary */}
      <div style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sales Summary</h3>
      </div>
      <div className="quick-actions" style={{ marginBottom: 24 }}>
        <SummaryCard title="Today's Sales" value={formatCurrency(todaySales)} sub={`${todayInvoices.length} bills today`} color="var(--gold-dark)" />
        <SummaryCard title="This Month" value={formatCurrency(monthSales)} sub={`${monthInvoices.length} bills this month`} color="#3b82f6" />
        <SummaryCard title="Total Sales" value={formatCurrency(totalSales)} sub={`${mockInvoices.length} total bills`} color="#8b5cf6" />
        <SummaryCard title="Pending Amount" value={formatCurrency(pendingAmount)} sub="To be collected" color="#dc2626" />
      </div>

      <div className="dashboard-grid">
        {/* Payment Methods Breakdown */}
        <div className="card">
          <div className="card-header"><h3>Payment Methods</h3></div>
          <div className="card-body">
            {paymentTotals.map(({ method, total }) => (
              <div key={method} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{method}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold-dark)' }}>{formatCurrency(total)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* GST Summary */}
        <div className="card">
          <div className="card-header"><h3>GST Summary</h3></div>
          <div className="card-body">
            <div style={{ padding: '20px', background: 'var(--cream)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Total GST Collected</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold-dark)', fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.01em' }}>{formatCurrency(totalGST)}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mockInvoices.map(inv => (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>{inv.invoice_number}</span>
                  <span>{inv.gst_rate}% → {formatCurrency(inv.gst_amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice History Table */}
      <div className="card">
        <div className="card-header"><h3>Invoice Summary</h3></div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <div className="scroll-hint">
            <span>Scroll horizontally to view details →</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Subtotal</th>
                <th>GST</th>
                <th>Grand Total</th>
                <th>Paid</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map(inv => (
                <tr key={inv.id}>
                  <td className="td-primary">{inv.invoice_number}</td>
                  <td style={{ fontSize: 12 }}>{new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>{inv.customer_name}</td>
                  <td>{formatCurrency(inv.subtotal)}</td>
                  <td style={{ color: '#16a34a' }}>{formatCurrency(inv.gst_amount)}</td>
                  <td><strong>{formatCurrency(inv.grand_total)}</strong></td>
                  <td style={{ color: '#16a34a' }}>{formatCurrency(inv.paid_amount)}</td>
                  <td style={{ color: inv.balance_amount > 0 ? '#dc2626' : '#16a34a' }}>{formatCurrency(inv.balance_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
