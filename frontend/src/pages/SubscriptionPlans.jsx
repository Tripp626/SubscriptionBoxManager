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
    <div className="container py-4">
      <h2 className="text-center mb-2">Choose Your Plan</h2>
      <p className="text-center text-muted mb-4">Select a subscription plan that fits your lifestyle.</p>

      <div className="row justify-content-center">
        {plans.map(plan => (
          <div key={plan._id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center d-flex flex-column">
                <h4>{plan.name}</h4>
                <h2 className="text-primary">${plan.price?.toFixed(2)}<small className="text-muted">/{plan.frequency}</small></h2>
                <p className="text-muted">{plan.description}</p>
                <ul className="list-unstyled text-start flex-grow-1">
                  {plan.benefits?.map((b, i) => <li key={i}>✓ {b}</li>)}
                </ul>
                <p className="text-muted"><small>Up to {plan.maxProducts} products per box</small></p>
                <button className="btn btn-primary w-100 mt-auto" onClick={() => handleSubscribeClick(plan)}>
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
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Subscription</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} disabled={loading}></button>
              </div>
              <div className="modal-body">
                {success ? (
                  <div className="text-center py-3">
                    <div className="text-success" style={{ fontSize: 48 }}>✓</div>
                    <h5 className="mt-2">Subscription Successful!</h5>
                    <p className="text-muted">Redirecting to dashboard...</p>
                  </div>
                ) : (
                  <>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <p>You are about to subscribe to:</p>
                    <div className="card bg-light mb-3">
                      <div className="card-body">
                        <h6>{selectedPlan.name}</h6>
                        <p className="mb-1">${selectedPlan.price?.toFixed(2)}/{selectedPlan.frequency}</p>
                        <p className="text-muted mb-0"><small>Up to {selectedPlan.maxProducts} products per box</small></p>
                      </div>
                    </div>
                    <p className="text-muted small">You will be charged ${selectedPlan.price?.toFixed(2)} today. Your next billing date will be in {selectedPlan.duration} month(s).</p>
                  </>
                )}
              </div>
              {!success && (
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={loading}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={confirmSubscribe} disabled={loading}>
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
