import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuSparkles } from 'react-icons/lu';
import { cashbackAds as mockAds } from '../services/mockData.js';

export default function CashbackAds({ adType = 'cashback' }) {
  const trackRef = useRef(null);
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAds(mockAds);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [adType]);

  useEffect(() => {
    if (ads.length === 0 || isLoading) return undefined;

    const track = trackRef.current;
    if (!track) return undefined;

    let animationId;
    let scrollPos = 0;

    const scroll = () => {
      scrollPos += 0.5;
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
    return <div className="ce-section-loading">Loading cashback offers...</div>;
  }

  if (ads.length === 0) {
    return null;
  }

  const duplicatedAds = [...ads, ...ads, ...ads, ...ads];

  return (
    <section className="ce-content-section ce-cashback-section">
      <div className="ce-section-heading-row">
        <div>
          <h2 className="ce-section-title">Cashback ads</h2>
          <p className="ce-section-subtitle">Warm offers from featured brands</p>
        </div>
      </div>

      <div ref={trackRef} className="ce-cashback-track">
        {duplicatedAds.map((ad, index) => (
          <Link
            key={`${ad.id}-${index}`}
            to="/consumer-ecommerce/ads"
            className="ce-cashback-card"
          >
            <img src={ad.image} alt={ad.title} />
            <div className="ce-cashback-scrim" />
            <div className="ce-cashback-badge">{ad.discount}</div>
            <div className="ce-cashback-copy">
              <h3>{ad.title}</h3>
              <p>{ad.brand}</p>
            </div>
            <span className="ce-ad-buy-btn">Buy</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
