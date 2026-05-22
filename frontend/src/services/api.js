import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const getDeliveryPersonnel = () => API.get('/auth/delivery-personnel');

// Subscription Plans
export const getPlans = () => API.get('/subscriptions/plans');
export const getAllPlans = () => API.get('/subscriptions/admin/plans');
export const createPlan = (data) => API.post('/subscriptions/admin/plans', data);
export const updatePlan = (id, data) => API.put(`/subscriptions/admin/plans/${id}`, data);
export const deletePlan = (id) => API.delete(`/subscriptions/admin/plans/${id}`);

// Customer Subscriptions
export const subscribe = (data) => API.post('/subscriptions/subscribe', data);
export const getMySubscriptions = () => API.get('/subscriptions/my-subscriptions');
export const cancelSubscription = (id) => API.put(`/subscriptions/cancel/${id}`);
export const renewSubscription = (id) => API.put(`/subscriptions/renew/${id}`);
export const pauseSubscription = (id) => API.put(`/subscriptions/pause/${id}`);
export const resumeSubscription = (id) => API.put(`/subscriptions/resume/${id}`);
export const skipNextBilling = (id) => API.put(`/subscriptions/skip/${id}`);
export const getAllSubscriptions = () => API.get('/subscriptions/admin/subscriptions');

// Products
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const createProduct = (formData) => API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, formData) => API.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const deactivateProduct = (id) => API.put(`/products/${id}/deactivate`);
export const activateProduct = (id) => API.put(`/products/${id}/activate`);
export const getLowStock = () => API.get('/products/admin/low-stock');

// Orders
export const createOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/my-orders');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const getAllOrders = () => API.get('/orders');
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}/status`, data);

// Shipments
export const getShipmentByOrder = (orderId) => API.get(`/shipments/order/${orderId}`);
export const getMyShipments = () => API.get('/shipments/my-shipments');
export const updateShipmentStatus = (id, data) => API.put(`/shipments/${id}/status`, data);
export const assignDeliveryPersonnel = (id, data) => API.put(`/shipments/${id}/assign`, data);
export const getAllShipments = () => API.get('/shipments');

// Payments
export const processPayment = (data) => API.post('/payments', data);
export const getMyPayments = () => API.get('/payments/my-payments');
export const getPayment = (id) => API.get(`/payments/${id}`);
export const getAllPayments = () => API.get('/payments');
export const refundPayment = (id) => API.put(`/payments/${id}/refund`);

// Feedback
export const createFeedback = (data) => API.post('/feedback', data);
export const getProductFeedback = (productId) => API.get(`/feedback/product/${productId}`);
export const getMyFeedback = () => API.get('/feedback/my-feedback');
export const getAllFeedback = () => API.get('/feedback');

// Preferences
export const setPreferences = (data) => API.post('/preferences', data);
export const getPreferences = () => API.get('/preferences');
export const getRecommendations = () => API.get('/preferences/recommendations');

// Notifications
export const getMyNotifications = () => API.get('/notifications');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');
export const sendNotification = (data) => API.post('/notifications/send', data);

// Reports
export const getSubscriptionReport = () => API.get('/reports/subscriptions');
export const getSalesReport = () => API.get('/reports/sales');
export const getCustomerAnalytics = () => API.get('/reports/customers');

// Boxes
export const getMyBox = () => API.get('/boxes/my-box');
export const customizeBox = (id, data) => API.put(`/boxes/${id}/customize`, data);
export const confirmBox = (id) => API.put(`/boxes/${id}/confirm`);
export const getBoxHistory = () => API.get('/boxes/history');
export const getAllBoxes = () => API.get('/boxes');
export const markBoxShipped = (id) => API.put(`/boxes/${id}/ship`);

export default API;
