import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
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
  LuChevronDown,
  LuArrowLeft,
  LuSearch,
  LuMic,
  LuBoxes,
  LuUtensils,
  LuTruck,
  LuCar,
  LuStore,
  LuIndianRupee,
} from 'react-icons/lu';
import { consumerProfile } from '../services/mockData.js';
import { clearAuth, getAccessToken } from '../../../services/authStorage.js';
import { useLocation } from '../context/LocationContext.jsx';
import LocationPickerModal from './LocationPickerModal.jsx';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function formatPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  const national = digits.length > 10 && digits.startsWith('91') ? digits.slice(-10) : digits;
  return national.length === 10 ? `+91 ${national}` : phone;
}

function formatWallet(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return 'Rs. 0';
  return `Rs. ${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function Header({ mode = 'home', title, subtitle, onBack }) {
  const navigate = useNavigate();
  const { location, showPicker, setShowPicker } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('triConsumerProfilePic') || '');
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('triConsumerUser') || 'null');
    } catch (_) {
      return null;
    }
  });

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
    clearAuth();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    let cancelled = false;
    axios.get(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      if (cancelled) return;
      const data = response.data?.data || response.data;
      if (data) {
        setProfile(data);
        localStorage.setItem('triConsumerUser', JSON.stringify(data));
      }
    }).catch(() => {
      if (!cancelled) setProfile((prev) => prev || null);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const locParts = [];
  if (profile?.district || profile?.city) locParts.push(profile.district || profile.city);
  if (profile?.state && profile.state !== (profile.district || profile.city)) locParts.push(profile.state);

  const displayProfile = {
    name: profile?.fullName || profile?.full_name || profile?.username || consumerProfile.name,
    idNumber: profile?.idNumber || profile?.prefixed_id || profile?.unique_id || profile?.username || profile?.id || consumerProfile.idNumber,
    pinCode: profile?.pinCode || profile?.pincode || consumerProfile.pinCode,
    phone: formatPhone(profile?.mobile || profile?.phone) || consumerProfile.phone,
    city: locParts.join(', ') || consumerProfile.city,
    membership: profile?.status === 'ACTIVE' ? 'Prime Consumer Member' : consumerProfile.membership,
    walletBalance: profile?.walletBalance ? formatWallet(profile.walletBalance) : consumerProfile.walletBalance,
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Synchronize dynamic cart items count
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    const syncCart = () => {
      try {
        const c = JSON.parse(localStorage.getItem('tri_consumer_cart') || '{"items":[]}');
        setCartCount(c.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0);
      } catch {
        setCartCount(0);
      }
    };
    syncCart();
    window.addEventListener('storage', syncCart);
    return () => window.removeEventListener('storage', syncCart);
  }, []);

  if (mode === 'compact') {
    return (
      <>
        <Box
          component="header"
          sx={{
            background: 'linear-gradient(135deg, #FF9E44 0%, #FF7A00 100%)',
            pt: 2,
            pb: 2,
            px: 2,
            color: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(255, 122, 0, 0.15)',
            borderBottomLeftRadius: '24px',
            borderBottomRightRadius: '24px',
            position: 'sticky',
            top: 0,
            zIndex: 1090,
            maxWidth: '430px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
          }}
        >
          {/* Row 1: Back + Title + Actions */}
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ overflow: 'hidden', flex: 1 }}>
              <IconButton
                onClick={() => (onBack ? onBack() : navigate(-1))}
                sx={{
                  color: '#FFFFFF',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(4px)',
                  width: 38,
                  height: 38,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                }}
              >
                <LuArrowLeft size={20} style={{ strokeWidth: 2.2 }} />
              </IconButton>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.2, color: '#FFFFFF', fontFamily: '"Inter", sans-serif' }} noWrap>
                  {title || 'Online Shop'}
                </Typography>
                {subtitle && (
                  <Typography sx={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.8)', fontFamily: '"Inter", sans-serif' }} noWrap>
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <IconButton
                component={Link}
                to="/consumer-ecommerce/delivery"
                sx={{
                  color: '#FF7A00',
                  bgcolor: '#FFFFFF',
                  width: 38,
                  height: 38,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  '&:hover': { bgcolor: 'grey.50' }
                }}
              >
                <LuSearch size={18} style={{ strokeWidth: 2.2 }} />
              </IconButton>
              <IconButton
                component={Link}
                to="/consumer-ecommerce/cart"
                sx={{
                  color: '#FF7A00',
                  bgcolor: '#FFFFFF',
                  width: 38,
                  height: 38,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  position: 'relative',
                  '&:hover': { bgcolor: 'grey.50' }
                }}
              >
                <LuShoppingBag size={18} style={{ strokeWidth: 2.2 }} />
                {cartCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      bgcolor: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      fontWeight: 700,
                      borderRadius: '50%',
                      width: 17,
                      height: 17,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #FFFFFF',
                    }}
                  >
                    {cartCount}
                  </Box>
                )}
              </IconButton>
            </Stack>
          </Stack>

          {/* Row 2: Deliver to location dropdown */}
          <Box
            onClick={() => setShowPicker(true)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 1.5,
              cursor: 'pointer',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              py: 0.8,
              px: 1.5,
              border: '1px solid rgba(255,255,255,0.15)',
              transition: 'background 0.2s',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' }
            }}
          >
            <LuMapPin size={14} style={{ color: '#FFFFFF' }} />
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF', flex: 1, fontFamily: '"Inter", sans-serif' }} noWrap>
              Delivering to: <span style={{ fontWeight: 700 }}>{location.area || 'Indiranagar'}</span>, {location.city || 'Bangalore'}
            </Typography>
            <LuChevronDown size={14} style={{ color: '#FFFFFF' }} />
          </Box>
        </Box>
        <LocationPickerModal isOpen={showPicker} onClose={() => setShowPicker(false)} />
      </>
    );
  }

  // mode === 'home' or default full Super App header
  return (
    <>
      <Box
        component="header"
        sx={{
          background: 'linear-gradient(135deg, #FF9E44 0%, #FF7A00 100%)',
          pt: 2.5,
          pb: 2,
          px: 2,
          color: '#FFFFFF',
          boxShadow: '0 8px 30px rgba(255, 122, 0, 0.12)',
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.8,
          maxWidth: '430px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Row 1: Profile + Greeting + Quick Tools */}
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box 
              onClick={() => setIsMenuOpen(true)}
              sx={{ 
                width: 44, 
                height: 44, 
                borderRadius: '50%', 
                overflow: 'hidden', 
                border: '2px solid #FFFFFF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                cursor: 'pointer',
                bgcolor: '#FFF5E6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease',
                '&:active': { transform: 'scale(0.95)' }
              }}
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <LuUser size={20} style={{ color: '#FF7A00' }} />
              )}
            </Box>
            <Box>
              <Typography sx={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', fontFamily: '"Inter", sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {greeting}
              </Typography>
              <Typography sx={{ fontSize: '15px', fontWeight: 700, fontFamily: '"Inter", sans-serif', color: '#FFFFFF' }}>
                {displayProfile.name}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton
              sx={{
                color: '#FFFFFF',
                bgcolor: 'rgba(255,255,255,0.12)',
                width: 38,
                height: 38,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' }
              }}
            >
              <LuBell size={18} />
            </IconButton>
            <IconButton
              sx={{
                color: '#FFFFFF',
                bgcolor: 'rgba(255,255,255,0.12)',
                width: 38,
                height: 38,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' }
              }}
            >
              <LuMessageCircle size={18} />
            </IconButton>
            <IconButton
              component={Link}
              to="/consumer-ecommerce/cart"
              sx={{
                color: '#FFFFFF',
                bgcolor: 'rgba(255,255,255,0.12)',
                width: 38,
                height: 38,
                position: 'relative',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' }
              }}
            >
              <LuShoppingBag size={18} />
              {cartCount > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    bgcolor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: 700,
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #FF7A00',
                  }}
                >
                  {cartCount}
                </Box>
              )}
            </IconButton>
          </Stack>
        </Stack>

        {/* Row 2: Deliver to Address Selection */}
        <Box
          onClick={() => setShowPicker(true)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            bgcolor: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            py: 1,
            px: 1.5,
            border: '1px solid rgba(255, 255, 255, 0.18)',
            transition: 'background 0.2s',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.18)' }
          }}
        >
          <LuMapPin size={16} />
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 600, fontFamily: '"Inter", sans-serif', color: '#FFFFFF' }} noWrap>
              Deliver to: <span style={{ fontWeight: 700 }}>{location.area || 'Indiranagar'}</span>, {location.city || 'Bangalore'} {location.pincode}
            </Typography>
          </Box>
          <LuChevronDown size={16} />
        </Box>

        {/* Row 3: Large Search Bar */}
        <Box
          component={Link}
          to="/consumer-ecommerce/delivery"
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#FFFFFF',
            borderRadius: '18px', // Design Token Search
            px: 2,
            py: 1.2,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.15s ease-in-out',
            '&:active': { transform: 'scale(0.98)' }
          }}
        >
          <LuSearch size={18} style={{ color: '#64748B', marginRight: 10 }} />
          <Typography sx={{ fontSize: '14px', color: '#94A3B8', flex: 1, fontWeight: 500, fontFamily: '"Inter", sans-serif' }}>
            Search for products, brands and services...
          </Typography>
          <Stack direction="row" spacing={1} sx={{ color: '#FF7A00' }}>
            <LuCamera size={18} />
            <LuMic size={18} />
          </Stack>
        </Box>

        {/* Row 4: Quick Services */}
        <Stack 
          direction="row" 
          spacing={1.5} 
          justifyContent="space-between" 
          sx={{ 
            mt: 0.5, 
            overflowX: 'auto', 
            pb: 0.5, 
            '&::-webkit-scrollbar': { display: 'none' } 
          }}
        >
          {[
            { label: 'Tri Pay', icon: LuIndianRupee, to: '/consumer-ecommerce/tripay' },
            { label: 'Tri Zone', icon: LuBoxes, to: '/consumer-ecommerce/tri-zone' },
            { label: 'Tri Eat', icon: LuUtensils, to: '/consumer-ecommerce/trieat' },
            { label: 'Tri Drop', icon: LuTruck, to: '/consumer-ecommerce/tripickdrop' },
            { label: 'Travel', icon: LuCar, to: '/consumer-ecommerce/tritrip' },
            { label: 'Nearby', icon: LuStore, to: '/consumer-ecommerce/nearby-stores' },
          ].map(({ label, icon: Icon, to }) => (
            <Box
              key={label}
              component={Link}
              to={to}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                minWidth: '58px',
                flexShrink: 0
              }}
            >
              <Box
                sx={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  bgcolor: '#FFFFFF',
                  color: '#FF7A00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                  mb: 0.8,
                  transition: 'transform 0.15s',
                  '&:active': { transform: 'scale(0.9)' }
                }}
              >
                <Icon size={18} style={{ strokeWidth: 2.2 }} />
              </Box>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center', fontFamily: '"Inter", sans-serif' }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

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
              <h2 className="ce-profile-name">{displayProfile.name}</h2>
              <p className="ce-profile-subtitle">{displayProfile.membership}</p>
              <Link 
                to="/consumer-ecommerce/profile" 
                className="ce-profile-settings-link" 
                onClick={() => setIsMenuOpen(false)}
                style={{ 
                  display: 'inline-block', 
                  marginTop: '8px', 
                  color: '#2563eb', 
                  fontWeight: 600, 
                  fontSize: '13px', 
                  textDecoration: 'underline' 
                }}
              >
                Edit Account / Settings
              </Link>
            </div>

            <div className="ce-profile-detail-grid">
              <div className="ce-profile-detail">
                <LuShoppingBag className="ce-primary-text" />
                <span>ID Number</span>
                <strong>{displayProfile.idNumber}</strong>
              </div>
              <div className="ce-profile-detail">
                <LuMapPin className="ce-primary-text" />
                <span>Pin Code</span>
                <strong>{displayProfile.pinCode}</strong>
              </div>
            </div>

            <div className="ce-profile-list">
              <div className="ce-profile-list-row">
                <LuPhone className="ce-primary-text" />
                <div>
                  <span>Phone</span>
                  <strong>{displayProfile.phone}</strong>
                </div>
              </div>
              <div className="ce-profile-list-row">
                <LuMapPin className="ce-primary-text" />
                <div>
                  <span>Location</span>
                  <strong>{displayProfile.city}</strong>
                </div>
              </div>
              <div className="ce-profile-list-row">
                <LuWallet className="ce-primary-text" />
                <div>
                  <span>Wallet Balance</span>
                  <strong>{displayProfile.walletBalance}</strong>
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

      <LocationPickerModal isOpen={showPicker} onClose={() => setShowPicker(false)} />
    </>
  );
}
