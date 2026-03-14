import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext.jsx';
import { formatINR } from '../utils/currency.js';
import styles from './ProductsPage.module.css';

const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat & Seafood', 'Beverages', 'Snacks', 'Pantry'];
const UNITS = ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'dozen'];
const EMPTY = { name: '', category: 'Fruits', price: '', stock: '', unit: 'kg', emoji: '🛒', description: '', isAvailable: true };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    const params = {};
    if (filterCat) params.category = filterCat;
    if (search) params.search = search;
    try {
      const { data } = await api.get('/products', { params });
      setProducts(data);
    } catch (err) { setError('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [search, filterCat]);

  const openAdd = () => { setForm(EMPTY); setEditProduct(null); setShowModal(true); };
  const openEdit = (p) => { setForm({ ...p, price: p.price.toString(), stock: p.stock.toString() }); setEditProduct(p); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditProduct(null); setForm(EMPTY); };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) return;
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
      if (editProduct) {
        const { data } = await api.put(`/products/${editProduct._id}`, payload);
        setProducts(products.map(p => p._id === data._id ? data : p));
      } else {
        const { data } = await api.post('/products', payload);
        setProducts([data, ...products]);
      }
      closeModal();
    } catch (err) { setError(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      setDeleteId(null);
    } catch (err) { setError('Delete failed'); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>{products.length} items in inventory</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>+ Add Product</button>
      </div>

      {error && <div className={styles.errorBar}>{error} <button onClick={() => setError('')}>✕</button></div>}

      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="🔍  Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.select} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className={styles.skeletonGrid}>{[...Array(8)].map((_, i) => <div key={i} className={`skeleton ${styles.skCard}`} />)}</div>
      ) : (
        <div className={styles.grid}>
          {products.map(p => (
            <div key={p._id} className={`${styles.card} ${!p.isAvailable ? styles.unavailable : ''}`}>
              <div className={styles.cardEmoji}>{p.emoji}</div>
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{p.name}</div>
                <div className={styles.cardMeta}>
                  <span className={styles.catBadge}>{p.category}</span>
                  <span className={`${styles.stockBadge} ${p.stock < 10 ? styles.lowStock : ''}`}>
                    {p.stock < 10 ? '⚠️ ' : ''}{p.stock} {p.unit}
                  </span>
                </div>
                <div className={styles.cardPrice}>{formatINR(p.price)} <span>/ {p.unit}</span></div>
                {p.description && <p className={styles.cardDesc}>{p.description}</p>}
              </div>
              <div className={styles.cardActions}>
                <button className={styles.editBtn} onClick={() => openEdit(p)}>Edit</button>
                <button className={styles.deleteBtn} onClick={() => setDeleteId(p._id)}>Delete</button>
              </div>
            </div>
          ))}
          {products.length === 0 && <div className={styles.empty}>No products found. <button onClick={openAdd}>Add one?</button></div>}
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Name *</label>
                  <input value={form.name} onChange={set('name')} placeholder="Product name" />
                </div>
                <div className={styles.field} style={{ flex: '0 0 80px' }}>
                  <label>Emoji</label>
                  <input value={form.emoji} onChange={set('emoji')} maxLength={4} style={{ textAlign: 'center', fontSize: 22 }} />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Category *</label>
                  <select value={form.category} onChange={set('category')}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Unit</label>
                  <select value={form.unit} onChange={set('unit')}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Price (₹) *</label>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00" />
                </div>
                <div className={styles.field}>
                  <label>Stock *</label>
                  <input type="number" min="0" value={form.stock} onChange={set('stock')} placeholder="0" />
                </div>
              </div>
              <div className={styles.field}>
                <label>Description</label>
                <input value={form.description} onChange={set('description')} placeholder="Short description…" />
              </div>
              <div className={styles.field}>
                <label>
                  <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} />
                  {' '}Available for sale
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className={styles.overlay} onClick={() => setDeleteId(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <h3>Delete product?</h3>
            <p>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.deleteBtn} style={{ flex: 1, padding: '10px' }} onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
