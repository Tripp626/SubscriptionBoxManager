import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getShipmentByOrder, getMyOrders } from '../services/api';
import ProductImage from '../components/ProductImage';

const STATUS_STEPS = ['preparing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
const STATUS_LABELS = {
  preparing: 'Preparing',
  packed: 'Packed',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  failed: 'Delivery Failed',
};

export default function TrackShipment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shipmentRes, ordersRes] = await Promise.all([
          getShipmentByOrder(orderId),
          getMyOrders(),
        ]);
        setShipment(shipmentRes.data);
        const matchedOrder = ordersRes.data.find(o => o._id === orderId);
        setOrder(matchedOrder || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId]);

  if (loading) return <div className="container py-5 text-center"><p>Loading shipment...</p></div>;

  if (!shipment) {
    return (
      <div className="container py-5 text-center">
        <h4>Shipment not found</h4>
        <p className="text-muted">We couldn't find a shipment for this order yet.</p>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(shipment.status);
  const isFailed = shipment.status === 'failed';

  return (
    <div className="container py-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>

      <div className="row">
        <div className="col-md-8">
          {/* Tracking Header */}
          <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📦 Track Shipment</h5>
              <span className={`badge bg-${isFailed ? 'danger' : shipment.status === 'delivered' ? 'success' : 'primary'} fs-6`}>
                {STATUS_LABELS[shipment.status] || shipment.status}
              </span>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="text-muted small">Order ID</label>
                  <p className="fw-bold mb-0">{orderId.slice(-8).toUpperCase()}</p>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small">Carrier</label>
                  <p className="fw-bold mb-0">{shipment.carrier || 'Not assigned yet'}</p>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="text-muted small">Tracking Number</label>
                  <p className="fw-bold mb-0">{shipment.trackingNumber || 'Will be available once shipped'}</p>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small">Estimated Delivery</label>
                  <p className="fw-bold mb-0">
                    {shipment.estimatedDeliveryDate
                      ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Calculating...'}
                  </p>
                </div>
              </div>
              {shipment.deliveryPersonnel && (
                <div className="alert alert-info mb-0">
                  <strong>Delivery Person:</strong> {shipment.deliveryPersonnel.firstName} {shipment.deliveryPersonnel.lastName}
                  {shipment.deliveryPersonnel.phone && <span className="ms-2">📞 {shipment.deliveryPersonnel.phone}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Progress Stepper */}
          {!isFailed && (
            <div className="card shadow-sm mb-4">
              <div className="card-header"><h5 className="mb-0">Shipping Progress</h5></div>
              <div className="card-body">
                <div className="d-flex justify-content-between position-relative mb-4" style={{ padding: '0 10px' }}>
                  <div className="position-absolute" style={{ top: 15, left: 20, right: 20, height: 3, backgroundColor: '#e9ecef', zIndex: 0 }} />
                  <div className="position-absolute" style={{ top: 15, left: 20, width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%`, height: 3, backgroundColor: '#198754', zIndex: 1, transition: 'width 0.3s' }} />
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} className="text-center position-relative" style={{ zIndex: 2, width: `${100 / STATUS_STEPS.length}%` }}>
                      <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{
                        width: 32, height: 32,
                        backgroundColor: i <= currentStep ? '#198754' : '#e9ecef',
                        color: i <= currentStep ? '#fff' : '#6c757d',
                        fontSize: 14, fontWeight: 'bold',
                      }}>
                        {i < currentStep ? '✓' : i + 1}
                      </div>
                      <small className={`d-block mt-1 ${i <= currentStep ? 'fw-bold text-success' : 'text-muted'}`} style={{ fontSize: 10, lineHeight: 1.2 }}>
                        {STATUS_LABELS[step]}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tracking Timeline */}
          <div className="card shadow-sm mb-4">
            <div className="card-header"><h5 className="mb-0">Tracking History</h5></div>
            <div className="card-body">
              {shipment.trackingUpdates?.length > 0 ? (
                <div className="position-relative" style={{ paddingLeft: 20 }}>
                  <div className="position-absolute" style={{ left: 7, top: 0, bottom: 0, width: 2, backgroundColor: '#e9ecef' }} />
                  {[...shipment.trackingUpdates].reverse().map((update, i) => (
                    <div key={i} className="mb-3 position-relative">
                      <div className="position-absolute rounded-circle" style={{
                        left: -17, top: 4, width: 12, height: 12,
                        backgroundColor: i === 0 ? '#198754' : '#adb5bd',
                        border: '2px solid #fff',
                      }} />
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{STATUS_LABELS[update.status] || update.status}</strong>
                          {update.location && <span className="text-muted ms-2">📍 {update.location}</span>}
                          {update.note && <p className="text-muted small mb-0 mt-1">{update.note}</p>}
                        </div>
                        <small className="text-muted text-nowrap ms-2">
                          {new Date(update.timestamp).toLocaleDateString()} {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No tracking updates yet. Check back soon!</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          {order?.products?.length > 0 && (
            <div className="card shadow-sm">
              <div className="card-header"><h5 className="mb-0">Items in This Shipment</h5></div>
              <div className="card-body">
                {order.products.map((item, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <ProductImage product={item.product} size={32} />
                      <div>
                        <span className="fw-bold">{item.product?.name || 'Product'}</span>
                        <small className="text-muted ms-2">×{item.quantity}</small>
                      </div>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total</strong>
                  <strong>${order.totalAmount?.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-md-4">
          <div className="card shadow-sm sticky-top" style={{ top: 20 }}>
            <div className="card-header"><h5 className="mb-0">Order Summary</h5></div>
            <div className="card-body">
              <div className="mb-2">
                <label className="text-muted small">Order Date</label>
                <p className="mb-0">{order ? new Date(order.createdAt).toLocaleDateString() : '—'}</p>
              </div>
              <div className="mb-2">
                <label className="text-muted small">Order Status</label>
                <p className="mb-0">
                  <span className={`badge bg-${order?.status === 'delivered' ? 'success' : order?.status === 'cancelled' ? 'danger' : 'info'}`}>
                    {order?.status || '—'}
                  </span>
                </p>
              </div>
              {shipment.actualDeliveryDate && (
                <div className="alert alert-success py-2 mb-0">
                  <strong>Delivered on</strong><br />
                  {new Date(shipment.actualDeliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}
              <Link to="/feedback" className="btn btn-outline-primary w-100 mt-3">
                Rate Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
