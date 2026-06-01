import { useState, useEffect } from 'react';
import { getPlans, subscribe } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await getPlans();
        setPlans(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribeClick = (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedPlan(plan);
    setShowModal(true);
    setError('');
    setSuccess(false);
  };

  const confirmSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      await subscribe({ planId: selectedPlan._id });
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 page-enter">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span style={{
          display: 'inline-block',
          background: 'var(--primary-50)',
          color: 'var(--primary-600)',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          fontSize: '13px',
          fontWeight: 700,
          marginBottom: '16px',
        }}>
          Simple Pricing
        </span>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '12px' }}>
          Choose your <span className="gradient-text">perfect plan</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto' }}>
          Select a subscription plan that fits your lifestyle. No hidden fees, cancel anytime.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="row justify-content-center">
        {plans.map((plan, idx) => (
          <div key={plan._id} className="col-md-4 mb-4">
            <div className={`card-hover`}
              style={{
                borderRadius: 'var(--radius-xl)',
                border: idx === 1 ? '2px solid var(--primary-400)' : '1px solid var(--border-light)',
                background: 'var(--bg-primary)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Popular badge */}
              {idx === 1 && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '-32px',
                  background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                  color: 'white',
                  padding: '4px 40px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transform: 'rotate(45deg)',
                  zIndex: 1,
                }}>
                  Popular
                </div>
              )}

              <div style={{ padding: '32px 28px', flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>{plan.name}</h4>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>{plan.description}</div>

                {/* Price */}
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ${plan.price?.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/{plan.frequency}</span>
                </div>

                {/* Benefits */}
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 24px',
                  flex: 1,
                  textAlign: 'left',
                }}>
                  {plan.benefits?.map((b, i) => (
                    <li key={i} style={{
                      padding: '8px 0',
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'var(--success-50)',
                        color: 'var(--success-600)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}>✓</span>
                      {b}
                    </li>
                  ))}
                  <li style={{
                    padding: '8px 0',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'var(--success-50)',
                      color: 'var(--success-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}>✓</span>
                    Up to {plan.maxProducts} products per box
                  </li>
                </ul>

                <button
                  className={idx === 1 ? 'btn-gradient-primary' : 'btn-outline-primary-modern'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    justifyContent: 'center',
                    display: 'flex',
                  }}
                  onClick={() => handleSubscribeClick(plan)}
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedPlan && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-content-modern">
              <div className="modal-header modal-header-modern">
                <h5 style={{ fontWeight: 700, margin: 0 }}>Confirm Subscription</h5>
                <button type="button" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowModal(false)} disabled={loading}>
                  ✕
                </button>
              </div>
              <div className="modal-body modal-body-modern">
                {success ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: 'var(--success-50)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      marginBottom: '16px',
                    }}>
                      ✓
                    </div>
                    <h5 style={{ fontWeight: 700, marginBottom: '8px' }}>Subscription Successful!</h5>
                    <p style={{ color: 'var(--text-muted)' }}>Redirecting to dashboard...</p>
                  </div>
                ) : (
                  <>
                    {error && <div className="alert-modern alert-modern-danger" style={{ marginBottom: '16px' }}>⚠️ {error}</div>}
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>You are about to subscribe to:</p>
                    <div style={{
                      background: 'linear-gradient(135deg, var(--primary-50), #eef2ff)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '20px',
                      marginBottom: '20px',
                      border: '1px solid var(--primary-200)',
                    }}>
                      <h6 style={{ fontWeight: 700, marginBottom: '4px' }}>{selectedPlan.name}</h6>
                      <p style={{ margin: '0 0 4px', color: 'var(--primary-600)', fontWeight: 700, fontSize: '1.25rem' }}>
                        ${selectedPlan.price?.toFixed(2)}/{selectedPlan.frequency}
                      </p>
                      <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '13px' }}>
                        Up to {selectedPlan.maxProducts} products per box
                      </p>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                      You will be charged ${selectedPlan.price?.toFixed(2)} today. Your next billing date will be in {selectedPlan.duration} month(s).
                    </p>
                  </>
                )}
              </div>
              {!success && (
                <div className="modal-footer modal-footer-modern">
                  <button type="button" className="btn-outline-primary-modern" onClick={() => setShowModal(false)} disabled={loading} style={{ padding: '10px 24px', fontSize: '14px' }}>
                    Cancel
                  </button>
                  <button type="button" className="btn-gradient-primary" onClick={confirmSubscribe} disabled={loading} style={{ padding: '10px 24px', fontSize: '14px' }}>
                    {loading ? 'Processing...' : `Confirm — $${selectedPlan.price?.toFixed(2)}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
