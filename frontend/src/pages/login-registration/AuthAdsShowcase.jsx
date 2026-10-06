import React, { useState, useEffect } from 'react';
import { 
  FaBolt, 
  FaPercent, 
  FaWallet, 
  FaShieldAlt, 
  FaArrowRight, 
  FaStar, 
  FaClock, 
  FaCopy, 
  FaCheck, 
  FaTag, 
  FaGift, 
  FaTruck, 
  FaStore 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

/**
 * Top Announcement Ticker Bar
 */
export function AuthTopTicker() {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (e) => {
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText('TRI50');
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="gm-ads-top-ticker">
      <div className="gm-ticker-content">
        <span className="gm-ticker-badge">
          <FaBolt className="gm-pulse-icon" /> MEGA SUPER SALE
        </span>
        <span className="gm-ticker-text">
          Flat <strong>50% OFF</strong> on 1st Order • <strong>15-Min Express Delivery</strong> in 40+ Cities • Code:
        </span>
        <button 
          type="button" 
          onClick={handleCopyCode} 
          className="gm-ticker-coupon-btn"
          title="Click to copy coupon code"
        >
          <span className="coupon-code-text">TRI50</span>
          {copiedCode ? <FaCheck color="#059669" size={12} /> : <FaCopy size={12} />}
        </button>
        <span className="gm-ticker-extra">
          • Extra 10% TriPay Cashback 🪙
        </span>
      </div>
    </div>
  );
}

/**
 * Left Column Promotional Ads
 */
export function AuthLeftAds() {
  const [copied, setCopied] = useState(false);

  const handleCopy = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="gm-ads-container gm-ads-left-stack">
      {/* AD 1: Hyperlocal 15-Minute Grocery & Essentials */}
      <div className="gm-ad-card gm-ad-card-beige">
        <div className="gm-ad-top-ribbon">
          <span className="gm-ad-chip gm-chip-green">
            <FaBolt size={10} /> 15-MIN EXPRESS
          </span>
          <span className="gm-ad-rating">
            <FaStar size={10} color="#F59E0B" /> 4.9 (48k+)
          </span>
        </div>

        <div className="gm-ad-icon-wrapper">
          <span className="gm-ad-emoji">🥑</span>
          <span className="gm-ad-emoji">🥛</span>
          <span className="gm-ad-emoji">🍞</span>
          <span className="gm-ad-emoji">🍎</span>
        </div>

        <h3 className="gm-ad-title">
          Fresh Groceries & Daily Needs
        </h3>
        <p className="gm-ad-desc">
          Farm-fresh fruits, dairy, and pantry staples delivered in 15 minutes directly from neighborhood stores.
        </p>

        <div className="gm-ad-deals-list">
          <div className="gm-deal-item">
            <span className="deal-name">Farm Fresh Milk</span>
            <span className="deal-price">₹32 <small className="old-price">₹38</small></span>
          </div>
          <div className="gm-deal-item">
            <span className="deal-name">Alphonso Mangoes 1kg</span>
            <span className="deal-price">₹149 <small className="old-price">₹220</small></span>
          </div>
          <div className="gm-deal-item">
            <span className="deal-name">Whole Wheat Bread</span>
            <span className="deal-price">₹40 <small className="old-price">₹50</small></span>
          </div>
        </div>

        <div className="gm-ad-coupon-box">
          <div className="coupon-left">
            <span className="coupon-label">USE COUPON:</span>
            <span className="coupon-val">FRESH100</span>
          </div>
          <button 
            type="button" 
            className="coupon-copy-btn"
            onClick={() => handleCopy('FRESH100')}
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        <Link to="/consumer-ecommerce" className="gm-ad-action-btn gm-btn-navy-embossed">
          <span>Explore Fresh Stores</span> <FaArrowRight size={12} />
        </Link>
      </div>

      {/* AD 2: Local Stores Network */}
      <div className="gm-ad-card gm-ad-card-beige">
        <div className="gm-ad-top-ribbon">
          <span className="gm-ad-chip gm-chip-orange">
            <FaStore size={10} /> 2,500+ STORES
          </span>
          <span className="gm-ad-tag">NEAR YOU</span>
        </div>

        <h3 className="gm-ad-title">
          Shop Your Favorite Local Merchants
        </h3>
        <p className="gm-ad-desc">
          Pharmacies, bakeries, supermarkets, and fashion outlets in your pin code with live store prices.
        </p>

        <div className="gm-perk-chips-row">
          <span className="gm-perk-chip">⚡ 0% Surge Price</span>
          <span className="gm-perk-chip">📦 Free Returns</span>
          <span className="gm-perk-chip">📍 Live GPS Track</span>
        </div>

        <div className="gm-ad-callout gm-callout-green">
          <strong>✓ Verified Quality:</strong> Every merchant inspected & 100% genuine products guaranteed.
        </div>
      </div>
    </div>
  );
}

