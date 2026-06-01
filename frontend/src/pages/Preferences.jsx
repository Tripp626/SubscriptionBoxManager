import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPreferences, setPreferences, getRecommendations } from '../services/api';

export default function Preferences() {
  const [prefs, setPrefs] = useState({ categories: [], interests: [], priceRange: { min: 0, max: 500 }, dietaryRestrictions: [], preferredFrequency: 'monthly' });
  const [recommendations, setRecommendations] = useState([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = ['Beauty', 'Food & Snacks', 'Tech & Gadgets', 'Fashion', 'Wellness', 'Books', 'Home & Living'];
  const categoryEmojis = {
    'Beauty': '💄',
    'Food & Snacks': '🍿',
    'Tech & Gadgets': '💻',
    'Fashion': '👗',
    'Wellness': '🧘',
    'Books': '📚',
    'Home & Living': '🏠',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prefRes, recRes] = await Promise.all([getPreferences(), getRecommendations()]);
        if (prefRes.data && Object.keys(prefRes.data).length > 0) setPrefs(prefRes.data);
        setRecommendations(recRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const toggleCategory = (cat) => {
    const cats = prefs.categories.includes(cat)
      ? prefs.categories.filter(c => c !== cat)
      : [...prefs.categories, cat];
    setPrefs({ ...prefs, categories: cats });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setPreferences(prefs);
      setSaved(true);
      const { data } = await getRecommendations();
      setRecommendations(data);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4 page-enter">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '6px' }}>
          My Preferences
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Tell us what you love so we can curate the perfect box for you
        </p>
      </div>

      {saved && (
        <div className="alert-modern alert-modern-success" style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '18px' }}>✅</span>
          <span>Preferences saved! Your recommendations have been updated.</span>
        </div>
      )}

      <div className="row">
        <div className="col-lg-6">
          <div className="card-elevated" style={{ padding: '28px', height: '100%' }}>
            <h5 style={{ fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚙️</span> Your Preferences
            </h5>

            <form onSubmit={handleSubmit}>
              {/* Categories */}
              <div style={{ marginBottom: '28px' }}>
                <label className="form-label-modern" style={{ fontSize: '14px' }}>Favorite Categories</label>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
                  Select all that interest you
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {categories.map(cat => {
                    const isSelected = prefs.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-full)',
                          border: `2px solid ${isSelected ? 'var(--primary-500)' : 'var(--border-light)'}`,
                          background: isSelected ? 'var(--primary-50)' : 'var(--bg-primary)',
                          color: isSelected ? 'var(--primary-700)' : 'var(--text-secondary)',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>{categoryEmojis[cat] || '📦'}</span>
                        {cat}
                        {isSelected && <span style={{ fontSize: '12px', color: 'var(--primary-500)' }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div style={{ marginBottom: '28px' }}>
                <label className="form-label-modern" style={{ fontSize: '14px' }}>Price Range</label>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
                  Set your preferred price range per product
                </p>
                <div className="row">
                  <div className="col">
                    <label className="form-label-modern" style={{ fontSize: '12px' }}>Min ($)</label>
                    <input
                      type="number"
                      className="form-control-modern"
                      placeholder="Min"
                      min="0"
                      value={prefs.priceRange?.min}
                      onChange={(e) => setPrefs({ ...prefs, priceRange: { ...prefs.priceRange, min: Number(e.target.value) } })}
                    />
                  </div>
                  <div className="col">
                    <label className="form-label-modern" style={{ fontSize: '12px' }}>Max ($)</label>
                    <input
                      type="number"
                      className="form-control-modern"
                      placeholder="Max"
                      min="0"
                      value={prefs.priceRange?.max}
                      onChange={(e) => setPrefs({ ...prefs, priceRange: { ...prefs.priceRange, max: Number(e.target.value) } })}
                    />
                  </div>
                </div>
                {/* Range slider visual */}
                <div style={{
                  marginTop: '12px',
                  height: '6px',
                  background: 'var(--border-light)',
                  borderRadius: 'var(--radius-full)',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: `${Math.min((prefs.priceRange?.min || 0) / 5, 100)}%`,
                    right: `${Math.max(100 - (prefs.priceRange?.max || 500) / 5, 0)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--primary-500), var(--accent-500))',
                    borderRadius: 'var(--radius-full)',
                  }} />
                </div>
              </div>

              {/* Frequency */}
              <div style={{ marginBottom: '28px' }}>
                <label className="form-label-modern" style={{ fontSize: '14px' }}>Preferred Frequency</label>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
                  How often would you like to receive boxes?
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { value: 'weekly', label: 'Weekly', icon: '📅', desc: 'Every week' },
                    { value: 'biweekly', label: 'Bi-weekly', icon: '📆', desc: 'Every 2 weeks' },
                    { value: 'monthly', label: 'Monthly', icon: '🗓️', desc: 'Once a month' },
                    { value: 'quarterly', label: 'Quarterly', icon: '📋', desc: 'Every 3 months' },
                  ].map(freq => (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => setPrefs({ ...prefs, preferredFrequency: freq.value })}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${prefs.preferredFrequency === freq.value ? 'var(--primary-500)' : 'var(--border-light)'}`,
                        background: prefs.preferredFrequency === freq.value ? 'var(--primary-50)' : 'var(--bg-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{freq.icon}</div>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '13px',
                        color: prefs.preferredFrequency === freq.value ? 'var(--primary-700)' : 'var(--text-primary)',
                      }}>
                        {freq.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{freq.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-gradient-primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }} disabled={saving}>
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </div>
        </div>

        {/* Recommendations */}
        <div className="col-lg-6">
          <div className="card-elevated" style={{ padding: '28px', height: '100%' }}>
            <h5 style={{ fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💡</span> Recommended For You
            </h5>

            {recommendations.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px' }}>
                <div className="empty-icon">🎯</div>
                <div className="empty-title">No recommendations yet</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Select your favorite categories to see personalized recommendations!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recommendations.map(p => (
                  <Link
                    key={p._id}
                    to={`/products/${p._id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-light)',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-300)'; e.currentTarget.style.background = 'var(--primary-50)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0,
                    }}>
                      📦
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.category}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>${p.price?.toFixed(2)}</div>
                      <div style={{ fontSize: '12px', color: 'var(--warning-600)', fontWeight: 600 }}>★ {p.averageRating?.toFixed(1)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
