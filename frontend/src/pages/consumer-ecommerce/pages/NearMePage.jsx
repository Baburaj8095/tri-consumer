import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Stack, Typography, Grid, Button, IconButton } from '@mui/material';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import TriIcon from '../../../components/ui/TriIcon.jsx';
import TriCard from '../../../components/ui/TriCard.jsx';
import LocationPickerModal from '../components/LocationPickerModal.jsx';
import { useLocation } from '../context/LocationContext.jsx';
import '../consumerEcommerce.css';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

const cities = [
  { name: 'Bangalore', count: '12.4K+', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=360&q=80' },
  { name: 'Hyderabad', count: '8.7K+', image: 'https://images.unsplash.com/photo-1566793474285-2decf0fc182a?auto=format&fit=crop&w=360&q=80' },
  { name: 'Mumbai', count: '15.6K+', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=360&q=80' },
  { name: 'Chennai', count: '7.2K+', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=360&q=80' },
  { name: 'Pune', count: '6.1K+', image: 'https://images.unsplash.com/photo-1615154131651-6a4f7f2dbb21?auto=format&fit=crop&w=360&q=80' },
  { name: 'Delhi', count: '18.2K+', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=360&q=80' },
];

const categories = [
  { name: 'Hotels', count: '1,120 places', icon: 'hotel', tone: 'blue' },
  { name: 'Restaurants', count: '3,210 places', icon: 'restaurant', tone: 'red' },
  { name: 'Shopping', count: '2,340 places', icon: 'shopping_bag', tone: 'orange' },
  { name: 'Medical', count: '680 places', icon: 'medical_services', tone: 'cyan' },
  { name: 'Hospitals', count: '140 places', icon: 'local_hospital', tone: 'red' },
  { name: 'Fuel', count: '210 places', icon: 'local_gas_station', tone: 'amber' },
  { name: 'ATM', count: '310 places', icon: 'atm', tone: 'blue' },
  { name: 'Entertainment', count: '320 places', icon: 'movie', tone: 'pink' },
  { name: 'Tourist Places', count: '430 places', icon: 'photo_camera', tone: 'green' },
  { name: 'Events', count: '120 places', icon: 'event', tone: 'purple' },
  { name: 'Services', count: '1,050 places', icon: 'home_repair_service', tone: 'teal' },
  { name: 'Education', count: '520 places', icon: 'school', tone: 'indigo' },
  { name: 'Banks', count: '240 places', icon: 'account_balance', tone: 'blue' },
  { name: 'More', count: 'View all', icon: 'grid_view', tone: 'indigo' },
];

const heroCategories = categories;

const filters = ['All', 'Open Now', 'Top Rated', 'Free Delivery'];

export default function NearMePage() {
  const navigate = useNavigate();
  const { location, showPicker, setShowPicker, saveLocation } = useLocation();
  
  const selectedCity = { name: location.city || 'Bangalore' };
  const setSelectedCity = (city) => {
    saveLocation({
      ...location,
      city: city.name,
      formattedAddress: `${location.area || 'Indiranagar'}, ${city.name}`
    });
  };

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [channelMode, setChannelMode] = useState('ONLINE');
  const [liveShops, setLiveShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(false);

  // Fetch B2C shops from the live Spring backend
  useEffect(() => {
    setLoadingShops(true);
    axios.get(`${CAPTAIN_API_URL}/captain/merchants/b2c`)
      .then(res => {
        setLiveShops(res.data || []);
        setLoadingShops(false);
      })
      .catch(err => {
        console.error('Error fetching B2C live merchants:', err);
        setLoadingShops(false);
      });
  }, []);

  // Filter listings based on selected City & Search term & Category & Online Delivery capability
  const visibleListings = useMemo(() => {
    return liveShops.filter(shop => {
      const shopCity = (shop.city || '').trim().toLowerCase();
      const chosenCity = selectedCity.name.toLowerCase();
      if (shopCity !== chosenCity) {
        return false;
      }

      const serviceMode = (shop.service_mode || 'ONLINE').toUpperCase();
      if (serviceMode === 'OFFLINE') {
        return false;
      }

      if (selectedCategory) {
        const catName = selectedCategory.name.toLowerCase();
        const shopTitle = (shop.shop_name || '').toLowerCase();

        let match = false;
        if (catName.includes('hotels')) {
          match = shopTitle.includes('hotel') || shopTitle.includes('stay') || shopTitle.includes('inn') || shopTitle.includes('resort');
        } else if (catName.includes('restaurants')) {
          match = shopTitle.includes('restaurant') || shopTitle.includes('food') || shopTitle.includes('eat') || shopTitle.includes('biryani') || shopTitle.includes('cafe') || shopTitle.includes('kitchen');
        } else if (catName.includes('shopping')) {
          match = shopTitle.includes('shop') || shopTitle.includes('store') || shopTitle.includes('market') || shopTitle.includes('mart') || shopTitle.includes('mall');
        } else if (catName.includes('medical') || catName.includes('hospitals')) {
          match = shopTitle.includes('clinic') || shopTitle.includes('pharmacy') || shopTitle.includes('health') || shopTitle.includes('hospital') || shopTitle.includes('medical') || shopTitle.includes('pharma');
        } else {
          match = shopTitle.includes(catName.split(' ')[0]);
        }

        if (!match) return false;
      }

      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchTitle = (shop.shop_name || '').toLowerCase().includes(query);
        const matchAddr = (shop.address || '').toLowerCase().includes(query);
        if (!matchTitle && !matchAddr) {
          return false;
        }
      }

      if (activeFilter === 'Free Delivery') {
        const deliveryFee = parseFloat(shop.base_delivery_fee || '0');
        if (deliveryFee > 0) return false;
      }

      return true;
    });
  }, [liveShops, selectedCity, selectedCategory, searchTerm, activeFilter]);

  const handleChannelChange = (mode) => {
    setChannelMode(mode);
    if (mode === 'OFFLINE') {
      navigate('/consumer-ecommerce/nearby-stores');
    } else if (mode === 'TRIZONE') {
      navigate('/consumer-ecommerce/tri-zone');
    }
  };

  // Render subcategory page view
  if (selectedCategory) {
    return (
      <div className="ce-app ce-nearme-wire" style={{ pb: '100px' }}>
        {/* Compact back button header for subcategory */}
        <Header 
          mode="compact" 
          title={selectedCategory.name} 
          subtitle={`Explore in ${selectedCity.name}`} 
          onBack={() => setSelectedCategory(null)} 
        />

        <Box sx={{ maxWidth: '430px', margin: '0 auto', width: '100%', px: 2, pt: 2 }}>
          {/* Subpage filters */}
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1.5, '&::-webkit-scrollbar': { display: 'none' } }}>
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={filter === activeFilter ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setActiveFilter(filter)}
                sx={{
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2,
                  py: 0.6,
                  flexShrink: 0
                }}
              >
                {filter}
              </Button>
            ))}
          </Stack>

          {/* Subpage Business List */}
          <Stack spacing={2} sx={{ mt: 1, pb: 4 }}>
            {loadingShops ? (
              <Typography sx={{ textAlign: 'center', py: 4, color: '#64748B', fontFamily: '"Inter", sans-serif' }}>
                Loading B2C stores...
              </Typography>
            ) : visibleListings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                <TriIcon name="search_off" size={48} color="#CBD5E1" sx={{ mb: 1.5 }} />
                <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', mb: 0.5, fontFamily: '"Inter", sans-serif' }}>
                  No Shops Found
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#64748B', fontFamily: '"Inter", sans-serif' }}>
                  There are currently no matching stores in {selectedCity.name}.
                </Typography>
              </Box>
            ) : (
              visibleListings.map((listing) => (
                <TriCard
                  key={listing.id}
                  noPadding
                  component={Link}
                  to={`/consumer-ecommerce/shop/${listing.id}`}
                  sx={{
                    display: 'flex',
                    textDecoration: 'none',
                    bgcolor: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(255, 122, 0, 0.02)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#FF7A00',
                      boxShadow: '0 8px 20px rgba(255, 122, 0, 0.05)'
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={listing.shop_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'}
                    alt={listing.shop_name}
                    sx={{ width: 110, height: 110, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif' }} noWrap>
                      {listing.shop_name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.3} sx={{ mt: 0.5 }}>
                      <TriIcon name="star" size={13} sx={{ color: '#F59E0B', fill: '#F59E0B' }} />
                      <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif' }}>4.5</Typography>
                      <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontFamily: '"Inter", sans-serif' }}>(118)</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 0.5, fontFamily: '"Inter", sans-serif' }} noWrap>
                      {listing.address || 'Local Area'}
                    </Typography>
                    <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#FF7A00', mt: 0.5, fontFamily: '"Inter", sans-serif' }}>
                      MIN ORDER: ₹{listing.min_order_value || '0'}
                    </Typography>
                  </Box>
                </TriCard>
              ))
            )}
          </Stack>
        </Box>

        {/* Floating Map View Button (Standardized position, moved higher) */}
        <Link 
          to="/consumer-ecommerce/nearby-stores?view=map" 
          className="ce-nearme-map-float ce-nearme-wire-map" 
          style={{ textDecoration: 'none', bottom: '120px' }}
        >
          <TriIcon name="map" size={18} />
          Map View
        </Link>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="ce-app ce-nearme-wire" style={{ pb: '100px' }}>
      <main className="ce-nearme-wire-shell">
        {/* Reusable Hero Header style matching other modules (Compact) */}
        <Header mode="compact" onSearch={(val) => setSearchTerm(val)} />

        <Box sx={{ maxWidth: '430px', margin: '0 auto', width: '100%' }}>
          
          {/* Hero Banner Banner with Overlay */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '140px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              px: 2.5,
              backgroundImage: 'linear-gradient(rgba(15,23,42,0.65), rgba(15,23,42,0.45)), url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=430&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 'inset 0 -30px 40px rgba(0,0,0,0.1)'
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', fontFamily: '"Inter", sans-serif', lineHeight: 1.2 }}>
                Explore Marketplace
              </Typography>
              <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontFamily: '"Inter", sans-serif', mt: 0.5, fontWeight: 500 }}>
                Find premium hotels, eating joints, shops & details
              </Typography>
            </Box>
          </Box>

          {/* Channel Selection Toggle */}
          <Box sx={{ px: 2, pt: 2 }}>
            <Box sx={{ display: 'flex', background: '#F1F5F9', borderRadius: '14px', p: 0.5 }}>
              <Button
                onClick={() => handleChannelChange('ONLINE')}
                sx={{
                  flex: 1,
                  py: 1,
                  borderRadius: '10px',
                  bgcolor: channelMode === 'ONLINE' ? '#FFFFFF' : 'transparent',
                  color: channelMode === 'ONLINE' ? '#FF7A00' : '#64748B',
                  fontWeight: 800,
                  fontSize: '12px',
                  boxShadow: channelMode === 'ONLINE' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  '&:hover': { bgcolor: channelMode === 'ONLINE' ? '#FFFFFF' : 'transparent' }
                }}
              >
                Online Shop
              </Button>
              <Button
                onClick={() => handleChannelChange('OFFLINE')}
                sx={{
                  flex: 1,
                  py: 1,
                  borderRadius: '10px',
                  bgcolor: channelMode === 'OFFLINE' ? '#FFFFFF' : 'transparent',
                  color: channelMode === 'OFFLINE' ? '#FF7A00' : '#64748B',
                  fontWeight: 800,
                  fontSize: '12px',
                  boxShadow: channelMode === 'OFFLINE' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  '&:hover': { bgcolor: channelMode === 'OFFLINE' ? '#FFFFFF' : 'transparent' }
                }}
              >
                Near Store
              </Button>
              <Button
                onClick={() => handleChannelChange('TRIZONE')}
                sx={{
                  flex: 1,
                  py: 1,
                  borderRadius: '10px',
                  bgcolor: channelMode === 'TRIZONE' ? '#FFFFFF' : 'transparent',
                  color: channelMode === 'TRIZONE' ? '#FF7A00' : '#64748B',
                  fontWeight: 800,
                  fontSize: '12px',
                  boxShadow: channelMode === 'TRIZONE' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  '&:hover': { bgcolor: channelMode === 'TRIZONE' ? '#FFFFFF' : 'transparent' }
                }}
              >
                Tri Zone
              </Button>
            </Box>
          </Box>

          {/* Categories Grid (Standardized, 20px card radius, premium icons) */}
          <Box sx={{ px: 2, pt: 2.5 }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Explore Categories
            </Typography>
            <Grid container spacing={1.5}>
              {heroCategories.map((c) => (
                <Grid item xs={4} key={c.name}>
                  <Box
                    onClick={() => c.name !== 'More' && setSelectedCategory(categories.find((item) => item.name === c.name))}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 1.5,
                      bgcolor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease-in-out',
                      '&:active': { transform: 'scale(0.95)' }
                    }}
                  >
                    <Box sx={{ bgcolor: 'rgba(255, 122, 0, 0.08)', color: '#FF7A00', width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.8 }}>
                      <TriIcon name={c.icon} size={20} />
                    </Box>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#475569', textAlign: 'center', fontFamily: '"Inter", sans-serif' }} noWrap>
                      {c.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Cities Section */}
          <Box sx={{ px: 2, pt: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Top Cities
              </Typography>
              <Button size="small" sx={{ fontWeight: 700, color: '#FF7A00', p: 0, minWidth: 0 }}>View All</Button>
            </Stack>
            <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
              {cities.map((city) => (
                <Box
                  key={city.name}
                  onClick={() => setSelectedCity(city)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '90px',
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: city.name === selectedCity.name ? '#FF7A00' : '#E2E8F0',
                    bgcolor: city.name === selectedCity.name ? '#FFF5E6' : '#FFFFFF',
                    transition: 'all 0.2s'
                  }}
                >
                  <Box
                    component="img"
                    src={city.image}
                    alt={city.name}
                    sx={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', mb: 0.8 }}
                  />
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#1E293B', fontFamily: '"Inter", sans-serif' }}>
                    {city.name}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Live Online Shops Section */}
          <Box sx={{ px: 2, pt: 3.5, pb: 6 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Online Shops with Delivery
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>
                {visibleListings.length} ACTIVE
              </Typography>
            </Stack>

            {loadingShops ? (
              <Typography sx={{ textAlign: 'center', py: 4, color: '#64748B', fontFamily: '"Inter", sans-serif' }}>
                Loading B2C stores...
              </Typography>
            ) : visibleListings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, p: 3, bgcolor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <TriIcon name="store" size={32} color="#CBD5E1" sx={{ mb: 1 }} />
                <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#475569', mb: 0.5 }}>No Active Online Stores</Typography>
                <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>Select another city above or switch views.</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {visibleListings.map(shop => (
                  <TriCard
                    key={shop.id}
                    noPadding
                    component={Link}
                    to={`/consumer-ecommerce/shop/${shop.id}`}
                    sx={{
                      display: 'flex',
                      textDecoration: 'none',
                      bgcolor: '#FFFFFF',
                      borderRadius: '20px', // Standard 20px card radius
                      border: '1px solid #E2E8F0',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(255, 122, 0, 0.02)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#FF7A00',
                        boxShadow: '0 8px 20px rgba(255, 122, 0, 0.06)'
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={shop.shop_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'}
                      alt={shop.shop_name}
                      sx={{ width: 110, height: 110, objectFit: 'cover', flexShrink: 0 }}
                    />
                    <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif' }} noWrap>
                        {shop.shop_name}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.3} sx={{ mt: 0.5 }}>
                        <TriIcon name="star" size={13} sx={{ color: '#F59E0B', fill: '#F59E0B' }} />
                        <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#334155', fontFamily: '"Inter", sans-serif' }}>4.5</Typography>
                        <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontFamily: '"Inter", sans-serif' }}>• Fee: ₹{shop.base_delivery_fee || '0'}</Typography>
                      </Stack>
                      <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 0.5, fontFamily: '"Inter", sans-serif' }} noWrap>
                        {shop.address || shop.city}
                      </Typography>
                      <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#FF7A00', mt: 0.5, fontFamily: '"Inter", sans-serif' }}>
                        MIN ORDER: ₹{shop.min_order_value || '0'}
                      </Typography>
                    </Box>
                  </TriCard>
                ))}
              </Stack>
            )}
          </Box>

        </Box>
      </main>

      {/* Floating Map View Button (Moved higher) */}
      <Link 
        to="/consumer-ecommerce/nearby-stores?view=map" 
        className="ce-nearme-map-float ce-nearme-wire-map" 
        style={{ textDecoration: 'none', bottom: '120px' }}
      >
        <TriIcon name="map" size={18} />
        Map View
      </Link>

      <BottomNav />
      <LocationPickerModal isOpen={showPicker} onClose={() => setShowPicker(false)} />
    </div>
  );
}
