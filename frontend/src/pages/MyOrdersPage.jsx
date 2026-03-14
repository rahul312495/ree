import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext.jsx';
import { formatINR } from '../utils/currency.js';
import styles from './MyOrdersPage.module.css';

const STATUS_COLORS = {
  Pending:    { bg: '#fef3c7', text: '#d97706', icon: '⏳' },
  Confirmed:  { bg: '#dbeafe', text: '#2563eb', icon: '✅' },
  Processing: { bg: '#ede9fe', text: '#7c3aed', icon: '⚙️' },
  Shipped:    { bg: '#cffafe', text: '#0891b2', icon: '🚚' },
  Delivered:  { bg: '#dcfce7', text: '#16a34a', icon: '🎉' },
  Cancelled:  { bg: '#fee2e2', text: '#dc2626', icon: '❌' },
};

const STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStepIndex = (status) => STEPS.indexOf(status);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Orders</h1>
        <p className={styles.subtitle}>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
      </div>

      {loading ? (
        <div className={styles.loadingArea}>
          {[...Array(3)].map((_, i) => <div key={i} className={`skeleton ${styles.skCard}`} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📦</div>
          <h2>No orders yet</h2>
          <p>Start shopping to place your first order!</p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map(order => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
            const stepIdx = getStepIndex(order.status);
            const isCancelled = order.status === 'Cancelled';
            const isExpanded = expanded === order._id;

            return (
              <div key={order._id} className={styles.orderCard}>
                {/* Card header */}
                <div className={styles.cardHeader} onClick={() => setExpanded(isExpanded ? null : order._id)}>
                  <div className={styles.cardLeft}>
                    <span className={styles.orderNum}>{order.orderNumber}</span>
                    <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className={styles.cardRight}>
                    <span className={styles.orderTotal}>{formatINR(order.totalAmount)}</span>
                    <span className={styles.statusBadge} style={{ background: sc.bg, color: sc.text }}>
                      {sc.icon} {order.status}
                    </span>
                    <span className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Progress tracker */}
                {!isCancelled && (
                  <div className={styles.progress}>
                    {STEPS.map((step, i) => (
                      <div key={step} className={styles.progressStep}>
                        <div className={`${styles.stepDot} ${i <= stepIdx ? styles.stepDone : ''} ${i === stepIdx ? styles.stepActive : ''}`}>
                          {i < stepIdx ? '✓' : i === stepIdx ? STATUS_COLORS[step]?.icon : ''}
                        </div>
                        <div className={`${styles.stepLabel} ${i <= stepIdx ? styles.stepLabelDone : ''}`}>{step}</div>
                        {i < STEPS.length - 1 && (
                          <div className={`${styles.stepLine} ${i < stepIdx ? styles.stepLineDone : ''}`} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isCancelled && (
                  <div className={styles.cancelledBanner}>❌ This order was cancelled.</div>
                )}

                {/* Expanded items */}
                {isExpanded && (
                  <div className={styles.itemsSection}>
                    <div className={styles.itemsSectionTitle}>Order Items</div>
                    <div className={styles.itemsList}>
                      {order.items?.map((item, i) => (
                        <div key={i} className={styles.item}>
                          <span className={styles.itemEmoji}>{item.emoji}</span>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemQty}>×{item.quantity}</span>
                          <span className={styles.itemPrice}>{formatINR(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    {order.deliveryAddress && (
                      <div className={styles.deliveryAddr}>📍 Delivering to: {order.deliveryAddress}</div>
                    )}
                    <div className={styles.totalRow}>
                      <span>Total</span>
                      <span className={styles.totalVal}>{formatINR(order.totalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
