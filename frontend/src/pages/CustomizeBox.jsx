import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBox } from '../context/BoxContext';
import { useAuth } from '../context/AuthContext';
import { getMyBox, customizeBox, confirmBox, getProducts } from '../services/api';
import ProductImage from '../components/ProductImage';

/* ─── tiny shared style tokens ─────────────────────────────────────────────── */
const S = {
  card: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-md)',
  },
  cardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
  },
  cardBody: { padding: '20px' },
  label: {
    fontWeight: 600,
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    display: 'block',
  },
  input: {
    border: '2px solid var(--border-light)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
    fontSize: '14px',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  muted: { color: 'var(--text-muted)', fontSize: '14px' },
};

/* ─── status config ─────────────────────────────────────────────────────────── */
const STATUS = {
  auto_generated: { label: 'Auto-Generated', bg: 'var(--info-50)',    color: 'var(--info-600)'    },
  customized:     { label: 'Customized',      bg: 'var(--warning-50)', color: 'var(--warning-600)' },
  confirmed:      { label: 'Confirmed',        bg: 'var(--success-50)', color: 'var(--success-600)' },
  shipped:        { label: 'Shipped',          bg: 'var(--info-50)',    color: 'var(--info-600)'    },
  delivered:      { label: 'Delivered',        bg: 'var(--gray-100)',   color: 'var(--text-secondary)' },
};

const CATEGORIES = ['Beauty', 'Food & Snacks', 'Tech & Gadgets', 'Wellness', 'Home & Living'];

