import { useEffect, useState } from 'react';
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

const categories = [
  { name: 'All Stores', icon: <LuStore size={24} /> },
  { name: 'Grocery', icon: <LuShoppingCart size={24} /> },
  { name: 'Mobile', icon: <LuSmartphone size={24} /> },
  { name: 'Hotel', icon: <LuHotel size={24} /> },
  { name: 'Electronics', icon: <LuZap size={24} /> }
];

export default function NearbyStoresPage() {
  const [b2cShops, setB2cShops] = useState([]);
  const [activeCat, setActiveCat] = useState('All Stores');

  useEffect(() => {
    axios.get(`${CAPTAIN_API_URL}/captain/merchants/b2c`)
      .then(res => {
        const data = res.data || [];
        setB2cShops(data.map(shop => ({
          id: shop.id,
          name: shop.shop_name || shop.business_name || shop.full_name || 'B2C Merchant',
          category: 'Retail Store',
          rating: '4.5',
          location: shop.city || shop.address || 'Local Area',
          distance: 'Nearby',
          status: 'Open now',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80',
        })));
      })
      .catch(err => console.error('Failed to load B2C merchants:', err));
  }, []);

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
          Stores near you <Typography component="span" sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>({b2cShops.length} found)</Typography>
        </Typography>

        {b2cShops.map((store) => (
          <NearbyStoreCard key={store.id} store={store} />
        ))}
      </Box>

      <BottomNav />
    </div>
  );
}
