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

  return (
    <div className="container py-4">
      <h2>Product Catalog</h2>
      <div className="row mb-4">
        <div className="col-md-6">
          <input type="text" className="form-control" placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            <option value="Beauty">Beauty</option>
            <option value="Food & Snacks">Food & Snacks</option>
            <option value="Tech & Gadgets">Tech & Gadgets</option>
            <option value="Wellness">Wellness</option>
            <option value="Home & Living">Home & Living</option>
          </select>
        </div>
      </div>

      <div className="row">
        {products.map(product => (
          <div key={product._id} className="col-md-3 mb-4">
            <div className="card h-100 shadow-sm" style={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${product._id}`)}>
              <div className="card-body text-center bg-light" style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ProductImage product={product} wSize={280} hSize={140} />
              </div>
              <div className="card-body">
                <h6 className="card-title">{product.name}</h6>
                <p className="text-muted small mb-1">{product.category}</p>
                <p className="fw-bold mb-1">${product.price?.toFixed(2)}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge bg-warning">★ {product.averageRating?.toFixed(1) ?? '0.0'}</span>
                  <span className={`badge bg-${product.quantity > 0 ? 'success' : 'danger'}`}>
                    {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="mt-4">
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
  );
}