/**
 * Right Column Promotional Ads
 */
export function AuthRightAds() {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 18, seconds: 42 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNum = (n) => String(n).padStart(2, '0');

  return (
    <div className="gm-ads-container gm-ads-right-stack">
      {/* AD 3: Mega Flash Deal with Countdown */}
      <div className="gm-ad-card gm-ad-card-beige">
        <div className="gm-ad-top-ribbon">
          <span className="gm-ad-chip gm-chip-orange">
            <FaPercent size={10} /> FLASH CARNIVAL
          </span>
          <span className="gm-timer-badge">
            <FaClock size={10} /> {formatNum(timeLeft.hours)}:{formatNum(timeLeft.minutes)}:{formatNum(timeLeft.seconds)}
          </span>
        </div>

        <div className="gm-flash-banner-visual">
          <div className="gm-discount-burst">UP TO 70% OFF</div>
          <p className="gm-flash-sub">Top Electronics & Lifestyle Deals</p>
        </div>

        <h3 className="gm-ad-title">
          Smart Gadgets & Audio Fest
        </h3>
        <p className="gm-ad-desc">
          Limited stock drops on Bluetooth audio, smartwatches, fast chargers, and lifestyle essentials.
        </p>

        <div className="gm-ad-deals-list">
          <div className="gm-deal-item">
            <span className="deal-name">Noise Canceling Buds</span>
            <span className="deal-price">₹1,299 <small className="old-price">₹3,999</small></span>
          </div>
          <div className="gm-deal-item">
            <span className="deal-name">Smart Fitness Watch</span>
            <span className="deal-price">₹999 <small className="old-price">₹2,499</small></span>
          </div>
          <div className="gm-deal-item">
            <span className="deal-name">65W Fast GaN Charger</span>
            <span className="deal-price">₹749 <small className="old-price">₹1,499</small></span>
          </div>
        </div>

        <Link to="/consumer-ecommerce" className="gm-ad-action-btn gm-btn-orange-embossed">
          <span>Claim Flash Deals</span> <FaArrowRight size={12} />
        </Link>
      </div>

      {/* AD 4: TriPay Super Wallet & Cashbacks */}
      <div className="gm-ad-card gm-ad-card-beige">
        <div className="gm-ad-top-ribbon">
          <span className="gm-ad-chip gm-chip-gold">
            <FaWallet size={10} /> TRIPAY CASHBACK
          </span>
          <span className="gm-ad-tag">GUARANTEED</span>
        </div>

        <h3 className="gm-ad-title">
          Get 5% Direct Cashback On Every Order
        </h3>
        <p className="gm-ad-desc">
          Pay with your secure TriPay wallet or scan UPI QR codes at partner stores to collect coins instantly.
        </p>

        <div className="gm-wallet-bonus-box">
          <div className="wallet-coin-icon">🪙</div>
          <div className="wallet-coin-info">
            <strong>₹50 Welcome Bonus</strong>
            <span>Credited directly upon new user signup!</span>
          </div>
        </div>

        <div className="gm-ad-callout gm-callout-navy">
          <strong>✓ 0% Fees:</strong> Zero gateway surcharge on UPI, cards, and net-banking.
        </div>
      </div>
    </div>
  );
}

/**
 * Bottom Trust & Guarantee Bar
 */
export function AuthBottomBar() {
  return (
    <footer className="gm-ads-bottom-bar" aria-label="Security & Service Guarantees">
      <div className="gm-bottom-item">
        <FaTruck color="#FF6B00" />
        <span><strong>15-Min</strong> Express Delivery</span>
      </div>
      <div className="gm-bottom-dot">•</div>
      <div className="gm-bottom-item">
        <FaShieldAlt color="#059669" />
        <span><strong>100% Genuine</strong> Guaranteed</span>
      </div>
      <div className="gm-bottom-dot">•</div>
      <div className="gm-bottom-item">
        <FaWallet color="#1E3A8A" />
        <span><strong>Instant</strong> Refund Policy</span>
      </div>
      <div className="gm-bottom-dot">•</div>
      <div className="gm-bottom-item">
        <FaGift color="#EA580C" />
        <span><strong>Reward Coins</strong> On Every Order</span>
      </div>
    </footer>
  );
}

export default function AuthAdsShowcase() {
  return null;
}

