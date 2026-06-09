import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adBanners as mockAds } from '../services/mockData.js';

export default function AdsCarousel() {
  const trackRef = useRef(null);
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAds(mockAds);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ads.length === 0 || isLoading) return undefined;

    const track = trackRef.current;
    if (!track) return undefined;

    let animationId;
    let scrollPos = 0;

    const scroll = () => {
      scrollPos += 0.6;
      if (track) {
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
    return <div className="ce-section-loading">Loading promotions...</div>;
  }

  if (ads.length === 0) {
    return null;
  }

  const duplicatedAds = [...ads, ...ads, ...ads, ...ads];

  return (
    <section className="ce-content-section ce-ads-section">
      <div className="ce-section-heading-row">
        <div>
          <h2 className="ce-section-title">Featured promotions</h2>
          <p className="ce-section-subtitle">Fresh campaigns from trusted partners</p>
        </div>
      </div>
      <div ref={trackRef} className="ce-ads-track">
        {duplicatedAds.map((ad, index) => (
          <Link key={`${ad.id}-${index}`} to="/consumer-ecommerce/ads" className="ce-ad-card">
            <img src={ad.image} alt={ad.title} />
            <div className="ce-ad-scrim" />
            <div className="ce-ad-copy">
              <span>Promoted</span>
              <strong>{ad.title}</strong>
              <small>{ad.brand}</small>
            </div>
            <span className="ce-ad-buy-btn">Buy</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
