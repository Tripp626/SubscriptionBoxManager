import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import { useBox } from '../context/BoxContext';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';

export default function BoxBuilder() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addedId, setAddedId] = useState(null);
  const { box, addToBox, removeFromBox, totalItems, maxItems, isFull } = useBox();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchProducts = async () => {
      try {
        const params = { page, limit: 20 };
        if (search) params.search = search;
        if (category) params.category = category;
        const { data } = await getProducts(params);
        setProducts(data.products);
        setTotalPages(data.pages);
      } catch (err) { console.error(err); }
    };
    fetchProducts();
  }, [search, category, page, user, navigate]);

  const handleAdd = (product) => {
    if (product.quantity <= 0) return;
    const ok = addToBox(product);
    if (ok) {
      setAddedId(product._id);
      setTimeout(() => setAddedId(null), 1000);
    }
  };

  const categories = ['Beauty', 'Food & Snacks', 'Tech & Gadgets', 'Wellness', 'Home & Living'];

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Left: Product browsing */}
        <div className="col-md-8">
          <h2>Build Your Box</h2>
          <p className="text-muted">Pick products for your next subscription box. You can select up to {maxItems} items.</p>

          <div className="row mb-3">
            <div className="col-md-6">
              <input type="text" className="form-control" placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="row">
            {products.map(product => {
              const inBox = box.some(item => item._id === product._id);
              const outOfStock = product.quantity <= 0;
              const justAdded = addedId === product._id;

              return (
                <div key={product._id} className="col-md-4 mb-3">
                  <div className={`card h-100 shadow-sm ${inBox ? 'border-success' : ''} ${outOfStock ? 'opacity-50' : ''}`}>
                    <div className="card-body text-center bg-light" style={{ minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ProductImage product={product} size={100} />
                    </div>
                    <div className="card-body pt-2">
                      <h6 className="card-title mb-1">{product.name}</h6>
                      <p className="text-muted small mb-1">{product.category}</p>
                      <p className="fw-bold mb-1">${product.price?.toFixed(2)}</p>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-warning">★ {product.averageRating?.toFixed(1) ?? '0.0'}</span>
                        <span className={`badge bg-${outOfStock ? 'danger' : 'success'}`}>
                          {outOfStock ? 'Out of Stock' : `${product.quantity} left`}
                        </span>
                      </div>
                      {inBox ? (
                        <button className="btn btn-sm btn-success w-100" onClick={() => removeFromBox(product._id)}>
                          ✓ In Box — Remove
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-outline-primary w-100" onClick={() => handleAdd(product)} disabled={isFull || outOfStock}>
                          {justAdded ? '✓ Added!' : outOfStock ? 'Out of Stock' : isFull ? 'Box Full' : 'Add to Box'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        {/* Right: Your Box sidebar */}
        <div className="col-md-4">
          <div className="card shadow-sm sticky-top" style={{ top: 20 }}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Your Box</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Items</span>
                <strong className={isFull ? 'text-success' : ''}>{totalItems} / {maxItems}</strong>
              </div>
              <div className="progress mb-3" style={{ height: 8 }}>
                <div className="progress-bar bg-success" style={{ width: `${(totalItems / maxItems) * 100}%` }}></div>
              </div>

              {box.length === 0 ? (
                <p className="text-muted text-center py-3">Your box is empty. Start adding products!</p>
              ) : (
                box.map(item => (
                  <div key={item._id} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                    <div>
                      <strong className="small">{item.name}</strong>
                      <br /><small className="text-muted">${item.price?.toFixed(2)}</small>
                    </div>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromBox(item._id)}>✕</button>
                  </div>
                ))
              )}

              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Estimated Total</strong>
                <strong>${box.reduce((s, i) => s + (i.price || 0), 0).toFixed(2)}</strong>
              </div>

              <button className="btn btn-primary w-100" disabled={box.length === 0} onClick={() => navigate('/box-review')}>
                Review & Submit Box
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
