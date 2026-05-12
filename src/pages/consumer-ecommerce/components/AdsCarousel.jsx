import { useRef, useEffect, useState } from 'react';
import { adBanners as mockAds } from '../services/mockData.js';
import { Link } from 'react-router-dom';

export default function AdsCarousel() {
  const trackRef = useRef(null);
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching ads from a backend API
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setIsLoading(true);
        // Replace this timeout with your actual API call:
        // const response = await fetch('/api/v1/ads');
        // const data = await response.json();
        
        setTimeout(() => {
          setAds(mockAds);
          setIsLoading(false);
        }, 500); // Simulated network delay
      } catch (error) {
        console.error("Failed to fetch ads:", error);
        setIsLoading(false);
      }
    };

    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length === 0 || isLoading) return;

    const track = trackRef.current;
    if (!track) return;

    let animationId;
    let scrollPos = 0;

    const scroll = () => {
      // scroll speed
      scrollPos += 0.6;
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
    return <div style={{ height: '120px', margin: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ce-muted)' }}>Loading ads...</div>;
  }

  if (ads.length === 0) {
    return null; // Don't render the section if there are no ads
  }

  // Duplicate for seamless infinite scrolling
  const duplicatedAds = [...ads, ...ads, ...ads, ...ads];

  return (
    <section className="ce-ads-section" style={{ margin: '24px 0' }}>
      <div className="ce-section-heading-row" style={{ padding: '0 14px', marginBottom: '12px' }}>
        <h2 className="ce-section-title" style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'var(--ce-text)' }}>Featured Promotions</h2>
      </div>
      <div 
        ref={trackRef} 
        style={{ 
          display: 'flex', 
          gap: '16px', 
          overflowX: 'hidden', 
          whiteSpace: 'nowrap',
          padding: '4px 14px 16px'
        }}
      >
        {duplicatedAds.map((ad, index) => (
          <Link 
            key={`${ad.id}-${index}`}
            to="/consumer-ecommerce/ads" 
            style={{ 
              flex: '0 0 280px', 
              height: '140px', 
              borderRadius: '20px', 
              overflow: 'hidden', 
              position: 'relative',
              display: 'block',
              textDecoration: 'none',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              transform: 'translateZ(0)' // Hardware acceleration
            }}
          >
            <img src={ad.image} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ 
              position: 'absolute', inset: 0, 
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '16px' 
            }}>
              <span style={{ 
                background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '8px', 
                color: '#fff', fontSize: '10px', fontWeight: '800', width: 'fit-content', marginBottom: '8px',
                backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)'
              }}>Promoted</span>
              <span style={{ color: '#fff', fontSize: '15px', fontWeight: '900', whiteSpace: 'normal', lineHeight: '1.2' }}>{ad.title}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#facc15' }}>★</span> {ad.brand}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
