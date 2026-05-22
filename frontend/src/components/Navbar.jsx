import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBox } from '../context/BoxContext';

export default function Navbar() {
  const { user, logout, isAdmin, isCustomer } = useAuth();
  const { currentBox } = useBox();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const boxItemCount = currentBox?.products?.length || 0;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">SBMS</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {isCustomer && <li className="nav-item"><Link className="nav-link" to="/customize-box">My Box</Link></li>}
            <li className="nav-item"><Link className="nav-link" to="/products">Browse Products</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/plans">Plans</Link></li>
            {isCustomer && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/preferences">Preferences</Link></li>
              </>
            )}
            {isAdmin && (
              <li className="nav-item"><Link className="nav-link" to="/admin">Admin</Link></li>
            )}
          </ul>
          <ul className="navbar-nav">
            {isCustomer && (
              <li className="nav-item">
                <Link className="nav-link position-relative" to="/customize-box">
                  📦 My Box
                  {boxItemCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success" style={{ fontSize: 10 }}>
                      {boxItemCount}
                    </span>
                  )}
                </Link>
              </li>
            )}
            {user ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/profile">Profile</Link></li>
                <li className="nav-item"><button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Sign In</Link></li>
                <li className="nav-item"><Link className="btn btn-primary btn-sm" to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
