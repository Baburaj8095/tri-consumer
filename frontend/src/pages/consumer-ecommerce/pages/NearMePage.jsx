import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Stack, Typography, Grid, Button, IconButton, InputBase, CircularProgress } from '@mui/material';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import TriIcon from '../../../components/ui/TriIcon.jsx';
import TriCard from '../../../components/ui/TriCard.jsx';
import LocationPickerModal from '../components/LocationPickerModal.jsx';
import { useLocation } from '../context/LocationContext.jsx';
import fallbackImg from '../../../images/fallback_img.png';
import '../consumerEcommerce.css';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

const selectableLocations = [
  { name: 'Bangalore', icon: 'domain', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=120&q=80', color: '#E2E8F0' },
  { name: 'Kalaburagi', icon: 'account_balance', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80', color: '#E2E8F0' },
  { name: 'Hyderabad', icon: 'castle', image: 'https://images.unsplash.com/photo-1566793474285-2decf0fc182a?auto=format&fit=crop&w=120&q=80', color: '#E2E8F0' },
  { name: 'Mysore', icon: 'gavel', image: 'https://images.unsplash.com/photo-1580907115718-4ad3328d894a?auto=format&fit=crop&w=120&q=80', color: '#E2E8F0' },
  { name: 'Mumbai', icon: 'apartment', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=120&q=80', color: '#E2E8F0' },
  { name: 'Delhi', icon: 'temple_hindu', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=120&q=80', color: '#E2E8F0' },
];

const quickCategories = [
  { name: 'All', icon: 'grid_view', bg: '#FFEFE0', color: '#FF7A00' },
  { name: 'Electronics', icon: 'devices', bg: '#E0F2FE', color: '#0284C7' },
  { name: 'Fashion', icon: 'checkroom', bg: '#FCE4EC', color: '#DB2777' },
  { name: 'Groceries', icon: 'shopping_cart', bg: '#E8F5E9', color: '#16A34A' },
  { name: 'Health', icon: 'local_hospital', bg: '#FFEBEE', color: '#DC2626' },
  { name: 'More', icon: 'more_horiz', bg: '#F1F5F9', color: '#475569' },
];

const popularAreas = [
  { name: 'Brigade Road', dist: '3.3 km away', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=280&q=80' },
  { name: 'MG Road', dist: '3.1 km away', image: 'https://images.unsplash.com/photo-1566793474285-2decf0fc182a?auto=format&fit=crop&w=280&q=80' },
  { name: 'Indiranagar', dist: '4.2 km away', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=280&q=80' },
  { name: 'Koramangala', dist: '4.8 km away', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=280&q=80' },
];

const mockOnlineShops = [
  { name: 'Cloud Kitchen', rate: '4.6', time: '30-40 min', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=280&q=80' },
  { name: 'Tech World', rate: '4.7', time: '1.2 km', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=280&q=80' },
  { name: 'Fashion Hub', rate: '4.5', time: '2.8 km', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=280&q=80' },
  { name: 'Daily Needs', rate: '4.4', time: '3.0 km', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=280&q=80' },
];

export default function NearMePage() {
  const navigate = useNavigate();
  const { location, showPicker, setShowPicker, saveLocation } = useLocation();
  
  const selectedCity = { name: location.city || 'Bangalore' };
  const setSelectedCity = (cityName) => {
    saveLocation({
      ...location,
      city: cityName,
      formattedAddress: `${location.area || 'Indiranagar'}, ${cityName}`
    });
  };

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelMode, setChannelMode] = useState('ONLINE');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    setLoadingProducts(true);
    const params = new URLSearchParams({ limit: 120, offset: 0 });
    if (selectedCity.name) params.append('city', selectedCity.name);
    
    axios.get(`${CAPTAIN_API_URL}/captain/shops/online/products?${params.toString()}`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : 
                     Array.isArray(res.data?.products) ? res.data.products : 
                     Array.isArray(res.data?.results) ? res.data.results : [];
        setProducts(data);
      })
      .catch(err => console.error('Failed to fetch online products:', err))
      .finally(() => setLoadingProducts(false));
  }, [selectedCity.name]);

  const activeCategories = useMemo(() => {
    if (channelMode === 'ONLINE') {
      return [
        { name: 'All', icon: 'grid_view', bg: '#FFEFE0', color: '#FF7A00' },
        { name: 'Electronics', icon: 'devices', bg: '#E0F2FE', color: '#0284C7' },
        { name: 'Fashion', icon: 'checkroom', bg: '#FCE4EC', color: '#DB2777' },
        { name: 'Groceries', icon: 'shopping_cart', bg: '#E8F5E9', color: '#16A34A' },
        { name: 'Health', icon: 'local_hospital', bg: '#FFEBEE', color: '#DC2626' },
      ];
    } else {
      return [
        { name: 'All', icon: 'grid_view', bg: '#FFEFE0', color: '#FF7A00' },
        { name: 'Hotels', icon: 'hotel', bg: '#E0F2FE', color: '#0284C7' },
        { name: 'EV Vehicles', icon: 'electric_car', bg: '#E8F5E9', color: '#16A34A' },
        { name: 'Travel', icon: 'flight', bg: '#F3E8FF', color: '#7C3AED' },
        { name: 'Food & Dine', icon: 'restaurant', bg: '#FFEBEE', color: '#DC2626' },
      ];
    }
  }, [channelMode]);

  const visibleProducts = useMemo(() => {
    return products.filter(prod => {
      // Filter by selected mode
      const isTriAppProd = prod.tri_app_id != null || prod.tri_app_slug != null;
      if (channelMode === 'ONLINE') {
        if (isTriAppProd) return false;
      } else {
        if (!isTriAppProd) return false;
      }

      // Filter by Category
      if (selectedCategory && selectedCategory.name !== 'All') {
        const prodCat = (prod.category || '').toLowerCase();
        const chosenCat = selectedCategory.name.toLowerCase();
        if (channelMode === 'TRIZONE') {
          const appSlug = (prod.tri_app_slug || '').toLowerCase();
          const appName = (prod.tri_app_name || '').toLowerCase();
          if (!appSlug.includes(chosenCat) && !appName.includes(chosenCat) && !chosenCat.includes(appSlug) && !chosenCat.includes(appName)) return false;
        } else {
          if (prodCat !== chosenCat) return false;
        }
      }

      // Filter by Search Query
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchTitle = (prod.title || '').toLowerCase().includes(query);
        const matchDesc = (prod.description || '').toLowerCase().includes(query);
        const matchShop = (prod.shop_name || '').toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchShop) return false;
      }
      return true;
    });
  }, [products, channelMode, selectedCategory, searchTerm]);

  const handleChannelChange = (mode) => {
    setChannelMode(mode);
    setSelectedCategory(null);
    setSearchTerm('');
    if (mode === 'OFFLINE') {
      navigate('/consumer-ecommerce/nearby-stores');
    }
  };

  if (selectedCategory) {
    return (
      <div className="ce-app ce-nearme-wire" style={{ paddingBottom: '100px' }}>
        <Header 
          mode="compact" 
          title={selectedCategory.name} 
          subtitle={`Explore in ${selectedCity.name}`} 
          onBack={() => setSelectedCategory(null)} 
        />
        <Box sx={{ maxWidth: '430px', margin: '0 auto', width: '100%', px: 2, pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1, pb: 4 }}>
            {loadingProducts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#FF7A00' }} />
              </Box>
            ) : visibleProducts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                <TriIcon name="search_off" size={48} color="#CBD5E1" sx={{ mb: 1.5 }} />
                <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', mb: 0.5, fontFamily: '"Inter", sans-serif' }}>No Products Found</Typography>
              </Box>
            ) : (
              visibleProducts.map((prod) => {
                const isTriZone = channelMode === 'TRIZONE';
                return (
                  <TriCard
                    key={prod.id}
                    noPadding
                    component={Link}
                    to={`/consumer-ecommerce/product/${prod.id}`}
                    sx={{ display: 'flex', textDecoration: 'none', bgcolor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', height: 120 }}
                  >
                    <Box
                      component="img"
                      src={prod.image || prod.image_url || fallbackImg}
                      alt={prod.title}
                      sx={{ width: 120, height: 120, objectFit: 'cover', flexShrink: 0 }}
                      onError={(e) => { e.target.src = fallbackImg; }}
                    />
                    <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                      <Box>
                        <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif' }} noWrap>
                          {prod.title}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 0.5 }} noWrap>
                          Sold by: {prod.shop_name}
                        </Typography>
                      </Box>
                      
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#FF7A00' }}>
                          ₹{prod.price} {isTriZone && <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 500 }}>/day</span>}
                        </Typography>
                        {isTriZone ? (
                          <Button 
                            variant="contained" 
                            size="small"
                            sx={{ 
                              fontSize: '10px', fontWeight: 800, px: 2, py: 0.4, borderRadius: '8px', bgcolor: '#FF7A00', textTransform: 'none',
                              '&:hover': { bgcolor: '#E06B00' }
                            }}
                          >
                            Book Now
                          </Button>
                        ) : (
                          <Typography sx={{ fontSize: '10px', color: '#22C55E', fontWeight: 700 }}>
                            Free delivery
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </TriCard>
                );
              })
            )}
          </Stack>
        </Box>
        <Link to="/consumer-ecommerce/nearby-stores?view=map" className="ce-nearme-map-float ce-nearme-wire-map" style={{ textDecoration: 'none', bottom: '120px' }}>
          <TriIcon name="map" size={18} /> Map View
        </Link>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="ce-app ce-nearme-wire" style={{ paddingBottom: '100px', backgroundColor: '#F8F9FB' }}>
      <main className="ce-nearme-wire-shell">
        <Box
          sx={{
            background: 'linear-gradient(135deg, #FF9E44 0%, #FF7A00 100%)',
            pt: 4,
            pb: 4,
            px: 2.5,
            color: '#FFFFFF',
            borderBottomLeftRadius: '32px',
            borderBottomRightRadius: '32px',
            boxShadow: '0 8px 30px rgba(255, 122, 0, 0.15)',
            maxWidth: '430px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* Header Row: Title on Left, Location Pill and Bell on Right */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: '20px', fontWeight: 800, fontFamily: '"Inter", sans-serif', color: '#FFFFFF', lineHeight: 1.2 }}>
                Nearby Marketplace
              </Typography>
              <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>
                Everything around you
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={1.2}>
              <Box
                onClick={() => setShowPicker(true)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: '#FFFFFF',
                  px: 1.5,
                  py: 0.7,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'transform 0.15s',
                  '&:active': { transform: 'scale(0.95)' },
                  flexShrink: 0
                }}
              >
                <TriIcon name="location_on" size={13} color="#FF7A00" />
                <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif' }}>
                  {location.city || 'Bangalore'}
                </Typography>
                <TriIcon name="arrow_drop_down" size={13} color="#475569" />
              </Box>
              <IconButton sx={{ color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.15)', width: 36, height: 36, borderRadius: '50%' }}>
                <TriIcon name="notifications" size={20} />
              </IconButton>
            </Stack>
          </Stack>

          {/* Search Bar inside Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#FFFFFF',
              borderRadius: '24px',
              px: 2,
              py: 1,
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
            }}
          >
            <TriIcon name="search" size={20} color="#64748B" sx={{ mr: 1.5 }} />
            <InputBase
              placeholder="Search businesses, services & products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                flex: 1,
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: '"Inter", sans-serif',
                color: '#1E293B',
                '&::placeholder': { color: '#94A3B8', opacity: 1 }
              }}
            />
            <TriIcon name="mic" size={20} color="#64748B" />
          </Box>
        </Box>

        <Box sx={{ maxWidth: '430px', margin: '0 auto', width: '100%', px: 2 }}>
          {/* Tab Switcher Overlay */}
          <Box sx={{ display: 'flex', bgcolor: '#F1F5F9', borderRadius: '24px', p: 0.6, border: '1px solid #E2E8F0', mt: -2.2, mb: 3.5, boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <Button
              onClick={() => handleChannelChange('ONLINE')}
              startIcon={<TriIcon name="shopping_bag" size={16} />}
              sx={{
                flex: 1,
                py: 1,
                borderRadius: '20px',
                bgcolor: channelMode === 'ONLINE' ? '#FFFFFF' : 'transparent',
                color: channelMode === 'ONLINE' ? '#FF7A00' : '#64748B',
                fontWeight: 800,
                fontSize: '12px',
                textTransform: 'none',
                boxShadow: channelMode === 'ONLINE' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                border: channelMode === 'ONLINE' ? '1px solid #E2E8F0' : 'none',
                fontFamily: '"Inter", sans-serif',
                '&:hover': { bgcolor: channelMode === 'ONLINE' ? '#FFFFFF' : 'transparent' }
              }}
            >
              Online Shop
            </Button>
            <Button
              onClick={() => handleChannelChange('TRIZONE')}
              startIcon={<TriIcon name="grid_view" size={16} />}
              sx={{
                flex: 1,
                py: 1,
                borderRadius: '20px',
                bgcolor: channelMode === 'TRIZONE' ? '#FFFFFF' : 'transparent',
                color: channelMode === 'TRIZONE' ? '#FF7A00' : '#64748B',
                fontWeight: 800,
                fontSize: '12px',
                textTransform: 'none',
                fontFamily: '"Inter", sans-serif',
                '&:hover': { bgcolor: 'transparent' }
              }}
            >
              Tri Zone
            </Button>
          </Box>

          {/* Select Location Section */}
          <Box sx={{ mb: 3.5 }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Select Location
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
              {selectableLocations.map((loc) => {
                const isSelected = loc.name.toLowerCase() === selectedCity.name.toLowerCase();
                return (
                  <Box
                    key={loc.name}
                    onClick={() => setSelectedCity(loc.name)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: '85px',
                      cursor: 'pointer',
                      p: 1.2,
                      borderRadius: '20px',
                      border: '1.5px solid',
                      borderColor: isSelected ? '#FF7A00' : '#E2E8F0',
                      bgcolor: '#FFFFFF',
                      transition: 'all 0.15s ease-in-out',
                      boxShadow: isSelected ? '0 4px 12px rgba(255, 122, 0, 0.08)' : 'none',
                      flexShrink: 0
                    }}
                  >
                    <Box
                      sx={{
                        color: isSelected ? '#FF7A00' : '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 0.8,
                        height: '36px'
                      }}
                    >
                      <TriIcon name={loc.icon} size={24} />
                    </Box>
                    {isSelected ? (
                      <Box
                        sx={{
                          bgcolor: '#FF7A00',
                          px: 1.2,
                          py: 0.4,
                          borderRadius: '12px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#FFFFFF', fontFamily: '"Inter", sans-serif' }}>
                          {loc.name}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#64748B', fontFamily: '"Inter", sans-serif', py: 0.4 }}>
                        {loc.name}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Quick Categories Section */}
          <Box sx={{ mb: 3.5 }}>
            <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
              {activeCategories.map((c) => (
                <Box
                  key={c.name}
                  onClick={() => setSelectedCategory(c)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    minWidth: '68px',
                    flexShrink: 0,
                    transition: 'transform 0.15s',
                    '&:active': { transform: 'scale(0.95)' }
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: c.bg,
                      color: c.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                      mb: 1
                    }}
                  >
                    <TriIcon name={c.icon} size={22} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: c.name === 'All' ? '#FF7A00' : '#334155',
                      textAlign: 'center',
                      fontFamily: '"Inter", sans-serif'
                    }}
                  >
                    {c.name}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Popular in Bangalore Section */}
          <Box sx={{ mb: 3.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Popular in {selectedCity.name}
              </Typography>
              <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#FF7A00', cursor: 'pointer', fontFamily: '"Inter", sans-serif' }}>
                View all
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
              {popularAreas.map((area) => (
                <Box
                  key={area.name}
                  sx={{
                    minWidth: '130px',
                    bgcolor: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1px solid #E2E8F0',
                    p: 1,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}
                >
                  <Box sx={{ width: '100%', height: '80px', borderRadius: '14px', overflow: 'hidden', mb: 1 }}>
                    <Box component="img" src={area.image} alt={area.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', px: 0.5 }} noWrap>
                    {area.name}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.3} sx={{ mt: 0.5, px: 0.5 }}>
                    <TriIcon name="location_on" size={12} color="#64748B" />
                    <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#64748B', fontFamily: '"Inter", sans-serif' }}>
                      {area.dist}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Featured Dynamic Products Section */}
          <Box sx={{ mb: 3.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {channelMode === 'ONLINE' ? 'Featured Online Products' : 'Featured Tri Zone Stays'}
              </Typography>
              <Typography 
                onClick={() => setSelectedCategory({ name: 'All' })}
                sx={{ fontSize: '11px', fontWeight: 800, color: '#FF7A00', cursor: 'pointer', fontFamily: '"Inter", sans-serif' }}
              >
                View all
              </Typography>
            </Stack>
            
            {loadingProducts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#FF7A00' }} size={24} />
              </Box>
            ) : visibleProducts.length === 0 ? (
              <Typography sx={{ fontSize: '12px', color: '#64748B', py: 2, textAlign: 'center' }}>
                No listings available in {selectedCity.name}
              </Typography>
            ) : (
              <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                {visibleProducts.slice(0, 10).map((prod) => {
                  const isTriZone = channelMode === 'TRIZONE';
                  return (
                    <Box
                      key={prod.id}
                      component={Link}
                      to={`/consumer-ecommerce/product/${prod.id}`}
                      style={{ textDecoration: 'none' }}
                      sx={{
                        minWidth: '150px',
                        maxWidth: '150px',
                        bgcolor: '#FFFFFF',
                        borderRadius: '20px',
                        border: '1px solid #E2E8F0',
                        p: 1,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        flexShrink: 0,
                        cursor: 'pointer'
                      }}
                    >
                      <Box sx={{ width: '100%', height: '100px', borderRadius: '14px', overflow: 'hidden', mb: 1, position: 'relative' }}>
                        <Box component="img" src={prod.image || prod.image_url || fallbackImg} alt={prod.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = fallbackImg; }} />
                        {prod.discount_percent > 0 && (
                          <Box sx={{ position: 'absolute', top: 6, left: 6, bgcolor: '#ef4444', color: '#fff', px: 0.8, py: 0.2, borderRadius: '6px', fontSize: '9px', fontWeight: 800 }}>
                            {Math.round(prod.discount_percent)}% OFF
                          </Box>
                        )}
                      </Box>
                      <Typography sx={{ fontSize: '12px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', px: 0.5 }} noWrap>
                        {prod.title}
                      </Typography>
                      
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5, px: 0.5 }}>
                        <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#FF7A00', fontFamily: '"Inter", sans-serif' }}>
                          ₹{prod.price} {isTriZone && <span style={{ fontSize: '8px', color: '#64748B', fontWeight: 500 }}>/day</span>}
                        </Typography>
                        {prod.mrp > prod.price && (
                          <Typography sx={{ fontSize: '9px', color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{prod.mrp}
                          </Typography>
                        )}
                      </Stack>

                      {isTriZone ? (
                        <Box sx={{ mt: 1, px: 0.5 }}>
                          <Typography sx={{ fontSize: '8px', color: '#22C55E', fontWeight: 700 }}>Free Cancellation</Typography>
                          <Button 
                            variant="contained" 
                            size="small"
                            sx={{ 
                              mt: 0.8, width: '100%', fontSize: '9px', fontWeight: 800, py: 0.4, borderRadius: '8px', bgcolor: '#FF7A00', textTransform: 'none',
                              '&:hover': { bgcolor: '#E06B00' }
                            }}
                          >
                            Book Now
                          </Button>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: '9px', color: '#22C55E', fontWeight: 700, mt: 0.5, px: 0.5 }}>
                          Free delivery
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>

          {/* Promo Coupon Card */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #FFF9F5 0%, #FFF0E6 100%)',
              borderRadius: '20px',
              p: 2,
              mb: 6,
              border: '1.5px dashed #FF9E44',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(255, 122, 0, 0.04)'
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 40, height: 40, bgcolor: '#FFEFE0', color: '#FF7A00', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TriIcon name="local_offer" size={20} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#C05600', fontFamily: '"Inter", sans-serif' }}>Flat 20% OFF</Typography>
                <Typography sx={{ fontSize: '10px', color: '#E06A00', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>Use code: TRIKONEKT20</Typography>
              </Box>
            </Stack>
            <Button
              sx={{
                bgcolor: '#FFFFFF',
                color: '#FF7A00',
                fontSize: '11px',
                fontWeight: 800,
                px: 2,
                py: 0.6,
                borderRadius: '12px',
                border: '1.5px solid #FFB080',
                textTransform: 'none',
                fontFamily: '"Inter", sans-serif',
                '&:hover': { bgcolor: '#FFF5EE' }
              }}
            >
              Shop Now
            </Button>
          </Box>

        </Box>
      </main>

      <Link 
        to="/consumer-ecommerce/nearby-stores?view=map" 
        className="ce-nearme-map-float ce-nearme-wire-map" 
        style={{ textDecoration: 'none', bottom: '120px' }}
      >
        <TriIcon name="map" size={18} /> Map View
      </Link>

      <BottomNav />
      <LocationPickerModal isOpen={showPicker} onClose={() => setShowPicker(false)} />
    </div>
  );
}
