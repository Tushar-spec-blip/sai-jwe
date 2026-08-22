import { useState } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, Package } from 'lucide-react';
import { Modal, ConfirmModal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { mockProducts } from '../data/mockData';

const CATEGORIES = ['Ring', 'Chain', 'Necklace', 'Bracelet', 'Earrings', 'Bangle', 'Pendant', 'Other'];
const METALS = ['Gold', 'Silver', 'Platinum'];
const PURITIES = ['24K', '22K', '18K', '14K', '999', 'Other'];

function ProductForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    item_code: initial.item_code || '',
    name: initial.name || '',
    category: initial.category || 'Ring',
    metal: initial.metal || 'Gold',
    purity: initial.purity || '22K',
    gross_weight: initial.gross_weight || '',
    stone_weight: initial.stone_weight || 0,
    making_charge: initial.making_charge || '',
    wastage_percent: initial.wastage_percent || 0,
    status: initial.status || 'AVAILABLE',
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const netWeight = Math.max(0, (parseFloat(form.gross_weight) || 0) - (parseFloat(form.stone_weight) || 0));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, net_weight: netWeight }); }}>
      <div className="form-row" style={{ marginBottom: 14 }}>
        <div className="form-group">
          <label className="form-label">Item Code <span className="required">*</span></label>
          <input className="form-input" value={form.item_code} onChange={e => set('item_code', e.target.value)} placeholder="e.g. RNG-001" required />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Product Name <span className="required">*</span></label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Gold Ring - Floral Design" required />
        </div>
      </div>
      <div className="form-row" style={{ marginBottom: 14 }}>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Metal</label>
          <select className="form-select" value={form.metal} onChange={e => set('metal', e.target.value)}>
            {METALS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Purity</label>
          <select className="form-select" value={form.purity} onChange={e => set('purity', e.target.value)}>
            {PURITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row" style={{ marginBottom: 14 }}>
        <div className="form-group">
          <label className="form-label">Gross Weight (g) <span className="required">*</span></label>
          <input className="form-input" type="number" step="0.001" value={form.gross_weight} onChange={e => set('gross_weight', e.target.value)} placeholder="0.000" required />
        </div>
        <div className="form-group">
          <label className="form-label">Stone Weight (g)</label>
          <input className="form-input" type="number" step="0.001" value={form.stone_weight} onChange={e => set('stone_weight', e.target.value)} placeholder="0.000" />
        </div>
        <div className="form-group">
          <label className="form-label">Net Weight (g)</label>
          <input className="form-input" value={netWeight.toFixed(3)} disabled />
        </div>
      </div>
      <div className="form-row" style={{ marginBottom: 14 }}>
        <div className="form-group">
          <label className="form-label">Making Charge (Rs.)</label>
          <input className="form-input" type="number" step="1" value={form.making_charge} onChange={e => set('making_charge', e.target.value)} placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label">Wastage %</label>
          <input className="form-input" type="number" step="0.1" value={form.wastage_percent} onChange={e => set('wastage_percent', e.target.value)} placeholder="0.0" />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            <option>AVAILABLE</option>
            <option>SOLD</option>
          </select>
        </div>
      </div>
      <div className="modal-footer" style={{ padding: '0', border: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary">
          {initial.id ? 'Save Changes' : 'Add Jewellery'}
        </button>
      </div>
    </form>
  );
}

export default function Inventory() {
  const [products, setProducts] = useState(mockProducts);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMetal, setFilterMetal] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.item_code.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || p.category === filterCategory;
    const matchMetal = !filterMetal || p.metal === filterMetal;
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchCat && matchMetal && matchStatus;
  });

  const handleAdd = (form) => {
    setProducts(prev => [{ ...form, id: Date.now(), created_at: new Date().toISOString() }, ...prev]);
    setShowAdd(false);
  };

  const handleEdit = (form) => {
    setProducts(prev => prev.map(p => p.id === editTarget.id ? { ...p, ...form } : p));
    setEditTarget(null);
  };

  const handleDelete = () => {
    setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Jewellery Inventory</h2>
          <p>{products.length} items — {products.filter(p => p.status === 'AVAILABLE').length} available, {products.filter(p => p.status === 'SOLD').length} sold</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add Jewellery
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ gap: 10, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ maxWidth: 280 }}>
            <Search />
            <input placeholder="Search item code or name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
            <select className="form-select" style={{ width: 'auto', minWidth: 130, padding: '8px 32px 8px 12px' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="form-select" style={{ width: 'auto', minWidth: 110, padding: '8px 32px 8px 12px' }} value={filterMetal} onChange={e => setFilterMetal(e.target.value)}>
              <option value="">All Metals</option>
              {METALS.map(m => <option key={m}>{m}</option>)}
            </select>
            <select className="form-select" style={{ width: 'auto', minWidth: 120, padding: '8px 32px 8px 12px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option>AVAILABLE</option>
              <option>SOLD</option>
            </select>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} items</span>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <h3>No items found</h3>
              <p>Try adjusting your filters or add new jewellery</p>
            </div>
          ) : (
            <>
              <div className="scroll-hint">
                <span>Scroll horizontally to view details →</span>
              </div>
              <table>
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Metal</th>
                  <th>Purity</th>
                  <th>Gross Wt.</th>
                  <th>Stone Wt.</th>
                  <th>Net Wt.</th>
                  <th>Making (Rs.)</th>
                  <th>Wastage %</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td><span className="td-primary" style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.item_code}</span></td>
                    <td><div className="td-primary">{p.name}</div></td>
                    <td style={{ fontSize: 12 }}>{p.category}</td>
                    <td style={{ fontSize: 12 }}>{p.metal}</td>
                    <td><span className="badge badge-gold">{p.purity}</span></td>
                    <td style={{ fontSize: 12 }}>{p.gross_weight}g</td>
                    <td style={{ fontSize: 12 }}>{p.stone_weight}g</td>
                    <td style={{ fontSize: 12, fontWeight: 600 }}>{p.net_weight}g</td>
                    <td style={{ fontSize: 12 }}>Rs. {p.making_charge.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: 12 }}>{p.wastage_percent}%</td>
                    <td><Badge status={p.status} /></td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-sm" title="View" onClick={() => setViewTarget(p)}><Eye size={14} /></button>
                        <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => setEditTarget(p)}><Pencil size={14} /></button>
                        <button className="btn btn-danger btn-sm" title="Delete" onClick={() => setDeleteTarget(p)}><Trash2 size={14} /></button>
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

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Jewellery" size="modal-lg">
        <ProductForm onSave={handleAdd} onClose={() => setShowAdd(false)} />
      </Modal>
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Jewellery" size="modal-lg">
        {editTarget && <ProductForm initial={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} />}
      </Modal>
      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="Jewellery Details">
        {viewTarget && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              {[
                ['Item Code', viewTarget.item_code],
                ['Category', viewTarget.category],
                ['Metal', viewTarget.metal],
                ['Purity', viewTarget.purity],
                ['Gross Weight', `${viewTarget.gross_weight} g`],
                ['Stone Weight', `${viewTarget.stone_weight} g`],
                ['Net Weight', `${viewTarget.net_weight} g`],
                ['Making Charge', `Rs. ${viewTarget.making_charge?.toLocaleString('en-IN')}`],
                ['Wastage', `${viewTarget.wastage_percent}%`],
                ['Status', viewTarget.status],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: '10px 14px', background: 'var(--cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{viewTarget.name}</div>
            <div className="modal-footer" style={{ padding: '16px 0 0', border: 'none' }}>
              <button className="btn btn-secondary" onClick={() => setViewTarget(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setEditTarget(viewTarget); setViewTarget(null); }}>Edit</button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Jewellery Item"
        message={`Remove "${deleteTarget?.name}" from inventory? This cannot be undone.`}
      />
    </div>
  );
}
