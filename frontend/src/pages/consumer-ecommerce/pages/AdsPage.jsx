import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaPlay } from 'react-icons/fa6';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

export default function AdsPage() {
  const [selectedAd, setSelectedAd] = useState(null);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const ads = [
    { id: 1, brand: 'Nike', title: 'Latest Collection', points: 50, duration: '30s', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=240&q=80' },
    { id: 2, brand: 'Starbucks', title: 'Coffee Rewards', points: 40, duration: '25s', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=240&q=80' },
    { id: 3, brand: 'Amazon Prime', title: 'Prime Benefits', points: 60, duration: '40s', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=240&q=80' },
    { id: 4, brand: 'Netflix', title: 'Stream Unlimited', points: 45, duration: '35s', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=240&q=80' },
    { id: 5, brand: 'Uber Eats', title: 'Food Delivery', points: 35, duration: '20s', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=240&q=80' },
    { id: 6, brand: 'Flipkart', title: 'Big Sale', points: 55, duration: '38s', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=240&q=80' },
  ];

  const handleWatchAd = (ad) => {
    setSelectedAd(ad);
  };

  const handleCompleteAd = () => {
    if (selectedAd) {
      setEarnedPoints(earnedPoints + selectedAd.points);
      setSelectedAd(null);
    }
  };

  return (
    <div className="ce-app ce-watch-page">
      <Header />
      <main className="ce-container">
        <div className="ce-ads-header">
          <Link to="/consumer-ecommerce" className="ce-back-btn">
            <FaArrowLeft />
          </Link>
          <h1 className="ce-ads-title">Watch & Earn Ads</h1>
          <div className="ce-points-badge">
            <span className="ce-points-label">Points</span>
            <span className="ce-points-value">{earnedPoints}</span>
          </div>
        </div>

        {selectedAd ? (
          <div className="ce-ad-player-container">
            <div className="ce-ad-player">
              <img className="ce-ad-player-icon" src={selectedAd.image} alt={selectedAd.brand} />
              <h2 className="ce-ad-player-brand">{selectedAd.brand}</h2>
              <p className="ce-ad-player-title">{selectedAd.title}</p>
              <p className="ce-ad-player-duration">Duration: {selectedAd.duration}</p>

              <div className="ce-progress-bar">
                <div className="ce-progress-fill"></div>
              </div>

              <div className="ce-ad-reward">
                <span className="ce-reward-icon">+</span>
                <span className="ce-reward-points">{selectedAd.points} Points</span>
              </div>

              <button className="ce-ad-complete-btn" onClick={handleCompleteAd}>
                Ad Completed
              </button>
            </div>
          </div>
        ) : (
          <div className="ce-ads-list">
            <div className="ce-ads-section-title">Available Ads</div>
            <div className="ce-ads-grid">
              {ads.map((ad) => (
                <div key={ad.id} className="ce-ad-card">
                  <img className="ce-ad-card-image" src={ad.image} alt={ad.brand} />
                  <div className="ce-ad-card-content">
                    <p className="ce-ad-card-brand">{ad.brand}</p>
                    <p className="ce-ad-card-title">{ad.title}</p>
                    <div className="ce-ad-card-footer">
                      <span className="ce-ad-card-duration">{ad.duration}</span>
                      <span className="ce-ad-card-points">+{ad.points} pts</span>
                    </div>
                  </div>
                  <button className="ce-ad-watch-btn" onClick={() => handleWatchAd(ad)}>
                    <FaPlay />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
