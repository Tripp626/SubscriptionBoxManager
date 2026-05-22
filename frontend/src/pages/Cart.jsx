import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h3>Your cart is empty</h3>
        <p className="text-muted">Browse our products and add items to your cart.</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2>Shopping Cart</h2>
      <div className="row mt-4">
        <div className="col-md-8">
          {cart.map(item => (
            <div key={item.product._id} className="card mb-3 shadow-sm">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <ProductImage product={item.product} size={80} />
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1">{item.product.name}</h6>
                  <p className="text-muted mb-0">${item.product.price?.toFixed(2)} each</p>
                </div>
                <div className="d-flex align-items-center gap-2 me-3">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>−</button>
                  <span style={{ width: 30, textAlign: 'center' }}>{item.quantity}</span>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
                </div>
                <strong className="me-3">${(item.product.price * item.quantity).toFixed(2)}</strong>
                <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(item.product._id)}>✕</button>
              </div>
            </div>
          ))}
          <button className="btn btn-outline-danger btn-sm" onClick={clearCart}>Clear Cart</button>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm sticky-top" style={{ top: 20 }}>
            <div className="card-body">
              <h5>Order Summary</h5>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total</strong>
                <strong>${totalPrice.toFixed(2)}</strong>
              </div>
              <button className="btn btn-primary w-100" onClick={() => {
                if (!user) { navigate('/login'); return; }
                navigate('/checkout');
              }}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
