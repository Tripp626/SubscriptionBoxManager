/* eslint-disable no-undef */
import { useState, useEffect } from 'react';
import { getSubscriptionReport, getSalesReport, getCustomerAnalytics, getAllSubscriptions, getAllOrders, getLowStock, getProducts, createProduct, updateProduct, deleteProduct, deactivateProduct, activateProduct, getAllShipments, updateShipmentStatus, assignDeliveryPersonnel, getDeliveryPersonnel } from '../services/api';
import ProductImage from '../components/ProductImage';

export default function AdminDashboard() {
  const [subReport, setSubReport] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [customerAnalytics, setCustomerAnalytics] = useState(null);
  const [recentSubscriptions, setRecentSubscriptions] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  // Product management state
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

  // Shipment management state
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
    // Set a flag to remove existing image on the server
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
    if (!window.confirm('Are you sure you want to deactivate this product? It will be hidden from customers but remain in the list.')) return;
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
    if (!window.confirm('Are you sure you want to permanently delete this product? This cannot be undone.')) return;
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
    <div className="container-fluid py-4">
      <h2>Admin Dashboard</h2>

      {/* Tabs */}
      <ul className="nav nav-tabs mt-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'shipments' ? 'active' : ''}`} onClick={() => setActiveTab('shipments')}>Shipments</button>
        </li>
      </ul>

      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="row mt-4">
            <div className="col-md-3 mb-3">
              <div className="card bg-primary text-white shadow-sm">
                <div className="card-body">
                  <h6>Active Subscriptions</h6>
                  <h3>{subReport?.active ?? '...'}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-success text-white shadow-sm">
                <div className="card-body">
                  <h6>Total Revenue</h6>
                  <h3>${salesReport?.totalRevenue?.toFixed(2) ?? '...'}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-info text-white shadow-sm">
                <div className="card-body">
                  <h6>Total Customers</h6>
                  <h3>{customerAnalytics?.totalCustomers ?? '...'}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-warning text-white shadow-sm">
                <div className="card-body">
                  <h6>Low Stock Items</h6>
                  <h3>{lowStock.length}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between">
                  <h5 className="mb-0">Recent Subscriptions</h5>
                </div>
                <div className="card-body">
                  <table className="table table-sm">
                    <thead><tr><th>Customer</th><th>Plan</th><th>Status</th></tr></thead>
                    <tbody>
                      {recentSubscriptions.map(sub => (
                        <tr key={sub._id}>
                          <td>{sub.user?.firstName} {sub.user?.lastName}</td>
                          <td>{sub.plan?.name}</td>
                          <td><span className={`badge bg-${sub.status === 'active' ? 'success' : 'secondary'}`}>{sub.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between">
                  <h5 className="mb-0">Recent Orders</h5>
                </div>
                <div className="card-body">
                  <table className="table table-sm">
                    <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order._id}>
                          <td>{order._id.slice(-8)}</td>
                          <td>{order.user?.firstName} {order.user?.lastName}</td>
                          <td>${order.totalAmount?.toFixed(2)}</td>
                          <td><span className="badge bg-info">{order.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-header"><h5 className="mb-0">Low Stock Alert</h5></div>
                <div className="card-body">
                  {lowStock.length === 0 ? (
                    <p className="text-muted">All products are well stocked.</p>
                  ) : (
                    lowStock.map(p => (
                      <div key={p._id} className="d-flex justify-content-between align-items-center mb-2">
                        <span>{p.name}</span>
                        <span className="badge bg-danger">{p.quantity} left</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-header"><h5 className="mb-0">Top Products</h5></div>
                <div className="card-body">
                  {customerAnalytics?.topProducts?.map(p => (
                    <div key={p._id} className="d-flex justify-content-between align-items-center mb-2">
                      <span>{p.name}</span>
                      <span className="badge bg-success">{p.totalOrdered} sold</span>
                    </div>
                  )) ?? <p className="text-muted">No data yet.</p>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'products' && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Product Catalog ({products.length} products)</h4>
            <button className="btn btn-primary" onClick={() => { resetProductForm(); setShowProductForm(true); }}>
              + Add Product
            </button>
          </div>

          {productError && <div className="alert alert-danger">{productError}</div>}
          {productSuccess && <div className="alert alert-success">{productSuccess}</div>}

          {/* Product Form */}
          {showProductForm && (
            <div className="card shadow-sm mb-4 border-primary">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{editingProduct ? 'Edit Product' : 'Add New Product'}</h5>
                <button className="btn btn-sm btn-outline-light" onClick={resetProductForm}>✕</button>
              </div>
              <div className="card-body">
                <form onSubmit={handleProductSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Product Name *</label>
                      <input type="text" className="form-control" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Price ($) *</label>
                      <input type="number" step="0.01" min="0" className="form-control" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Quantity *</label>
                      <input type="number" min="0" className="form-control" value={productForm.quantity} onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category *</label>
                      <select className="form-select" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} required>
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tags (comma-separated)</label>
                      <input type="text" className="form-control" placeholder="e.g. organic, vegan, gift" value={productForm.tags} onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows={3} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Product Image</label>
                    <input type="file" className="form-control" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleProductImageChange} />
                    {productImagePreview && (
                      <div className="mt-2 d-flex align-items-center gap-2">
                        <img src={productImagePreview} alt="Preview" className="rounded" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleRemoveProductImage}>✕ Remove</button>
                      </div>
                    )}
                  </div>
                  <div className="form-check mb-3">
                    <input type="checkbox" className="form-check-input" id="isActive" checked={productForm.isActive} onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })} />
                    <label className="form-check-label" htmlFor="isActive">Active (visible to customers)</label>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={productLoading}>
                      {productLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={resetProductForm}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="card shadow-sm">
            <div className="card-body">
              {products.length === 0 ? (
                <p className="text-muted text-center py-3">No products yet. Click "Add Product" to create one.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
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
                        <tr key={product._id} className={!product.isActive ? 'table-secondary' : ''}>
                          <td>
                            <ProductImage product={product} wSize={40} hSize={40} />
                          </td>
                          <td>
                            <strong>{product.name}</strong>
                            {product.tags?.length > 0 && <><br /><small className="text-muted">{product.tags.join(', ')}</small></>}
                          </td>
                          <td>{product.category}</td>
                          <td>${product.price?.toFixed(2)}</td>
                          <td>
                            <span className={`badge bg-${product.quantity > 10 ? 'success' : product.quantity > 0 ? 'warning' : 'danger'}`}>
                              {product.quantity}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${product.isActive ? 'success' : 'secondary'}`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEditProduct(product)}>Edit</button>
                            {product.isActive ? (
                              <button className="btn btn-sm btn-outline-warning me-1" onClick={() => handleDeactivateProduct(product._id)}>Deactivate</button>
                            ) : (
                              <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleActivateProduct(product._id)}>Activate</button>
                            )}
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shipments Tab */}
      {activeTab === 'shipments' && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Shipments ({shipments.length} total)</h4>
          </div>

          {shipmentLoading && (
            <div className="text-center py-4">
              <div class="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {shipments.length === 0 && !shipmentLoading && (
            <p className="text-muted text-center py-4">No shipments found.</p>
          )}

          {!shipmentLoading && shipments.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover">
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
                                      shipment.status === 'shipped' || shipment.status === 'in_transit' || shipment.status === 'out_for_delivery' ? 'primary' : 'warning';

                    return (
                      <tr key={shipment._id}>
                        <td>#{shipment.order?._id?.slice(-8).toUpperCase() || 'N/A'}</td>
                        <td>
                          {shipment.order?.user?.firstName} {shipment.order?.user?.lastName || ''}
                        </td>
                        <td>
                          {shipment.order?.products?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                        </td>
                        <td>${shipment.order?.totalAmount?.toFixed(2) || '0.00'}</td>
                        <td>
                          <span className={`badge bg-${statusColor}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td>
                          {shipment.estimatedDeliveryDate ? (
                            <small className="text-muted">
                              {new Date(shipment.estimatedDeliveryDate).toLocaleDateString()}
                            </small>
                          ) : (
                            <span className="badge bg-secondary">Calculating...</span>
                          )}
                        </td>
                        <td>
                          {shipment.trackingNumber ? (
                            <small className="text-truncate" title={shipment.trackingNumber}>
                              {shipment.trackingNumber}
                            </small>
                          ) : (
                            <span className="badge bg-secondary">None</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleOpenStatusModal(shipment)}>
                              Update
                            </button>
                            <button className="btn btn-sm btn-outline-success" onClick={() => navigate(`/track/${shipment.order?._id}`)} disabled={!shipment.order?._id}>
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
          )}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal fade show d-block" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabindex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Shipment #{selectedShipment._id?.slice(-8).toUpperCase()}</h5>
                <button type="button" className="btn-close" onClick={() => setShowStatusModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {shipmentMessage && (
                  <div className={`alert alert-${shipmentMessage.includes('success') ? 'success' : 'danger'} mb-3`}>
                    {shipmentMessage}
                  </div>
                )}
                <form onSubmit={handleUpdateStatus}>
                  <div className="mb-3">
                    <label className="form-label">Status *</label>
                    <select className="form-select" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })} required>
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
                  <div className="mb-3">
                    <label className="form-label">Tracking Number</label>
                    <input type="text" className="form-control" value={statusForm.trackingNumber} onChange={(e) => setStatusForm({ ...statusForm, trackingNumber: e.target.value })} placeholder="e.g. 1Z999AA10123456784" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Carrier</label>
                    <input type="text" className="form-control" value={statusForm.carrier} onChange={(e) => setStatusForm({ ...statusForm, carrier: e.target.value })} placeholder="e.g. UPS, FedEx, USPS" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Estimated Delivery Date</label>
                    <input type="date" className="form-control" value={statusForm.estimatedDeliveryDate} onChange={(e) => setStatusForm({ ...statusForm, estimatedDeliveryDate: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location (optional)</label>
                    <input type="text" className="form-control" value={statusForm.location} onChange={(e) => setStatusForm({ ...statusForm, location: e.target.value })} placeholder="Current facility or city" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Note (optional)</label>
                    <textarea className="form-control" rows="2" value={statusForm.note} onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })} placeholder="Any additional details" />
                  </div>
                  {deliveryPersonnel.length > 0 && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Assign Delivery Personnel</label>
                        <select className="form-select" value={assignPersonnelId} onChange={(e) => setAssignPersonnelId(e.target.value)}>
                          <option value="">No assignment</option>
                          {deliveryPersonnel.map(p => (
                            <option key={p._id} value={p._id}>
                              {p.firstName} {p.lastName} ({p.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="alert alert-info mb-0 small">
                        Assigning personnel will notify them of this shipment.
                      </div>
                    </>
                  )}
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button type="button" className="btn btn-secondary me-md-2" onClick={() => setShowStatusModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={shipmentLoading}>
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
