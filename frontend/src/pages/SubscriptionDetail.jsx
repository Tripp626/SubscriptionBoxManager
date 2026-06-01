import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMySubscriptions, cancelSubscription, renewSubscription,
  pauseSubscription, resumeSubscription, skipNextBilling,
} from '../services/api';

/* ─── shared style tokens ───────────────────────────────────────────────────── */
const S = {
  card: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
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
    fontSize: '12px',
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
  divider: {
    height: 1,
    background: 'var(--border-light)',
    margin: '16px 0',
  },
  muted: { color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.55 },
};

/* ─── status config ─────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  active:    { label: 'Active',    bg: 'var(--success-50)', color: 'var(--success-600)', dot: 'var(--success-500)' },
  paused:    { label: 'Paused',    bg: 'var(--warning-50)', color: 'var(--warning-600)', dot: 'var(--warning-500)' },
  cancelled: { label: 'Cancelled', bg: 'var(--danger-50)',  color: 'var(--danger-600)',  dot: 'var(--danger-500)'  },
  expired:   { label: 'Expired',   bg: 'var(--gray-100)',   color: 'var(--text-secondary)', dot: 'var(--gray-400)' },
};

/* ─── tiny reusables ────────────────────────────────────────────────────────── */
function Spinner({ small = false }) {
  const size = small ? 14 : 26;
  return (
    <span style={{
      width: size, height: size,
      border: '2px solid var(--border-light)',
      borderTopColor: 'var(--primary-500)',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.expired;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: '11px', fontWeight: 700,
      padding: '4px 12px', borderRadius: 'var(--radius-full)',
      textTransform: 'uppercase', letterSpacing: '0.04em',
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {s.label}
    </span>
  );
}

function DetailRow({ label, value, highlight = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={S.label}>{label}</span>
      <span style={{ ...S.value, color: highlight ? 'var(--primary-600)' : 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  );
}

function ActionButton({ label, loading, onClick, variant = 'outline-secondary', fullWidth = true, disabled = false }) {
  const styles = {
    'gradient-primary': {
      background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-500) 100%)',
      color: '#fff', border: 'none',
      boxShadow: 'var(--shadow-primary)',
    },
    'outline-success': {
      background: 'transparent', color: 'var(--success-600)',
      border: '2px solid var(--success-200)',
    },
    'outline-warning': {
      background: 'transparent', color: 'var(--warning-600)',
      border: '2px solid var(--warning-200)',
    },
    'outline-info': {
      background: 'transparent', color: 'var(--info-600)',
      border: '2px solid var(--info-200)',
    },
    'outline-danger': {
      background: 'transparent', color: 'var(--danger-600)',
      border: '2px solid var(--danger-200)',
    },
    'outline-secondary': {
      background: 'transparent', color: 'var(--text-secondary)',
      border: '2px solid var(--border-light)',
    },
  };

  const hoverMap = {
    'gradient-primary': { filter: 'brightness(1.1)', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(99,102,241,0.4)' },
    'outline-success':  { background: 'var(--success-50)',  borderColor: 'var(--success-400)' },
    'outline-warning':  { background: 'var(--warning-50)',  borderColor: 'var(--warning-400)' },
    'outline-info':     { background: 'var(--info-50)',     borderColor: 'var(--info-400)'    },
    'outline-danger':   { background: 'var(--danger-50)',   borderColor: 'var(--danger-400)'  },
    'outline-secondary':{ background: 'var(--bg-tertiary)', borderColor: 'var(--gray-300)'    },
  };

  const base = styles[variant] || styles['outline-secondary'];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...base,
        width: fullWidth ? '100%' : 'auto',
        padding: '10px 18px',
        borderRadius: 'var(--radius-md)',
        fontSize: '13px', fontWeight: 700,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.65 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { if (!disabled && !loading) Object.assign(e.currentTarget.style, hoverMap[variant] || {}); }}
      onMouseLeave={e => { if (!disabled && !loading) Object.assign(e.currentTarget.style, base); }}
    >
      {loading ? <><Spinner small /> Processing…</> : label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════════ */
export default function SubscriptionDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage]           = useState({ text: '', type: '' });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMySubscriptions();
        const sub = data.find(s => s._id === id);
        if (sub) setSubscription(sub);
        else navigate('/dashboard');
      } catch { navigate('/dashboard'); }
      finally { setLoading(false); }
    })();
  }, [id, navigate]);

  const runAction = async (fn, successMsg) => {
    setActionLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const { data } = await fn();
      setSubscription(data.subscription);
      setMessage({ text: successMsg(data), type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Something went wrong. Please try again.', type: 'danger' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    runAction(() => cancelSubscription(id), () => 'Subscription cancelled successfully.');
  };
  const handleRenew  = () => runAction(() => renewSubscription(id),  () => 'Subscription renewed successfully.');
  const handleResume = () => runAction(() => resumeSubscription(id), () => 'Subscription resumed! Your next box will be prepared as scheduled.');
  const handlePause  = () => {
    if (!window.confirm("Pause this subscription? You won't be charged or receive boxes until you resume.")) return;
    runAction(() => pauseSubscription(id), () => 'Subscription paused. You can resume anytime.');
  };
  const handleSkip   = () => {
    if (!window.confirm("Skip your next billing cycle?")) return;
    runAction(
      () => skipNextBilling(id),
      (data) => `Next billing skipped. New billing date: ${new Date(data.subscription.nextBillingDate).toLocaleDateString()}.`
    );
  };

  /* ── loading / empty states ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <Spinner />
      <p style={S.muted}>Loading subscription…</p>
    </div>
  );

  if (!subscription) return null;

  const isActive    = subscription.status === 'active';
  const isPaused    = subscription.status === 'paused';
  const isInactive  = subscription.status === 'cancelled' || subscription.status === 'expired';

  const fmt = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

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
            📋 Subscription Details
          </h2>
          <p style={S.muted}>{subscription.plan?.name || 'Subscription'} — manage your plan below</p>
        </div>
        <StatusBadge status={subscription.status} />
      </div>

      <div className="row">

        {/* ── LEFT — details ──────────────────────────────────────────── */}
        <div className="col-md-8 mb-4">

          {/* Message banner */}
          {message.text && (
            <div
              className={`alert-modern alert-modern-${message.type}`}
              style={{ marginBottom: 20 }}
            >
              {message.type === 'success' ? '✓ ' : '⚠️ '}{message.text}
            </div>
          )}

          {/* Plan overview card */}
          <div style={{ ...S.card, marginBottom: 20 }}>
            <div style={S.cardHeader}>
              <h5 style={{ margin: 0, fontWeight: 700 }}>Plan Overview</h5>
              <span style={{
                background: 'var(--primary-50)', color: 'var(--primary-600)',
                fontSize: 11, fontWeight: 700, padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
              }}>
                {subscription.plan?.frequency || 'Monthly'}
              </span>
            </div>

            <div style={S.cardBody}>
              {/* 2-col grid of details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px' }}>
                <DetailRow label="Plan Name"       value={subscription.plan?.name || 'N/A'} />
                <DetailRow label="Price"           value={`$${subscription.plan?.price?.toFixed(2)} / ${subscription.plan?.frequency}`} highlight />
                <DetailRow label="Start Date"      value={fmt(subscription.startDate)} />
                <DetailRow label="End Date"        value={fmt(subscription.endDate)} />
                <DetailRow label="Next Billing"    value={fmt(subscription.nextBillingDate)} />
                <DetailRow label="Auto-Renew"      value={subscription.autoRenew ? '✓ Enabled' : '✗ Disabled'} />
                <DetailRow label="Payment Method"  value={subscription.paymentMethod || 'N/A'} />
                <DetailRow label="Products / Box"  value={`Up to ${subscription.plan?.maxProducts || 'N/A'}`} />
              </div>

              {/* Benefits */}
              {subscription.plan?.benefits?.length > 0 && (
                <>
                  <div style={S.divider} />
                  <div>
                    <span style={{ ...S.label, marginBottom: 10 }}>Plan Benefits</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px 16px' }}>
                      {subscription.plan.benefits.map((b, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--success-500)', fontWeight: 700, fontSize: 14 }}>✓</span>
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Billing timeline card */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <h5 style={{ margin: 0, fontWeight: 700 }}>Billing Timeline</h5>
            </div>
            <div style={S.cardBody}>
              {[
                { icon: '🟢', label: 'Subscription Started',  date: fmt(subscription.startDate),       done: true  },
                { icon: '💳', label: 'Next Billing Date',     date: fmt(subscription.nextBillingDate),  done: false },
                { icon: '🔚', label: 'Subscription Ends',     date: fmt(subscription.endDate),          done: false },
              ].map((item, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < arr.length - 1 ? 20 : 0, position: 'relative' }}>
                  {/* vertical line */}
                  {i < arr.length - 1 && (
                    <div style={{
                      position: 'absolute', left: 19, top: 32,
                      width: 2, height: 'calc(100% - 12px)',
                      background: item.done ? 'linear-gradient(180deg, var(--primary-400), var(--border-light))' : 'var(--border-light)',
                    }} />
                  )}
                  {/* dot */}
                  <div style={{
                    width: 40, height: 40, flexShrink: 0,
                    background: item.done ? 'var(--primary-50)' : 'var(--bg-tertiary)',
                    border: `2px solid ${item.done ? 'var(--primary-200)' : 'var(--border-light)'}`,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT — actions ──────────────────────────────────────────── */}
        <div className="col-md-4">
          <div style={{ ...S.card, position: 'sticky', top: 20 }}>
            <div style={{
              ...S.cardHeader,
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-500) 100%)',
            }}>
              <h5 style={{ margin: 0, fontWeight: 700, color: '#fff' }}>Manage Subscription</h5>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Active */}
              {isActive && (
                <>
                  <p style={{ ...S.muted, marginBottom: 4 }}>
                    Active and auto-renewing on <strong>{fmt(subscription.nextBillingDate)}</strong>.
                  </p>
                  <ActionButton
                    label="⏸ Pause Subscription"
                    variant="outline-warning"
                    loading={actionLoading}
                    onClick={handlePause}
                  />
                  <ActionButton
                    label="⏭ Skip Next Billing"
                    variant="outline-info"
                    loading={actionLoading}
                    onClick={handleSkip}
                  />
                  <div style={S.divider} />
                  <ActionButton
                    label="✕ Cancel Subscription"
                    variant="outline-danger"
                    loading={actionLoading}
                    onClick={handleCancel}
                  />
                </>
              )}

              {/* Paused */}
              {isPaused && (
                <>
                  <p style={{ ...S.muted, marginBottom: 4 }}>
                    Paused — no boxes or charges until you resume.
                  </p>
                  <ActionButton
                    label="▶ Resume Subscription"
                    variant="outline-success"
                    loading={actionLoading}
                    onClick={handleResume}
                  />
                  <div style={S.divider} />
                  <ActionButton
                    label="✕ Cancel Subscription"
                    variant="outline-danger"
                    loading={actionLoading}
                    onClick={handleCancel}
                  />
                </>
              )}

              {/* Cancelled / Expired */}
              {isInactive && (
                <>
                  <p style={{ ...S.muted, marginBottom: 4 }}>
                    This subscription is <strong>{subscription.status}</strong>. Renew to start receiving boxes again.
                  </p>
                  <ActionButton
                    label="🔄 Renew Subscription"
                    variant="gradient-primary"
                    loading={actionLoading}
                    onClick={handleRenew}
                  />
                </>
              )}

              {/* Always visible */}
              <ActionButton
                label="Browse Other Plans →"
                variant="outline-secondary"
                loading={false}
                onClick={() => navigate('/plans')}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
