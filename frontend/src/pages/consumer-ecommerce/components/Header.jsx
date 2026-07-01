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
import { Box, Stack, IconButton, Typography, Button } from '@mui/material';
import TriIcon from '../../../components/ui/TriIcon';
import SearchBar from './SearchBar';

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

export default function Header({ mode = 'home', title, subtitle, onBack, showQuickServices = (mode === 'home'), onSearch }) {
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
    }).catch((err) => {
      if (cancelled) return;
      if (err.response?.status === 401) {
        clearAuth();
        navigate('/login');
      } else {
        setProfile((prev) => prev || null);
      }
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

  const isCompact = mode === 'compact';

  if (title) {
    return (
      <Box
        component="header"
        sx={{
          background: 'linear-gradient(135deg, #FF9E44 0%, #FF7A00 100%)',
          py: 1.8,
          px: 2,
          color: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(255, 122, 0, 0.12)',
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          maxWidth: '430px',
          margin: '0 auto',
          width: '100%',
          position: 'sticky',
          top: 0,
          zIndex: 1090,
        }}
      >
        {onBack && (
          <IconButton
            onClick={onBack}
            sx={{
              color: '#FFFFFF',
              bgcolor: 'rgba(255,255,255,0.16)',
              width: 32,
              height: 32,
              borderRadius: '10px',
              mr: 0.5,
              flexShrink: 0,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.26)' }
            }}
          >
            <TriIcon name="arrow_back" size={18} />
          </IconButton>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: '15px', fontWeight: 800, fontFamily: '"Inter", sans-serif', color: '#FFFFFF', lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: '"Inter", sans-serif', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton
          component={Link}
          to="/consumer-ecommerce/cart"
          sx={{
            color: '#FFFFFF',
            bgcolor: 'rgba(255,255,255,0.16)',
            width: 32,
            height: 32,
            borderRadius: '10px',
            position: 'relative',
            flexShrink: 0,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' }
          }}
        >
          <TriIcon name="shopping_bag" size={18} />
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
                width: 15,
                height: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #FF7A00',
              }}
            >
              {cartCount}
            </Box>
          )}
        </IconButton>
      </Box>
    );
  }

  return (
    <>
      <Box
        component="header"
        sx={{
          background: 'linear-gradient(135deg, #FF9E44 0%, #FF7A00 100%)',
          pt: isCompact ? 2 : 3,
          pb: isCompact ? 2 : 3,
          px: 1.5,
          color: '#FFFFFF',
          boxShadow: isCompact ? '0 4px 20px rgba(255, 122, 0, 0.12)' : '0 8px 30px rgba(255, 122, 0, 0.15)',
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: isCompact ? 1.5 : 2, // 12px vs 16px gap
          maxWidth: '430px',
          margin: '0 auto',
          width: '100%',
          position: 'sticky',
          top: 0,
          zIndex: 1090,
        }}
      >
        {/* Row 1: Profile + Greeting + User Name and Right Action Icons */}
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flexShrink: 1 }}>
            {onBack && (
              <IconButton
                onClick={onBack}
                sx={{
                  color: '#FFFFFF',
                  bgcolor: 'rgba(255,255,255,0.16)',
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  mr: 0.5,
                  flexShrink: 0,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.26)' }
                }}
              >
                <TriIcon name="arrow_back" size={18} />
              </IconButton>
            )}
            {/* Avatar */}
            <Box 
              onClick={() => setIsMenuOpen(true)}
              sx={{ 
                width: isCompact ? 36 : 42, 
                height: isCompact ? 36 : 42, 
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
                '&:active': { transform: 'scale(0.95)' },
                flexShrink: 0
              }}
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <TriIcon name="person" size={isCompact ? 18 : 22} color="#FF7A00" />
              )}
            </Box>
            {/* Greeting & Name */}
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: isCompact ? '8.5px' : '10px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', fontFamily: '"Inter", sans-serif', textTransform: 'uppercase', letterSpacing: '0.8px', lineHeight: 1.2 }}>
                {greeting}
              </Typography>
              <Typography sx={{ fontSize: isCompact ? '12px' : '14px', fontWeight: 700, fontFamily: '"Inter", sans-serif', color: '#FFFFFF', lineHeight: 1.3 }} noWrap>
                {displayProfile.name}
              </Typography>
            </Box>
          </Stack>

          {/* Right Action Icons: Wallet, Notification, Messages, Cart */}
          <Stack direction="row" spacing={0.6} alignItems="center" sx={{ flexShrink: 0 }}>
            {/* Wallet Button */}
            <Box 
              onClick={() => navigate('/consumer-ecommerce/wallet')}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.3, 
                bgcolor: 'rgba(255,255,255,0.16)', 
                px: 0.8, 
                py: 0.4, 
                borderRadius: '10px', 
                cursor: 'pointer',
                transition: 'transform 0.15s',
                '&:active': { transform: 'scale(0.95)' },
                height: 32,
                flexShrink: 0
              }}
            >
              <TriIcon name="account_balance_wallet" size={16} color="#FFFFFF" />
              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', fontFamily: '"Inter", sans-serif' }}>
                {displayProfile.walletBalance.replace('Rs. ', '₹')}
              </Typography>
            </Box>

            {/* Notification Button */}
            <IconButton
              sx={{
                color: '#FFFFFF',
                bgcolor: 'rgba(255,255,255,0.16)',
                width: 32,
                height: 32,
                borderRadius: '10px',
                flexShrink: 0,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' }
              }}
            >
              <TriIcon name="notifications" size={18} />
            </IconButton>

            {/* Messages Button */}
            <IconButton
              sx={{
                color: '#FFFFFF',
                bgcolor: 'rgba(255,255,255,0.16)',
                width: 32,
                height: 32,
                borderRadius: '10px',
                flexShrink: 0,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' }
              }}
            >
              <TriIcon name="chat_bubble" size={18} />
            </IconButton>

            {/* Orders History Button */}
            <IconButton
              component={Link}
              to="/orders"
              sx={{
                color: '#FFFFFF',
                bgcolor: 'rgba(255,255,255,0.16)',
                width: 32,
                height: 32,
                borderRadius: '10px',
                flexShrink: 0,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' }
              }}
            >
              <TriIcon name="receipt_long" size={18} />
            </IconButton>

            {/* Cart Button */}
            <IconButton
              component={Link}
              to="/consumer-ecommerce/cart"
              sx={{
                color: '#FFFFFF',
                bgcolor: 'rgba(255,255,255,0.16)',
                width: 32,
                height: 32,
                borderRadius: '10px',
                position: 'relative',
                flexShrink: 0,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' }
              }}
            >
              <TriIcon name="shopping_bag" size={18} />
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
                    width: 15,
                    height: 15,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #FF7A00',
                  }}
                >
                  {cartCount}
                </Box>
              )}
            </IconButton>
          </Stack>
        </Stack>

        {/* Row 2: Deliver to section (integrated, not floating) */}
        <Box
          onClick={() => setShowPicker(true)}
          sx={{
            cursor: 'pointer',
            mt: isCompact ? 0 : 0.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.1
          }}
        >
          <Typography sx={{ fontSize: isCompact ? '8px' : '10px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Deliver To
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <TriIcon name="location_on" size={isCompact ? 15 : 18} sx={{ color: '#FFFFFF' }} />
            <Typography sx={{ fontSize: isCompact ? '12.5px' : '14px', fontWeight: 700, color: '#FFFFFF', fontFamily: '"Inter", sans-serif' }} noWrap>
              {location.area || 'Indiranagar'}, {location.city || 'Bangalore'}
            </Typography>
            <TriIcon name="arrow_drop_down" size={isCompact ? 16 : 20} sx={{ color: '#FFFFFF' }} />
          </Stack>
        </Box>

        {/* Row 3: Reusable Search Component (with Join Prime option next to search in home mode) */}
        {!isCompact ? (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <SearchBar 
                variant="light"
                onSearch={onSearch}
                onCameraClick={() => navigate('/consumer-ecommerce/scanner')}
              />
            </Box>
            <Button 
              component={Link}
              to="/consumer-ecommerce/join-prime"
              sx={{
                bgcolor: '#FFF5E6',
                color: '#FF7A00',
                fontSize: '11px',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                px: 1.5,
                height: 42,
                borderRadius: '18px',
                border: '1.5px solid #FF7A00',
                boxShadow: '0 2px 8px rgba(255, 122, 0, 0.1)',
                textTransform: 'none',
                fontFamily: '"Inter", sans-serif',
                '&:hover': {
                  bgcolor: '#FFEFE0'
                }
              }}
            >
              👑 Join Prime
            </Button>
          </Stack>
        ) : (
          <SearchBar 
            variant="light"
            onSearch={onSearch}
            onCameraClick={() => navigate('/consumer-ecommerce/scanner')}
          />
        )}

        {/* Row 4: Quick Services */}
        {showQuickServices && (
          <Stack 
            direction="row" 
            spacing={2} 
            justifyContent="space-between" 
            sx={{ 
              mt: 0.5, 
              overflowX: 'auto', 
              pb: 0.5, 
              '&::-webkit-scrollbar': { display: 'none' } 
            }}
          >
            {[
              { label: 'Tri Pay', icon: 'currency_rupee', to: '/consumer-ecommerce/tripay' },
              { label: 'Tri Zone', icon: 'grid_view', to: '/consumer-ecommerce/tri-zone' },
              { label: 'Tri Eat', icon: 'restaurant', to: '/consumer-ecommerce/trieat' },
              { label: 'Tri Drop', icon: 'local_shipping', to: '/consumer-ecommerce/tripickdrop' },
              { label: 'Travel', icon: 'directions_car', to: '/consumer-ecommerce/tritrip' },
              { label: 'Nearby', icon: 'storefront', to: '/consumer-ecommerce/nearby-stores' },
            ].map(({ label, icon, to }) => (
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
                    width: '46px',
                    height: '46px',
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
                  <TriIcon name={icon} size={22} />
                </Box>
                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center', fontFamily: '"Inter", sans-serif' }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {isMenuOpen && (
        <div className="ce-profile-menu-overlay" role="presentation" onClick={() => setIsMenuOpen(false)}>
          <aside className="ce-profile-menu" role="dialog" aria-label="User profile" onClick={(event) => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button className="ce-icon-btn ce-icon-btn-sm" onClick={() => setIsMenuOpen(false)} aria-label="Close profile menu">
                <LuX />
              </button>
            </div>

            {/* Premium Header Card (Orange Gradient) */}
            <div className="ce-profile-header-card" style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              borderRadius: '16px',
              padding: '20px',
              color: '#ffffff',
              position: 'relative',
              boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.3)',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '3px solid #ffffff',
                    overflow: 'hidden',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(255, 255, 255, 0.2)'
                  }}>
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <LuUser size={28} color="#ffffff" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditMenuOpen(true)}
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      background: '#ffffff',
                      color: '#f97316',
                      border: 'none',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                    }}
                  >
                    <LuCamera size={12} />
                  </button>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                      {displayProfile.name}
                    </h3>
                  </div>
                  <p style={{ margin: '2px 0 6px 0', fontSize: '12px', opacity: 0.9, fontWeight: 500 }}>
                    {displayProfile.membership}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '20px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    Verified Consumer
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '12px' }}>
                <Link 
                  to="/consumer-ecommerce/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Edit Account / Settings →
                </Link>
              </div>
            </div>

            {/* 3-Column Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '12px 6px',
                textAlign: 'center',
                border: '1px solid #e2e8f0'
              }}>
                <LuShoppingBag size={18} color="#f97316" style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayProfile.idNumber}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Member ID</div>
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '12px 6px',
                textAlign: 'center',
                border: '1px solid #e2e8f0'
              }}>
                <LuMapPin size={18} color="#f97316" style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                  {displayProfile.pinCode}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Pin Code</div>
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '12px 6px',
                textAlign: 'center',
                border: '1px solid #e2e8f0'
              }}>
                <LuWallet size={18} color="#f97316" style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayProfile.walletBalance}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Wallet</div>
              </div>
            </div>

            {/* Quick Actions (2-Column Grid) */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                Quick Actions
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div 
                  onClick={() => { setIsMenuOpen(false); navigate('/orders'); }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s'
                  }}
                >
                  <LuShoppingBag size={20} color="#f97316" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>My Orders</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Track purchases</span>
                </div>

                <div 
                  onClick={() => { setIsMenuOpen(false); navigate('/consumer-ecommerce/kyc'); }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s'
                  }}
                >
                  <LuUser size={20} color="#f97316" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>KYC Verify</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Aadhaar & Payout</span>
                </div>
              </div>
            </div>

            {/* Account Details & Info */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                Account & Support
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '10px'
                }}>
                  <LuPhone size={16} color="#f97316" />
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Phone</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{displayProfile.phone}</div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '10px'
                }}>
                  <LuMapPin size={16} color="#f97316" />
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Location</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{displayProfile.city}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
              <button
                type="button"
                className="ce-profile-list-logout"
                onClick={handleLogoutClick}
                style={{
                  width: '100%',
                  border: '1px solid #fee2e2',
                  borderRadius: '12px',
                  padding: '14px',
                  cursor: 'pointer',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#ef4444',
                  fontWeight: 700,
                  fontSize: '14px'
                }}
              >
                <LuLogOut size={16} />
                Logout
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
