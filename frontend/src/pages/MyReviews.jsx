import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyFeedback } from '../services/api';

export default function MyReviews() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const { data } = await getMyFeedback();
        setFeedback(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  if (loading) return <div className="container py-5 text-center"><p>Loading...</p></div>;

  return (
    <div className="container py-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      <h2>My Reviews</h2>

      {feedback.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">You haven't reviewed any products yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
        </div>
      ) : (
        <div className="row mt-4">
          {feedback.map(f => (
            <div key={f._id} className="col-md-6 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{f.product?.name || 'Unknown Product'}</h6>
                      <p className="text-muted small mb-1">{f.product?.category}</p>
                    </div>
                    <span className="text-warning">{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</span>
                  </div>
                  {f.comment && <p className="mt-2 mb-1">{f.comment}</p>}
                  <small className="text-muted">{new Date(f.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
