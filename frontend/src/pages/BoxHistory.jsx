import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBoxHistory } from '../services/api';
import ProductImage from '../components/ProductImage';

export default function BoxHistory() {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await getBoxHistory();
        setBoxes(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load box history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const statusLabels = {
    shipped: { text: 'Shipped', badge: 'bg-primary' },
    delivered: { text: 'Delivered', badge: 'bg-success' },
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your box history...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">📦 Box History</h2>
          <p className="text-muted mb-0">Your past subscription boxes</p>
        </div>
        <Link to="/customize-box" className="btn btn-primary">
          View Upcoming Box
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {boxes.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <span style={{ fontSize: 48 }}>📦</span>
            <h4 className="mt-3">No Box History Yet</h4>
            <p className="text-muted">Your delivered boxes will appear here once they arrive.</p>
            <Link to="/customize-box" className="btn btn-primary mt-2">
              View Your Upcoming Box
            </Link>
          </div>
        </div>
      ) : (
        boxes.map(box => {
          const statusInfo = statusLabels[box.status] || { text: box.status, badge: 'bg-secondary' };
          return (
            <div key={box._id} className="card shadow-sm mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <strong>Box #{box._id.slice(-8).toUpperCase()}</strong>
                  <span className="text-muted ms-2">
                    {new Date(box.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <span className={`badge ${statusInfo.badge}`}>{statusInfo.text}</span>
              </div>
              <div className="card-body">
                <div className="row">
                  {box.products?.map(product => (
                    <div key={product._id} className="col-md-3 col-6 mb-3">
                      <div className="card h-100 border-0 bg-light">
                        <div className="card-body text-center py-2">
                          <ProductImage product={product} size={40} />
                          <h6 className="card-title mt-2 mb-1 small">{product.name}</h6>
                          <p className="text-muted small mb-0">{product.category}</p>
                          <p className="fw-bold small mb-0">${product.price?.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <hr />

                <div className="row text-center">
                  <div className="col-md-4">
                    <small className="text-muted d-block">Shipped</small>
                    <strong>{box.shippedDate ? new Date(box.shippedDate).toLocaleDateString() : '—'}</strong>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Delivered</small>
                    <strong>{box.deliveredDate ? new Date(box.deliveredDate).toLocaleDateString() : '—'}</strong>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Total Value</small>
                    <strong>${box.products?.reduce((s, p) => s + (p.price || 0), 0).toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
