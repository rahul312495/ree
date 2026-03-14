import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './ProfilePage.module.css';

const LABEL_OPTIONS = ['Home', 'Work', 'Other'];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Personal Details
// ─────────────────────────────────────────────────────────────────────────────
function PersonalDetails({ profile, onSaved }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text }

  useEffect(() => {
    if (profile) setForm({ name: profile.name || '', phone: profile.phone || '', email: profile.email || '' });
  }, [profile]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async () => {
    setSaving(true); setMsg(null);
    try {
      const { data } = await api.put('/profile', form);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      onSaved(data.user);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>👤</span>
        <div>
          <h2 className={styles.cardTitle}>Personal Details</h2>
          <p className={styles.cardSub}>Update your name, email and phone number</p>
        </div>
      </div>

      {msg && (
        <div className={`${styles.alert} ${msg.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.label}>Full Name</label>
          <input className={styles.input} value={form.name} onChange={set('name')} placeholder="Your full name" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Phone Number</label>
          <input className={styles.input} value={form.phone} onChange={set('phone')} placeholder="+91 XXXXX XXXXX" />
        </div>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label}>Email Address</label>
          <input className={styles.input} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Change Password
// ─────────────────────────────────────────────────────────────────────────────
function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async () => {
    if (form.newPassword !== form.confirm) {
      setMsg({ type: 'error', text: 'New passwords do not match' }); return;
    }
    if (form.newPassword.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters' }); return;
    }
    setSaving(true); setMsg(null);
    try {
      await api.put('/profile/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setMsg({ type: 'success', text: 'Password changed successfully!' });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Password update failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>🔒</span>
        <div>
          <h2 className={styles.cardTitle}>Change Password</h2>
          <p className={styles.cardSub}>Keep your account secure with a strong password</p>
        </div>
      </div>

      {msg && (
        <div className={`${styles.alert} ${msg.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label className={styles.label}>Current Password</label>
          <input className={styles.input} type="password" value={form.currentPassword} onChange={set('currentPassword')} placeholder="••••••••" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>New Password</label>
          <input className={styles.input} type="password" value={form.newPassword} onChange={set('newPassword')} placeholder="••••••••" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Confirm New Password</label>
          <input className={styles.input} type="password" value={form.confirm} onChange={set('confirm')} placeholder="••••••••" />
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Address Manager
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_ADDR = { label: 'Home', line: '', city: '', state: '', pincode: '', isDefault: false };

function AddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAddr, setEditAddr] = useState(null); // null = add new
  const [form, setForm] = useState(EMPTY_ADDR);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/profile/addresses');
      setAddresses(data);
    } catch { setMsg({ type: 'error', text: 'Failed to load addresses' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const openAdd = () => { setForm(EMPTY_ADDR); setEditAddr(null); setShowForm(true); setMsg(null); };
  const openEdit = (a) => { setForm({ label: a.label, line: a.line, city: a.city || '', state: a.state || '', pincode: a.pincode || '', isDefault: a.isDefault }); setEditAddr(a); setShowForm(true); setMsg(null); };
  const closeForm = () => { setShowForm(false); setEditAddr(null); setForm(EMPTY_ADDR); };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleSave = async () => {
    if (!form.line.trim()) { setMsg({ type: 'error', text: 'Address line is required' }); return; }
    setSaving(true); setMsg(null);
    try {
      if (editAddr) {
        const { data } = await api.put(`/profile/addresses/${editAddr._id}`, form);
        setAddresses(data);
      } else {
        const { data } = await api.post('/profile/addresses', form);
        setAddresses(data);
      }
      closeForm();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (addrId) => {
    try {
      const { data } = await api.put(`/profile/addresses/${addrId}/default`);
      setAddresses(data);
    } catch { setMsg({ type: 'error', text: 'Failed to set default' }); }
  };

  const handleDelete = async (addrId) => {
    try {
      const { data } = await api.delete(`/profile/addresses/${addrId}`);
      setAddresses(data);
    } catch { setMsg({ type: 'error', text: 'Delete failed' }); }
  };

  const LABEL_ICONS = { Home: '🏠', Work: '🏢', Other: '📍' };

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>📍</span>
        <div>
          <h2 className={styles.cardTitle}>Saved Addresses</h2>
          <p className={styles.cardSub}>Manage your delivery addresses</p>
        </div>
        <button className={styles.addAddrBtn} onClick={openAdd}>+ Add Address</button>
      </div>

      {msg && (
        <div className={`${styles.alert} ${msg.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
          <button className={styles.alertClose} onClick={() => setMsg(null)}>✕</button>
        </div>
      )}

      {/* Address list */}
      {loading ? (
        <div className={styles.addrSkeleton}>
          {[1, 2].map(i => <div key={i} className={`skeleton ${styles.addrSkItem}`} />)}
        </div>
      ) : addresses.length === 0 ? (
        <div className={styles.addrEmpty}>
          <div className={styles.addrEmptyIcon}>🏠</div>
          <p>No saved addresses yet.</p>
          <span>Add one to make checkout faster!</span>
        </div>
      ) : (
        <div className={styles.addrList}>
          {addresses.map((a) => (
            <div key={a._id} className={`${styles.addrCard} ${a.isDefault ? styles.addrCardDefault : ''}`}>
              <div className={styles.addrCardLeft}>
                <div className={styles.addrLabelRow}>
                  <span className={styles.addrLabelIcon}>{LABEL_ICONS[a.label] || '📍'}</span>
                  <span className={styles.addrLabel}>{a.label}</span>
                  {a.isDefault && <span className={styles.defaultBadge}>✦ Default</span>}
                </div>
                <div className={styles.addrLine}>{a.line}</div>
                {(a.city || a.state || a.pincode) && (
                  <div className={styles.addrCity}>
                    {[a.city, a.state, a.pincode].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
              <div className={styles.addrActions}>
                {!a.isDefault && (
                  <button className={styles.addrActionBtn} onClick={() => handleSetDefault(a._id)} title="Set as default">
                    ✦ Default
                  </button>
                )}
                <button className={styles.addrEditBtn} onClick={() => openEdit(a)}>Edit</button>
                <button className={styles.addrDeleteBtn} onClick={() => handleDelete(a._id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit form modal */}
      {showForm && (
        <div className={styles.overlay} onClick={closeForm}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editAddr ? 'Edit Address' : 'Add New Address'}</h3>
              <button className={styles.modalClose} onClick={closeForm}>✕</button>
            </div>

            <div className={styles.modalBody}>
              {/* Label selector */}
              <div className={styles.field}>
                <label className={styles.label}>Label</label>
                <div className={styles.labelPills}>
                  {LABEL_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`${styles.labelPill} ${form.label === opt ? styles.labelPillActive : ''}`}
                      onClick={() => setForm({ ...form, label: opt })}
                    >
                      {LABEL_ICONS[opt]} {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label className={styles.label}>Address Line *</label>
                <input className={styles.input} value={form.line} onChange={set('line')} placeholder="Street / Flat / Building" />
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>City</label>
                  <input className={styles.input} value={form.city} onChange={set('city')} placeholder="Mumbai" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>State</label>
                  <input className={styles.input} value={form.state} onChange={set('state')} placeholder="Maharashtra" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Pincode</label>
                  <input className={styles.input} value={form.pincode} onChange={set('pincode')} placeholder="400001" maxLength={6} />
                </div>
                <div className={`${styles.field} ${styles.checkboxField}`}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={form.isDefault} onChange={set('isDefault')} />
                    Set as default address
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeForm}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editAddr ? 'Update Address' : 'Add Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ProfilePage
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/profile').then(({ data }) => {
      setProfile(data);
    }).catch(() => {
      // Fallback to auth context user
      setProfile(user);
    }).finally(() => setLoading(false));
  }, []);

  const handleProfileSaved = (updatedUser) => {
    setProfile(updatedUser);
    // Keep sidebar name/email in sync
    updateUser({ name: updatedUser.name, email: updatedUser.email });
  };

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loadingArea}>
        {[1, 2, 3].map(i => <div key={i} className={`skeleton ${styles.skCard}`} />)}
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.header}>
        <div className={styles.headerAvatar}>{profile?.name?.[0]?.toUpperCase()}</div>
        <div>
          <h1 className={styles.title}>{profile?.name}</h1>
          <p className={styles.subtitle}>{profile?.email} · Customer since {new Date(profile?.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      <div className={styles.sections}>
        <PersonalDetails profile={profile} onSaved={handleProfileSaved} />
        <ChangePassword />
        <AddressManager />
      </div>
    </div>
  );
}
