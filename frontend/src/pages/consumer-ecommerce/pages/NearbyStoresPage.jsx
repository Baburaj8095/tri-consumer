import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Box, Typography, InputBase, IconButton, Stack } from '@mui/material';
import { 
  LuChevronLeft, 
  LuSearch, 
  LuStore, 
  LuShoppingCart, 
  LuSmartphone, 
  LuHotel, 
  LuZap 
} from 'react-icons/lu';
import BottomNav from '../components/BottomNav.jsx';
import NearbyStoreCard from '../components/NearbyStoreCard.jsx';
import '../consumerEcommerce.css';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

const getCategoryIcon = (name) => {
  const value = String(name || '').toLowerCase();
  if (value.includes('grocery') || value.includes('kirana') || value.includes('food')) return <LuShoppingCart size={24} />;
  if (value.includes('mobile') || value.includes('phone')) return <LuSmartphone size={24} />;
  if (value.includes('hotel') || value.includes('restaurant') || value.includes('eat')) return <LuHotel size={24} />;
  if (value.includes('electronics') || value.includes('appliance')) return <LuZap size={24} />;
  return <LuStore size={24} />;
};

const resolveCategoryName = (shop) => {
  const raw = shop?.category;
  if (raw && typeof raw === 'object') {
    return raw.name || raw.title || raw.label || 'Retail Store';
  }
  return shop?.category_name || shop?.business_category || shop?.business_type || shop?.subcategory_name || (raw ? String(raw) : 'Retail Store');
};

