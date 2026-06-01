import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, processPayment } from '../services/api';

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState(user?.address || { street: '', city: '', state: '', zipCode: '', country: 'US' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const orderData = {
        products: cart.map(item => ({ product: item.product._id, quantity: item.quantity })),
        shippingAddress: address,
      };
      const { data: order } = await createOrder(orderData);
      await processPayment({ orderId: order._id, method: 'stripe' });
      clearCart();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container py-4">
      <h2>Checkout</h2>
      <div className="row mt-4">
        <div className="col-md-7">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit} className="card shadow-sm p-4">
            <h5>Shipping Address</h5>
            <div className="mb-3">
              <label className="form-label">Street</label>
              <input type="text" className="form-control-modern" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} required />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">City</label>
                <input type="text" className="form-control-modern" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">State</label>
                <input type="text" className="form-control-modern" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} required />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Zip Code</label>
                <input type="text" className="form-control-modern" value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Country</label>
                <input type="text" className="form-control-modern" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} required />
              </div>
            </div>
            <hr />
            <h5>Payment Method</h5>
            <div className="mb-3">
              <select className="form-select-modern">
                <option value="stripe">Credit Card (Stripe)</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
            </button>
          </form>
        </div>
        <div className="col-md-5">
          <div className="card shadow-sm sticky-top" style={{ top: 20 }}>
            <div className="card-body">
              <h5>Order Summary</h5>
              <hr />
              {cart.map(item => (
                <div key={item.product._id} className="d-flex justify-content-between mb-2">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total</strong>
                <strong>${totalPrice.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
