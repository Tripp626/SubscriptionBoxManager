import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="page-enter" style={{ background: 'var(--bg-secondary)' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 70%, #6366f1 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 0',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '-50px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(168, 85, 247, 0.15)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.12)',
          filter: 'blur(100px)',
        }} />
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '20%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(192, 132, 252, 0.1)',
          filter: 'blur(60px)',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row align-items-center">
            <div className="col-lg-6" style={{ color: 'white' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '9999px',
                padding: '6px 16px',
                marginBottom: '24px',
                fontSize: '13px',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}>
                <span>✨</span> Now with AI-powered recommendations
              </div>
              <h1 style={{
                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '20px',
              }}>
                Boxes Curated<br />
                <span style={{
                  background: 'linear-gradient(135deg, #c084fc, #818cf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Just For You
                </span>
              </h1>
              <p style={{
                fontSize: '1.15rem',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.75)',
                marginBottom: '36px',
                maxWidth: '480px',
              }}>
                Discover handpicked products, personalized to your tastes. Subscribe, customize, and enjoy delightful boxes delivered right to your door every month.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link
                  to="/register"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 32px',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '15px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.5)',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99, 102, 241, 0.6)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.5)'; }}
                >
                  Get Started Free →
                </Link>
                <Link
                  to="/plans"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 32px',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '15px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                >
                  View Plans
                </Link>
              </div>

              {/* Social proof */}
              <div style={{ marginTop: '48px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex' }}>
                  {['🧑', '👩', '🧔', '👱‍♀️'].map((emoji, i) => (
                    <div key={i} style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: `hsl(${220 + i * 30}, 70%, 85%)`,
                      border: '2px solid rgba(30, 27, 75, 0.8)',
                      marginLeft: i > 0 ? '-10px' : '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      position: 'relative',
                      zIndex: 4 - i,
                    }}>
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[1,2,3,4,5].map(i => (
                      <span key={i} style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>
                    ))}
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    Loved by <strong style={{ color: 'white' }}>2,500+</strong> subscribers
                  </span>
                </div>
              </div>
            </div>

            {/* Right side mockup */}
            <div className="col-lg-6 d-none d-lg-flex" style={{ justifyContent: 'center', position: 'relative' }}>
              <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                transform: 'rotate(-3deg)',
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: '16px',
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>📦</div>
                  <div style={{ fontWeight: 700, color: '#4338ca', fontSize: '14px' }}>Your February Box</div>
                  <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>5 items · Ships Feb 15</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { emoji: '🧴', name: 'Face Serum', price: '$24' },
                    { emoji: '🍫', name: 'Artisan Chocolate', price: '$12' },
                    { emoji: '📖', name: 'Mini Journal', price: '$8' },
                    { emoji: '🕯️', name: 'Soy Candle', price: '$16' },
                  ].map(item => (
                    <div key={item.name} style={{
                      background: '#f9fafb',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{item.emoji}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 700 }}>{item.price}</div>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px',
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                }}>
                  Customize Your Box →
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{
              display: 'inline-block',
              background: 'var(--primary-50)',
              color: 'var(--primary-600)',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '16px',
            }}>
              How It Works
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '12px' }}>
              Three simple steps to<br /><span className="gradient-text">subscription bliss</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto' }}>
              Getting started is easy. Choose a plan, tell us your preferences, and we'll handle the rest.
            </p>
          </div>

          <div className="row">
            {[
              {
                icon: '🎯',
                title: 'Choose Your Plan',
                desc: 'Pick from flexible subscription plans that fit your lifestyle and budget. From starter boxes to premium collections.',
                gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
              },
              {
                icon: '✨',
                title: 'Personalized Picks',
                desc: 'Our smart engine learns your preferences and curates boxes you\'ll absolutely love. The more you rate, the better it gets.',
                gradient: 'linear-gradient(135deg, #a855f7, #c084fc)',
              },
              {
                icon: '🚚',
                title: 'Track & Enjoy',
                desc: 'Follow your shipment in real-time and rate products to improve future boxes. Free shipping on all plans.',
                gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
              },
            ].map((feature, i) => (
              <div key={i} className="col-md-4 mb-4">
                <div className="feature-card" style={{ height: '100%' }}>
                  <div className="feature-icon" style={{ background: feature.gradient }}>
                    <span style={{ color: 'white', fontSize: '28px' }}>{feature.icon}</span>
                  </div>
                  <div className="feature-title">{feature.title}</div>
                  <div className="feature-desc">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--gray-900), var(--gray-800))',
        padding: '64px 0',
      }}>
        <div className="container">
          <div className="row text-center">
            {[
              { value: '2,500+', label: 'Happy Subscribers' },
              { value: '50K+', label: 'Boxes Delivered' },
              { value: '4.9★', label: 'Average Rating' },
              { value: '500+', label: 'Unique Products' },
            ].map((stat, i) => (
              <div key={i} className="col-6 col-md-3 mb-3">
                <div style={{ color: 'white', fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
                  {stat.value}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{
              display: 'inline-block',
              background: 'var(--success-50)',
              color: 'var(--success-600)',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '16px',
            }}>
              Testimonials
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
              What our subscribers say
            </h2>
          </div>
          <div className="row">
            {[
              {
                quote: "I look forward to my box every month! The personalization is incredible — it's like they actually know me.",
                name: 'Sarah M.',
                role: 'Subscriber since 2024',
                avatar: '👩',
              },
              {
                quote: "The quality of products is outstanding. I've discovered so many brands I never would have found on my own.",
                name: 'James K.',
                role: 'Premium member',
                avatar: '🧔',
              },
              {
                quote: "Best subscription box I've tried. The ability to customize and swap items makes it feel truly personal.",
                name: 'Emily R.',
                role: 'Subscriber since 2023',
                avatar: '👱‍♀️',
              },
            ].map((testimonial, i) => (
              <div key={i} className="col-md-4 mb-4">
                <div className="card-elevated" style={{ padding: '28px', height: '100%' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>
                    "{testimonial.quote}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--primary-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{testimonial.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
            borderRadius: 'var(--radius-2xl)',
            padding: '64px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-80px',
              left: '-30px',
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{
                color: 'white',
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                marginBottom: '16px',
              }}>
                Ready to unbox happiness?
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: '1.1rem',
                marginBottom: '36px',
                maxWidth: '500px',
                margin: '0 auto 36px',
              }}>
                Join thousands of happy subscribers and start receiving personalized boxes today. No commitment, cancel anytime.
              </p>
              <Link
                to="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 40px',
                  background: 'white',
                  color: '#4f46e5',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 800,
                  fontSize: '16px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; }}
              >
                Get Started Free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--gray-900)',
        padding: '48px 0 24px',
        color: 'rgba(255,255,255,0.6)',
      }}>
        <div className="container">
          <div className="row" style={{ marginBottom: '32px' }}>
            <div className="col-md-4 mb-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}>📦</div>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>SBMS</span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.7, maxWidth: '280px' }}>
                Curated subscription boxes personalized to your tastes. Discover new products every month.
              </p>
            </div>
            <div className="col-md-2 col-6 mb-4">
              <h6 style={{ color: 'white', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Product</h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/plans" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Plans</Link>
                <Link to="/products" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Products</Link>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-4">
              <h6 style={{ color: 'white', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Company</h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '14px' }}>About</span>
                <span style={{ fontSize: '14px' }}>Contact</span>
              </div>
            </div>
            <div className="col-md-2 col-6 mb-4">
              <h6 style={{ color: 'white', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Legal</h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '14px' }}>Privacy</span>
                <span style={{ fontSize: '14px' }}>Terms</span>
              </div>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '24px',
            textAlign: 'center',
            fontSize: '13px',
          }}>
            © 2026 Subscription Box Manager. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
