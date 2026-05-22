import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', address: { street: '', city: '', state: '', zipCode: '', country: '' } });
  const [saved, setSaved] = useState(false);

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
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm p-4">
            <h3>Account Settings</h3>
            {saved && <div className="alert alert-success">Profile updated!</div>}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">First Name</label>
                  <input type="text" className="form-control" name="firstName" value={form.firstName} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-control" name="lastName" value={form.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={user?.email} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <hr />
              <h5>Address</h5>
              <div className="mb-3">
                <label className="form-label">Street</label>
                <input type="text" className="form-control" name="address.street" value={form.address.street} onChange={handleChange} />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">City</label>
                  <input type="text" className="form-control" name="address.city" value={form.address.city} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">State</label>
                  <input type="text" className="form-control" name="address.state" value={form.address.state} onChange={handleChange} />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Zip Code</label>
                  <input type="text" className="form-control" name="address.zipCode" value={form.address.zipCode} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Country</label>
                  <input type="text" className="form-control" name="address.country" value={form.address.country} onChange={handleChange} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
