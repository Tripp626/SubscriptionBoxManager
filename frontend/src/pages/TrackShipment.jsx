import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getShipmentByOrder, getMyOrders } from '../services/api';
import ProductImage from '../components/ProductImage';

/* ─── constants ─────────────────────────────────────────────────────────────── */
const STATUS_STEPS = ['preparing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];

const STATUS_META = {
  preparing:        { label: 'Preparing',        icon: '📦', color: 'var(--warning-600)', bg: 'var(--warning-50)'  },
  packed:           { label: 'Packed',            icon: '🎁', color: 'var(--info-600)',    bg: 'var(--info-50)'     },
  shipped:          { label: 'Shipped',           icon: '🚚', color: 'var(--info-600)',    bg: 'var(--info-50)'     },
  in_transit:       { label: 'In Transit',        icon: '🛣️',  color: 'var(--info-600)',    bg: 'var(--info-50)'     },
  out_for_delivery: { label: 'Out for Delivery',  icon: '🏃', color: 'var(--primary-600)', bg: 'var(--primary-50)'  },
  delivered:        { label: 'Delivered',         icon: '✅', color: 'var(--success-600)', bg: 'var(--success-50)'  },
  failed:           { label: 'Delivery Failed',   icon: '❌', color: 'var(--danger-600)',  bg: 'var(--danger-50)'   },
};

/* ─── shared style tokens ───────────────────────────────────────────────────── */
const S = {
  card: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--bg-secondary)',
  },
  cardBody: { padding: '20px' },
  label: {
    fontWeight: 600,
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px',
    display: 'block',
  },
  value: {
    fontWeight: 700,
    fontSize: '14px',
    color: 'var(--text-primary)',
    margin: 0,
  },
  muted: { color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.55 },
  divider: { height: 1, background: 'var(--border-light)', margin: '14px 0' },
};

/* ─── helpers ───────────────────────────────────────────────────────────────── */
const fmt = (d, opts) => d
  ? new Date(d).toLocaleDateString(undefined, opts || { year: 'numeric', month: 'short', day: 'numeric' })
  : '—';

const fmtTime = (d) => d
  ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  : '';

/* ─── reusables ─────────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <span style={{
      width: 28, height: 28,
      border: '2px solid var(--border-light)',
      borderTopColor: 'var(--primary-500)',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.preparing;
  return (
    <span style={{
      background: m.bg, color: m.color,
      fontSize: '11px', fontWeight: 700,
      padding: '4px 12px', borderRadius: 'var(--radius-full)',
      textTransform: 'uppercase', letterSpacing: '0.04em',
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      {m.icon} {m.label}
    </span>
  );
}

function DetailItem({ label, value, mono = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={S.label}>{label}</span>
      <span style={{ ...S.value, fontFamily: mono ? 'monospace' : 'inherit', color: mono ? 'var(--primary-600)' : 'var(--text-primary)' }}>
        {value || '—'}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════════ */
