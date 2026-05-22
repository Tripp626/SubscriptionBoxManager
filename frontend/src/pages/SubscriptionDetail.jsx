import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMySubscriptions, cancelSubscription, renewSubscription, pauseSubscription, resumeSubscription, skipNextBilling, getShipmentByOrder } from '../services/api';

export default function SubscriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data } = await getMySubscriptions();
        const sub = data.find(s => s._id === id);
        if (sub) {
          setSubscription(sub);
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error(err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    setActionLoading(true);
    setMessage('');
    try {
      const { data } = await cancelSubscription(id);
      setSubscription(data.subscription);
      setMessage('Subscription cancelled successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to cancel subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenew = async () => {
    setActionLoading(true);
    setMessage('');
    try {
      const { data } = await renewSubscription(id);
      setSubscription(data.subscription);
      setMessage('Subscription renewed successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to renew subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!window.confirm('Pause this subscription? You won\'t be charged or receive boxes until you resume.')) return;
    setActionLoading(true);
    setMessage('');
    try {
      const { data } = await pauseSubscription(id);
      setSubscription(data.subscription);
      setMessage('Subscription paused. You can resume anytime.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to pause subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    setMessage('');
    try {
      const { data } = await resumeSubscription(id);
      setSubscription(data.subscription);
      setMessage('Subscription resumed! Your next box will be prepared as scheduled.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to resume subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!window.confirm('Skip your next billing cycle? You won\'t be charged or receive a box for the next period.')) return;
    setActionLoading(true);
    setMessage('');
    try {
      const { data } = await skipNextBilling(id);
      setSubscription(data.subscription);
      setMessage(`Next billing skipped. Your new billing date is ${new Date(data.subscription.nextBillingDate).toLocaleDateString()}.`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to skip billing cycle.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="container py-5 text-center"><p>Loading...</p></div>;
  if (!subscription) return null;

  const isActive = subscription.status === 'active';
  const isCancelled = subscription.status === 'cancelled';
  const isExpired = subscription.status === 'expired';

  return (
    <div className="container py-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>

      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Subscription Details</h5>
              <span className={`badge bg-${isActive ? 'success' : subscription.status === 'paused' ? 'warning' : isCancelled ? 'danger' : 'secondary'} fs-6`}>
                {subscription.status}
              </span>
            </div>
            <div className="card-body">
              {message && <div className="alert alert-info">{message}</div>}

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="text-muted small">Plan</label>
                  <p className="fw-bold mb-0">{subscription.plan?.name || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small">Price</label>
                  <p className="fw-bold mb-0">${subscription.plan?.price?.toFixed(2)}/{subscription.plan?.frequency}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="text-muted small">Start Date</label>
                  <p className="mb-0">{new Date(subscription.startDate).toLocaleDateString()}</p>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small">End Date</label>
                  <p className="mb-0">{new Date(subscription.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="text-muted small">Next Billing Date</label>
                  <p className="mb-0">{new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small">Auto-Renew</label>
                  <p className="mb-0">{subscription.autoRenew ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="text-muted small">Payment Method</label>
                  <p className="mb-0">{subscription.paymentMethod}</p>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small">Products per Box</label>
                  <p className="mb-0">Up to {subscription.plan?.maxProducts}</p>
                </div>
              </div>

              {subscription.plan?.benefits?.length > 0 && (
                <div className="mb-3">
                  <label className="text-muted small">Benefits</label>
                  <ul className="list-unstyled mb-0">
                    {subscription.plan.benefits.map((b, i) => <li key={i}>✓ {b}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm sticky-top" style={{ top: 20 }}>
            <div className="card-header"><h5 className="mb-0">Actions</h5></div>
            <div className="card-body">
              {isActive && (
                <>
                  <p className="text-muted small">Your subscription is active and will auto-renew on {new Date(subscription.nextBillingDate).toLocaleDateString()}.</p>
                  <button className="btn btn-outline-warning w-100 mb-2" onClick={handlePause} disabled={actionLoading}>
                    {actionLoading ? 'Processing...' : 'Pause Subscription'}
                  </button>
                  <button className="btn btn-outline-info w-100 mb-2" onClick={handleSkip} disabled={actionLoading}>
                    {actionLoading ? 'Processing...' : 'Skip Next Billing'}
                  </button>
                  <button className="btn btn-outline-danger w-100 mb-2" onClick={handleCancel} disabled={actionLoading}>
                    {actionLoading ? 'Processing...' : 'Cancel Subscription'}
                  </button>
                </>
              )}
              {subscription.status === 'paused' && (
                <>
                  <p className="text-muted small">This subscription is paused. No boxes will be sent and you won't be charged until you resume.</p>
                  <button className="btn btn-success w-100 mb-2" onClick={handleResume} disabled={actionLoading}>
                    {actionLoading ? 'Processing...' : 'Resume Subscription'}
                  </button>
                  <button className="btn btn-outline-danger w-100 mb-2" onClick={handleCancel} disabled={actionLoading}>
                    {actionLoading ? 'Processing...' : 'Cancel Subscription'}
                  </button>
                </>
              )}
              {(isCancelled || isExpired) && (
                <>
                  <p className="text-muted small">This subscription is {subscription.status}. Renew to start receiving boxes again.</p>
                  <button className="btn btn-primary w-100 mb-2" onClick={handleRenew} disabled={actionLoading}>
                    {actionLoading ? 'Processing...' : 'Renew Subscription'}
                  </button>
                </>
              )}
              <button className="btn btn-outline-secondary w-100" onClick={() => navigate('/plans')}>
                Browse Other Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
