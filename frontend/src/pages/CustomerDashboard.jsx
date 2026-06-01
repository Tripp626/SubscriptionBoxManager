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
    <div className="container py-4 page-enter">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 36px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-60px',
          right: '20%',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.25)',
          }}>
            👋
          </div>
          <div>
            <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.6rem', margin: 0 }}>
              Welcome back, {user?.firstName}!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', margin: '4px 0 0', fontSize: '14px' }}>
              Here's what's happening with your subscriptions today.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="alert-modern alert-modern-info" style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '20px' }}>🔔</span>
          <span>You have <strong>{notifications.length}</strong> new notification{notifications.length > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Upcoming Box CTA */}
      {activeSub && (
        <div className="card-elevated" style={{
          marginBottom: '24px',
          borderLeft: '4px solid var(--primary-500)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '24px' }}>📦</span>
                <h5 style={{ fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>Your Upcoming Box</h5>
              </div>
              {loadingBox ? (
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Loading...</p>
              ) : upcomingBox ? (
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
                  {statusLabels[upcomingBox.status]?.text || 'Box pending'} —{' '}
                  <strong>{upcomingBox.products?.length || 0}</strong> items
                  {upcomingBox.isPersonalized && <span style={{ marginLeft: '8px' }}>✨ Personalized</span>}
                </p>
              ) : (
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Your next box is being prepared.</p>
              )}
            </div>
            <Link
              to="/customize-box"
              className="btn-gradient-primary"
              style={{ padding: '10px 24px', fontSize: '14px', whiteSpace: 'nowrap' }}
            >
              {upcomingBox?.status === 'auto_generated' ? '✏️ Customize Box' :
               upcomingBox?.status === 'customized' ? '✅ Review & Confirm' :
               '👁️ View Box'}
            </Link>
          </div>
        </div>
      )}

      {/* No subscription prompt */}
      {!activeSub && subscriptions.length === 0 && (
        <div className="card-elevated" style={{
          marginBottom: '24px',
          borderLeft: '4px solid var(--warning-500)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '24px' }}>🚀</span>
                <h5 style={{ fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>Get Started</h5>
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
                Subscribe to a plan to receive your first box!
              </p>
            </div>
            <Link
              to="/plans"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.39)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              Browse Plans →
            </Link>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-8">
          {/* Subscriptions Card */}
          <div className="card-elevated" style={{ marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h5 style={{ fontWeight: 700, margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋</span> My Subscriptions
              </h5>
              <Link to="/plans" className="btn-gradient-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>
                Browse Plans
              </Link>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {subscriptions.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <div className="empty-icon">📭</div>
                  <div className="empty-title">No subscriptions yet</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    <Link to="/plans">Browse plans</Link> to get started.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table-modern">
                    <thead>
                      <tr>
                        <th>Plan</th>
                        <th>Status</th>
                        <th>Next Billing</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map(sub => (
                        <tr key={sub._id}>
                          <td style={{ fontWeight: 600 }}>{sub.plan?.name || 'N/A'}</td>
                          <td>
                            <span className={`badge-modern ${
                              sub.status === 'active' ? 'bg-success' :
                              sub.status === 'paused' ? 'bg-warning' : 'bg-secondary'
                            }`} style={{
                              background: sub.status === 'active' ? 'var(--success-50)' :
                                          sub.status === 'paused' ? 'var(--warning-50)' : 'var(--gray-100)',
                              color: sub.status === 'active' ? 'var(--success-600)' :
                                     sub.status === 'paused' ? 'var(--warning-600)' : 'var(--gray-600)',
                            }}>
                              {sub.status}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {new Date(sub.nextBillingDate).toLocaleDateString()}
                          </td>
                          <td>
                            <Link to={`/subscription/${sub._id}`} className="btn-outline-primary-modern" style={{ padding: '4px 14px', fontSize: '12px' }}>
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Orders Card */}
          <div className="card-elevated" style={{ marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-light)',
            }}>
              <h5 style={{ fontWeight: 700, margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛍️</span> Order History
              </h5>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {orders.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <div className="empty-icon">🛒</div>
                  <div className="empty-title">No orders yet</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Your first order will appear here after your box ships.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table-modern">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(order => {
                        const shipment = shipments.find(s => s.order === order._id || s.order?._id === order._id);
                        return (
                          <tr key={order._id}>
                            <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>#{order._id.slice(-8)}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>{order.products?.length || 0}</td>
                            <td style={{ fontWeight: 700 }}>${order.totalAmount?.toFixed(2)}</td>
                            <td>
                              <span className="badge-modern" style={{
                                background: order.status === 'delivered' ? 'var(--success-50)' :
                                            order.status === 'cancelled' ? 'var(--danger-50)' : 'var(--info-50)',
                                color: order.status === 'delivered' ? 'var(--success-600)' :
                                       order.status === 'cancelled' ? 'var(--danger-600)' : 'var(--info-600)',
                              }}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              {shipment && order.status !== 'cancelled' && (
                                <Link to={`/track/${order._id}`} className="btn-outline-primary-modern" style={{ padding: '4px 14px', fontSize: '12px' }}>
                                  Track
                                </Link>
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

        {/* Sidebar */}
        <div className="col-md-4">
          {/* Recommendations */}
          <div className="card-elevated" style={{ marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-light)',
            }}>
              <h5 style={{ fontWeight: 700, margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💡</span> Recommended For You
              </h5>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {recommendations.length === 0 ? (
                <div className="empty-state" style={{ padding: '16px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Set your preferences to get recommendations!</p>
                </div>
              ) : (
                recommendations.slice(0, 5).map(product => (
                  <Link key={product._id} to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '4px',
                      transition: 'background 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ flexShrink: 0 }}>
                        <ProductImage product={product} size={36} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>${product.price?.toFixed(2)}</div>
                      </div>
                      <span style={{
                        background: 'var(--warning-50)',
                        color: 'var(--warning-600)',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        flexShrink: 0,
                      }}>
                        ★ {product.averageRating?.toFixed(1)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
              <Link to="/preferences" className="btn-outline-primary-modern" style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '13px', justifyContent: 'center', display: 'flex' }}>
                Update Preferences
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="card-elevated" style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-light)',
            }}>
              <h5 style={{ fontWeight: 700, margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚡</span> Quick Links
              </h5>
            </div>
            <div style={{ padding: '8px' }}>
              {[
                { to: '/customize-box', icon: '📦', label: 'My Upcoming Box' },
                { to: '/box-history', icon: '📜', label: 'Box History' },
                { to: '/products', icon: '🛍️', label: 'Browse Products' },
                { to: '/preferences', icon: '⚙️', label: 'My Preferences' },
                { to: '/feedback', icon: '⭐', label: 'My Reviews' },
                { to: '/profile', icon: '👤', label: 'Account Settings' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '14px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-50)'; e.currentTarget.style.color = 'var(--primary-700)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <span style={{ fontSize: '18px' }}>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
