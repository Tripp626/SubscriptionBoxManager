import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div>
      <header className="bg-dark text-white py-5">
        <div className="container text-center">
          <h1>Subscription Box Manager</h1>
          <p className="lead">Curated boxes delivered to your door, personalized just for you.</p>
          <div className="mt-4">
            <Link to="/register" className="btn btn-primary btn-lg me-3">Get Started</Link>
            <Link to="/login" className="btn btn-outline-light btn-lg">Sign In</Link>
          </div>
        </div>
      </header>

      <section className="py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h3>Choose a Plan</h3>
                  <p>Pick from flexible subscription plans that fit your lifestyle and budget.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h3>Personalized Picks</h3>
                  <p>Our engine learns your preferences and curates boxes you'll love.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h3>Track & Enjoy</h3>
                  <p>Follow your shipment in real-time and rate products to improve future boxes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-dark text-white text-center py-3">
        <p className="mb-0">&copy; 2026 Subscription Box Manager. All rights reserved.</p>
      </footer>
    </div>
  );
}
