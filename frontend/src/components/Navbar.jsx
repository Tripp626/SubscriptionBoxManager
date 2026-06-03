import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBox } from '../context/BoxContext';

export default function Navbar() {
  const { user, logout, isAdmin, isCustomer } = useAuth();
  const { currentBox } = useBox();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const boxItemCount = currentBox?.products?.length || 0;
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '';

  return (
    <nav className="navbar navbar-expand-lg override-navbar" style={{ zIndex: 1000, boxShadow: '0 2px 20px rgba(0, 0, 0, 0.15)' }}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <span className="brand-icon">📦</span>
          Boxly
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          style={{ borderColor: 'rgba(255,255,255,0.2)' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {isCustomer && (
              <li className="nav-item">
                <Link className="nav-link" to="/customize-box">My Box</Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/products">Browse Products</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/plans">Plans</Link>
            </li>
            {isCustomer && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/preferences">Preferences</Link>
                </li>
              </>
            )}
            {isAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">Admin</Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav align-items-center" style={{ gap: '8px' }}>
            {isCustomer && (
              <li className="nav-item">
                <Link className="nav-link position-relative" to="/customize-box" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '18px' }}>📦</span>
                  My Box
                  {boxItemCount > 0 && (
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 700,
                        borderRadius: '9999px',
                        padding: '2px 7px',
                        minWidth: '18px',
                        textAlign: 'center',
                      }}
                    >
                      {boxItemCount}
                    </span>
                  )}
                </Link>
              </li>
            )}
            {user ? (
              <li className="nav-item dropdown" style={{ position: 'relative' }}>
                <button
                  className="nav-link"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 'var(--radius-md)',
                    padding: '5px 12px 5px 5px',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.8)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                >
                  <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                    {initials}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{user.firstName}</span>
                  <span style={{ fontSize: '10px', opacity: 0.5 }}>▾</span>
                </button>
                {dropdownOpen && (
                  <>
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div
                      className="dropdown-menu-modern"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 8px)',
                        zIndex: 1000,
                        background: 'white',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-xl)',
                        animation: 'slideDown 0.2s ease-out',
                        minWidth: '200px',
                        padding: '8px',
                      }}
                    >
                      <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-light)',
                        marginBottom: '4px',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                          {user.firstName} {user.lastName}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                      <Link
                        className="dropdown-item"
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: 'var(--text-secondary)',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <span>👤</span> Profile
                      </Link>
                      <Link
                        className="dropdown-item"
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: 'var(--text-secondary)',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <span>📊</span> Dashboard
                      </Link>
                      <Link
                        className="dropdown-item"
                        to="/preferences"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: 'var(--text-secondary)',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <span>⚙️</span> Preferences
                      </Link>
                      <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }} />
                      <button
                        className="dropdown-item"
                        onClick={handleLogout}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: 'var(--danger-600)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/login"
                    style={{
                      color: 'rgba(255,255,255,0.8) !important',
                      fontWeight: 500,
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    Sign In
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/register"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '7px 18px',
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      color: 'white',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 600,
                      fontSize: '13px',
                      border: 'none',
                      textDecoration: 'none',
                      boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(99, 102, 241, 0.4)'; }}
                  >
                    Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
