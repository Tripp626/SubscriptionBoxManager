import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const { data } = await login({ email, password });
      loginUser(data);
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'delivery') navigate('/delivery');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
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
        {/* Decorative circles */}
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
        <div style={{
          position: 'absolute',
          top: '40%',
          right: '10%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
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
            📦
          </div>
          <h1 style={{
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: 800,
            marginBottom: '16px',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}>
            Subscription Box Manager
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            fontWeight: 400,
          }}>
            Curated boxes delivered to your door, personalized just for you. Sign in to manage your subscriptions, customize your boxes, and discover new products.
          </p>

          {/* Feature pills */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '32px',
          }}>
            {['Personalized Picks', 'Track Shipments', 'Manage Plans'].map(feature => (
              <span key={feature} style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                {feature}
              </span>
            ))}
          </div>
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
          {/* Mobile logo */}
          <div className="d-lg-none" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #4f46e5, #a855f7)',
              borderRadius: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '16px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.39)',
            }}>
              📦
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.025em' }}>
              Welcome Back
            </h2>
          </div>

          <div className="d-none d-lg-block" style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.025em' }}>
              Sign in to your account
            </h2>
            <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '15px' }}>
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert-modern alert-modern-danger" style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label-modern" htmlFor="email">
                Email Address
              </label>
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

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label-modern" htmlFor="password" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ fontSize: '13px', fontWeight: 600, color: '#6366f1' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="input-icon-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control-modern"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#9ca3af',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 500 }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          {/* Social Buttons (decorative) */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn-outline-primary-modern" style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              fontSize: '14px',
            }}>
              <span style={{ fontSize: '18px' }}>G</span>
              Google
            </button>
            <button type="button" className="btn-outline-primary-modern" style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              fontSize: '14px',
            }}>
              <span style={{ fontSize: '18px' }}>🍎</span>
              Apple
            </button>
          </div>

          {/* Register Link */}
          <p style={{ textAlign: 'center', marginTop: '28px', color: '#6b7280', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: '#6366f1' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
