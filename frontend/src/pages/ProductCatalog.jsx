import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import ProductImage from '../components/ProductImage';

export default function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const fetchProducts = async () => {
        try {
          const params = { page, limit: 12 };
          if (search) params.search = search;
          if (category) params.category = category;
          const { data } = await getProducts(params);
          setProducts(data.products);
          setTotalPages(data.pages);
        } catch (err) {
          console.error(err);
        }
      };
      fetchProducts();
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, category, page]);

  const categories = ['Beauty', 'Food & Snacks', 'Tech & Gadgets', 'Wellness', 'Home & Living'];

  return (
    <div className="container py-4 page-enter">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '6px' }}>
          Browse Products
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Discover amazing products for your subscription box
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="card-elevated" style={{ padding: '20px', marginBottom: '28px' }}>
        <div className="row align-items-end">
          <div className="col-md-6 mb-3 mb-md-0">
            <label className="form-label-modern">Search Products</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">🔍</span>
              <input
                type="text"
                className="form-control-modern"
                placeholder="Search by name, category, or tag..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <label className="form-label-modern">Category</label>
            <select
              className="form-control-modern"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <button
              className="btn-outline-primary-modern"
              style={{ width: '100%', padding: '10px' }}
              onClick={() => { setSearch(''); setCategory(''); setPage(1); }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="empty-state card-elevated" style={{ padding: '64px 24px' }}>
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No products found</div>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="row">
          {products.map((product) => (
            <div key={product._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
              <div
                className="card-hover"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-primary)',
                  cursor: 'pointer',
                  height: '100%',
                }}
                onClick={() => navigate(`/products/${product._id}`)}
              >
                {/* Image */}
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'var(--bg-tertiary)',
                  minHeight: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    transition: 'transform 0.3s ease',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                  }}>
                    <ProductImage product={product} wSize={280} hSize={160} />
                  </div>
                  {/* Stock badge */}
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: product.quantity > 0 ? 'var(--success-50)' : 'var(--danger-50)',
                    color: product.quantity > 0 ? 'var(--success-600)' : 'var(--danger-600)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backdropFilter: 'blur(10px)',
                  }}>
                    {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '16px' }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--primary-600)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}>
                    {product.category}
                  </div>
                  <h6 style={{
                    fontWeight: 700,
                    fontSize: '14px',
                    marginBottom: '8px',
                    color: 'var(--text-primary)',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {product.name}
                  </h6>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      ${product.price?.toFixed(2)}
                    </span>
                    <span style={{
                      background: 'var(--warning-50)',
                      color: 'var(--warning-600)',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}>
                      ★ {product.averageRating?.toFixed(1) ?? '0.0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination pagination-modern justify-content-center">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))} style={{ border: 'none' }}>
                ← Prev
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ border: 'none' }}>
                Next →
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
