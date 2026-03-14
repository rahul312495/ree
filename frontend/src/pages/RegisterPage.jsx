import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.bigIcon}>🛒</div>
          <h1 className={styles.leftTitle}>FreshMart</h1>
          <p className={styles.leftSub}>Join our community of fresh food lovers.</p>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Create account</h2>
          <p className={styles.cardSub}>Start shopping fresh today</p>

          {error && <div className={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Full Name</label>
              <input value={form.name} onChange={set('name')} placeholder="Jane Smith" required />
            </div>
            <div className={styles.field}>
              <label>Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" required />
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required minLength={6} />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Phone</label>
                <input value={form.phone} onChange={set('phone')} placeholder="+1-555-0000" />
              </div>
            </div>
            <div className={styles.field}>
              <label>Address</label>
              <input value={form.address} onChange={set('address')} placeholder="123 Main St, City" />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating…' : 'Create Account →'}
            </button>
          </form>

          <p className={styles.switchLink}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
