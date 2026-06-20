import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Button, Chip } from '@mui/material';
import { LuMapPin, LuStar, LuPhone, LuNavigation, LuWallet, LuEye } from 'react-icons/lu';
import { useLocation, calculateDistance } from '../context/LocationContext';

export default function NearbyStoreCard({ store }) {
  const navigate = useNavigate();
  const { location: userLoc } = useLocation();
  const targetId = store.shopId || store.id;

  // Calculate dynamic distance using user's location vs store location
  const storeLat = store.latitude || store.lat || 12.9716;
  const storeLng = store.longitude || store.lng || 77.5946;
  const rawDistance = calculateDistance(userLoc.lat, userLoc.lng, storeLat, storeLng);
  const displayDistance = rawDistance ? `${rawDistance.toFixed(1)} KM Away` : (store.distance || '0.8 KM Away');

  const handleDirectionsClick = (e) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${storeLat},${storeLng}`;
    window.open(url, '_blank');
  };

  const handleCallClick = (e) => {
    e.stopPropagation();
    const phone = store.phone || '08095918105';
    window.open(`tel:${phone}`);
  };

  const handlePayClick = (e) => {
    e.stopPropagation();
    navigate(`/consumer-ecommerce/shop/${targetId}/payment`);
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    navigate(`/consumer-ecommerce/shop/${targetId}`);
  };

  return (
    <Box 
      onClick={() => navigate(`/consumer-ecommerce/shop/${targetId}`)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        mb: 3,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        '&:hover': {
          borderColor: '#f97316',
          boxShadow: '0 8px 24px rgba(249,115,22,0.1)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Top: Image Section */}
      <Box sx={{ width: '100%', height: 160, overflow: 'hidden', position: 'relative', bgcolor: '#f1f5f9' }}>
        <img 
          src={store.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80'} 
          alt={store.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        {/* Distance Badge */}
        <Box sx={{ 
          position: 'absolute', 
          top: 12, 
          right: 12, 
          bgcolor: 'rgba(15, 23, 42, 0.8)', 
          color: '#fff', 
          px: 1.5, 
          py: 0.5, 
          borderRadius: '20px', 
          fontSize: '0.7rem', 
          fontWeight: 800,
          backdropFilter: 'blur(4px)'
        }}>
          {displayDistance}
        </Box>
      </Box>

      {/* Bottom: Details & Actions */}
      <Box sx={{ p: 2 }}>
        {/* Name and Rating */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.2 }}>
            {store.name}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', px: 1, py: 0.25, borderRadius: '6px' }}>
            <LuStar size={12} style={{ fill: '#d97706' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>{store.rating || '4.5'}</Typography>
          </Stack>
        </Stack>

        {/* Category & Status */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            {store.category || 'Retail Store'}
          </Typography>
          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
            Open Now
          </Typography>
        </Stack>

        {/* Location / Area display */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1.5, color: '#64748b' }}>
          <LuMapPin size={14} color="#f97316" />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {store.location || 'Indiranagar, Bangalore'}
          </Typography>
        </Stack>

        {/* Cashback Badge & Tags */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
          <Box sx={{ bgcolor: 'rgba(249, 115, 22, 0.1)', color: '#f97316', px: 1, py: 0.5, borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800 }}>
            5% Cashback
          </Box>
          <Box sx={{ bgcolor: '#f1f5f9', color: '#475569', px: 1, py: 0.5, borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700 }}>
            Home Delivery
          </Box>
          <Box sx={{ bgcolor: '#f1f5f9', color: '#475569', px: 1, py: 0.5, borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700 }}>
            Pickup
          </Box>
          <Box sx={{ bgcolor: '#f1f5f9', color: '#475569', px: 1, py: 0.5, borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700 }}>
            Offline Pay
          </Box>
        </Stack>

        {/* 4-Button Footer Row (Equal width, height, same spacing) */}
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<LuPhone size={12} />}
            sx={{ 
              flex: 1, 
              height: '38px',
              fontSize: '0.75rem', 
              fontWeight: 700, 
              textTransform: 'none', 
              color: '#f97316', 
              borderColor: '#f97316', 
              borderRadius: '8px',
              px: 0.5,
              '&:hover': {
                borderColor: '#ea580c',
                bgcolor: 'rgba(249,115,22,0.04)'
              }
            }} 
            onClick={handleCallClick}
          >
            Call
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<LuNavigation size={12} />}
            sx={{ 
              flex: 1, 
              height: '38px',
              fontSize: '0.75rem', 
              fontWeight: 700, 
              textTransform: 'none', 
              color: '#f97316', 
              borderColor: '#f97316', 
              borderRadius: '8px',
              px: 0.5,
              '&:hover': {
                borderColor: '#ea580c',
                bgcolor: 'rgba(249,115,22,0.04)'
              }
            }} 
            onClick={handleDirectionsClick}
          >
            Directions
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<LuWallet size={12} />}
            sx={{ 
              flex: 1, 
              height: '38px',
              fontSize: '0.75rem', 
              fontWeight: 700, 
              textTransform: 'none', 
              color: '#f97316', 
              borderColor: '#f97316', 
              borderRadius: '8px',
              px: 0.5,
              '&:hover': {
                borderColor: '#ea580c',
                bgcolor: 'rgba(249,115,22,0.04)'
              }
            }} 
            onClick={handlePayClick}
          >
            Pay
          </Button>
          <Button 
            size="small" 
            variant="contained" 
            startIcon={<LuEye size={12} />}
            sx={{ 
              flex: 1, 
              height: '38px',
              fontSize: '0.75rem', 
              fontWeight: 800, 
              textTransform: 'none', 
              bgcolor: '#f97316', 
              color: '#fff', 
              boxShadow: 'none', 
              borderRadius: '8px', 
              px: 0.5,
              '&:hover': { 
                bgcolor: '#ea580c',
                boxShadow: 'none'
              } 
            }}
            onClick={handleViewClick}
          >
            View
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
