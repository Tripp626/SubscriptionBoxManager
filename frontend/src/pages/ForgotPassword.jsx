import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!email.trim()) {
      setStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setStatus({
        type: 'success',
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
      setEmail('');
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Side - Branding */}
      <div className="d-none d-lg-flex" style={{
        flex: '1',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px',
      }}>
        <div style={{
          position: 'absolute',
          top: '-80px',
          left: '-80px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-120px',
          right: '-60px',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '420px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            fontSize: '40px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            🔐
          </div>
          <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Reset Your Password
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: 1.7, fontWeight: 400 }}>
            No worries — it happens to the best of us. Enter your email and we'll send you a reset link.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        background: '#f8f9fc',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div className="d-lg-none" style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #4f46e5, #a855f7)',
              borderRadius: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '12px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.39)',
            }}>🔐</div>
          </div>

          <div className="d-none d-lg-block" style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.025em' }}>
              Forgot password?
            </h2>
            <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '15px' }}>
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {status.message && (
            <div className={`alert-modern ${status.type === 'success' ? 'alert-modern-success' : 'alert-modern-danger'}`} style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '18px' }}>{status.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label-modern" htmlFor="email">Email Address</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  className="form-control-modern"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-gradient-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-modern" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link to="/login" style={{ fontWeight: 600, color: '#6366f1', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