export default function NearbyStoresPage() {
  const [b2cShops, setB2cShops] = useState([]);
  const [activeCat, setActiveCat] = useState('All Stores');
  const [categories, setCategories] = useState([{ name: 'All Stores', icon: <LuStore size={24} /> }]);
  const [sponsoredShops, setSponsoredShops] = useState([]);
  const [consumerLocation, setConsumerLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('checking');

  const filteredShops = useMemo(() => {
    if (activeCat === 'All Stores') return b2cShops;
    const active = activeCat.toLowerCase();
    return b2cShops.filter((shop) => String(shop.category || '').toLowerCase().includes(active));
  }, [activeCat, b2cShops]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setConsumerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('ready');
      },
      () => {
        setConsumerLocation(null);
        setLocationStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    const params = consumerLocation
      ? `?lat=${consumerLocation.lat}&lng=${consumerLocation.lng}&radius_km=25`
      : '';

    axios.get(`${CAPTAIN_API_URL}/captain/merchants/b2c${params}`)
      .then(res => {
        const data = res.data || [];
        setB2cShops(data.map(shop => ({
          id: shop.id,
          shopId: shop.shop_id || shop.id,
          name: shop.shop_name || shop.business_name || shop.full_name || 'B2C Merchant',
          category: resolveCategoryName(shop),
          rating: '4.5',
          location: shop.city || shop.address || 'Local Area',
          distance: shop.distance_km != null ? `${shop.distance_km} Km` : 'Nearby',
          status: 'Open now',
          phone: shop.contact_number || shop.phone || '',
          image: shop.shop_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80',
          homeDeliveryEnabled: Boolean(shop.home_delivery_enabled),
          deliveryRadiusKm: Math.min(Number(shop.delivery_radius_km) || 5, 25),
          distanceKm: shop.distance_km,
          isDeliveryAvailable: Boolean(shop.is_delivery_available),
          deliveryUnavailableReason: shop.delivery_unavailable_reason,
          consumerLocation,
          locationStatus,
        })));
        const mapped = data.map(shop => resolveCategoryName(shop)).filter(Boolean);
        const uniq = Array.from(new Set(mapped));
        setCategories([
          { name: 'All Stores', icon: <LuStore size={24} /> },
          ...uniq.map(name => ({ name, icon: getCategoryIcon(name) }))
        ]);
      })
      .catch(err => console.error('Failed to load B2C merchants:', err));

    // Fetch sponsored shops
    axios.get(`${CAPTAIN_API_URL}/api/ads/sponsored-shops?limit=6&target=CONSUMER_NEARBY_B2C`)
      .then(res => setSponsoredShops(res.data || []))
      .catch(() => {});
  }, [consumerLocation, locationStatus]);

  return (
    <div className="ce-app ce-nearby-page" style={{ paddingTop: 84, paddingBottom: 80, minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header className="ce-compact-page-header">
        <Link to="/consumer-ecommerce" aria-label="Back"><LuChevronLeft /></Link>
        <div>
          <h1>Near Store</h1>
          <p>Stores around Indiranagar</p>
        </div>
        <span><LuStore /></span>
      </header>

      {/* Sponsored Shops Row */}
      {sponsoredShops.length > 0 && (
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#f97316', letterSpacing: 0.5, mb: 1, textTransform: 'uppercase' }}>
            🌟 Sponsored Stores
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
            {sponsoredShops.map(ad => (
              <Box
                key={ad.id}
                sx={{
                  minWidth: 140, maxWidth: 140, borderRadius: '12px', overflow: 'hidden',
                  border: '2px solid rgba(249,115,22,0.25)', bgcolor: '#fff', flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(249,115,22,0.08)'
                }}
              >
                <Box
                  component="img"
                  src={ad.image_url || ad.shop_image || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=280&q=80'}
                  alt={ad.title}
                  sx={{ width: '100%', height: 72, objectFit: 'cover', display: 'block' }}
                />
                <Box sx={{ p: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                    {ad.title || ad.shop_name}
                  </Typography>
                  {ad.description && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b', mt: 0.25, lineHeight: 1.3 }}>
                      {ad.description}
                    </Typography>
                  )}
                  <Box sx={{ mt: 0.5, px: 0.5, py: 0.25, bgcolor: 'rgba(249,115,22,0.08)', borderRadius: '4px', display: 'inline-block' }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#f97316' }}>Sponsored</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Search Bar */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: '#fff', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            px: 2, 
            py: 1.5,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <LuSearch color="#f97316" size={20} />
          <InputBase placeholder="Search nearby stores..." sx={{ ml: 1.5, flex: 1, fontSize: '0.95rem', fontWeight: 500 }} />
        </Box>
      </Box>

      {/* Categories Horizontal Scroll */}
      <Box sx={{ bgcolor: '#fff', py: 2, borderBottom: '1px solid #e2e8f0' }}>
        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', px: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
          {categories.map(cat => (
            <Box 
              key={cat.name} 
              onClick={() => setActiveCat(cat.name)}
              sx={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, 
                minWidth: '70px', cursor: 'pointer',
                color: activeCat === cat.name ? '#f97316' : '#64748b'
              }}
            >
              <Box sx={{ 
                width: 50, height: 50, borderRadius: '12px', border: '1px solid',
                borderColor: activeCat === cat.name ? '#f97316' : '#e2e8f0',
                display: 'grid', placeItems: 'center',
                bgcolor: activeCat === cat.name ? 'rgba(249, 115, 22, 0.1)' : '#f8fafc',
                transition: 'all 0.2s'
              }}>
                {cat.icon}
              </Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: activeCat === cat.name ? 700 : 500, whiteSpace: 'nowrap' }}>
                {cat.name}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Store List */}
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', mb: 2, color: '#0f172a' }}>
          Stores near you <Typography component="span" sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>({filteredShops.length} found)</Typography>
        </Typography>

        {locationStatus !== 'ready' && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 2 }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 700 }}>
              Set location to check delivery availability. Pay Store remains available for nearby stores.
            </Typography>
          </Box>
        )}

        {filteredShops.map((store) => (
          <NearbyStoreCard key={store.id} store={store} />
        ))}
      </Box>

      <BottomNav />
    </div>
  );
}
