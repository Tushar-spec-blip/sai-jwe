export function Badge({ status }) {
  const statusMap = {
    PAID: 'badge-paid',
    PARTIAL: 'badge-partial',
    PENDING: 'badge-pending',
    AVAILABLE: 'badge-available',
    SOLD: 'badge-sold',
  };
  const cls = statusMap[status] || 'badge-gold';
  return <span className={`badge ${cls}`}>{status}</span>;
}

export function StatusBadge({ status }) {
  return <Badge status={status} />;
}
