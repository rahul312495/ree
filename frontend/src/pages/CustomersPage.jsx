import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext.jsx';
import { formatINR } from '../utils/currency.js';
import styles from './CustomersPage.module.css';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', { params: search ? { search } : {} });
      setCustomers(data);
    } catch (err) { setError('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, [search]);

  const openDetail = async (c) => {
    setSelected(c);
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/customers/${c._id}`);
      setSelectedDetail(data);
    } catch { setSelectedDetail(c); }
    finally { setDetailLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/customers/${id}`);
      setCustomers(customers.filter(c => c._id !== id));
      setDeleteId(null);
      if (selected?._id === id) { setSelected(null); setSelectedDetail(null); }
    } catch { setError('Delete failed'); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>{customers.length} registered customers</p>
        </div>
      </div>

      {error && <div className={styles.errorBar}>{error} <button onClick={() => setError('')}>✕</button></div>}

      <div className={styles.layout}>
        <div className={styles.listPanel}>
          <input className={styles.searchInput} placeholder="🔍  Search customers…" value={search} onChange={e => setSearch(e.target.value)} />
          {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className={`skeleton ${styles.skItem}`} />)
          ) : (
            <div className={styles.list}>
              {customers.map(c => (
                <div key={c._id} className={`${styles.customerItem} ${selected?._id === c._id ? styles.activeItem : ''}`} onClick={() => openDetail(c)}>
                  <div className={styles.avatar}>{c.name[0].toUpperCase()}</div>
                  <div className={styles.custInfo}>
                    <div className={styles.custName}>{c.name}</div>
                    <div className={styles.custEmail}>{c.email}</div>
                  </div>
                  <div className={styles.custStats}>
                    <div className={styles.statVal}>{c.orderCount}</div>
                    <div className={styles.statLbl}>orders</div>
                  </div>
                </div>
              ))}
              {customers.length === 0 && <div className={styles.empty}>No customers found</div>}
            </div>
          )}
        </div>

        <div className={styles.detailPanel}>
          {!selected ? (
            <div className={styles.noSelection}><div className={styles.noSelIcon}>👥</div><p>Select a customer to view details</p></div>
          ) : detailLoading ? (
            <div className={styles.detailLoading}><div className={styles.spinner} /></div>
          ) : selectedDetail ? (
            <div className={styles.detail} key={selected._id}>
              <div className={styles.detailHeader}>
                <div className={styles.detailAvatar}>{selectedDetail.name[0].toUpperCase()}</div>
                <div>
                  <h2 className={styles.detailName}>{selectedDetail.name}</h2>
                  <div className={styles.detailEmail}>{selectedDetail.email}</div>
                </div>
                <button className={styles.delBtn} onClick={() => setDeleteId(selectedDetail._id)}>🗑️</button>
              </div>

              <div className={styles.detailStats}>
                <div className={styles.dStat}>
                  <div className={styles.dStatVal}>{selectedDetail.orderCount ?? selectedDetail.orders?.length ?? 0}</div>
                  <div className={styles.dStatLbl}>Orders</div>
                </div>
                <div className={styles.dStat}>
                  <div className={styles.dStatVal}>{formatINR(selectedDetail.totalSpent || 0)}</div>
                  <div className={styles.dStatLbl}>Total Spent</div>
                </div>
                <div className={styles.dStat}>
                  <div className={styles.dStatVal}>{new Date(selectedDetail.createdAt).toLocaleDateString('en-IN')}</div>
                  <div className={styles.dStatLbl}>Joined</div>
                </div>
              </div>

              <div className={styles.detailFields}>
                {selectedDetail.phone && <div className={styles.detailField}><span className={styles.fieldIcon}>📞</span><span>{selectedDetail.phone}</span></div>}
                {/* Show all saved addresses */}
                {selectedDetail.addresses?.length > 0
                  ? selectedDetail.addresses.map((a, i) => (
                      <div key={i} className={styles.detailField}>
                        <span className={styles.fieldIcon}>📍</span>
                        <span>{a.label}: {a.line}{a.city ? `, ${a.city}` : ''}{a.state ? `, ${a.state}` : ''}{a.pincode ? ` - ${a.pincode}` : ''}{a.isDefault ? ' ✦' : ''}</span>
                      </div>
                    ))
                  : selectedDetail.address && <div className={styles.detailField}><span className={styles.fieldIcon}>📍</span><span>{selectedDetail.address}</span></div>
                }
              </div>

              {selectedDetail.orders?.length > 0 && (
                <div className={styles.orderHistory}>
                  <h3 className={styles.orderHistTitle}>Order History</h3>
                  <div className={styles.orderList}>
                    {selectedDetail.orders.map(o => (
                      <div key={o._id} className={styles.orderItem}>
                        <div>
                          <div className={styles.orderNum}>{o.orderNumber}</div>
                          <div className={styles.orderDate}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                        </div>
                        <span className={styles.orderStatus} style={{
                          background: { Pending:'#fef3c7',Confirmed:'#dbeafe',Processing:'#ede9fe',Shipped:'#cffafe',Delivered:'#dcfce7',Cancelled:'#fee2e2' }[o.status],
                          color: { Pending:'#d97706',Confirmed:'#2563eb',Processing:'#7c3aed',Shipped:'#0891b2',Delivered:'#16a34a',Cancelled:'#dc2626' }[o.status],
                        }}>{o.status}</span>
                        <div className={styles.orderTotal}>{formatINR(o.totalAmount)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {deleteId && (
        <div className={styles.overlay} onClick={() => setDeleteId(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <h3>Delete customer?</h3>
            <p>All their data will be permanently removed.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.delConfirmBtn} onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
