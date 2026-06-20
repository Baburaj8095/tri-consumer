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
  LuZap,
  LuMapPin,
  LuChevronDown,
  LuMap,
  LuList
} from 'react-icons/lu';
import BottomNav from '../components/BottomNav.jsx';
import NearbyStoreCard from '../components/NearbyStoreCard.jsx';
import MapView from '../components/MapView.jsx';
import LocationPickerModal from '../components/LocationPickerModal.jsx';
import { useLocation } from '../context/LocationContext.jsx';
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
  const { location: userLoc, showPicker, setShowPicker } = useLocation();
  const [b2cShops, setB2cShops] = useState([]);
  const [activeCat, setActiveCat] = useState('All Stores');
  const [categories, setCategories] = useState([{ name: 'All Stores', icon: <LuStore size={24} /> }]);
  const [sponsoredShops, setSponsoredShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list | map

  const filteredShops = useMemo(() => {
    let shops = b2cShops;
    if (activeCat !== 'All Stores') {
      const active = activeCat.toLowerCase();
      shops = shops.filter((shop) => String(shop.category || '').toLowerCase().includes(active));
    }
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      shops = shops.filter((shop) => 
        shop.name.toLowerCase().includes(query) || 
        shop.location.toLowerCase().includes(query)
      );
    }
    return shops;
  }, [activeCat, b2cShops, searchTerm]);

  useEffect(() => {
    const params = userLoc
      ? `?lat=${userLoc.lat}&lng=${userLoc.lng}&radius_km=25`
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
          latitude: shop.latitude || shop.lat,
          longitude: shop.longitude || shop.lng,
        })));
        const mapped = data.map(shop => resolveCategoryName(shop)).filter(Boolean);
        const uniq = Array.from(new Set(mapped));
        setCategories([
          { name: 'All Stores', icon: <LuStore size={24} /> },
          ...uniq.map(name => ({ name, icon: getCategoryIcon(name) }))
        ]);
      })
      .catch(err => console.error('Failed to load B2C merchants:', err));

    axios.get(`${CAPTAIN_API_URL}/api/ads/sponsored-shops?limit=6&target=CONSUMER_NEARBY_B2C`)
      .then(res => setSponsoredShops(res.data || []))
      .catch(() => {});
  }, [userLoc]);

  return (
    <div className="ce-app ce-nearby-page" style={{ paddingTop: 84, paddingBottom: 80, minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* Header Location selector Dropdown */}
      <header className="ce-compact-page-header">
        <Link to="/consumer-ecommerce" aria-label="Back"><LuChevronLeft /></Link>
        <div onClick={() => setShowPicker(true)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '15px' }}>
            📍 {userLoc.area}, {userLoc.city} <LuChevronDown size={14} color="#64748b" />
          </h1>
          <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Stores around your area</p>
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
          <InputBase 
            placeholder="Search nearby stores..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ ml: 1.5, flex: 1, fontSize: '0.95rem', fontWeight: 500 }} 
          />
        </Box>
      </Box>

      {/* List / Map View Toggle Bar */}
      <Box sx={{ px: 2, mb: 1 }}>
        <div className="map-view-toggle-bar">
          <button 
            className={`map-view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <LuList size={16} /> List View
          </button>
          <button 
            className={`map-view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <LuMap size={16} /> Map View
          </button>
        </div>
      </Box>

      {viewMode === 'map' ? (
        <Box sx={{ p: 2 }}>
          <MapView stores={filteredShops} />
        </Box>
      ) : (
        <>
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

            {filteredShops.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: '#64748b' }}>
                No shops match your criteria.
              </Box>
            ) : (
              filteredShops.map((store) => (
                <NearbyStoreCard key={store.id} store={store} />
              ))
            )}
          </Box>
        </>
      )}

      <BottomNav />
      
      {/* Location Picker Modal */}
      <LocationPickerModal isOpen={showPicker} onClose={() => setShowPicker(false)} />
    </div>
  );
}
