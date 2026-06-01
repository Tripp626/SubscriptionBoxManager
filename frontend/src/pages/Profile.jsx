import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', address: { street: '', city: '', state: '', zipCode: '', country: '' } });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getProfile();
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          address: data.address || { street: '', city: '', state: '', zipCode: '', country: '' },
        });
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm({ ...form, address: { ...form.address, [field]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const initials = `${form.firstName?.[0] || ''}${form.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="container py-4 page-enter">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Avatar Header Card */}
          <div className="card-elevated" style={{ overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{
              height: '100px',
              background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                bottom: '-40px',
                left: '32px',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--bg-primary)',
                  padding: '4px',
                  boxShadow: 'var(--shadow-lg)',
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '28px',
                  }}>
                    {initials || '?'}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '56px 32px 28px' }}>
              <h3 style={{ fontWeight: 800, marginBottom: '4px' }}>
                {form.firstName} {form.lastName}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {user?.email} · <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
              </p>
            </div>
          </div>

          {/* Profile Form Card */}
          <div className="card-elevated" style={{ overflow: 'hidden' }}>
            {saved && (
              <div className="alert-modern alert-modern-success" style={{ margin: '20px 24px 0', borderRadius: 0 }}>
                <span style={{ fontSize: '18px' }}>✅</span>
                <span>Profile updated successfully!</span>
              </div>
            )}

            <div style={{ padding: '28px 32px' }}>
              <h5 style={{ fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👤</span> Personal Information
              </h5>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label-modern">First Name</label>
                    <div className="input-icon-wrapper">
                      <span className="input-icon">👤</span>
                      <input type="text" className="form-control-modern" name="firstName" value={form.firstName} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label-modern">Last Name</label>
                    <div className="input-icon-wrapper">
                      <span className="input-icon">👤</span>
                      <input type="text" className="form-control-modern" name="lastName" value={form.lastName} onChange={handleChange} required />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label-modern">Email</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon">✉️</span>
                    <input type="email" className="form-control-modern" value={user?.email} disabled style={{ background: 'var(--bg-tertiary)', cursor: 'not-allowed' }} />
                  </div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    Email cannot be changed. <Link to="/contact" style={{ fontWeight: 600 }}>Contact support</Link> for assistance.
                  </small>
                </div>

                <div className="mb-4">
                  <label className="form-label-modern">Phone</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon">📱</span>
                    <input type="tel" className="form-control-modern" name="phone" value={form.phone} onChange={handleChange} placeholder="(555) 123-4567" />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '24px', marginBottom: '24px' }}>
                  <h5 style={{ fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏠</span> Address
                  </h5>

                  <div className="mb-3">
                    <label className="form-label-modern">Street Address</label>
                    <input type="text" className="form-control-modern" name="address.street" value={form.address.street} onChange={handleChange} placeholder="123 Main Street, Apt 4B" />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label-modern">City</label>
                      <input type="text" className="form-control-modern" name="address.city" value={form.address.city} onChange={handleChange} placeholder="New York" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label-modern">State / Province</label>
                      <input type="text" className="form-control-modern" name="address.state" value={form.address.state} onChange={handleChange} placeholder="NY" />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label-modern">Zip / Postal Code</label>
                      <input type="text" className="form-control-modern" name="address.zipCode" value={form.address.zipCode} onChange={handleChange} placeholder="10001" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label-modern">Country</label>
                      <input type="text" className="form-control-modern" name="address.country" value={form.address.country} onChange={handleChange} placeholder="United States" />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-gradient-primary" style={{ padding: '10px 32px', fontSize: '14px' }} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
