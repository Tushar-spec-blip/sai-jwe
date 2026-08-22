import { useState } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, Phone, MapPin, User } from 'lucide-react';
import { Modal, ConfirmModal } from '../components/common/Modal';
import { mockCustomers } from '../data/mockData';

function CustomerForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    phone: initial.phone || '',
    address: initial.address || '',
    gstin: initial.gstin || '',
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <div className="form-row" style={{ marginBottom: 14 }}>
        <div className="form-group">
          <label className="form-label">Name <span className="required">*</span></label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Customer name" required />
        </div>
        <div className="form-group">
          <label className="form-label">Phone <span className="required">*</span></label>
          <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone number" required />
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 14 }}>
        <label className="form-label">Address</label>
        <textarea className="form-textarea" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Customer address" rows={2} />
      </div>
      <div className="form-group" style={{ marginBottom: 20 }}>
        <label className="form-label">GSTIN <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
        <input className="form-input" value={form.gstin} onChange={e => set('gstin', e.target.value)} placeholder="GST number if applicable" />
      </div>
      <div className="modal-footer" style={{ padding: '0', border: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary">
          {initial.id ? 'Save Changes' : 'Add Customer'}
        </button>
      </div>
    </form>
  );
}

function ViewCustomerModal({ customer, onClose, onEdit }) {
  return (
    <Modal isOpen={!!customer} onClose={onClose} title="Customer Details">
      {customer && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, background: 'rgba(201,168,76,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={28} color="var(--gold)" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{customer.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Customer ID: #{customer.id}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <Phone size={16} color="var(--text-muted)" />
              <span>{customer.phone}</span>
            </div>
            {customer.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: 'var(--cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <MapPin size={16} color="var(--text-muted)" style={{ marginTop: 2 }} />
                <span>{customer.address}</span>
              </div>
            )}
            {customer.gstin && (
              <div style={{ padding: '10px 14px', background: 'var(--cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>GSTIN: </span><strong>{customer.gstin}</strong>
              </div>
            )}
            <div style={{ padding: '10px 14px', background: 'var(--cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: 12, color: 'var(--text-muted)' }}>
              Member since: {new Date(customer.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '16px 0 0', border: 'none' }}>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={onEdit}>Edit Customer</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    String(c.id).includes(search)
  );

  const handleAdd = (form) => {
    const newC = { ...form, id: Date.now(), created_at: new Date().toISOString() };
    setCustomers(prev => [newC, ...prev]);
    setShowAdd(false);
  };

  const handleEdit = (form) => {
    setCustomers(prev => prev.map(c => c.id === editTarget.id ? { ...c, ...form } : c));
    setEditTarget(null);
  };

  const handleDelete = () => {
    setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Customers</h2>
          <p>{customers.length} customers registered</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add Customer
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <Search />
            <input
              placeholder="Search by name, phone or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} results</span>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <User size={48} />
              <h3>No customers found</h3>
              <p>Try adjusting your search, or add a new customer</p>
            </div>
          ) : (
            <>
              <div className="scroll-hint">
                <span>Scroll horizontally to view details →</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>GSTIN</th>
                    <th>Since</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{c.id}</td>
                      <td>
                        <div className="td-primary">{c.name}</div>
                      </td>
                      <td>{c.phone}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: 12 }}>
                        {c.address || '—'}
                      </td>
                      <td style={{ fontSize: 12 }}>{c.gstin || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-ghost btn-sm" title="View" onClick={() => setViewTarget(c)}><Eye size={14} /></button>
                          <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => setEditTarget(c)}><Pencil size={14} /></button>
                          <button className="btn btn-danger btn-sm" title="Delete" onClick={() => setDeleteTarget(c)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Customer">
        <CustomerForm onSave={handleAdd} onClose={() => setShowAdd(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Customer">
        {editTarget && <CustomerForm initial={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} />}
      </Modal>

      {/* View Modal */}
      <ViewCustomerModal
        customer={viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={() => { setEditTarget(viewTarget); setViewTarget(null); }}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
