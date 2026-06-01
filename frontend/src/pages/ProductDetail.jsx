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

  if (!product) {
    return (
      <div className="container py-5 text-center page-enter">
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }} />
      </div>
    );
  }

  const canReview = user?.role === 'customer' && userOrder;

  return (
    <div className="container py-4 page-enter">
      <button
        className="btn-outline-primary-modern"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '20px', padding: '6px 16px', fontSize: '13px' }}
      >
        ← Back
      </button>

      <div className="row">
        {/* Image Section */}
        <div className="col-md-6 mb-4">
          <div className="card-elevated" style={{ overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-50), var(--bg-tertiary))',
              minHeight: '340px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
            }}>
              <ProductImage product={product} wSize={620} hSize={340} />
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="col-md-6">
          <div style={{
            display: 'inline-block',
            background: 'var(--primary-50)',
            color: 'var(--primary-600)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}>
            {product.category}
          </div>

          <h2 style={{ fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '8px', fontSize: '1.75rem' }}>
            {product.name}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} style={{ color: s <= Math.round(product.averageRating || 0) ? '#fbbf24' : '#d1d5db', fontSize: '18px' }}>★</span>
                ))}
              </div>
              <span style={{ fontWeight: 700, fontSize: '15px' }}>
                {product.averageRating?.toFixed(1) ?? '0.0'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                ({product.totalRatings} reviews)
              </span>
            </div>

            {/* Stock */}
            <span className="badge-modern" style={{
              background: product.quantity > 0 ? 'var(--success-50)' : 'var(--danger-50)',
              color: product.quantity > 0 ? 'var(--success-600)' : 'var(--danger-600)',
            }}>
              {product.quantity > 0 ? `✓ In Stock (${product.quantity})` : '✗ Out of Stock'}
            </span>
          </div>

          {/* Price */}
          <div style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '20px',
          }}>
            ${product.price?.toFixed(2)}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <h6 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Description</h6>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
              {product.description}
            </p>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h6 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Tags</h6>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.tags.map(tag => (
                  <span key={tag} style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {user?.role === 'customer' && product.quantity > 0 && (
            <div style={{ display: 'flex', gap: '12px' }}>
              {inBox ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'var(--success-50)',
                  color: 'var(--success-600)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '14px',
                }}>
                  ✓ In Your Upcoming Box
                </div>
              ) : (
                <button className="btn-gradient-primary" onClick={() => navigate('/customize-box')}>
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
          <div className="card-elevated" style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h5 style={{ fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⭐</span> Customer Reviews ({feedback.length})
              </h5>
              {canReview && !showReviewForm && (
                <button className="btn-gradient-primary" style={{ padding: '6px 18px', fontSize: '13px' }} onClick={() => setShowReviewForm(true)}>
                  {existingReview ? '✏️ Edit My Review' : '✍️ Write a Review'}
                </button>
              )}
            </div>

            <div style={{ padding: '20px 24px' }}>
              {!canReview && user?.role === 'customer' && !showReviewForm && (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Purchase this product to leave a review.</p>
              )}

              {/* Review Form */}
              {showReviewForm && (
                <div style={{
                  background: 'var(--primary-50)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  marginBottom: '20px',
                  border: '2px solid var(--primary-200)',
                }}>
                  <h6 style={{ fontWeight: 700, marginBottom: '16px' }}>
                    {existingReview ? 'Edit Your Review' : 'Write a Review'}
                  </h6>
                  {reviewMessage && (
                    <div className="alert-modern alert-modern-info" style={{ marginBottom: '16px', fontSize: '13px' }}>
                      {reviewMessage}
                    </div>
                  )}
                  <form onSubmit={handleSubmitReview}>
                    <div style={{ marginBottom: '16px' }}>
                      <label className="form-label-modern">Rating</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            style={{
                              fontSize: '28px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: star <= reviewRating ? '#fbbf24' : '#d1d5db',
                              padding: '0 2px',
                              transition: 'color 0.15s ease',
                            }}
                            onClick={() => setReviewRating(star)}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label className="form-label-modern">Comment</label>
                      <textarea
                        className="form-control-modern"
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="What did you think of this product?"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="btn-gradient-primary" style={{ padding: '8px 20px', fontSize: '13px' }} disabled={reviewLoading}>
                        {reviewLoading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                      </button>
                      <button type="button" className="btn-outline-primary-modern" style={{ padding: '8px 20px', fontSize: '13px' }} onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              {feedback.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px' }}>
                  <div className="empty-icon">💬</div>
                  <div className="empty-title">No reviews yet</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Be the first to review this product!</p>
                </div>
              ) : (
                feedback.map(f => (
                  <div key={f._id} style={{
                    padding: '16px 0',
                    borderBottom: '1px solid var(--border-light)',
                    background: (f.user?._id === user?._id || f.user === user?._id) ? 'var(--primary-50)' : 'transparent',
                    margin: '0 -24px',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    borderRadius: (f.user?._id === user?._id || f.user === user?._id) ? 'var(--radius-md)' : '0',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                          {f.user?.firstName?.[0]}{f.user?.lastName?.[0]}
                        </div>
                        <strong style={{ fontSize: '14px' }}>{f.user?.firstName} {f.user?.lastName}</strong>
                        {(f.user?._id === user?._id || f.user === user?._id) && (
                          <span style={{ fontSize: '11px', background: 'var(--primary-100)', color: 'var(--primary-600)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>You</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s} style={{ color: s <= f.rating ? '#fbbf24' : '#d1d5db', fontSize: '14px' }}>★</span>
                        ))}
                      </div>
                    </div>
                    {f.comment && <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '8px 0', lineHeight: 1.6 }}>{f.comment}</p>}
                    <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(f.createdAt).toLocaleDateString()}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
