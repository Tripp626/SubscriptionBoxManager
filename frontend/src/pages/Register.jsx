import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/api';

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: 'Weak', color: '#ef4444', width: '20%' };
  if (score <= 2) return { label: 'Fair', color: '#f59e0b', width: '40%' };
  if (score <= 3) return { label: 'Good', color: '#3b82f6', width: '60%' };
  if (score <= 4) return { label: 'Strong', color: '#10b981', width: '80%' };
  return { label: 'Very Strong', color: '#059669', width: '100%' };
}

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(form.password);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!form.email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...userData } = form;
      const { data } = await register(userData);
      loginUser(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Side - Branding */}
      <div className="d-none d-lg-flex" style={{
        flex: '1',
        background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #4f46e5 100%)',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px',
      }}>
        {/* Decorative shapes */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '200px',
          height: '200px',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '5%',
          left: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '15%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
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
            🎉
          </div>
          <h1 style={{
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: 800,
            marginBottom: '16px',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}>
            Start Your Journey
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            fontWeight: 400,
          }}>
            Create your free account and start receiving personalized subscription boxes tailored to your tastes and preferences.
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            marginTop: '32px',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            {[
              { icon: '🎯', text: 'Personalized for you' },
              { icon: '🚚', text: 'Free shipping' },
              { icon: '⏸️', text: 'Cancel anytime' },
            ].map(item => (
              <div key={item.text} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255,255,255,0.12)',
                padding: '10px 20px',
                borderRadius: '9999px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
                width: 'fit-content',
              }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                {item.text}
              </div>
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
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Mobile logo */}
          <div className="d-lg-none" style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              borderRadius: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              marginBottom: '12px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.39)',
            }}>
              🎉
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.025em' }}>
              Create Your Account
            </h2>
          </div>

          <div className="d-none d-lg-block" style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.025em' }}>
              Create a new account
            </h2>
            <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '15px' }}>
              Start your subscription journey today.
            </p>
          </div>

          {error && (
            <div className="alert-modern alert-modern-danger" style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name Row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label-modern" htmlFor="firstName">First Name</label>
                <div className="input-icon-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="firstName"
                    type="text"
                    className="form-control-modern"
                    name="firstName"
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label-modern" htmlFor="lastName">Last Name</label>
                <div className="input-icon-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="lastName"
                    type="text"
                    className="form-control-modern"
                    name="lastName"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label className="form-label-modern" htmlFor="email">Email Address</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  className="form-control-modern"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '18px' }}>
              <label className="form-label-modern" htmlFor="password">Password</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control-modern"
                  name="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
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
              {/* Password Strength */}
              {form.password.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{
                    height: '4px',
                    borderRadius: '2px',
                    background: '#e5e7eb',
                    overflow: 'hidden',
                    marginBottom: '4px',
                  }}>
                    <div style={{
                      height: '100%',
                      width: passwordStrength.width,
                      background: passwordStrength.color,
                      borderRadius: '2px',
                      transition: 'all 0.3s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label-modern" htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control-modern"
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  style={{
                    borderColor: form.confirmPassword && form.confirmPassword !== form.password ? '#ef4444' : undefined,
                  }}
                />
                {form.confirmPassword && form.confirmPassword === form.password && (
                  <span style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '16px',
                    color: '#10b981',
                  }}>✓</span>
                )}
              </div>
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500, marginTop: '4px', display: 'block' }}>
                  Passwords don't match
                </span>
              )}
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p style={{ textAlign: 'center', marginTop: '24px', color: '#6b7280', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: '#6366f1' }}>
              Sign in
            </Link>
          </p>

          {/* Terms */}
          <p style={{ textAlign: 'center', marginTop: '16px', color: '#9ca3af', fontSize: '12px', lineHeight: 1.5 }}>
            By creating an account, you agree to our{' '}
            <span style={{ color: '#6366f1', fontWeight: 600 }}>Terms of Service</span> and{' '}
            <span style={{ color: '#6366f1', fontWeight: 600 }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
