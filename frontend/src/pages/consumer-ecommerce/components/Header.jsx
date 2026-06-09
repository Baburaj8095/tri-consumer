import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
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
  LuCamera,
  LuImage,
  LuTrash2,
  LuLogOut,
} from 'react-icons/lu';
import { consumerProfile } from '../services/mockData.js';

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('triConsumerProfilePic') || '');
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    const isAnyOpen = isMenuOpen || isEditMenuOpen || showLogoutConfirm;
    if (isAnyOpen) {
      document.body.classList.add('ce-menu-open');
      document.documentElement.classList.add('ce-menu-open');
    } else {
      document.body.classList.remove('ce-menu-open');
      document.documentElement.classList.remove('ce-menu-open');
    }
    return () => {
      document.body.classList.remove('ce-menu-open');
      document.documentElement.classList.remove('ce-menu-open');
    };
  }, [isMenuOpen, isEditMenuOpen, showLogoutConfirm]);

  const handleTakePhoto = () => {
    setIsEditMenuOpen(false);
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleChooseGallery = () => {
    setIsEditMenuOpen(false);
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const handleRemovePhoto = () => {
    setProfilePic('');
    localStorage.removeItem('triConsumerProfilePic');
    setIsEditMenuOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setProfilePic(dataUrl);
      localStorage.setItem('triConsumerProfilePic', dataUrl);
    };
    reader.onerror = () => {
      alert("Failed to read image file.");
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleLogoutSubmit = () => {
    localStorage.removeItem('triConsumerToken');
    setShowLogoutConfirm(false);
    navigate('/login');
  };

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
              <div className="ce-profile-avatar-wrap">
                <div className="ce-profile-avatar">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" />
                  ) : (
                    <LuUser />
                  )}
                </div>
                <button
                  type="button"
                  className="ce-profile-edit-btn"
                  onClick={() => setIsEditMenuOpen(true)}
                  aria-label="Edit profile picture"
                >
                  <LuCamera />
                </button>
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
              <button
                type="button"
                className="ce-profile-list-row ce-profile-list-logout"
                onClick={handleLogoutClick}
                style={{ width: '100%', border: '1px solid #FEE2E2', cursor: 'pointer', textAlign: 'left' }}
              >
                <LuLogOut />
                <div>
                  <strong style={{ color: '#EF4444' }}>Logout</strong>
                </div>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Hidden File Inputs for Camera and Gallery */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Profile Photo Edit Bottom Sheet */}
      {isEditMenuOpen && (
        <div className="ce-bottom-sheet-overlay" role="presentation" onClick={() => setIsEditMenuOpen(false)}>
          <div className="ce-bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="ce-bottom-sheet-header">
              <h3>Profile Photo</h3>
              <button type="button" className="ce-bottom-sheet-close" onClick={() => setIsEditMenuOpen(false)} aria-label="Close">
                <LuX />
              </button>
            </div>
            <div className="ce-bottom-sheet-options">
              <button type="button" onClick={handleTakePhoto}>
                <LuCamera />
                <span>Take Photo</span>
              </button>
              <button type="button" onClick={handleChooseGallery}>
                <LuImage />
                <span>Choose from Gallery</span>
              </button>
              {profilePic && (
                <button type="button" className="ce-remove-option" onClick={handleRemovePhoto}>
                  <LuTrash2 />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
            <button type="button" className="ce-bottom-sheet-cancel" onClick={() => setIsEditMenuOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="ce-dialog-overlay" role="presentation" onClick={() => setShowLogoutConfirm(false)}>
          <div className="ce-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out of your account?</p>
            <div className="ce-dialog-actions">
              <button type="button" className="ce-dialog-btn ce-cancel-btn" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button type="button" className="ce-dialog-btn ce-logout-btn" onClick={handleLogoutSubmit}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
