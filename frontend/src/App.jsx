import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Layout from './components/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import CustomerShopPage from './pages/CustomerShopPage.jsx';
import MyOrdersPage from './pages/MyOrdersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontSize:32 }}>🛒</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/shop" replace />;
  return children;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/dashboard' : '/shop'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<HomeRedirect />} />

        {/* Admin routes */}
        <Route path="dashboard"  element={<AdminRoute><DashboardPage /></AdminRoute>} />
        <Route path="products"   element={<AdminRoute><ProductsPage /></AdminRoute>} />
        <Route path="orders"     element={<AdminRoute><OrdersPage /></AdminRoute>} />
        <Route path="customers"  element={<AdminRoute><CustomersPage /></AdminRoute>} />

        {/* Customer routes */}
        <Route path="shop"       element={<PrivateRoute><CustomerShopPage /></PrivateRoute>} />
        <Route path="my-orders"  element={<PrivateRoute><MyOrdersPage /></PrivateRoute>} />
        <Route path="profile"    element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
