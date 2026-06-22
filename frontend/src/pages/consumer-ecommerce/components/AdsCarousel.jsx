import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { adBanners as mockAds } from '../services/mockData.js';

const CAPTAIN_API_URL =
  process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

export default function AdsCarousel() {
  const trackRef = useRef(null);
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get(`${CAPTAIN_API_URL}/api/ads/banners?limit=10&target=CONSUMER_ONLINE_B2C`)
      .then(res => {
        const fetchedAds = Array.isArray(res.data) ? res.data : [];
        if (fetchedAds.length > 0) {
          setAds(fetchedAds.map(ad => ({
            id: ad.id,
            title: ad.title || 'Promoted',
            brand: ad.description || 'Sponsored',
            image: ad.image_url || ad.shop_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80',
            targetUrl: ad.target_url || null
          })));
        } else {
          setAds(mockAds);
        }
      })
      .catch(() => {
        setAds(mockAds);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