/* ─── small reusable components ─────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.auto_generated;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: '11px', fontWeight: 700,
      padding: '4px 12px', borderRadius: 'var(--radius-full)',
      textTransform: 'uppercase', letterSpacing: '0.04em',
      display: 'inline-flex', alignItems: 'center', gap: '5px',
    }}>
      {s.label}
    </span>
  );
}

function Spinner({ small = false }) {
  const size = small ? 16 : 28;
  return (
    <span style={{
      width: size, height: size,
      border: `2px solid var(--border-light)`,
      borderTopColor: 'var(--primary-500)',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

function SearchBar({ value, onChange, placeholder = 'Search products...' }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', left: 14, top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--gray-400)', fontSize: 15, pointerEvents: 'none',
      }}>🔍</span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...S.input, paddingLeft: 42 }}
        onFocus={e  => (e.target.style.borderColor = 'var(--primary-400)')}
        onBlur={e   => (e.target.style.borderColor = 'var(--border-light)')}
      />
    </div>
  );
}

function CategorySelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{ ...S.input, appearance: 'none', paddingRight: 36, cursor: 'pointer' }}
      onFocus={e  => (e.target.style.borderColor = 'var(--primary-400)')}
      onBlur={e   => (e.target.style.borderColor = 'var(--border-light)')}
    >
      <option value="">All Categories</option>
      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}

/* ─── ProductCard used in box contents ──────────────────────────────────────── */
function BoxProductCard({ product, canCustomize, saving, onSwap, onRemove }) {
  return (
    <div className="card-hover" style={{
      ...S.card,
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Image */}
      <div style={{
        background: 'var(--bg-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, minHeight: 150, position: 'relative', overflow: 'hidden',
      }}>
        <ProductImage product={product} wSize={235} hSize={140} />
        {product.quantity <= 0 && (
          <span style={{
            position: 'absolute', top: 10, right: 10,
            background: 'var(--danger-50)', color: 'var(--danger-600)',
            fontSize: 11, fontWeight: 700, padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
          }}>Out of Stock</span>
        )}
      </div>

      {/* Details */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {product.category}
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {product.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            ${product.price?.toFixed(2)}
          </span>
          <span style={{
            background: 'var(--warning-50)', color: 'var(--warning-600)',
            fontSize: 12, fontWeight: 700, padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
          }}>
            ★ {product.averageRating?.toFixed(1) ?? '0.0'}
          </span>
        </div>

        {canCustomize && (
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button
              onClick={() => onSwap(product._id)}
              disabled={saving}
              style={{
                flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 600,
                background: 'transparent', color: 'var(--primary-600)',
                border: '2px solid var(--primary-200)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-50)'; e.currentTarget.style.borderColor = 'var(--primary-400)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--primary-200)'; }}
            >
              🔄 Swap
            </button>
            <button
              onClick={() => onRemove(product._id)}
              disabled={saving}
              style={{
                flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 600,
                background: 'transparent', color: 'var(--danger-600)',
                border: '2px solid var(--danger-200)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-50)'; e.currentTarget.style.borderColor = 'var(--danger-400)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--danger-200)'; }}
            >
              ✕ Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Small product row used in Add / Swap panels ───────────────────────────── */
function ProductRow({ product, actionLabel, onAction, disabled }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px',
      background: 'var(--bg-tertiary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-light)',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary-200)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
    >
      {/* Thumbnail */}
      <div style={{
        width: 48, height: 48, flexShrink: 0,
        background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        <ProductImage product={product} wSize={48} hSize={48} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{product.category}</div>
      </div>

      {/* Price */}
      <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', flexShrink: 0 }}>
        ${product.price?.toFixed(2)}
      </div>

      {/* Action */}
      <button
        onClick={() => onAction(product)}
        disabled={disabled || product.quantity <= 0}
        style={{
          padding: '6px 14px', fontSize: 12, fontWeight: 700,
          background: disabled || product.quantity <= 0
            ? 'var(--gray-100)' : 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-500) 100%)',
          color: disabled || product.quantity <= 0 ? 'var(--text-muted)' : '#fff',
          border: 'none', borderRadius: 'var(--radius-md)',
          cursor: disabled || product.quantity <= 0 ? 'not-allowed' : 'pointer',
          flexShrink: 0, transition: 'opacity 0.2s, transform 0.15s',
          boxShadow: disabled || product.quantity <= 0 ? 'none' : 'var(--shadow-primary)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        {product.quantity <= 0 ? 'Out of Stock' : actionLabel}
      </button>
    </div>
  );
}

/* ─── Progress bar ───────────────────────────────────────────────────────────── */
function CapacityBar({ current, max }) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const full = current >= max;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Items in box</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: full ? 'var(--success-600)' : 'var(--text-primary)' }}>
          {current} / {max}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: full
            ? 'linear-gradient(90deg, var(--success-500), #34d399)'
            : 'linear-gradient(90deg, var(--primary-500), var(--accent-500))',
          borderRadius: 99,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════════ */
export default function CustomizeBox() {
  const { user } = useAuth();
  const { currentBox, subscription, setBox, swapProduct, canCustomize } = useBox();
  const navigate = useNavigate();

  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const [swapMode, setSwapMode]       = useState(null);   // productId being swapped
  const [swapSearch, setSwapSearch]   = useState('');
  const [swapCategory, setSwapCategory] = useState('');
  const [swapProducts, setSwapProducts] = useState([]);
  const [swapPage, setSwapPage]       = useState(1);
  const [swapTotalPages, setSwapTotalPages] = useState(1);
  const [confirming, setConfirming]   = useState(false);
  const [addSearch, setAddSearch]     = useState('');
  const [addCategory, setAddCategory] = useState('');
  const [addProducts, setAddProducts] = useState([]);
  const [addPage, setAddPage]         = useState(1);
  const [addTotalPages, setAddTotalPages] = useState(1);
  const [addSaving, setAddSaving]     = useState(false);

  const maxItems = subscription?.plan?.maxProducts
    || currentBox?.subscription?.plan?.maxProducts || 5;

  /* ── data fetchers ── */
  const fetchAddProducts = useCallback(async () => {
    try {
      const excluded = currentBox?.products?.map(p => p._id) || [];
      const params   = { page: addPage, limit: 20 };
      if (addSearch)   params.search   = addSearch;
      if (addCategory) params.category = addCategory;
      const { data } = await getProducts(params);
      setAddProducts(data.products.filter(p => !excluded.includes(p._id)));
      setAddTotalPages(data.pages);
    } catch (err) { console.error(err); }
  }, [addPage, addSearch, addCategory, currentBox]);

  const fetchSwapProducts = useCallback(async () => {
    try {
      const excluded = currentBox?.products?.map(p => p._id) || [];
      const params   = { page: swapPage, limit: 20 };
      if (swapSearch)   params.search   = swapSearch;
      if (swapCategory) params.category = swapCategory;
      const { data } = await getProducts(params);
      setSwapProducts(data.products.filter(p => !excluded.includes(p._id)));
      setSwapTotalPages(data.pages);
    } catch (err) { console.error(err); }
  }, [swapPage, swapSearch, swapCategory, currentBox]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    (async () => {
      try {
        const { data } = await getMyBox();
        setBox(data);
      } catch (err) {
        setError(err.response?.status === 404
          ? 'No active subscription found. Subscribe to a plan to get started!'
          : err.response?.data?.message || 'Failed to load your box.');
      } finally { setLoading(false); }
    })();
  }, [user, navigate, setBox]);

  useEffect(() => { if (swapMode) fetchSwapProducts(); }, [swapMode, fetchSwapProducts]);
  useEffect(() => {
    if (currentBox && currentBox.products.length < maxItems && canCustomize) fetchAddProducts();
  }, [currentBox, fetchAddProducts, maxItems, canCustomize]);

  /* ── actions ── */
  const handleSwap = async (newProduct) => {
    if (!currentBox) return;
    setSaving(true); setError('');
    try {
      const { data } = await customizeBox(currentBox._id, { removeProductId: swapMode, addProductId: newProduct._id });
      setBox({ box: data.box, subscription });
      swapProduct(swapMode, newProduct._id);
      setSwapMode(null); setSwapSearch(''); setSwapCategory('');
    } catch (err) { setError(err.response?.data?.message || 'Failed to swap product.'); }
    finally { setSaving(false); }
  };

  const handleRemove = async (productId) => {
    if (!currentBox) return;
    setSaving(true); setError('');
    try {
      const { data } = await customizeBox(currentBox._id, { removeProductId: productId, addProductId: null });
      setBox({ box: data.box, subscription });
      swapProduct(productId, null);
    } catch (err) { setError(err.response?.data?.message || 'Failed to remove product.'); }
    finally { setSaving(false); }
  };

  const handleAddProduct = async (product) => {
    if (!currentBox) return;
    setAddSaving(true); setError('');
    try {
      const { data } = await customizeBox(currentBox._id, { removeProductId: null, addProductId: product._id });
      setBox({ box: data.box, subscription });
    } catch (err) { setError(err.response?.data?.message || 'Failed to add product.'); }
    finally { setAddSaving(false); }
  };

  const handleConfirm = async () => {
    if (!currentBox) return;
    setConfirming(true); setError('');
    try {
      const { data } = await confirmBox(currentBox._id);
      if (data.error) { setError(data.error); }
      else {
        setBox({ box: data.box, subscription });
        if (data.orderId) navigate(`/track/${data.orderId}`);
      }
    } catch (err) { setError(err.response?.data?.message || 'Failed to confirm box.'); }
    finally { setConfirming(false); }
  };

  /* ── early returns ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <Spinner />
      <p style={S.muted}>Loading your box…</p>
    </div>
  );

  if (error && !currentBox) return (
    <div className="container py-5">
      <div className="alert-modern alert-modern-warning" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
        <p style={{ marginBottom: 16 }}>{error}</p>
        <Link to="/plans" className="btn-gradient-primary">Browse Plans →</Link>
      </div>
    </div>
  );

  if (!currentBox) return null;

  const itemCount   = currentBox.products?.length || 0;
  const estTotal    = currentBox.products?.reduce((s, p) => s + (p.price || 0), 0).toFixed(2);
  const boxFull     = itemCount >= maxItems;

  return (
    <div className="container py-4 page-enter">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h2 style={{ fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 4 }}>
            📦 Your Upcoming Box
          </h2>
          <p style={S.muted}>
            {subscription?.plan?.name ? `${subscription.plan.name} Plan` : 'Subscription'} — up to {maxItems} items
          </p>
        </div>
        <StatusBadge status={currentBox.status} />
      </div>

      {/* ── Error banner ────────────────────────────────────────────────── */}
      {error && (
        <div className="alert-modern alert-modern-danger" style={{ marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Swap panel (inline, not a modal) ────────────────────────────── */}
      {swapMode && (
        <div style={{ ...S.card, marginBottom: 24, overflow: 'hidden' }}>
          <div style={S.cardHeader}>
            <div>
              <h5 style={{ margin: 0, fontWeight: 700 }}>Choose a Replacement</h5>
              <p style={{ ...S.muted, marginTop: 2, fontSize: 12 }}>Select a product to swap in</p>
            </div>
            <button
              onClick={() => { setSwapMode(null); setSwapSearch(''); setSwapCategory(''); }}
              style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 600,
                background: 'transparent', color: 'var(--text-secondary)',
                border: '2px solid var(--border-light)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
              }}
            >
              ✕ Cancel
            </button>
          </div>

          <div style={S.cardBody}>
            {/* Filters */}
            <div className="row mb-3">
              <div className="col-md-6 mb-2 mb-md-0">
                <SearchBar
                  value={swapSearch}
                  onChange={e => { setSwapSearch(e.target.value); setSwapPage(1); }}
                />
              </div>
              <div className="col-md-4">
                <CategorySelect
                  value={swapCategory}
                  onChange={e => { setSwapCategory(e.target.value); setSwapPage(1); }}
                />
              </div>
            </div>

            {saving ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '24px 0' }}>
                <Spinner small /> <span style={S.muted}>Swapping…</span>
              </div>
            ) : swapProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                <p>No products available. Try a different search.</p>
              </div>
            ) : (
              <div className="row">
                {swapProducts.map(product => (
                  <div key={product._id} className="col-lg-3 col-md-4 col-sm-6 mb-3">
                    <div className="card-hover" style={{ ...S.card, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        background: 'var(--bg-tertiary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 12, minHeight: 120,
                      }}>
                        <ProductImage product={product} wSize={200} hSize={110} />
                      </div>
                      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {product.category}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {product.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>${product.price?.toFixed(2)}</span>
                          <span style={{ background: 'var(--warning-50)', color: 'var(--warning-600)', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--radius-full)' }}>
                            ★ {product.averageRating?.toFixed(1) ?? '0.0'}
                          </span>
                        </div>
                        <button
                          disabled={saving || product.quantity <= 0}
                          onClick={() => handleSwap(product)}
                          className="btn-gradient-primary btn-sm"
                          style={{ marginTop: 10, width: '100%' }}
                        >
                          {product.quantity <= 0 ? 'Out of Stock' : 'Swap In'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {swapTotalPages > 1 && (
              <nav className="mt-3">
                <ul className="pagination pagination-modern justify-content-center">
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

      {/* ── Main two-column layout ───────────────────────────────────────── */}
      <div className="row">

        {/* LEFT — box contents */}
        <div className={currentBox.products.length < maxItems && canCustomize ? 'col-md-8' : 'col-12'}>
          <div style={{ ...S.card, marginBottom: 24, overflow: 'hidden' }}>
            <div style={S.cardHeader}>
              <div>
                <h5 style={{ margin: 0, fontWeight: 700 }}>Box Contents</h5>
                <div style={{ marginTop: 8 }}>
                  <CapacityBar current={itemCount} max={maxItems} />
                </div>
              </div>
              {currentBox.isPersonalized && (
                <span style={{
                  background: 'var(--warning-50)', color: 'var(--warning-600)',
                  fontSize: 11, fontWeight: 700, padding: '4px 12px',
                  borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap',
                }}>
                  ✨ Personalized
                </span>
              )}
            </div>

            <div style={S.cardBody}>
              {itemCount === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
                  <p>Your box is empty. Contact support if this is unexpected.</p>
                </div>
              ) : (
                <div className="row">
                  {currentBox.products.map(product => (
                    <div key={product._id} className="col-lg-4 col-md-6 mb-3">
                      <BoxProductCard
                        product={product}
                        canCustomize={canCustomize}
                        saving={saving}
                        onSwap={setSwapMode}
                        onRemove={handleRemove}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — add items panel (only if box not full and user can customize) */}
        {currentBox.products.length < maxItems && canCustomize && (
          <div className="col-md-4">
            <div style={{ ...S.card, overflow: 'hidden', position: 'sticky', top: 20, marginBottom: 20 }}>
              <div style={{
                ...S.cardHeader,
                background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-500) 100%)',
                borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              }}>
                <h5 style={{ margin: 0, fontWeight: 700, color: '#fff' }}>Add Item</h5>
                <span style={{
                  background: 'rgba(255,255,255,0.2)', color: '#fff',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                }}>
                  {maxItems - itemCount} spot{maxItems - itemCount !== 1 ? 's' : ''} left
                </span>
              </div>

              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Search */}
                <div>
                  <label style={S.label}>Search products</label>
                  <SearchBar
                    value={addSearch}
                    onChange={e => { setAddSearch(e.target.value); setAddPage(1); }}
                    placeholder="Search for products…"
                  />
                </div>

                {/* Category */}
                <div>
                  <label style={S.label}>Category</label>
                  <CategorySelect
                    value={addCategory}
                    onChange={e => { setAddCategory(e.target.value); setAddPage(1); }}
                  />
                </div>

                {/* Results */}
                {addSaving ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0' }}>
                    <Spinner small /> <span style={S.muted}>Searching…</span>
                  </div>
                ) : addProducts.length === 0 ? (
                  <p style={{ ...S.muted, textAlign: 'center', padding: '12px 0' }}>
                    No products found. Try different keywords.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={S.label}>Available ({addProducts.length})</label>
                    {addProducts.map(product => (
                      <ProductRow
                        key={product._id}
                        product={product}
                        actionLabel="+ Add"
                        onAction={handleAddProduct}
                        disabled={addSaving}
                      />
                    ))}
                  </div>
                )}

                {addTotalPages > 1 && (
                  <nav>
                    <ul className="pagination pagination-modern justify-content-center mb-0" style={{ gap: 4 }}>
                      {Array.from({ length: addTotalPages }, (_, i) => (
                        <li key={i} className={`page-item ${addPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setAddPage(i + 1)}>{i + 1}</button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RIGHT (always visible) — Box summary */}
        <div className={currentBox.products.length < maxItems && canCustomize ? 'col-md-4 mt-0' : 'col-md-4'}>
          <div style={{ ...S.card, overflow: 'hidden', position: 'sticky', top: currentBox.products.length < maxItems && canCustomize ? 'calc(20px + 300px + 20px)' : 20 }}>
            <div style={{
              ...S.cardHeader,
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-500) 100%)',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
            }}>
              <h5 style={{ margin: 0, fontWeight: 700, color: '#fff' }}>Box Summary</h5>
              <StatusBadge status={currentBox.status} />
            </div>

            <div style={{ padding: '20px' }}>
              {/* Summary rows */}
              {[
                { label: 'Plan',         value: subscription?.plan?.name || 'N/A' },
                { label: 'Next Billing', value: currentBox.billingDate ? new Date(currentBox.billingDate).toLocaleDateString() : 'N/A' },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid var(--border-light)',
                }}>
                  <span style={S.muted}>{row.label}</span>
                  <strong style={{ fontSize: 14 }}>{row.value}</strong>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={S.muted}>Items</span>
                <strong style={{ fontSize: 14 }}>{itemCount} / {maxItems}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 4px' }}>
                <strong style={{ fontSize: 15 }}>Est. Total</strong>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary-600)' }}>${estTotal}</strong>
              </div>

              {/* Confirm button */}
              {canCustomize && (
                <button
                  className="btn-gradient-primary"
                  style={{ width: '100%', marginTop: 16, padding: '12px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={handleConfirm}
                  disabled={confirming || itemCount === 0}
                >
                  {confirming ? <><Spinner small /> Confirming…</> : '✓ Confirm This Box'}
                </button>
              )}

              {/* Status messages */}
              {currentBox.status === 'confirmed' && (
                <div className="alert-modern alert-modern-success" style={{ marginTop: 14, textAlign: 'center', flexDirection: 'column', gap: 4 }}>
                  <strong>✓ Box Confirmed!</strong>
                  <p style={{ margin: 0, fontSize: 12 }}>Being prepared for shipment.</p>
                </div>
              )}
              {currentBox.status === 'shipped' && (
                <div className="alert-modern alert-modern-info" style={{ marginTop: 14, textAlign: 'center', flexDirection: 'column', gap: 4 }}>
                  <strong>🚚 Shipped!</strong>
                  <p style={{ margin: 0, fontSize: 12 }}>Your box is on its way.</p>
                </div>
              )}

              <Link
                to="/box-history"
                style={{
                  display: 'block', textAlign: 'center', marginTop: 14,
                  padding: '10px', fontSize: 13, fontWeight: 600,
                  color: 'var(--text-secondary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'border-color 0.2s, color 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-300)'; e.currentTarget.style.color = 'var(--primary-600)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                View Box History →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
