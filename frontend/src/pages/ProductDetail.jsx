import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, getProductFeedback, createFeedback, getMyOrders } from '../services/api';
import { useBox } from '../context/BoxContext';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBox } = useBox();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [userOrder, setUserOrder] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, feedRes] = await Promise.all([
          getProduct(id),
          getProductFeedback(id),
        ]);
        setProduct(prodRes.data);
        setFeedback(feedRes.data);

        if (user?.role === 'customer') {
          try {
            const { data: orders } = await getMyOrders();
            const orderWithProduct = orders.find(o =>
              o.products.some(p => p.product?._id === id || p.product === id)
            );
            if (orderWithProduct) setUserOrder(orderWithProduct);
          } catch {
            // Orders may not exist yet
          }

          const myReview = feedRes.data.find(f => f.user?._id === user._id || f.user === user._id);
          if (myReview) setExistingReview(myReview);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id, user]);

  const inBox = currentBox?.products?.some(p => p._id === id);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewMessage('');
    try {
      await createFeedback({
        productId: id,
        orderId: userOrder?._id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewMessage(existingReview ? 'Review updated!' : 'Review submitted!');
      setShowReviewForm(false);
      const { data: feedRes } = await getProductFeedback(id);
      setFeedback(feedRes);
      const myReview = feedRes.find(f => f.user?._id === user._id || f.user === user._id);
      if (myReview) setExistingReview(myReview);
    } catch (err) {
      setReviewMessage(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (!product) return <div className="container py-5 text-center"><p>Loading...</p></div>;

  const canReview = user?.role === 'customer' && userOrder;

  return (
    <div className="container py-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>← Back</button>
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body text-center bg-light" style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ProductImage product={product} wSize={620} hSize={320} className="rounded" />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p className="text-muted">{product.category}</p>
          <h3 className="text-primary">${product.price?.toFixed(2)}</h3>
          <p>{product.description}</p>
          <div className="mb-3">
            <span className="badge bg-warning me-2">★ {product.averageRating?.toFixed(1) ?? '0.0'} ({product.totalRatings} reviews)</span>
            <span className={`badge bg-${product.quantity > 0 ? 'success' : 'danger'}`}>
              {product.quantity > 0 ? `In Stock (${product.quantity} available)` : 'Out of Stock'}
            </span>
          </div>
          {product.tags?.length > 0 && (
            <div className="mb-3">
              {product.tags.map(tag => <span key={tag} className="badge bg-secondary me-1">{tag}</span>)}
            </div>
          )}
          {user?.role === 'customer' && product.quantity > 0 && (
            <div className="d-flex align-items-center gap-2 mt-3">
              {inBox ? (
                <button className="btn btn-success" disabled>
                  ✓ In Your Upcoming Box
                </button>
              ) : (
                <button className="btn btn-outline-primary" onClick={() => navigate('/customize-box')}>
                  Swap Into My Box
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="row mt-5">
        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Customer Reviews</h4>
            {canReview && !showReviewForm && (
              <button className="btn btn-sm btn-primary" onClick={() => setShowReviewForm(true)}>
                {existingReview ? 'Edit My Review' : 'Write a Review'}
              </button>
            )}
          </div>

          {!canReview && user?.role === 'customer' && !showReviewForm && (
            <p className="text-muted small">Purchase this product to leave a review.</p>
          )}

          {showReviewForm && (
            <div className="card mb-3 shadow-sm border-primary">
              <div className="card-body">
                <h6>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h6>
                {reviewMessage && <div className="alert alert-info py-1 px-2 small">{reviewMessage}</div>}
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-2">
                    <label className="form-label small">Rating</label>
                    <div>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className="btn btn-sm p-0 me-1"
                          style={{ fontSize: 24, color: star <= reviewRating ? '#ffc107' : '#ccc' }}
                          onClick={() => setReviewRating(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Comment</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="What did you think of this product?"
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={reviewLoading}>
                      {reviewLoading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowReviewForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {feedback.length === 0 ? (
            <p className="text-muted">No reviews yet. Be the first to review!</p>
          ) : (
            feedback.map(f => (
              <div key={f._id} className={`card mb-2 shadow-sm ${(f.user?._id === user?._id || f.user === user?._id) ? 'border-primary' : ''}`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <strong>{f.user?.firstName} {f.user?.lastName}</strong>
                    <span className="text-warning">{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</span>
                  </div>
                  {f.comment && <p className="mb-0 mt-1">{f.comment}</p>}
                  <small className="text-muted">{new Date(f.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
