import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Layout.module.css';

const adminNav = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/products', icon: '🛍️', label: 'Products' },
  { to: '/orders', icon: '📦', label: 'Orders' },
  { to: '/customers', icon: '👥', label: 'Customers' },
];

const customerNav = [
  { to: '/shop', icon: '🛒', label: 'Shop' },
  { to: '/my-orders', icon: '📦', label: 'My Orders' },
  { to: '/profile', icon: '👤', label: 'My Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminNav : customerNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🛒</span>
          <div>
            <div className={styles.brandName}>RetailFlow</div>
            <div className={styles.brandSub}>{isAdmin ? 'Admin Portal' : 'My Account'}</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name}</div>
            <div className={styles.userRole}>{user?.role}</div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">↩</button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
