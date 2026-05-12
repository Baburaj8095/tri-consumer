import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  HiOutlineBars3BottomLeft,
  HiOutlineBell,
  HiOutlineChatBubbleLeftRight,
  HiOutlineIdentification,
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlineBuildingStorefront,
  HiOutlineUser,
  HiOutlineWallet,
  HiOutlineXMark,
} from 'react-icons/hi2';
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
            <HiOutlineBars3BottomLeft />
          </button>
          <h1 className="ce-title">Consumer Dashboard</h1>
          <div className="ce-header-actions">
            <Link
              to="/consumer-ecommerce/nearby-stores"
              className="ce-icon-btn ce-icon-btn-sm ce-tooltip-wrap"
              aria-label="Nearby Stores"
            >
              <HiOutlineBuildingStorefront />
              <span className="ce-tooltip">Nearby Stores</span>
            </Link>
            <button className="ce-icon-btn ce-icon-btn-sm" aria-label="Notifications">
              <HiOutlineBell />
            </button>
            <button className="ce-icon-btn ce-icon-btn-sm" aria-label="Messages">
              <HiOutlineChatBubbleLeftRight />
            </button>
            <button className="ce-icon-btn ce-icon-btn-sm ce-icon-btn-primary" aria-label="Location">
              <HiOutlineMapPin />
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="ce-profile-menu-overlay" role="presentation" onClick={() => setIsMenuOpen(false)}>
          <aside className="ce-profile-menu" role="dialog" aria-label="User profile" onClick={(event) => event.stopPropagation()}>
            <div className="ce-profile-menu-head">
              <div className="ce-profile-avatar">
                <HiOutlineUser />
              </div>
              <button className="ce-icon-btn ce-icon-btn-sm" onClick={() => setIsMenuOpen(false)} aria-label="Close profile menu">
                <HiOutlineXMark />
              </button>
            </div>

            <div className="ce-profile-main">
              <p className="ce-profile-label">Profile</p>
              <h2 className="ce-profile-name">{consumerProfile.name}</h2>
              <p className="ce-profile-subtitle">{consumerProfile.membership}</p>
            </div>

            <div className="ce-profile-detail-grid">
              <div className="ce-profile-detail">
                <HiOutlineIdentification className="ce-primary-text" />
                <span>ID Number</span>
                <strong>{consumerProfile.idNumber}</strong>
              </div>
              <div className="ce-profile-detail">
                <HiOutlineMapPin className="ce-primary-text" />
                <span>Pin Code</span>
                <strong>{consumerProfile.pinCode}</strong>
              </div>
            </div>

            <div className="ce-profile-list">
              <div className="ce-profile-list-row">
                <HiOutlinePhone className="ce-primary-text" />
                <div>
                  <span>Phone</span>
                  <strong>{consumerProfile.phone}</strong>
                </div>
              </div>
              <div className="ce-profile-list-row">
                <HiOutlineMapPin className="ce-primary-text" />
                <div>
                  <span>Location</span>
                  <strong>{consumerProfile.city}</strong>
                </div>
              </div>
              <div className="ce-profile-list-row">
                <HiOutlineWallet className="ce-primary-text" />
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
