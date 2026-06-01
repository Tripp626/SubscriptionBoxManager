/* eslint-disable no-undef */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubscriptionReport, getSalesReport, getCustomerAnalytics, getAllSubscriptions, getAllOrders, getLowStock, getProducts, createProduct, updateProduct, deleteProduct, deactivateProduct, activateProduct, getAllShipments, updateShipmentStatus, assignDeliveryPersonnel, getDeliveryPersonnel } from '../services/api';
import ProductImage from '../components/ProductImage';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [subReport, setSubReport] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [customerAnalytics, setCustomerAnalytics] = useState(null);
  const [recentSubscriptions, setRecentSubscriptions] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category: '', quantity: '', tags: '', isActive: true,
  });
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState('');
  const [productSuccess, setProductSuccess] = useState('');
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const [shipments, setShipments] = useState([]);
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', trackingNumber: '', carrier: '', estimatedDeliveryDate: '', location: '', note: '' });
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
  const [assignPersonnelId, setAssignPersonnelId] = useState('');
  const [shipmentMessage, setShipmentMessage] = useState('');

  const categories = ['Beauty', 'Food & Snacks', 'Tech & Gadgets', 'Wellness', 'Home & Living'];

  const fetchDashboardData = async () => {
    try {
      const [subRes, salesRes, custRes, allSubs, allOrders, lowRes] = await Promise.all([
        getSubscriptionReport(), getSalesReport(), getCustomerAnalytics(),
        getAllSubscriptions(), getAllOrders(), getLowStock(),
      ]);
      setSubReport(subRes.data);
      setSalesReport(salesRes.data);
      setCustomerAnalytics(custRes.data);
      setRecentSubscriptions(allSubs.data.slice(0, 5));
      setRecentOrders(allOrders.data.slice(0, 5));
      setLowStock(lowRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await getProducts({ limit: 100, showAll: true });
      setProducts(data.products);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProducts();
    }
  }, [activeTab]);

  const fetchShipments = async () => {
    try {
      const { data } = await getAllShipments();
      setShipments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDeliveryPersonnel = async () => {
    try {
      const { data } = await getDeliveryPersonnel();
      setDeliveryPersonnel(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'shipments') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchShipments();
      fetchDeliveryPersonnel();
    }
  }, [activeTab]);

  const resetProductForm = () => {
    setProductForm({ name: '', description: '', price: '', category: '', quantity: '', tags: '', isActive: true });
    setProductImageFile(null);
    setProductImagePreview('');
    setEditingProduct(null);
    setShowProductForm(false);
    setProductError('');
    setProductSuccess('');
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      quantity: product.quantity || '',
      tags: product.tags?.join(', ') || '',
      isActive: product.isActive,
    });
    setProductImageFile(null);
    setProductImagePreview(product.imageUrl || '');
    setShowProductForm(true);
    setProductError('');
    setProductSuccess('');
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImageFile(file);
      setProductImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveProductImage = () => {
    setProductImageFile(null);
    setProductImagePreview('');
    setProductForm({ ...productForm, removeImage: true });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductLoading(true);
    setProductError('');
    setProductSuccess('');

    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('price', productForm.price);
    formData.append('category', productForm.category);
    formData.append('quantity', productForm.quantity);
    formData.append('tags', productForm.tags);
    formData.append('isActive', productForm.isActive);
    if (productForm.removeImage) {
      formData.append('imageUrl', '');
    }
    if (productImageFile) {
      formData.append('image', productImageFile);
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
        setProductSuccess('Product updated successfully!');
      } else {
        await createProduct(formData);
        setProductSuccess('Product created successfully!');
      }
      await fetchProducts();
      setTimeout(resetProductForm, 1500);
    } catch (err) {
      setProductError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setProductLoading(false);
    }
  };

  const handleDeactivateProduct = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this product?')) return;
    try {
      await deactivateProduct(id);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate product.');
    }
  };

  const handleActivateProduct = async (id) => {
    try {
      await activateProduct(id);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      await deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleOpenStatusModal = (shipment) => {
    setSelectedShipment(shipment);
    setStatusForm({
      status: shipment.status,
      trackingNumber: shipment.trackingNumber || '',
      carrier: shipment.carrier || '',
      estimatedDeliveryDate: shipment.estimatedDeliveryDate ? shipment.estimatedDeliveryDate.slice(0, 10) : '',
      location: '',
      note: '',
    });
    setAssignPersonnelId('');
    setShipmentMessage('');
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setShipmentLoading(true);
    setShipmentMessage('');
    const payload = { ...statusForm };
    if (!payload.estimatedDeliveryDate) delete payload.estimatedDeliveryDate;
    if (!payload.trackingNumber) delete payload.trackingNumber;
    if (!payload.carrier) delete payload.carrier;
    if (!payload.location) delete payload.location;
    if (!payload.note) delete payload.note;
    try {
      await updateShipmentStatus(selectedShipment._id, payload);
      if (assignPersonnelId) {
        await assignDeliveryPersonnel(selectedShipment._id, { personnelId: assignPersonnelId });
      }
      setShipmentMessage('Shipment updated successfully!');
      await fetchShipments();
      setTimeout(() => setShowStatusModal(false), 1000);
    } catch (err) {
      setShipmentMessage(err.response?.data?.message || 'Failed to update shipment.');
    } finally {
      setShipmentLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4 page-enter">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '4px' }}>
          Admin Dashboard
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Manage your subscription box business
        </p>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs nav-tabs-modern" style={{ marginBottom: '24px' }}>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            📊 Overview
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            🛍️ Products
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'shipments' ? 'active' : ''}`} onClick={() => setActiveTab('shipments')}>
            🚚 Shipments
          </button>
        </li>
      </ul>

      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="row mt-4">
            {[
              { label: 'Active Subscriptions', value: subReport?.active ?? '...', icon: '📋', type: 'primary' },
              { label: 'Total Revenue', value: `$${salesReport?.totalRevenue?.toFixed(2) ?? '...'}`, icon: '💰', type: 'success' },
              { label: 'Total Customers', value: customerAnalytics?.totalCustomers ?? '...', icon: '👥', type: 'info' },
              { label: 'Low Stock Items', value: lowStock.length, icon: '⚠️', type: 'warning' },
            ].map((stat, i) => (
              <div key={i} className="col-md-3 mb-3">
                <div className={`stat-card stat-${stat.type}`}>
                  <div className="stat-icon" style={{
                    background: stat.type === 'primary' ? 'var(--primary-50)' :
                                stat.type === 'success' ? 'var(--success-50)' :
                                stat.type === 'info' ? 'var(--info-50)' : 'var(--warning-50)',
                  }}>
                    <span>{stat.icon}</span>
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="row mt-3">
            {/* Recent Subscriptions */}
            <div className="col-md-6 mb-4">
              <div className="card-elevated" style={{ overflow: 'hidden', height: '100%' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-light)' }}>
                  <h6 style={{ fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📋</span> Recent Subscriptions
                  </h6>
                </div>
                <div className="table-responsive">
                  <table className="table-modern" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Plan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSubscriptions.map(sub => (
                        <tr key={sub._id}>
                          <td style={{ fontWeight: 600 }}>{sub.user?.firstName} {sub.user?.lastName}</td>
                          <td>{sub.plan?.name}</td>
                          <td>
                            <span className="badge-modern" style={{
                              background: sub.status === 'active' ? 'var(--success-50)' : 'var(--gray-100)',
                              color: sub.status === 'active' ? 'var(--success-600)' : 'var(--gray-600)',
                            }}>
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="col-md-6 mb-4">
              <div className="card-elevated" style={{ overflow: 'hidden', height: '100%' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-light)' }}>
                  <h6 style={{ fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🛍️</span> Recent Orders
                  </h6>
                </div>
                <div className="table-responsive">
                  <table className="table-modern" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order._id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{order._id.slice(-8)}</td>
                          <td>{order.user?.firstName} {order.user?.lastName}</td>
                          <td style={{ fontWeight: 700 }}>${order.totalAmount?.toFixed(2)}</td>
                          <td>
                            <span className="badge-modern" style={{ background: 'var(--info-50)', color: 'var(--info-600)' }}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Low Stock */}
            <div className="col-md-6 mb-4">
              <div className="card-elevated" style={{ overflow: 'hidden', height: '100%' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-light)' }}>
                  <h6 style={{ fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚠️</span> Low Stock Alert
                  </h6>
                </div>
                <div style={{ padding: '16px 22px' }}>
                  {lowStock.length === 0 ? (
                    <div className="empty-state" style={{ padding: '16px' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>All products are well stocked.</p>
                    </div>
                  ) : (
                    lowStock.map(p => (
                      <div key={p._id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border-light)',
                      }}>
                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                        <span className="badge-modern" style={{ background: 'var(--danger-50)', color: 'var(--danger-600)' }}>
                          {p.quantity} left
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="col-md-6 mb-4">
              <div className="card-elevated" style={{ overflow: 'hidden', height: '100%' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-light)' }}>
                  <h6 style={{ fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏆</span> Top Products
                  </h6>
                </div>
                <div style={{ padding: '16px 22px' }}>
                  {customerAnalytics?.topProducts?.length > 0 ? (
                    customerAnalytics.topProducts.map(p => (
                      <div key={p._id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border-light)',
                      }}>
                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                        <span className="badge-modern" style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
                          {p.totalOrdered} sold
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state" style={{ padding: '16px' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No data yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'products' && (
        <div className="mt-2">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 style={{ fontWeight: 700, margin: 0 }}>Product Catalog</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0' }}>
                {products.length} products
              </p>
            </div>
            <button className="btn-gradient-primary" onClick={() => { resetProductForm(); setShowProductForm(true); }}>
              + Add Product
            </button>
          </div>

          {productError && <div className="alert-modern alert-modern-danger" style={{ marginBottom: '20px' }}>⚠️ {productError}</div>}
          {productSuccess && <div className="alert-modern alert-modern-success" style={{ marginBottom: '20px' }}>✓ {productSuccess}</div>}

          {/* Product Form */}
          {showProductForm && (
            <div className="card-elevated" style={{ marginBottom: '24px', overflow: 'hidden', border: '2px solid var(--primary-200)' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h6 style={{ fontWeight: 700, margin: 0 }}>
                  {editingProduct ? '✏️ Edit Product' : '✨ Add New Product'}
                </h6>
                <button onClick={resetProductForm} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-muted)', padding: '4px' }}>
                  ✕
                </button>
              </div>
              <div style={{ padding: '24px' }}>
                <form onSubmit={handleProductSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label-modern">Product Name *</label>
                      <input type="text" className="form-control-modern" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label-modern">Price ($) *</label>
                      <input type="number" step="0.01" min="0" className="form-control-modern" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label-modern">Quantity *</label>
                      <input type="number" min="0" className="form-control-modern" value={productForm.quantity} onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label-modern">Category *</label>
                      <select className="form-control-modern" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} required>
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label-modern">Tags (comma-separated)</label>
                      <input type="text" className="form-control-modern" placeholder="e.g. organic, vegan, gift" value={productForm.tags} onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label-modern">Description</label>
                    <textarea className="form-control-modern" rows={3} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label-modern">Product Image</label>
                    <input type="file" className="form-control-modern" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleProductImageChange} />
                    {productImagePreview && (
                      <div className="mt-2 d-flex align-items-center gap-2">
                        <img src={productImagePreview} alt="Preview" className="rounded" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                        <button type="button" className="btn-outline-primary-modern" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={handleRemoveProductImage}>
                          ✕ Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-3" style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <input type="checkbox" className="form-check-input" id="isActive" checked={productForm.isActive} onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    <label className="form-check-label" htmlFor="isActive" style={{ fontWeight: 600, cursor: 'pointer', marginBottom: 0 }}>Active (visible to customers)</label>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="btn-gradient-primary" style={{ padding: '10px 28px', fontSize: '14px' }} disabled={productLoading}>
                      {productLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                    <button type="button" className="btn-outline-primary-modern" style={{ padding: '10px 28px', fontSize: '14px' }} onClick={resetProductForm}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="card-elevated" style={{ overflow: 'hidden' }}>
            <div className="table-responsive">
              {products.length === 0 ? (
                <div className="empty-state" style={{ padding: '48px' }}>
                  <div className="empty-icon">📦</div>
                  <div className="empty-title">No products yet</div>
                  <p style={{ color: 'var(--text-muted)' }}>Click "Add Product" to create one.</p>
                </div>
              ) : (
                <table className="table-modern" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id} style={{ opacity: product.isActive ? 1 : 0.5 }}>
                        <td><ProductImage product={product} wSize={40} hSize={40} /></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{product.name}</div>
                          {product.tags?.length > 0 && (
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{product.tags.join(', ')}</div>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{product.category}</td>
                        <td style={{ fontWeight: 700 }}>${product.price?.toFixed(2)}</td>
                        <td>
                          <span className="badge-modern" style={{
                            background: product.quantity > 10 ? 'var(--success-50)' : product.quantity > 0 ? 'var(--warning-50)' : 'var(--danger-50)',
                            color: product.quantity > 10 ? 'var(--success-600)' : product.quantity > 0 ? 'var(--warning-600)' : 'var(--danger-600)',
                          }}>
                            {product.quantity}
                          </span>
                        </td>
                        <td>
                          <span className="badge-modern" style={{
                            background: product.isActive ? 'var(--success-50)' : 'var(--gray-100)',
                            color: product.isActive ? 'var(--success-600)' : 'var(--gray-600)',
                          }}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button className="btn-outline-primary-modern" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => handleEditProduct(product)}>Edit</button>
                            {product.isActive ? (
                              <button style={{ padding: '4px 12px', fontSize: '12px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--warning-50)', color: 'var(--warning-600)', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleDeactivateProduct(product._id)}>Deactivate</button>
                            ) : (
                              <button style={{ padding: '4px 12px', fontSize: '12px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--success-50)', color: 'var(--success-600)', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleActivateProduct(product._id)}>Activate</button>
                            )}
                            <button style={{ padding: '4px 12px', fontSize: '12px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--danger-50)', color: 'var(--danger-600)', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shipments Tab */}
      {activeTab === 'shipments' && (
        <div className="mt-2">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 style={{ fontWeight: 700, margin: 0 }}>Shipments</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0' }}>
                {shipments.length} total shipments
              </p>
            </div>
          </div>

          {shipmentLoading && (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {shipments.length === 0 && !shipmentLoading && (
            <div className="empty-state card-elevated" style={{ padding: '48px' }}>
              <div className="empty-icon">📭</div>
              <div className="empty-title">No shipments found</div>
            </div>
          )}

          {!shipmentLoading && shipments.length > 0 && (
            <div className="card-elevated" style={{ overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="table-modern" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>ETA</th>
                      <th>Tracking</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map(shipment => {
                      const statusLabel = shipment.status === 'delivered' ? 'Delivered' :
                                        shipment.status === 'failed' ? 'Failed' :
                                        shipment.status.replace('_', ' ');
                      const statusColor = shipment.status === 'delivered' ? 'success' :
                                        shipment.status === 'failed' ? 'danger' :
                                        shipment.status === 'shipped' || shipment.status === 'in_transit' || shipment.status === 'out_for_delivery' ? 'info' : 'warning';

                      return (
                        <tr key={shipment._id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{shipment.order?._id?.slice(-8).toUpperCase() || 'N/A'}</td>
                          <td>{shipment.order?.user?.firstName} {shipment.order?.user?.lastName || ''}</td>
                          <td>{shipment.order?.products?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}</td>
                          <td style={{ fontWeight: 700 }}>${shipment.order?.totalAmount?.toFixed(2) || '0.00'}</td>
                          <td>
                            <span className="badge-modern" style={{
                              background: `var(--${statusColor}-50)`,
                              color: `var(--${statusColor}-600)`,
                            }}>
                              {statusLabel}
                            </span>
                          </td>
                          <td>
                            {shipment.estimatedDeliveryDate ? (
                              <small style={{ color: 'var(--text-muted)' }}>
                                {new Date(shipment.estimatedDeliveryDate).toLocaleDateString()}
                              </small>
                            ) : (
                              <span className="badge-modern" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>Calculating...</span>
                            )}
                          </td>
                          <td>
                            {shipment.trackingNumber ? (
                              <small className="text-truncate" style={{ color: 'var(--text-secondary)' }} title={shipment.trackingNumber}>
                                {shipment.trackingNumber}
                              </small>
                            ) : (
                              <span className="badge-modern" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>None</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="btn-outline-primary-modern" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => handleOpenStatusModal(shipment)}>
                                Update
                              </button>
                              <button className="btn-outline-primary-modern" style={{ padding: '4px 12px', fontSize: '12px', background: 'var(--success-50)', color: 'var(--success-600)', border: 'none' }} onClick={() => navigate(`/track/${shipment.order?._id}`)} disabled={!shipment.order?._id}>
                                Track
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal fade show d-block" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content modal-content-modern">
              <div className="modal-header modal-header-modern">
                <h5 style={{ fontWeight: 700, margin: 0 }}>
                  Update Shipment #{selectedShipment._id?.slice(-8).toUpperCase()}
                </h5>
                <button type="button" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowStatusModal(false)} aria-label="Close">
                  ✕
                </button>
              </div>
              <div className="modal-body modal-body-modern">
                {shipmentMessage && (
                  <div className={`alert-modern ${shipmentMessage.includes('success') ? 'alert-modern-success' : 'alert-modern-danger'}`} style={{ marginBottom: '16px' }}>
                    {shipmentMessage}
                  </div>
                )}
                <form onSubmit={handleUpdateStatus}>
                  <div className="mb-3">
                    <label className="form-label-modern">Status *</label>
                    <select className="form-control-modern" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })} required>
                      <option value="">Select status</option>
                      <option value="preparing">Preparing</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="in_transit">In Transit</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label-modern">Tracking Number</label>
                      <input type="text" className="form-control-modern" value={statusForm.trackingNumber} onChange={(e) => setStatusForm({ ...statusForm, trackingNumber: e.target.value })} placeholder="e.g. 1Z999AA10123456784" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label-modern">Carrier</label>
                      <input type="text" className="form-control-modern" value={statusForm.carrier} onChange={(e) => setStatusForm({ ...statusForm, carrier: e.target.value })} placeholder="e.g. UPS, FedEx, USPS" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label-modern">Estimated Delivery Date</label>
                    <input type="date" className="form-control-modern" value={statusForm.estimatedDeliveryDate} onChange={(e) => setStatusForm({ ...statusForm, estimatedDeliveryDate: e.target.value })} />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label-modern">Location (optional)</label>
                      <input type="text" className="form-control-modern" value={statusForm.location} onChange={(e) => setStatusForm({ ...statusForm, location: e.target.value })} placeholder="Current facility or city" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label-modern">Note (optional)</label>
                      <input type="text" className="form-control-modern" value={statusForm.note} onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })} placeholder="Any additional details" />
                    </div>
                  </div>
                  {deliveryPersonnel.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label-modern">Assign Delivery Personnel</label>
                      <select className="form-control-modern" value={assignPersonnelId} onChange={(e) => setAssignPersonnelId(e.target.value)}>
                        <option value="">No assignment</option>
                        {deliveryPersonnel.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.firstName} {p.lastName} ({p.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button type="button" className="btn-outline-primary-modern" onClick={() => setShowStatusModal(false)} style={{ padding: '10px 24px', fontSize: '14px' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-gradient-primary" disabled={shipmentLoading} style={{ padding: '10px 24px', fontSize: '14px' }}>
                      {shipmentLoading ? 'Updating...' : 'Update Shipment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