export default function TrackShipment() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [shipmentRes, ordersRes] = await Promise.all([
          getShipmentByOrder(orderId),
          getMyOrders(),
        ]);
        setShipment(shipmentRes.data);
        setOrder(ordersRes.data.find(o => o._id === orderId) || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  /* ── loading ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <Spinner />
      <p style={S.muted}>Loading shipment details…</p>
    </div>
  );

  /* ── not found ── */
  if (!shipment) return (
    <div className="container py-5">
      <div style={{
        ...S.card,
        maxWidth: 480, margin: '0 auto',
        textAlign: 'center', padding: '48px 32px',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
        <h5 style={{ fontWeight: 800, marginBottom: 8 }}>Shipment Not Found</h5>
        <p style={{ ...S.muted, marginBottom: 20 }}>We couldn't find a shipment for this order yet. Check back soon!</p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '9px 20px', fontWeight: 700, fontSize: 13,
            background: 'transparent', color: 'var(--text-secondary)',
            border: '2px solid var(--border-light)', borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );

  const currentStep = STATUS_STEPS.indexOf(shipment.status);
  const isFailed    = shipment.status === 'failed';
  const isDelivered = shipment.status === 'delivered';
  const progressPct = currentStep >= 0
    ? Math.round((currentStep / (STATUS_STEPS.length - 1)) * 100)
    : 0;

  return (
    <div className="container py-4 page-enter">

      {/* ── Back button ─────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', marginBottom: 24,
          background: 'transparent', color: 'var(--text-secondary)',
          border: '2px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-300)'; e.currentTarget.style.color = 'var(--primary-600)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        ← Back to Dashboard
      </button>

      {/* ── Page heading ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h2 style={{ fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 4 }}>
            🚚 Track Shipment
          </h2>
          <p style={S.muted}>Order #{orderId.slice(-8).toUpperCase()}</p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <div className="row">

        {/* ── LEFT col ────────────────────────────────────────────────── */}
        <div className="col-md-8">

          {/* Shipment info card */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <h5 style={{ margin: 0, fontWeight: 700 }}>Shipment Details</h5>
            </div>
            <div style={S.cardBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 32px' }}>
                <DetailItem label="Order ID"           value={`#${orderId.slice(-8).toUpperCase()}`} mono />
                <DetailItem label="Carrier"            value={shipment.carrier || 'Not assigned yet'} />
                <DetailItem label="Tracking Number"    value={shipment.trackingNumber || 'Available once shipped'} mono />
                <DetailItem
                  label="Est. Delivery"
                  value={shipment.estimatedDeliveryDate
                    ? fmt(shipment.estimatedDeliveryDate, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Calculating…'}
                />
              </div>

              {/* Delivery personnel */}
              {shipment.deliveryPersonnel && (
                <>
                  <div style={S.divider} />
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px',
                    background: 'var(--info-50)',
                    border: '1px solid var(--info-100)',
                    borderRadius: 'var(--radius-lg)',
                  }}>
                    <span style={{ fontSize: 28 }}>🧑‍💼</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                        {shipment.deliveryPersonnel.firstName} {shipment.deliveryPersonnel.lastName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--info-600)', marginTop: 2 }}>Delivery Agent</div>
                      {shipment.deliveryPersonnel.phone && (
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                          📞 {shipment.deliveryPersonnel.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Progress stepper */}
          {!isFailed && (
            <div style={S.card}>
              <div style={S.cardHeader}>
                <h5 style={{ margin: 0, fontWeight: 700 }}>Shipping Progress</h5>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-600)' }}>
                  {progressPct}% Complete
                </span>
              </div>
              <div style={{ padding: '28px 24px 20px' }}>

                {/* Track bar */}
                <div style={{ height: 4, background: 'var(--border-light)', borderRadius: 99, marginBottom: 24, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', height: '100%', left: 0,
                    width: `${progressPct}%`,
                    background: isDelivered
                      ? 'linear-gradient(90deg, var(--success-500), #34d399)'
                      : 'linear-gradient(90deg, var(--primary-500), var(--accent-500))',
                    borderRadius: 99,
                    transition: 'width 0.8s ease',
                  }} />
                </div>

                {/* Steps */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {STATUS_STEPS.map((step, i) => {
                    const done    = i <= currentStep;
                    const current = i === currentStep;
                    const m       = STATUS_META[step];
                    return (
                      <div key={step} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          margin: '0 auto 6px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: done ? 14 : 13,
                          fontWeight: 700,
                          background: done
                            ? (current ? 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-500) 100%)' : 'var(--success-500)')
                            : 'var(--bg-tertiary)',
                          color: done ? '#fff' : 'var(--text-muted)',
                          border: `2px solid ${done ? 'transparent' : 'var(--border-light)'}`,
                          boxShadow: current ? '0 0 0 4px var(--primary-100)' : 'none',
                          transition: 'all 0.3s',
                        }}>
                          {done && !current ? '✓' : m.icon}
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: done ? 700 : 500,
                          color: done ? 'var(--text-primary)' : 'var(--text-muted)',
                          lineHeight: 1.25,
                          display: 'block',
                        }}>
                          {m.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Failed banner */}
          {isFailed && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 20px', marginBottom: 20,
              background: 'var(--danger-50)',
              border: '1px solid var(--danger-200)',
              borderRadius: 'var(--radius-xl)',
            }}>
              <span style={{ fontSize: 28 }}>❌</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--danger-600)', marginBottom: 2 }}>Delivery Failed</div>
                <div style={{ fontSize: 13, color: 'var(--danger-500)' }}>
                  Your delivery attempt was unsuccessful. Please contact support or check your tracking number.
                </div>
              </div>
            </div>
          )}

          {/* Tracking timeline */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <h5 style={{ margin: 0, fontWeight: 700 }}>Tracking History</h5>
              {shipment.trackingUpdates?.length > 0 && (
                <span style={{
                  background: 'var(--primary-50)', color: 'var(--primary-600)',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                }}>
                  {shipment.trackingUpdates.length} update{shipment.trackingUpdates.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div style={S.cardBody}>
              {!shipment.trackingUpdates?.length ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📡</div>
                  <p style={S.muted}>No tracking updates yet. Check back soon!</p>
                </div>
              ) : (
                <div style={{ position: 'relative', paddingLeft: 32 }}>
                  {/* vertical line */}
                  <div style={{
                    position: 'absolute', left: 11, top: 8, bottom: 8,
                    width: 2,
                    background: 'linear-gradient(180deg, var(--primary-400) 0%, var(--border-light) 100%)',
                  }} />

                  {[...shipment.trackingUpdates].reverse().map((update, i) => {
                    const m = STATUS_META[update.status] || STATUS_META.preparing;
                    return (
                      <div key={i} style={{ position: 'relative', paddingBottom: 20 }}>
                        {/* dot */}
                        <div style={{
                          position: 'absolute', left: -32 + 6, top: 2,
                          width: 14, height: 14, borderRadius: '50%',
                          background: i === 0 ? 'var(--primary-500)' : 'var(--border-light)',
                          border: `2px solid ${i === 0 ? 'var(--primary-200)' : 'var(--bg-primary)'}`,
                          boxShadow: i === 0 ? '0 0 0 3px var(--primary-100)' : 'none',
                        }} />

                        <div style={{
                          background: i === 0 ? 'var(--bg-secondary)' : 'transparent',
                          border: i === 0 ? '1px solid var(--border-light)' : 'none',
                          borderRadius: 'var(--radius-lg)',
                          padding: i === 0 ? '12px 14px' : '4px 0',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6 }}>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                                {m.icon} {m.label}
                              </span>
                              {update.location && (
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                                  📍 {update.location}
                                </span>
                              )}
                              {update.note && (
                                <p style={{ ...S.muted, marginTop: 3, marginBottom: 0, fontSize: 12 }}>
                                  {update.note}
                                </p>
                              )}
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              {fmt(update.timestamp)} · {fmtTime(update.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Order items */}
          {order?.products?.length > 0 && (
            <div style={S.card}>
              <div style={S.cardHeader}>
                <h5 style={{ margin: 0, fontWeight: 700 }}>Items in This Shipment</h5>
                <span style={{
                  background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                }}>
                  {order.products.length} item{order.products.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={S.cardBody}>
                {order.products.map((item, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* thumbnail */}
                      <div style={{
                        width: 56, height: 56, flexShrink: 0,
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid var(--border-light)',
                      }}>
                        <ProductImage product={item.product} wSize={56} hSize={56} />
                      </div>

                      {/* info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                          {item.product?.name || 'Product'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {item.product?.category}
                          <span style={{ margin: '0 6px' }}>·</span>
                          Qty: {item.quantity}
                        </div>
                      </div>

                      {/* price */}
                      <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', flexShrink: 0 }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    {i < order.products.length - 1 && <div style={S.divider} />}
                  </div>
                ))}

                {/* total */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0 0',
                  borderTop: '2px solid var(--border-light)',
                  marginTop: 14,
                }}>
                  <strong style={{ fontSize: 15 }}>Order Total</strong>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--primary-600)' }}>
                    ${order.totalAmount?.toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT col — sidebar ──────────────────────────────────────── */}
        <div className="col-md-4">
          <div style={{ ...S.card, position: 'sticky', top: 20, marginBottom: 0 }}>
            <div style={{
              ...S.cardHeader,
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-500) 100%)',
            }}>
              <h5 style={{ margin: 0, fontWeight: 700, color: '#fff' }}>Order Summary</h5>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Order Date',   value: order ? fmt(order.createdAt) : '—' },
                { label: 'Order Status', value: order?.status || '—', badge: true },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border-light)',
                }}>
                  <span style={S.muted}>{row.label}</span>
                  {row.badge ? (
                    <StatusBadge status={row.value} />
                  ) : (
                    <strong style={{ fontSize: 13 }}>{row.value}</strong>
                  )}
                </div>
              ))}

              {/* Delivered confirmation */}
              {shipment.actualDeliveryDate && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px',
                  background: 'var(--success-50)',
                  border: '1px solid var(--success-200)',
                  borderRadius: 'var(--radius-lg)',
                  marginTop: 16,
                }}>
                  <span style={{ fontSize: 24 }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--success-700)' }}>Delivered!</div>
                    <div style={{ fontSize: 12, color: 'var(--success-600)', marginTop: 1 }}>
                      {fmt(shipment.actualDeliveryDate, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              )}

              {/* Estimated delivery highlight */}
              {!shipment.actualDeliveryDate && shipment.estimatedDeliveryDate && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  background: 'var(--primary-50)',
                  border: '1px solid var(--primary-100)',
                  borderRadius: 'var(--radius-lg)',
                  marginTop: 16,
                }}>
                  <span style={{ fontSize: 20 }}>📅</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Est. Delivery</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary-700)', marginTop: 1 }}>
                      {fmt(shipment.estimatedDeliveryDate, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              )}

              {/* Rate products CTA */}
              <Link
                to="/feedback"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  marginTop: 20, padding: '11px',
                  background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-500) 100%)',
                  color: '#fff',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700, fontSize: 13,
                  textDecoration: 'none',
                  boxShadow: 'var(--shadow-primary)',
                  transition: 'filter 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                ⭐ Rate Your Products
              </Link>

              <Link
                to="/dashboard"
                style={{
                  display: 'block', textAlign: 'center', marginTop: 10,
                  padding: '10px', fontSize: 13, fontWeight: 600,
                  color: 'var(--text-secondary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-300)'; e.currentTarget.style.color = 'var(--primary-600)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
