import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import { api } from '../context/AuthContext.jsx';
import { formatINR, formatINRShort } from '../utils/currency.js';
import styles from './DashboardPage.module.css';

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Processing: '#8b5cf6',
  Shipped: '#06b6d4',
  Delivered: '#22c55e',
  Cancelled: '#ef4444',
};

const PIE_COLORS = [
  '#22c55e', '#16a34a', '#15803d',
  '#166534', '#4ade80', '#86efac',
  '#f59e0b', '#ef4444'
];

export default function DashboardPage() {

  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        const [ov, rv, cat, os, tp, ls] = await Promise.all([
          api.get('/stats/overview'),
          api.get('/stats/revenue'),
          api.get('/stats/categories'),
          api.get('/stats/order-status'),
          api.get('/stats/top-products'),
          api.get('/products/low-stock')
        ]);

        setOverview(ov.data);
        setRevenue(rv.data);

        setCategories(
          cat.data.map(c => ({
            name: c._id,
            revenue: c.revenue,
            sold: c.itemsSold
          }))
        );

        setOrderStatus(os.data);
        setTopProducts(tp.data);
        setLowStockProducts(ls.data);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }

    };

    loadDashboard();

  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatINRShort(overview?.totalRevenue || 0),
      icon: '💰',
      color: '#22c55e',
      bg: '#f0fdf4'
    },
    {
      label: 'Total Orders',
      value: overview?.totalOrders || 0,
      icon: '📦',
      color: '#3b82f6',
      bg: '#dbeafe'
    },
    {
      label: 'Customers',
      value: overview?.totalCustomers || 0,
      icon: '👥',
      color: '#8b5cf6',
      bg: '#f3e8ff'
    },
    {
      label: 'Products',
      value: overview?.totalProducts || 0,
      icon: '🛍️',
      color: '#f59e0b',
      bg: '#fef3c7'
    },
    {
      label: 'Pending Orders',
      value: overview?.pendingOrders || 0,
      icon: '⏳',
      color: '#ef4444',
      bg: '#fee2e2'
    },
    {
      label: 'Low Stock Items',
      value: overview?.lowStockProducts || 0,
      icon: '⚠️',
      color: '#d97706',
      bg: '#fef3c7'
    },
  ];

  return (
    <div className={styles.page}>

      {/* HEADER */}

      <div className={styles.header}>

        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back! Here's what's happening at RetailFlow.
          </p>
        </div>

        <div className={styles.dateTag}>
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>

      </div>


      {/* STAT CARDS */}

      <div className={styles.statsGrid}>
        {statCards.map((s) => (

          <div
            key={s.label}
            className={styles.statCard}
            style={{ '--card-color': s.color, '--card-bg': s.bg }}
          >

            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>

          </div>

        ))}
      </div>


      {/* CHART ROW */}

      <div className={styles.chartsRow}>

        {/* REVENUE CHART */}

        <div className={styles.chartCard} style={{ flex: 2 }}>

          <div className={styles.chartHeader}>
            <h3>Revenue — Last 7 Days</h3>
          </div>

          <ResponsiveContainer width="100%" height={240}>

            <AreaChart data={revenue}>

              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="date"/>
              <YAxis tickFormatter={(v)=>`₹${v}`}/>

              <Tooltip
                formatter={(v)=>[formatINR(v),'Revenue']}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>


        {/* ORDER STATUS PIE */}

        <div className={styles.chartCard} style={{ flex: 1 }}>

          <div className={styles.chartHeader}>
            <h3>Order Status</h3>
          </div>

          <ResponsiveContainer width="100%" height={240}>

            <PieChart>

              <Pie
                data={orderStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
              >

                {orderStatus.map(entry => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] || '#94a3b8'}
                  />
                ))}

              </Pie>

              <Tooltip/>
              <Legend/>

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* CATEGORY REVENUE */}

      <div className={styles.chartCard}>

        <div className={styles.chartHeader}>
          <h3>Revenue by Category</h3>
        </div>

        <ResponsiveContainer width="100%" height={220}>

          <BarChart data={categories}>

            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="name"/>
            <YAxis tickFormatter={(v)=>`₹${v}`}/>

            <Tooltip
              formatter={(v,name)=>[
                name==='revenue'?formatINR(v):v,
                name==='revenue'?'Revenue':'Units Sold'
              ]}
            />

            <Bar dataKey="revenue" radius={[6,6,0,0]}>
              {categories.map((_,i)=>(
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
              ))}
            </Bar>

          </BarChart>

        </ResponsiveContainer>

      </div>


      {/* TOP SELLING PRODUCTS */}

      <div className={styles.chartCard}>

        <div className={styles.chartHeader}>
          <h3>Top Selling Products</h3>
        </div>

        <table className={styles.table}>

          <thead>
            <tr>
              <th>Product</th>
              <th>Units Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>

          <tbody>
            {topProducts.map((p,i)=>(
              <tr key={i}>
                <td>{p.productName}</td>
                <td>{p.totalSold}</td>
                <td>{formatINR(p.revenue)}</td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>


      {/* LOW STOCK PANEL */}

      <div className={styles.chartCard}>

        <div className={styles.chartHeader}>
          <h3>⚠ Low Stock Products</h3>
        </div>

        <table className={styles.table}>

          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {lowStockProducts.map(p => (

              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.stock}</td>
                <td style={{color:'#ef4444',fontWeight:'bold'}}>
                  Low Stock
                </td>
              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}