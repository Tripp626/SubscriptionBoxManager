import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBox } from '../context/BoxContext';
import { useAuth } from '../context/AuthContext';
import { getMyBox, customizeBox, confirmBox, getProducts } from '../services/api';
import ProductImage from '../components/ProductImage';

export default function CustomizeBox() {
  const { user } = useAuth();
  const { currentBox, subscription, setBox, swapProduct, canCustomize } = useBox();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [swapMode, setSwapMode] = useState(null);
  const [swapSearch, setSwapSearch] = useState('');
  const [swapCategory, setSwapCategory] = useState('');
  const [swapProducts, setSwapProducts] = useState([]);
  const [swapPage, setSwapPage] = useState(1);
  const [swapTotalPages, setSwapTotalPages] = useState(1);
  const [confirming, setConfirming] = useState(false);

  const [addSearch, setAddSearch] = useState('');
  const [addCategory, setAddCategory] = useState('');
  const [addProducts, setAddProducts] = useState([]);
  const [addPage, setAddPage] = useState(1);
  const [addTotalPages, setAddTotalPages] = useState(1);
  const [addSaving, setAddSaving] = useState(false);

  const maxItems = subscription?.plan?.maxProducts || currentBox?.subscription?.plan?.maxProducts || 5;

  const fetchAddProducts = useCallback(async () => {
    try {
      const currentProductIds = currentBox?.products?.map(p => p._id) || [];
      const params = { page: addPage, limit: 20 };
      if (addSearch) params.search = addSearch;
      if (addCategory) params.category = addCategory;
      const { data } = await getProducts(params);
      const filtered = data.products.filter(p => !currentProductIds.includes(p._id));
      setAddProducts(filtered);
      setAddTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    }
  }, [addPage, addSearch, addCategory, currentBox]);

  const fetchSwapProducts = useCallback(async () => {
    try {
      const currentProductIds = currentBox?.products?.map(p => p._id) || [];
      const params = { page: swapPage, limit: 20 };
      if (swapSearch) params.search = swapSearch;
      if (swapCategory) params.category = swapCategory;
      const { data } = await getProducts(params);
      const filtered = data.products.filter(p => !currentProductIds.includes(p._id));
      setSwapProducts(filtered);
      setSwapTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    }
  }, [swapPage, swapSearch, swapCategory, currentBox]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchMyBox = async () => {
      try {
        const { data } = await getMyBox();
        setBox(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('No active subscription found. Subscribe to a plan to get started!');
        } else {
          setError(err.response?.data?.message || 'Failed to load your box.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyBox();
  }, [user, navigate, setBox]);

  useEffect(() => {
    if (swapMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSwapProducts();
    }
  }, [swapMode, fetchSwapProducts]);

  useEffect(() => {
    if (currentBox && currentBox.products.length < maxItems && canCustomize) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAddProducts();
    }
  }, [currentBox, fetchAddProducts, maxItems, canCustomize]);

  const handleSwap = async (newProduct) => {
    if (!currentBox) return;
    setSaving(true);
    setError('');
    try {
      const oldProductId = swapMode;
      const { data } = await customizeBox(currentBox._id, {
        removeProductId: oldProductId,
        addProductId: newProduct._id,
      });
      setBox({ box: data.box, subscription });
      // Update local state too
      swapProduct(oldProductId, newProduct._id);
      setSwapMode(null);
      setSwapSearch('');
      setSwapCategory('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to swap product.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (productId) => {
    if (!currentBox) return;
    setSaving(true);
    setError('');
    try {
      const { data } = await customizeBox(currentBox._id, {
        removeProductId: productId,
        addProductId: null,
      });
      setBox({ box: data.box, subscription });
      swapProduct(productId, null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove product.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = async (product) => {
    if (!currentBox) return;
    setAddSaving(true);
    setError('');
    try {
      const { data } = await customizeBox(currentBox._id, {
        removeProductId: null,
        addProductId: product._id,
      });
      setBox({ box: data.box, subscription });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product.');
    } finally {
      setAddSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (!currentBox) return;
    setConfirming(true);
    setError('');
    try {
      const { data } = await confirmBox(currentBox._id);
      // Handle potential order creation response
      if (data.error) {
        setError(data.error);
      } else {
        setBox({ box: data.box, subscription });
        // Optionally navigate to tracking page if order was created
        if (data.orderId) {
          navigate(`/track/${data.orderId}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm box.');
    } finally {
      setConfirming(false);
    }
  };

  const categories = ['Beauty', 'Food & Snacks', 'Tech & Gadgets', 'wellness', 'Home & Living'];

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your box...</p>
      </div>
    );
  }

  if (error && !currentBox) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          {error}
          <div className="mt-3">
            <Link to="/plans" className="btn btn-primary">Browse Plans</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentBox) return null;

  const statusLabels = {
    auto_generated: { text: 'Auto-Generated', badge: 'bg-info' },
    customized: { text: 'Customized', badge: 'bg-warning' },
    confirmed: { text: 'Confirmed — Ready to Ship', badge: 'bg-success' },
    shipped: { text: 'Shipped', badge: 'bg-primary' },
    delivered: { text: 'Delivered', badge: 'bg-secondary' },
  };

  const statusInfo = statusLabels[currentBox.status] || statusLabels.auto_generated;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">📦 Your Upcoming Box</h2>
          <p className="text-muted mb-0">
            {subscription?.plan?.name ? `${subscription.plan.name} Plan` : 'Subscription'} — Up to {maxItems} items
          </p>
        </div>
        <span className={`badge ${statusInfo.badge} fs-6`}>{statusInfo.text}</span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Swap product modal overlay */}
      {swapMode && (
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Choose a Replacement</h5>
            <button className="btn btn-sm btn-outline-light" onClick={() => setSwapMode(null)}>✕ Cancel</button>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={swapSearch}
                  onChange={(e) => { setSwapSearch(e.target.value); setSwapPage(1); }}
                />
              </div>
              <div className="col-md-3">
                <select className="form-select" value={swapCategory} onChange={(e) => { setSwapCategory(e.target.value); setSwapPage(1); }}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {saving && (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status" />
                <span className="ms-2">Swapping...</span>
              </div>
            )}

            <div className="row">
              {swapProducts.map(product => (
                <div key={product._id} className="col-md-3 mb-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body text-center bg-light" style={{ minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ProductImage product={product} wSize={270} hSize={150} />
                    </div>
                    <div className="card-body pt-2">
                      <h6 className="card-title mb-1 small">{product.name}</h6>
                      <p className="text-muted small mb-1">{product.category}</p>
                      <p className="fw-bold mb-1">${product.price?.toFixed(2)}</p>
                      <span className="badge bg-warning small">★ {product.averageRating?.toFixed(1) ?? '0.0'}</span>
                      <button
                        className="btn btn-sm btn-primary w-100 mt-2"
                        disabled={saving || product.quantity <= 0}
                        onClick={() => handleSwap(product)}
                      >
                        {product.quantity <= 0 ? 'Out of Stock' : 'Swap In'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {swapProducts.length === 0 && (
              <p className="text-muted text-center py-3">No products available to swap in.</p>
            )}

            {swapTotalPages > 1 && (
              <nav className="mt-3">
                <ul className="pagination justify-content-center">
                  {Array.from({ length: swapTotalPages }, (_, i) => (
                    <li key={i} className={`page-item ${swapPage === i + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setSwapPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>
      )}

      {/* Box contents */}
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Box Contents ({currentBox.products?.length || 0}/{maxItems})</h5>
              {currentBox.isPersonalized && (
                <span className="badge bg-warning text-dark">✨ Personalized</span>
              )}
            </div>
            <div className="card-body">
              {currentBox.products?.length === 0 ? (
                <p className="text-muted text-center py-3">Your box is empty. This shouldn't happen — contact support.</p>
              ) : (
                <div className="row">
                  {currentBox.products?.map(product => (
                    <div key={product._id} className="col-md-4 mb-3">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body text-center bg-light" style={{ minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ProductImage product={product} wSize={235} hSize={150} />
                        </div>
                        <div className="card-body pt-2">
                          <h6 className="card-title mb-1">{product.name}</h6>
                          <p className="text-muted small mb-1">{product.category}</p>
                          <p className="fw-bold mb-1">${product.price?.toFixed(2)}</p>
                          <span className="badge bg-warning">★ {product.averageRating?.toFixed(1) ?? '0.0'}</span>

                          {canCustomize && (
                            <div className="d-grid gap-1 mt-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setSwapMode(product._id)}
                                disabled={saving}
                              >
                                🔄 Swap
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemove(product._id)}
                                disabled={saving}
                              >
                                ✕ Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Item Button (if box not full) */}
        {currentBox.products.length < maxItems && canCustomize && (
          <div className="col-md-4">
            <div className="card shadow-sm sticky-top" style={{ top: 20 }}>
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Add Item to Box</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Search products to add...</label>
                  <input type="text" className="form-control" placeholder="Search for products..."
                    value={addSearch} onChange={(e) => { setAddSearch(e.target.value); setAddPage(1); }} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={addCategory} onChange={(e) => { setAddCategory(e.target.value); setAddPage(1); }}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {addSaving && (
                  <div className="text-center py-2">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                    <span className="ms-2">Searching...</span>
                  </div>
                )}

                {addProducts.length > 0 && (
                  <div className="mb-3">
                    <h6>Available Products:</h6>
                    {addProducts.map(product => (
                      <div key={product._id} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                        <div>
                          <strong>{product.name}</strong>
                          <br /><small className="text-muted">{product.category}</small>
                        </div>
                        <strong>${product.price?.toFixed(2)}</strong>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleAddProduct(product)}
                          disabled={addSaving || product.quantity <= 0}
                        >
                          {product.quantity <= 0 ? 'Out of Stock' : 'Add (+1)'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {addProducts.length === 0 && !addSaving && (
                  <p className="text-muted text-center py-2">No products found. Try different search terms.</p>
                )}

                {addTotalPages > 1 && (
                  <nav className="mt-3">
                    <ul className="pagination justify-content-center">
                      {Array.from({ length: addTotalPages }, (_, i) => (
                        <li key={i} className={`page-item ${addPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setAddPage(i + 1)}>{i + 1}</button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="col-md-4">
          <div className="card shadow-sm sticky-top" style={{ top: 20 }}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Box Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Plan</span>
                <strong>{subscription?.plan?.name || 'N/A'}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Items</span>
                <strong>{currentBox.products?.length || 0} / {maxItems}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Status</span>
                <span className={`badge ${statusInfo.badge}`}>{statusInfo.text}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Next Billing</span>
                <strong>{currentBox.billingDate ? new Date(currentBox.billingDate).toLocaleDateString() : 'N/A'}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Est. Total</strong>
                <strong>${currentBox.products?.reduce((s, p) => s + (p.price || 0), 0).toFixed(2)}</strong>
              </div>

              {canCustomize && (
                <button
                  className="btn btn-success w-100 btn-lg"
                  onClick={handleConfirm}
                  disabled={confirming || currentBox.products?.length === 0}
                >
                  {confirming ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Confirming...
                    </>
                  ) : (
                    '✓ Confirm This Box'
                  )}
                </button>
              )}

              {currentBox.status === 'confirmed' && (
                <div className="alert alert-success mt-3 mb-0 text-center">
                  <strong>✓ Box Confirmed!</strong>
                  <p className="small mb-0 mt-1">Your box is being prepared for shipment.</p>
                </div>
              )}

              {currentBox.status === 'shipped' && (
                <div className="alert alert-info mt-3 mb-0 text-center">
                  <strong>🚚 Shipped!</strong>
                  <p className="small mb-0 mt-1">Your box is on its way.</p>
                </div>
              )}

              <Link to="/box-history" className="btn btn-outline-secondary w-100 mt-3">
                View Box History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
