import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatINR } from '../utils/currency.js';
import styles from './CustomerShopPage.module.css';

const CATEGORIES = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat & Seafood', 'Beverages', 'Snacks', 'Pantry'];

export default function CustomerShopPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [cart, setCart] = useState({});
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');

  // Address selection
  const [addresses, setAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState('');

  useEffect(() => {
    // Load saved addresses for the checkout dropdown
    api.get('/profile/addresses').then(({ data }) => {
      setAddresses(data);
      const def = data.find(a => a.isDefault);
      if (def) setSelectedAddrId(def._id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { available: true };
        if (filterCat !== 'All') params.category = filterCat;
        if (search) params.search = search;
        const { data } = await api.get('/products', { params });
        setProducts(data);
      } catch { setError('Failed to load products'); }
      finally { setLoading(false); }
    };
    load();
  }, [search, filterCat]);

  const addToCart = (p) => setCart(c => ({ ...c, [p._id]: { ...p, qty: (c[p._id]?.qty || 0) + 1 } }));
  const removeFromCart = (id) => setCart(c => {
    const updated = { ...c };
    if (updated[id]?.qty > 1) updated[id] = { ...updated[id], qty: updated[id].qty - 1 };
    else delete updated[id];
    return updated;
  });
  const clearCart = () => setCart({});

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const selectedAddr = addresses.find(a => a._id === selectedAddrId);
  const deliveryAddressStr = selectedAddr
    ? `${selectedAddr.line}${selectedAddr.city ? ', ' + selectedAddr.city : ''}${selectedAddr.state ? ', ' + selectedAddr.state : ''}${selectedAddr.pincode ? ' - ' + selectedAddr.pincode : ''}`
    : user?.address || '';

  const placeOrder = async () => {
    if (cartItems.length === 0) return;
    setPlacing(true); setError('');
    try {
      const items = cartItems.map(i => ({
        product: i._id, name: i.name, emoji: i.emoji, price: i.price, quantity: i.qty,
      }));
      const { data } = await api.post('/orders', {
        items,
        totalAmount: Math.round(cartTotal * 100) / 100,
        deliveryAddress: deliveryAddressStr,
      });
      setOrderSuccess(data);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed. Please try again.');
    } finally { setPlacing(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Shop Fresh 🛒</h1>
          <p className={styles.subtitle}>Hello, {user?.name?.split(' ')[0]}! What are you shopping for today?</p>
        </div>
      </div>

      {error && <div className={styles.errorBar}>{error} <button onClick={() => setError('')}>✕</button></div>}

      {orderSuccess && (
        <div className={styles.successBanner}>
          <span className={styles.successIcon}>🎉</span>
          <div><strong>Order placed!</strong> Your order <span className={styles.orderNum}>{orderSuccess.orderNumber}</span> has been confirmed.</div>
          <button className={styles.successClose} onClick={() => setOrderSuccess(null)}>✕</button>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.productsPanel}>
          <div className={styles.toolbar}>
            <input className={styles.searchInput} placeholder="🔍  Search products…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className={styles.catPills}>
            {CATEGORIES.map(c => (
              <button key={c} className={`${styles.catPill} ${filterCat === c ? styles.activePill : ''}`} onClick={() => setFilterCat(c)}>{c}</button>
            ))}
          </div>
          {loading ? (
            <div className={styles.grid}>{[...Array(9)].map((_, i) => <div key={i} className={`skeleton ${styles.skCard}`} />)}</div>
          ) : (
            <div className={styles.grid}>
              {products.map(p => {
                const inCart = cart[p._id]?.qty || 0;
                return (
                  <div key={p._id} className={styles.productCard}>
                    <div className={styles.productEmoji}>{p.emoji}</div>
                    <div className={styles.productInfo}>
                      <div className={styles.productName}>{p.name}</div>
                      <div className={styles.productCat}>{p.category}</div>
                      <div className={styles.productPrice}>{formatINR(p.price)} <span>/ {p.unit}</span></div>
                      {p.stock < 10 && <div className={styles.lowStockWarn}>Only {p.stock} left!</div>}
                    </div>
                    <div className={styles.cartControl}>
                      {inCart === 0 ? (
                        <button className={styles.addBtn} onClick={() => addToCart(p)}>Add to Cart</button>
                      ) : (
                        <div className={styles.qtyControl}>
                          <button className={styles.qtyBtn} onClick={() => removeFromCart(p._id)}>−</button>
                          <span className={styles.qtyNum}>{inCart}</span>
                          <button className={styles.qtyBtn} onClick={() => addToCart(p)}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {products.length === 0 && <div className={styles.empty}>No products found in this category.</div>}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className={styles.cartPanel}>
          <div className={styles.cartHeader}>
            <h2 className={styles.cartTitle}>Your Cart</h2>
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </div>

          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyCartIcon}>🛍️</div>
              <p>Your cart is empty</p>
              <span>Add items from the left</span>
            </div>
          ) : (
            <>
              <div className={styles.cartItems}>
                {cartItems.map(item => (
                  <div key={item._id} className={styles.cartItem}>
                    <span className={styles.cartEmoji}>{item.emoji}</span>
                    <div className={styles.cartItemInfo}>
                      <div className={styles.cartItemName}>{item.name}</div>
                      <div className={styles.cartItemPrice}>{formatINR(item.price)} × {item.qty}</div>
                    </div>
                    <div className={styles.cartItemTotal}>{formatINR(item.price * item.qty)}</div>
                    <button className={styles.cartRemove} onClick={() => { const u = { ...cart }; delete u[item._id]; setCart(u); }}>✕</button>
                  </div>
                ))}
              </div>

              {/* Delivery address picker */}
              <div className={styles.addrSection}>
                <div className={styles.addrLabel}>📍 Deliver to</div>
                {addresses.length > 0 ? (
                  <select className={styles.addrSelect} value={selectedAddrId} onChange={e => setSelectedAddrId(e.target.value)}>
                    {addresses.map(a => (
                      <option key={a._id} value={a._id}>
                        {a.label}: {a.line}{a.city ? ', ' + a.city : ''}{a.isDefault ? ' ✦' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className={styles.noAddr}>No saved addresses — <a href="/profile">add one in Profile</a></div>
                )}
              </div>

              <div className={styles.cartFooter}>
                <div className={styles.cartTotalRow}>
                  <span>Subtotal ({cartCount} items)</span>
                  <span className={styles.cartTotalVal}>{formatINR(cartTotal)}</span>
                </div>
                <button className={styles.checkoutBtn} onClick={placeOrder} disabled={placing}>
                  {placing ? 'Placing Order…' : `Place Order · ${formatINR(cartTotal)}`}
                </button>
                <button className={styles.clearBtn} onClick={clearCart}>Clear cart</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

