import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Button } from '@mui/material';
import { useLocation, calculateDistance } from '../context/LocationContext';
import TriIcon from '../../../components/ui/TriIcon';
import fallbackImg from '../../../images/fallback_img.png';

export default function NearbyStoreCard({ store, compact = false, sx = {} }) {
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
    navigate(`/consumer-ecommerce/shop/${targetId}?mode=nearby-delivery`);
  };

  const handleViewDetail = () => {
    navigate(`/consumer-ecommerce/shop/${targetId}?mode=nearby-delivery`);
  };

  return (
    <Box 
      onClick={handleViewDetail}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFFFFF',
        borderRadius: '20px', // Standardized: 20px Card Radius
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        mb: compact ? 0 : 3,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 10px 30px rgba(255, 122, 0, 0.04), 0 2px 8px rgba(0,0,0,0.02)', // Soft premium shadow
        '&:hover': {
          borderColor: '#FF7A00',
          boxShadow: '0 12px 28px rgba(255, 122, 0, 0.08)',
          transform: 'translateY(-2px)'
        },
        ...sx
      }}
    >
      {/* Top: Image Section */}
      <Box sx={{ width: '100%', height: compact ? 110 : 160, overflow: 'hidden', position: 'relative', bgcolor: '#F8F9FB' }}>
        <img 
          src={store.image || fallbackImg} 
          alt={store.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => { e.target.src = fallbackImg; }}
        />
        {/* Distance Badge */}
        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          bgcolor: 'rgba(15, 23, 42, 0.8)', 
          color: '#FFFFFF', 
          px: 1.2, 
          py: 0.4, 
          borderRadius: '20px', 
          fontSize: '10px', 
          fontWeight: 800,
          backdropFilter: 'blur(4px)',
          fontFamily: '"Inter", sans-serif'
        }}>
          {displayDistance}
        </Box>
      </Box>

      {/* Bottom: Details & Actions */}
      <Box sx={{ p: compact ? 1.5 : 2 }}>
        {/* Name and Rating */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5, gap: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: compact ? '14px' : '16px', color: '#1E293B', lineHeight: 1.3, fontFamily: '"Inter", sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
            {store.name}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.3} sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#D97706', px: 0.8, py: 0.2, borderRadius: '6px', flexShrink: 0 }}>
            <TriIcon name="star" size={12} sx={{ fill: '#D97706', color: '#D97706' }} />
            <Typography sx={{ fontSize: '10px', fontWeight: 800, fontFamily: '"Inter", sans-serif' }}>{store.rating || '4.5'}</Typography>
          </Stack>
        </Stack>

        {/* Category & Status */}
        <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 0.5 }}>
          <Typography sx={{ fontSize: compact ? '11px' : '12px', color: '#64748B', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
            {store.category || 'Retail Store'}
          </Typography>
          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#CBD5E1' }} />
          <Typography sx={{ fontSize: compact ? '11px' : '12px', color: '#22C55E', fontWeight: 700, fontFamily: '"Inter", sans-serif' }}>
            {store.status || 'Open Now'}
          </Typography>
        </Stack>

        {/* Location / Area display */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: compact ? 1 : 1.5, color: '#64748B' }}>
          <TriIcon name="location_on" size={12} color="#FF7A00" />
          <Typography sx={{ fontSize: compact ? '11px' : '12px', fontWeight: 500, fontFamily: '"Inter", sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {store.location || 'Indiranagar, Bangalore'}
          </Typography>
        </Stack>

        {/* Cashback Badge & Tags */}
        <Stack direction="row" spacing={0.8} sx={{ mb: compact ? 0 : 2, flexWrap: 'wrap', gap: 0.5 }}>
          <Box sx={{ bgcolor: 'rgba(255, 122, 0, 0.08)', color: '#FF7A00', px: 1, py: 0.5, borderRadius: '8px', fontSize: '9px', fontWeight: 800, fontFamily: '"Inter", sans-serif' }}>
            5% Cashback
          </Box>
          {!compact && (
            <>
              {store.homeDeliveryEnabled && (
                <Box 
                  sx={{ 
                    bgcolor: store.isDeliveryAvailable ? 'rgba(34, 197, 94, 0.08)' : '#F8F9FB', 
                    color: store.isDeliveryAvailable ? '#22C55E' : '#64748B', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: '8px', 
                    fontSize: '10px', 
                    fontWeight: 700, 
                    fontFamily: '"Inter", sans-serif' 
                  }}
                >
                  {store.isDeliveryAvailable ? 'Home Delivery' : 'Delivery Out of Range'}
                </Box>
              )}
              <Box sx={{ bgcolor: '#F8F9FB', color: '#475569', px: 1, py: 0.5, borderRadius: '8px', fontSize: '10px', fontWeight: 700, fontFamily: '"Inter", sans-serif' }}>
                Pickup
              </Box>
            </>
          )}
        </Stack>

        {/* 4-Button Footer Row (Standardized with 2 variants: Primary contained, Secondary outlined, 38px height) */}
        {!compact && (
          <Stack direction="row" spacing={0.8} sx={{ width: '100%' }}>
            <Button 
              size="small" 
              variant="outlined" 
              startIcon={<TriIcon name="call" size={14} />}
              sx={{ 
                flex: 1, 
                minWidth: 0,
                height: '38px',
                fontSize: '11px', 
                fontWeight: 700, 
                textTransform: 'none', 
                color: '#FF7A00', 
                borderColor: '#FF7A00', 
                borderWidth: '1.5px',
                borderRadius: '12px',
                px: 0,
                '& .MuiButton-startIcon': { mr: 0.3, ml: 0 },
                '&:hover': {
                  borderColor: '#E06B00',
                  borderWidth: '1.5px',
                  bgcolor: 'rgba(255, 122, 0, 0.04)'
                }
              }} 
              onClick={handleCallClick}
            >
              Call
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              startIcon={<TriIcon name="near_me" size={14} />}
              sx={{ 
                flex: 1, 
                minWidth: 0,
                height: '38px',
                fontSize: '11px', 
                fontWeight: 700, 
                textTransform: 'none', 
                color: '#FF7A00', 
                borderColor: '#FF7A00', 
                borderWidth: '1.5px',
                borderRadius: '12px',
                px: 0,
                '& .MuiButton-startIcon': { mr: 0.3, ml: 0 },
                '&:hover': {
                  borderColor: '#E06B00',
                  borderWidth: '1.5px',
                  bgcolor: 'rgba(255, 122, 0, 0.04)'
                }
              }} 
              onClick={handleDirectionsClick}
            >
              Go
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              startIcon={<TriIcon name="account_balance_wallet" size={14} />}
              sx={{ 
                flex: 1, 
                minWidth: 0,
                height: '38px',
                fontSize: '11px', 
                fontWeight: 700, 
                textTransform: 'none', 
                color: '#FF7A00', 
                borderColor: '#FF7A00', 
                borderWidth: '1.5px',
                borderRadius: '12px',
                px: 0,
                '& .MuiButton-startIcon': { mr: 0.3, ml: 0 },
                '&:hover': {
                  borderColor: '#E06B00',
                  borderWidth: '1.5px',
                  bgcolor: 'rgba(255, 122, 0, 0.04)'
                }
              }} 
              onClick={handlePayClick}
            >
              Pay
            </Button>
            <Button 
              size="small" 
              variant="contained" 
              startIcon={<TriIcon name="visibility" size={14} />}
              sx={{ 
                flex: 1, 
                minWidth: 0,
                height: '38px',
                fontSize: '11px', 
                fontWeight: 800, 
                textTransform: 'none', 
                bgcolor: '#FF7A00', 
                color: '#FFFFFF', 
                boxShadow: 'none', 
                borderRadius: '12px', 
                px: 0,
                '& .MuiButton-startIcon': { mr: 0.3, ml: 0 },
                '&:hover': { 
                  bgcolor: '#E06B00',
                  boxShadow: 'none'
                } 
              }}
              onClick={handleViewClick}
            >
              View
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
