import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdzOnlySection() {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const ads = [
    {
      id: 1,
      title: 'Mega Electronics Mela',
      subtitle: 'Up to 50% OFF on Smart Appliances',
      badge: 'Brand Campaign',
      image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=800&q=80',
      cta: 'Shop Now',
      color: '#EA580C'
    },
    {
      id: 2,
      title: 'Fresh Veggies & Fruits',
      subtitle: 'Free doorstep delivery in 15 mins',
      badge: 'Promotional Offer',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      cta: 'Order Now',
      color: '#16A34A'
    },
    {
      id: 3,
      title: 'Premium Salon & Spa',
      subtitle: 'Flat 30% OFF on first home booking',
      badge: 'Featured Services',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      cta: 'Book Now',
      color: '#DB2777'
    },
    {
      id: 4,
      title: 'Upgrade Your Wardrobe',
      subtitle: 'Flat 70% OFF on summer collections',
      badge: 'Seasonal Deals',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
      cta: 'Explore',
      color: '#2563EB'
    }
  ];

  // Auto-scroll logic
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % ads.length;
      el.scrollTo({
        left: nextIndex * el.clientWidth,
        behavior: 'smooth'
      });
      setActiveIndex(nextIndex);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeIndex, ads.length]);

  // Handle manual scroll scroll-snap tracking
  const handleScroll = (e) => {
    const el = e.target;
    const scrollPos = el.scrollLeft;
    const width = el.clientWidth;
    if (width > 0) {
      const index = Math.round(scrollPos / width);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  return (
    <section className="ce-adz-carousel-section" style={{ margin: '18px 0 24px' }}>
      <div className="ce-section-heading-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h2 className="ce-section-title" style={{ fontSize: '16px', fontWeight: '800', color: '#1F2937', margin: 0 }}>Adz Only</h2>
          <p className="ce-section-subtitle" style={{ fontSize: '11px', color: '#6B7280', margin: '2px 0 0' }}>Special offers & campaigns from local partners</p>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            borderRadius: '16px',
            gap: '0',
          }}
          className="ce-adz-carousel-track"
        >
          {ads.map((ad) => (
            <Link 
              key={ad.id} 
              to="/consumer-ecommerce/ads" 
              style={{
                flex: '0 0 100%',
                scrollSnapAlign: 'center',
                textDecoration: 'none',
                position: 'relative',
                height: '168px',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'block'
              }}
            >
              <img 
                src={ad.image} 
                alt={ad.title} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  inset: 0
                }}
              />
              {/* Gradient Scrim Overlay */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.75) 100%)',
                  zIndex: 1
                }}
              />
              
              {/* Copy content */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                  zIndex: 2,
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <span 
                  style={{
                    alignSelf: 'flex-start',
                    background: ad.color,
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {ad.badge}
                </span>
                <strong style={{ fontSize: '16px', fontWeight: '800', lineHeight: '1.25' }}>{ad.title}</strong>
                <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>{ad.subtitle}</p>
              </div>

              {/* Buy Now/CTA floating button */}
              <span 
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 2,
                  background: 'rgba(255, 255, 255, 0.92)',
                  color: '#111827',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {ad.cta}
              </span>
            </Link>
          ))}
        </div>

        {/* Pagination Dots Indicators */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '12px'
          }}
        >
          {ads.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const el = scrollRef.current;
                if (el) {
                  el.scrollTo({
                    left: idx * el.clientWidth,
                    behavior: 'smooth'
                  });
                  setActiveIndex(idx);
                }
              }}
              style={{
                width: idx === activeIndex ? '16px' : '6px',
                height: '6px',
                borderRadius: '3px',
                border: 0,
                background: idx === activeIndex ? '#FF6B00' : '#D1D5DB',
                transition: 'all 200ms ease',
                cursor: 'pointer',
                padding: 0
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
