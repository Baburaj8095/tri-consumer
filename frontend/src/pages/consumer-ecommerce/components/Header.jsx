import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  LuBell,
  LuMapPin,
  LuMenu,
  LuMessageCircle,
  LuPhone,
  LuShoppingBag,
  LuUser,
  LuWallet,
  LuX,
} from 'react-icons/lu';
import { consumerProfile } from '../services/mockData.js';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="ce-header">
        <div className="ce-header-inner">
          <button 
            className="ce-icon-btn" 
            onClick={() => setIsMenuOpen(true)} 
            aria-label="Open profile menu"
          >
            <LuMenu />
          </button>
          <div className="ce-title-wrap">
            <span className="ce-title-kicker">Trikonekt</span>
            <h1 className="ce-title">Shop</h1>
          </div>
          <div className="ce-header-actions">
            <button className="ce-icon-btn ce-icon-btn-sm" aria-label="Wallet">
              <LuWallet />
            </button>
            <button className="ce-icon-btn ce-icon-btn-sm ce-icon-with-badge" aria-label="Notifications">
              <LuBell />
              <span>3</span>
            </button>
            <button className="ce-icon-btn ce-icon-btn-sm ce-icon-with-badge" aria-label="Chat">
              <LuMessageCircle />
              <span>2</span>
            </button>
            <Link to="/consumer-ecommerce/cart" className="ce-icon-btn ce-icon-btn-sm ce-icon-with-badge" aria-label="Cart">
              <LuShoppingBag />
              <span>3</span>
            </Link>
            <Link to="/consumer-ecommerce/nearby-stores" className="ce-icon-btn ce-icon-btn-sm" aria-label="Nearby">
              <LuMapPin />
            </Link>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="ce-profile-menu-overlay" role="presentation" onClick={() => setIsMenuOpen(false)}>
          <aside className="ce-profile-menu" role="dialog" aria-label="User profile" onClick={(event) => event.stopPropagation()}>
            <div className="ce-profile-menu-head">
              <div className="ce-profile-avatar">
                <LuUser />
              </div>
              <button className="ce-icon-btn ce-icon-btn-sm" onClick={() => setIsMenuOpen(false)} aria-label="Close profile menu">
                <LuX />
              </button>
            </div>

            <div className="ce-profile-main">
              <p className="ce-profile-label">Profile</p>
              <h2 className="ce-profile-name">{consumerProfile.name}</h2>
              <p className="ce-profile-subtitle">{consumerProfile.membership}</p>
            </div>

            <div className="ce-profile-detail-grid">
              <div className="ce-profile-detail">
                <LuShoppingBag className="ce-primary-text" />
                <span>ID Number</span>
                <strong>{consumerProfile.idNumber}</strong>
              </div>
              <div className="ce-profile-detail">
                <LuMapPin className="ce-primary-text" />
                <span>Pin Code</span>
                <strong>{consumerProfile.pinCode}</strong>
              </div>
            </div>

            <div className="ce-profile-list">
              <div className="ce-profile-list-row">
                <LuPhone className="ce-primary-text" />
                <div>
                  <span>Phone</span>
                  <strong>{consumerProfile.phone}</strong>
                </div>
              </div>
              <div className="ce-profile-list-row">
                <LuMapPin className="ce-primary-text" />
                <div>
                  <span>Location</span>
                  <strong>{consumerProfile.city}</strong>
                </div>
              </div>
              <div className="ce-profile-list-row">
                <LuWallet className="ce-primary-text" />
                <div>
                  <span>Wallet Balance</span>
                  <strong>{consumerProfile.walletBalance}</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
