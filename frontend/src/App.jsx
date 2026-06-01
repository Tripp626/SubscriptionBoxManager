import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BoxProvider } from './context/BoxContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProductCatalog from './pages/ProductCatalog';
import ProductDetail from './pages/ProductDetail';
import CustomizeBox from './pages/CustomizeBox';
import BoxHistory from './pages/BoxHistory';
import SubscriptionPlans from './pages/SubscriptionPlans';
import SubscriptionDetail from './pages/SubscriptionDetail';
import Preferences from './pages/Preferences';
import Profile from './pages/Profile';
import MyReviews from './pages/MyReviews';
import TrackShipment from './pages/TrackShipment';
import ForgotPassword from './pages/ForgotPassword';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/register', '/forgot-password'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/plans" element={<SubscriptionPlans />} />
        <Route path="/customize-box" element={<ProtectedRoute roles={['customer']}><CustomizeBox /></ProtectedRoute>} />
        <Route path="/box-history" element={<ProtectedRoute roles={['customer']}><BoxHistory /></ProtectedRoute>} />
        <Route path="/subscription/:id" element={<ProtectedRoute roles={['customer']}><SubscriptionDetail /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/preferences" element={<ProtectedRoute roles={['customer']}><Preferences /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute roles={['customer']}><MyReviews /></ProtectedRoute>} />
        <Route path="/track/:orderId" element={<ProtectedRoute roles={['customer']}><TrackShipment /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BoxProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </BoxProvider>
    </AuthProvider>
  );
}
