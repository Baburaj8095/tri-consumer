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

const circularCategories = [
  { name: 'Local Market', icon: 'storefront', bg: '#E8F5E9', color: '#2E7D32' },
  { name: 'Farmers', icon: 'agriculture', bg: '#F1F8E9', color: '#558B2F' },
  { name: 'Grocery', icon: 'shopping_basket', bg: '#FFF3E0', color: '#EF6C00' },
  { name: 'Restaurants', icon: 'restaurant', bg: '#FCE4EC', color: '#C2185B' },
  { name: 'More', icon: 'grid_view', bg: '#EDE7F6', color: '#673AB7' },
];

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
        } else if (catName.includes('restaurants') || catName.includes('food')) {
          match = shopTitle.includes('restaurant') || shopTitle.includes('food') || shopTitle.includes('eat') || shopTitle.includes('biryani') || shopTitle.includes('cafe') || shopTitle.includes('kitchen');
        } else if (catName.includes('shopping') || catName.includes('grocery') || catName.includes('market') || catName.includes('farmers')) {
          match = shopTitle.includes('shop') || shopTitle.includes('store') || shopTitle.includes('market') || shopTitle.includes('mart') || shopTitle.includes('mall') || shopTitle.includes('grocery');
        } else if (catName.includes('medical') || catName.includes('hospitals') || catName.includes('health')) {
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
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1.5, '&::-webkit-scrollbar': { display: 'none' } }}>
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={filter === activeFilter ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setActiveFilter(filter)}
                sx={{ borderRadius: '12px', fontSize: '11px', fontWeight: 700, textTransform: 'none', px: 2, py: 0.6, flexShrink: 0 }}
              >
                {filter}
              </Button>
            ))}
          </Stack>

          <Stack spacing={2} sx={{ mt: 1, pb: 4 }}>
            {loadingShops ? (
              <Typography sx={{ textAlign: 'center', py: 4, color: '#64748B', fontFamily: '"Inter", sans-serif' }}>Loading...</Typography>
            ) : visibleListings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                <TriIcon name="search_off" size={48} color="#CBD5E1" sx={{ mb: 1.5 }} />
                <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', mb: 0.5, fontFamily: '"Inter", sans-serif' }}>No Shops Found</Typography>
              </Box>
            ) : (
              visibleListings.map((listing) => (
                <TriCard
                  key={listing.id}
                  noPadding
                  component={Link}
                  to={`/consumer-ecommerce/shop/${listing.id}`}
                  sx={{
                    display: 'flex', textDecoration: 'none', bgcolor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden'
                  }}
                >
                  <Box
                    component="img"
                    src={listing.shop_image || fallbackImg}
                    alt={listing.shop_name}
                    sx={{ width: 110, height: 110, objectFit: 'cover', flexShrink: 0 }}
                    onError={(e) => { e.target.src = fallbackImg; }}
                  />
                  <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif' }} noWrap>
                      {listing.shop_name}
                    </Typography>
                  </Box>
                </TriCard>
              ))
            )}
          </Stack>
        </Box>

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
    <div className="ce-app ce-nearme-wire" style={{ paddingBottom: '100px' }}>
      <main className="ce-nearme-wire-shell">
        <Box
          sx={{
            background: 'linear-gradient(135deg, #FF9E44 0%, #FF7A00 100%)',
            pt: 4, pb: 3, px: 2.5, color: '#FFFFFF',
            borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px',
            boxShadow: '0 8px 30px rgba(255, 122, 0, 0.15)',
            maxWidth: '430px', margin: '0 auto', width: '100%',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3, gap: 1 }}>
            <Box>
              <Typography sx={{ fontSize: '20px', fontWeight: 800, fontFamily: '"Inter", sans-serif', color: '#FFFFFF', lineHeight: 1.2 }}>Nearby Marketplace</Typography>
              <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>Everything around you</Typography>
            </Box>
            <Box
              onClick={() => setShowPicker(true)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(255, 255, 255, 0.18)', px: 1.5, py: 0.6, borderRadius: '20px', cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.25)', transition: 'transform 0.15s', '&:active': { transform: 'scale(0.95)' }, flexShrink: 0
              }}
            >
              <TriIcon name="location_on" size={14} color="#FFFFFF" />
              <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF', fontFamily: '"Inter", sans-serif' }}>{location.city || 'Bangalore'}</Typography>
              <TriIcon name="arrow_drop_down" size={14} color="#FFFFFF" />
            </Box>
          </Stack>
          <Box sx={{ display: 'flex', bgcolor: 'rgba(255,255,255,0.12)', borderRadius: '16px', p: 0.5 }}>
            {['ONLINE', 'OFFLINE', 'TRIZONE'].map((mode) => (
              <Button
                key={mode}
                onClick={() => handleChannelChange(mode)}
                sx={{
                  flex: 1, py: 1, borderRadius: '12px', bgcolor: channelMode === mode ? '#FFFFFF' : 'transparent',
                  color: channelMode === mode ? '#FF7A00' : 'rgba(255,255,255,0.85)', fontWeight: 800, fontSize: '12px', textTransform: 'none',
                  fontFamily: '"Inter", sans-serif', boxShadow: channelMode === mode ? '0 4px 12px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {mode === 'ONLINE' ? 'Online Shop' : mode === 'OFFLINE' ? 'Near Store' : 'Tri Zone'}
              </Button>
            ))}
          </Box>
        </Box>

        <Box sx={{ maxWidth: '430px', margin: '0 auto', width: '100%' }}>
          <Box sx={{ px: 2, pt: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#FFFFFF', borderRadius: '24px', px: 2, py: 1, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)', border: '1px solid #E2E8F0' }}>
              <TriIcon name="search" size={20} color="#64748B" sx={{ mr: 1.5 }} />
              <InputBase placeholder="Search active online shops..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ flex: 1, fontSize: '13px', fontWeight: 500, fontFamily: '"Inter", sans-serif', color: '#1E293B' }} />
              <TriIcon name="mic" size={20} color="#64748B" />
            </Box>
          </Box>

          <Box sx={{ px: 2, pt: 3 }}>
            <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
              {circularCategories.map((c) => (
                <Box key={c.name} onClick={() => c.name !== 'More' && setSelectedCategory(categories.find((item) => item.name === c.name) || { name: c.name })} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: '68px', flexShrink: 0 }}>
                  <Box sx={{ width: 54, height: 54, borderRadius: '50%', bgcolor: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', mb: 1 }}>
                    <TriIcon name={c.icon} size={22} color={c.color} />
                  </Box>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#334155', textAlign: 'center', fontFamily: '"Inter", sans-serif' }}>{c.name}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ px: 2, pt: 3.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Top Cities</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
              {cities.map((city) => (
                <Box key={city.name} onClick={() => setSelectedCity(city)} sx={{ position: 'relative', minWidth: '120px', height: '150px', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', border: '2px solid', borderColor: city.name === selectedCity.name ? '#FF7A00' : 'transparent', flexShrink: 0 }}>
                  <Box component="img" src={city.image} alt={city.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 1.5, color: '#FFFFFF' }}>
                    <Typography sx={{ fontSize: '12.5px', fontWeight: 800, fontFamily: '"Inter", sans-serif' }}>{city.name}</Typography>
                    <Typography sx={{ fontSize: '9px', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{city.count} businesses</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ px: 2, pt: 3.5, pb: 6 }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 2 }}>Online Shops with Delivery ({visibleListings.length})</Typography>
            {loadingShops ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} sx={{ color: '#FF7A00' }} /></Box>
            ) : visibleListings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5, bgcolor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <TriIcon name="shopping_bag" size={48} color="#CBD5E1" />
                <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', mt: 1 }}>No Active Online Stores</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {visibleListings.map(shop => (
                  <TriCard key={shop.id} noPadding component={Link} to={`/consumer-ecommerce/shop/${shop.id}`} sx={{ display: 'flex', textDecoration: 'none', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                    <Box component="img" src={shop.shop_image || fallbackImg} alt={shop.shop_name} sx={{ width: 110, height: 110, objectFit: 'cover' }} onError={(e) => { e.target.src = fallbackImg; }} />
                    <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }} noWrap>{shop.shop_name}</Typography>
                      <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 0.5 }}>{shop.address || shop.city}</Typography>
                    </Box>
                  </TriCard>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </main>

      <Link to="/consumer-ecommerce/nearby-stores?view=map" className="ce-nearme-map-float ce-nearme-wire-map" style={{ textDecoration: 'none', bottom: '120px' }}>
        <TriIcon name="map" size={18} /> Map View
      </Link>
      <BottomNav />
      <LocationPickerModal isOpen={showPicker} onClose={() => setShowPicker(false)} />
    </div>
  );
}
