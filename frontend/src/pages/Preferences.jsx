import { useState, useEffect } from 'react';
import { getPreferences, setPreferences, getRecommendations } from '../services/api';

export default function Preferences() {
  const [prefs, setPrefs] = useState({ categories: [], interests: [], priceRange: { min: 0, max: 500 }, dietaryRestrictions: [], preferredFrequency: 'monthly' });
  const [recommendations, setRecommendations] = useState([]);
  const [saved, setSaved] = useState(false);

  const categories = ['Beauty', 'Food & Snacks', 'Tech & Gadgets', 'Fashion', 'Wellness', 'Books', 'Home & Living'];

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
    const cats = prefs.categories.includes(cat) ? prefs.categories.filter(c => c !== cat) : [...prefs.categories, cat];
    setPrefs({ ...prefs, categories: cats });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setPreferences(prefs);
      setSaved(true);
      const { data } = await getRecommendations();
      setRecommendations(data);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save preferences');
    }
  };

  return (
    <div className="container py-4">
      <h2>My Preferences</h2>
      {saved && <div className="alert alert-success">Preferences saved!</div>}
      <div className="row">
        <div className="col-md-6">
          <form onSubmit={handleSubmit} className="card shadow-sm p-4">
            <h5>Favorite Categories</h5>
            <div className="mb-3">
              {categories.map(cat => (
                <button key={cat} type="button" className={`btn btn-sm me-2 mb-2 ${prefs.categories.includes(cat) ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => toggleCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="mb-3">
              <label className="form-label">Price Range</label>
              <div className="row">
                <div className="col"><input type="number" className="form-control" placeholder="Min" value={prefs.priceRange?.min} onChange={(e) => setPrefs({ ...prefs, priceRange: { ...prefs.priceRange, min: Number(e.target.value) } })} /></div>
                <div className="col"><input type="number" className="form-control" placeholder="Max" value={prefs.priceRange?.max} onChange={(e) => setPrefs({ ...prefs, priceRange: { ...prefs.priceRange, max: Number(e.target.value) } })} /></div>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Preferred Frequency</label>
              <select className="form-select" value={prefs.preferredFrequency} onChange={(e) => setPrefs({ ...prefs, preferredFrequency: e.target.value })}>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-100">Save Preferences</button>
          </form>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h5>Recommended For You</h5>
            {recommendations.length === 0 ? (
              <p className="text-muted">Select categories above to see recommendations.</p>
            ) : (
              recommendations.map(p => (
                <div key={p._id} className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                  <div>
                    <strong>{p.name}</strong>
                    <br /><small className="text-muted">{p.category}</small>
                  </div>
                  <div className="text-end">
                    <span className="fw-bold">${p.price?.toFixed(2)}</span>
                    <br /><small className="text-warning">★ {p.averageRating?.toFixed(1)}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
