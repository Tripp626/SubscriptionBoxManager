import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBox } from '../context/BoxContext';
import { useAuth } from '../context/AuthContext';
import { getMySubscriptions, createOrder, processPayment } from '../services/api';

export default function BoxReview() {
  const { box, clearBox, maxItems, setBoxLimit } = useBox();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSub, setSelectedSub] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState(user?.address || { street: '', city: '', state: '', zipCode: '', country: 'US' });

  useEffect(() => {
    if (box.length === 0) { navigate('/box-builder'); return; }
    const fetchSubs = async () => {
      try {
        const { data } = await getMySubscriptions();
        const active = data.filter(s => s.status === 'active');
        setSubscriptions(active);
        if (active.length > 0) {
          setSelectedSub(active[0]._id);
          setBoxLimit(active[0].plan?.maxProducts || 5);
        }
      } catch (err) { console.error(err); }
    };
    fetchSubs();
  }, [box.length, navigate, setBoxLimit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) { setError('Please select a subscription.'); return; }
    setLoading(true);
    setError('');
    try {
      const orderData = {
        products: box.map(item => ({ product: item._id, quantity: 1 })),
        shippingAddress: address,
        subscriptionId: selectedSub,
        isPersonalized: true,
      };
      const { data: order } = await createOrder(orderData);
      await processPayment({ orderId: order._id, method: 'stripe' });
      clearBox();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit box. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (box.length === 0) return null;

  return (
    <div className="container py-4">
      <button className="btn-outline-secondary mb-3" onClick={() => navigate('/box-builder')}>← Back to Box Builder</button>
      <h2>Review Your Box</h2>

      <div className="row mt-4">
        <div className="col-md-7">
          {error && <div className="alert-modern alert-modern-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            {/* Subscription selection */}
            <div className="card-elevated mb-4">
              <div className="card-header"><h5 className="mb-0">Subscription</h5></div>
              <div className="card-body">
                {subscriptions.length === 0 ? (
                  <p className="text-muted">No active subscriptions. <button type="button" className="btn-gradient-primary btn-sm" onClick={() => navigate('/plans')}>Subscribe to a plan</button></p>
                ) : (
                  <select className="form-select-modern" value={selectedSub} onChange={(e) => setSelectedSub(e.target.value)}>
                    {subscriptions.map(sub => (
                      <option key={sub._id} value={sub._id}>
                        {sub.plan?.name} — up to {sub.plan?.maxProducts} items
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Shipping */}
            <div className="card-elevated mb-4">
              <div className="card-header"><h5 className="mb-0">Shipping Address</h5></div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label-modern">Street</label>
                  <input type="text" className="form-control-modern" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} required />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label-modern">City</label>
                    <input type="text" className="form-control-modern" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label-modern">State</label>
                    <input type="text" className="form-control-modern" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} required />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label-modern">Zip Code</label>
                    <input type="text" className="form-control-modern" value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label-modern">Country</label>
                    <input type="text" className="form-control-modern" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} required />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-gradient-primary w-100 btn-lg" disabled={loading || subscriptions.length === 0}>
              {loading ? 'Processing...' : `Submit Box — $${box.reduce((s, i) => s + (i.price || 0), 0).toFixed(2)}`}
            </button>
          </form>
        </div>

        <div className="col-md-5">
          <div className="card-elevated sticky-top" style={{ top: 20 }}>
            <div className="card-header"><h5 className="mb-0">Box Contents ({box.length}/{maxItems})</h5></div>
            <div className="card-body">
              {box.map(item => (
                <div key={item._id} className="d-flex justify-content-between align-items-center mb-2 p-3 bg-tertiary rounded">
                  <div>
                    <strong>{item.name}</strong>
                    <br /><small className="text-muted">{item.category}</small>
                  </div>
                  <strong>${item.price?.toFixed(2)}</strong>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total</strong>
                <strong>${box.reduce((s, i) => s + (i.price || 0), 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
