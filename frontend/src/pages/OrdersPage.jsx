import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext.jsx';
import { formatINR } from '../utils/currency.js';
import styles from './OrdersPage.module.css';

const STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_COLORS = {
  Pending:    { bg: '#fef3c7', text: '#d97706' },
  Confirmed:  { bg: '#dbeafe', text: '#2563eb' },
  Processing: { bg: '#ede9fe', text: '#7c3aed' },
  Shipped:    { bg: '#cffafe', text: '#0891b2' },
  Delivered:  { bg: '#dcfce7', text: '#16a34a' },
  Cancelled:  { bg: '#fee2e2', text: '#dc2626' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/orders');
        setOrders(data);
      } catch (err) { setError('Failed to load orders'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status });
      setOrders(orders.map(o => o._id === id ? { ...o, status: data.status } : o));
    } catch (err) { setError('Status update failed'); }
    finally { setUpdatingId(null); }
  };

  const deleteOrder = async (id) => {
    try {
      await api.delete(`/orders/${id}`);
      setOrders(orders.filter(o => o._id !== id));
      setDeleteId(null);
    } catch (err) { setError('Delete failed'); }
  };

  const filtered = filter ? orders.filter(o => o.status === filter) : orders;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>{orders.length} total orders</p>
        </div>
      </div>

      {error && <div className={styles.errorBar}>{error} <button onClick={() => setError('')}>✕</button></div>}

      <div className={styles.filters}>
        <button className={`${styles.filterBtn} ${!filter ? styles.active : ''}`} onClick={() => setFilter('')}>All ({orders.length})</button>
        {STATUSES.map(s => {
          const count = orders.filter(o => o.status === s).length;
          return (
            <button key={s} className={`${styles.filterBtn} ${filter === s ? styles.active : ''}`} onClick={() => setFilter(s)}
              style={filter === s ? { background: STATUS_COLORS[s].bg, color: STATUS_COLORS[s].text, borderColor: STATUS_COLORS[s].text + '40' } : {}}>
              {s} {count > 0 && <span className={styles.count}>{count}</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className={styles.loadingArea}>{[...Array(5)].map((_, i) => <div key={i} className={`skeleton ${styles.skRow}`} />)}</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Order</span><span>Customer</span><span>Items</span><span>Total</span><span>Status</span><span>Date</span><span>Actions</span>
          </div>
          {filtered.map(order => {
            const sc = STATUS_COLORS[order.status];
            return (
              <div key={order._id} className={styles.tableGroup}>
                <div className={styles.tableRow}>
                  <span className={styles.orderNum}>{order.orderNumber}</span>
                  <span className={styles.customerCell}>
                    <div className={styles.custAvatar}>{order.customer?.name?.[0]}</div>
                    <div>
                      <div className={styles.custName}>{order.customer?.name || 'Unknown'}</div>
                      <div className={styles.custEmail}>{order.customer?.email}</div>
                    </div>
                  </span>
                  <span className={styles.itemCount}>
                    <button className={styles.expandBtn} onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} {expanded === order._id ? '▲' : '▼'}
                    </button>
                  </span>
                  <span className={styles.total}>{formatINR(order.totalAmount)}</span>
                  <span>
                    <select className={styles.statusSelect} value={order.status}
                      onChange={e => updateStatus(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                      style={{ background: sc.bg, color: sc.text }}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </span>
                  <span className={styles.date}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                  <span><button className={styles.delBtn} onClick={() => setDeleteId(order._id)}>🗑️</button></span>
                </div>
                {expanded === order._id && (
                  <div className={styles.itemsList}>
                    {order.items?.map((item, i) => (
                      <div key={i} className={styles.itemRow}>
                        <span>{item.emoji} {item.name}</span>
                        <span>×{item.quantity}</span>
                        <span>{formatINR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.deliveryAddress && <div className={styles.deliveryAddr}>📍 {order.deliveryAddress}</div>}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <div className={styles.empty}>No orders with status "{filter}"</div>}
        </div>
      )}

      {deleteId && (
        <div className={styles.overlay} onClick={() => setDeleteId(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <h3>Delete this order?</h3>
            <p>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.delConfirmBtn} onClick={() => deleteOrder(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
