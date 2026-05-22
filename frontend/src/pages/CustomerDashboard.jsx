import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBox } from '../context/BoxContext';
import { getMySubscriptions, getMyOrders, getRecommendations, getMyNotifications, getMyBox, getMyShipments } from '../services/api';
import ProductImage from '../components/ProductImage';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { setBox } = useBox();
  const [subscriptions, setSubscriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [upcomingBox, setUpcomingBox] = useState(null);
  const [loadingBox, setLoadingBox] = useState(true);
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, orderRes, recRes, notifRes, shipRes] = await Promise.all([
          getMySubscriptions(), getMyOrders(), getRecommendations(), getMyNotifications(), getMyShipments(),
        ]);
        setSubscriptions(subRes.data);
        setOrders(orderRes.data);
        setRecommendations(recRes.data);
        setNotifications(notifRes.data.filter(n => !n.isRead));
        setShipments(shipRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchUpcomingBox = async () => {
      try {
        const { data } = await getMyBox();
        setUpcomingBox(data.box);
        setBox(data);
      } catch {
        // No active subscription or box yet
      } finally {
        setLoadingBox(false);
      }
    };
    fetchUpcomingBox();
  }, [setBox]);

  const activeSub = subscriptions.find(s => s.status === 'active');

  const statusLabels = {
    auto_generated: { text: 'New Box Ready — Customize It!', badge: 'bg-info' },
    customized: { text: 'Customized — Confirm When Ready', badge: 'bg-warning' },
    confirmed: { text: 'Confirmed — Being Prepared', badge: 'bg-success' },
    shipped: { text: 'Shipped — On Its Way!', badge: 'bg-primary' },
    delivered: { text: 'Delivered', badge: 'bg-secondary' },
  };

  return (
    <div className="container py-4">
      <h2>Welcome, {user?.firstName}!</h2>

      {notifications.length > 0 && (
        <div className="alert alert-info">
          <strong>{notifications.length}</strong> new notification(s)
        </div>
      )}

      {/* Upcoming Box CTA */}
      {activeSub && (
        <div className="card mb-4 shadow-sm border-primary">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">📦 Your Upcoming Box</h5>
              {loadingBox ? (
                <p className="text-muted mb-0">Loading...</p>
              ) : upcomingBox ? (
                <p className="text-muted mb-0">
                  {statusLabels[upcomingBox.status]?.text || 'Box pending'} —{' '}
                  <strong>{upcomingBox.products?.length || 0}</strong> items
                  {upcomingBox.isPersonalized && <span className="ms-1">✨ Personalized</span>}
                </p>
              ) : (
                <p className="text-muted mb-0">Your next box is being prepared.</p>
              )}
            </div>
            {upcomingBox ? (
              <Link to="/customize-box" className="btn btn-primary btn-lg">
                {upcomingBox.status === 'auto_generated' ? 'Customize Box' :
                 upcomingBox.status === 'customized' ? 'Review & Confirm' :
                 'View Box'}
              </Link>
            ) : (
              <Link to="/customize-box" className="btn btn-primary btn-lg">
                View Box
              </Link>
            )}
          </div>
        </div>
      )}

      {/* No subscription prompt */}
      {!activeSub && subscriptions.length === 0 && (
        <div className="card mb-4 shadow-sm border-warning">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">🚀 Get Started</h5>
              <p className="text-muted mb-0">Subscribe to a plan to receive your first box!</p>
            </div>
            <Link to="/plans" className="btn btn-success btn-lg">Browse Plans</Link>
          </div>
        </div>
      )}

      <div className="row mt-3">
        <div className="col-md-8">
          <div className="card mb-4 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Subscriptions</h5>
              <Link to="/plans" className="btn btn-sm btn-primary">Browse Plans</Link>
            </div>
            <div className="card-body">
              {subscriptions.length === 0 ? (
                <p className="text-muted">No active subscriptions. <Link to="/plans">Browse plans</Link></p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead><tr><th>Plan</th><th>Status</th><th>Next Billing</th><th>Actions</th></tr></thead>
                    <tbody>
                      {subscriptions.map(sub => (
                        <tr key={sub._id}>
                          <td>{sub.plan?.name || 'N/A'}</td>
                          <td><span className={`badge bg-${sub.status === 'active' ? 'success' : sub.status === 'paused' ? 'warning' : 'secondary'}`}>{sub.status}</span></td>
                          <td>{new Date(sub.nextBillingDate).toLocaleDateString()}</td>
                          <td>
                            <Link to={`/subscription/${sub._id}`} className="btn btn-sm btn-outline-primary">Details</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="card mb-4 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Order History</h5>
            </div>
            <div className="card-body">
              {orders.length === 0 ? (
                <p className="text-muted">No orders yet. Your first order will appear here after your box ships.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Order Status</th><th>Shipment</th><th>Actions</th></tr></thead>
                    <tbody>
                      {orders.slice(0, 5).map(order => {
                        const shipment = shipments.find(s => s.order === order._id || s.order?._id === order._id);
                        return (
                          <tr key={order._id}>
                            <td>{order._id.slice(-8)}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>{order.products?.length || 0}</td>
                            <td>${order.totalAmount?.toFixed(2)}</td>
                            <td><span className={`badge bg-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'info'}`}>{order.status}</span></td>
                            <td>
                              {shipment ? (
                                <span className={`badge bg-${shipment.status === 'delivered' ? 'success' : shipment.status === 'failed' ? 'danger' : 'primary'}`}>
                                  {shipment.status === 'out_for_delivery' ? 'Out for Delivery' : shipment.status.replace('_', ' ')}
                                </span>
                              ) : (
                                <span className="badge bg-secondary">Processing</span>
                              )}
                            </td>
                            <td>
                              {shipment && order.status !== 'cancelled' && (
                                <Link to={`/track/${order._id}`} className="btn btn-sm btn-outline-primary">Track</Link>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card mb-4 shadow-sm">
            <div className="card-header"><h5 className="mb-0">Recommended For You</h5></div>
            <div className="card-body">
              {recommendations.length === 0 ? (
                <p className="text-muted">Set your preferences to get recommendations!</p>
              ) : (
                recommendations.slice(0, 5).map(product => (
                  <Link key={product._id} to={`/products/${product._id}`} className="text-decoration-none">
                    <div className="d-flex align-items-center mb-2 p-2 rounded hover-light" style={{ cursor: 'pointer' }}>
                      <div className="me-2">
                        <ProductImage product={product} size={36} />
                      </div>
                      <div className="flex-grow-1">
                        <strong className="text-dark">{product.name}</strong>
                        <br /><small className="text-muted">${product.price?.toFixed(2)}</small>
                      </div>
                      <span className="badge bg-warning">★ {product.averageRating?.toFixed(1)}</span>
                    </div>
                  </Link>
                ))
              )}
              <Link to="/preferences" className="btn btn-sm btn-outline-primary w-100 mt-2">Update Preferences</Link>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header"><h5 className="mb-0">Quick Links</h5></div>
            <div className="list-group list-group-flush">
              <Link to="/customize-box" className="list-group-item list-group-item-action">📦 My Upcoming Box</Link>
              <Link to="/box-history" className="list-group-item list-group-item-action">📦 Box History</Link>
              <Link to="/products" className="list-group-item list-group-item-action">Browse Products</Link>
              <Link to="/preferences" className="list-group-item list-group-item-action">My Preferences</Link>
              <Link to="/feedback" className="list-group-item list-group-item-action">My Reviews</Link>
              <Link to="/profile" className="list-group-item list-group-item-action">Account Settings</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
