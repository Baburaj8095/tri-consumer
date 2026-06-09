import { useState, useEffect } from 'react';
import { LuFlame } from 'react-icons/lu';

const mockProducts = [
  { id: 1, name: 'Wireless Earbuds', price: '₹999', originalPrice: '₹2,999', discount: '67%', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80' },
  { id: 2, name: 'Phone Case', price: '₹299', originalPrice: '₹799', discount: '62%', image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=300&q=80' },
  { id: 3, name: 'Screen Protector', price: '₹149', originalPrice: '₹499', discount: '70%', image: 'https://images.unsplash.com/photo-1609034227505-5876f6aa4e90?auto=format&fit=crop&w=300&q=80' },
  { id: 4, name: 'USB Cable', price: '₹199', originalPrice: '₹599', discount: '67%', image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=300&q=80' },
];

const mockStores = [
  { id: 1, name: 'Nike Store', tag: 'Hot Deal', discount: '40% OFF', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' },
  { id: 2, name: 'Zara', tag: 'Limited', discount: '50% OFF', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80' },
];

export default function DealsSection() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="ce-deals-section-skeleton" />;
  }

  return (
    <section className="ce-deals-section">
      <div className="ce-deals-carousel">
        {/* Card 1: Shopping Deals */}
        {/*
        <div className="ce-deals-card ce-shopping-deals-card">
          <div className="ce-deals-card-header">
            <h3 className="ce-deals-card-title">Shopping Deals</h3>
          </div>
          <div className="ce-products-grid-mini">
            {mockProducts.map((product) => (
              <div key={product.id} className="ce-mini-product-item">
                <div className="ce-mini-product-img-wrap">
                  <img src={product.image} alt={product.name} className="ce-mini-product-img" />
                  <div className="ce-mini-product-discount">{product.discount}</div>
                </div>
                <div className="ce-mini-product-info">
                  <span className="ce-mini-product-price">{product.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        */}

        {/* Card 2: Minimum 60% Off Banner */}
        <div className="ce-deals-card ce-promo-banner-card">
          <div className="ce-promo-banner-content">
            <div className="ce-promo-text-wrap">
              <div className="ce-promo-badge">
                <LuFlame className="ce-promo-icon" />
                <span>Limited Time</span>
              </div>
              <h2 className="ce-promo-title">Min. 60% Off</h2>
              <p className="ce-promo-subtitle">On selected items</p>
              <button className="ce-promo-cta">Shop Now</button>
            </div>
            <div className="ce-promo-img-wrap">
              <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80" alt="Promo" className="ce-promo-img" />
            </div>
          </div>
        </div>

        {/* Card 3: Store Deals For You */}
        <div className="ce-deals-card ce-store-deals-card">
          <div className="ce-deals-card-header">
            <h3 className="ce-deals-card-title">Store Deals For You</h3>
          </div>
          <div className="ce-store-deals-grid">
            {mockStores.map((store) => (
              <div key={store.id} className="ce-store-deal-item">
                <div className="ce-store-deal-img-wrap">
                  <img src={store.image} alt={store.name} className="ce-store-deal-img" />
                  <div className="ce-store-deal-tag">{store.tag}</div>
                  <div className="ce-store-deal-overlay">
                    <span className="ce-store-deal-discount">{store.discount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
