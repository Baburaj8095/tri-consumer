import { useRef, useEffect, useState } from 'react';
import { cashbackAds as mockAds } from '../services/mockData.js';
import { Link } from 'react-router-dom';

export default function CashbackAds({ adType = 'cashback' }) {
  const trackRef = useRef(null);
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching configured ads from a backend API
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setIsLoading(true);
        // Backend configurable URL example:
        // const response = await fetch(`/api/v1/ads?type=${adType}`);
        // const data = await response.json();
        
        setTimeout(() => {
          setAds(mockAds); // In real scenario, use filtered data
          setIsLoading(false);
        }, 600); // Simulated network delay
      } catch (error) {
        console.error("Failed to fetch ads:", error);
        setIsLoading(false);
      }
    };

    fetchAds();
  }, [adType]);

  // Infinite horizontal scroll logic
  useEffect(() => {
    if (ads.length === 0 || isLoading) return;

    const track = trackRef.current;
    if (!track) return;

    let animationId;
    let scrollPos = 0;

    const scroll = () => {
      // scroll speed
      scrollPos += 0.5;
      if (track) {
        // Since we duplicated the array, we reset halfway to create infinite loop
        if (scrollPos >= track.scrollWidth / 2) {
          scrollPos = 0;
        }
        track.scrollLeft = scrollPos;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [ads, isLoading]);

  if (isLoading) {
    return <div style={{ height: '140px', margin: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ce-muted)' }}>Loading cashback ads...</div>;
  }

  if (ads.length === 0) {
    return null;
  }

  // Duplicate for seamless infinite scrolling
  const duplicatedAds = [...ads, ...ads, ...ads, ...ads];

  return (
    <section className="ce-content-section" style={{ padding: '20px 14px', margin: '16px 0', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="ce-section-heading-row" style={{ marginBottom: '16px' }}>
        <h2 className="ce-section-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15' }}>
          <span style={{ fontSize: '20px' }}>✨</span> Cashback Rewards
        </h2>
      </div>
      
      <div 
        ref={trackRef} 
        style={{ 
          display: 'flex', 
          gap: '16px', 
          overflowX: 'hidden', 
          whiteSpace: 'nowrap',
          paddingBottom: '8px'
        }}
      >
        {duplicatedAds.map((ad, index) => (
          <Link 
            key={`${ad.id}-${index}`}
            to="/consumer-ecommerce/ads" 
            style={{ 
              flex: '0 0 200px', 
              height: '240px', 
              borderRadius: '16px', 
              overflow: 'hidden', 
              position: 'relative', 
              display: 'block',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              border: '1px solid rgba(250, 204, 21, 0.2)'
            }}
          >
            <img src={ad.image} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #020617 0%, rgba(2,6,23,0.6) 40%, transparent 100%)' }}></div>
            
            {/* Gold foil effect badge */}
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)', color: '#78350f', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
              {ad.discount}
            </div>

            <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', color: '#fff' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, whiteSpace: 'normal', lineHeight: '1.2', color: '#f8fafc' }}>{ad.title}</h3>
              <p style={{ fontSize: '12px', margin: '6px 0 0', color: '#cbd5e1', whiteSpace: 'normal', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#facc15' }}></span> {ad.brand}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
