import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Button } from '@mui/material';
import { LuMapPin, LuStar } from 'react-icons/lu';

export default function NearbyStoreCard({ store }) {
  const navigate = useNavigate();
  const targetId = store.shopId || store.id;

  return (
    <Box 
      onClick={() => navigate(`/consumer-ecommerce/shop/${targetId}`)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        mb: 2.5,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        '&:hover': {
          borderColor: '#f97316',
          boxShadow: '0 8px 24px rgba(249,115,22,0.12)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Top: Full-width Image */}
      <Box sx={{
        width: '100%',
        height: 180,
        overflow: 'hidden',
        position: 'relative',
        bgcolor: '#f1f5f9'
      }}>
        <img 
          src={store.image} 
          alt={store.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        {/* Distance Badge */}
        <Box sx={{ 
          position: 'absolute', 
          top: 12, 
          right: 12, 
          bgcolor: 'rgba(15, 23, 42, 0.75)', 
          color: '#fff', 
          px: 1.5, 
          py: 0.5, 
          borderRadius: '20px', 
          fontSize: '0.75rem', 
          fontWeight: 700,
          backdropFilter: 'blur(4px)'
        }}>
          {store.distance || '1.2 Km'}
        </Box>
      </Box>

      {/* Bottom: Details & Actions */}
      <Box sx={{ p: 2.5 }}>
        {/* Name and Rating */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', lineHeight: 1.25, pr: 2 }}>
            {store.name}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', px: 1, py: 0.25, borderRadius: '8px' }}>
            <LuStar size={14} style={{ fill: '#d97706' }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 800 }}>{store.rating || '4.5'}</Typography>
          </Stack>
        </Stack>

        {/* Category & Status */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            {store.category || 'Retail Store'}
          </Typography>
          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
          <Typography sx={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
            Open now
          </Typography>
        </Stack>

        {/* Location / Address */}
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 2, color: '#64748b' }}>
          <LuMapPin size={16} color="#f97316" />
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {store.location}
          </Typography>
        </Stack>

        {/* Cashback Badge */}
        <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
          <Box sx={{ bgcolor: 'rgba(249, 115, 22, 0.1)', color: '#f97316', px: 1.5, py: 0.5, borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
            5% Cashback on Offline Pay
          </Box>
        </Stack>

        {/* 4-Button Footer Row */}
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <Button 
            size="medium" 
            variant="outlined" 
            sx={{ 
              flex: 1, 
              py: 1, 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              textTransform: 'none', 
              color: '#f97316', 
              borderColor: '#f97316', 
              borderRadius: '10px',
              '&:hover': {
                borderColor: '#ea580c',
                bgcolor: 'rgba(249,115,22,0.04)'
              }
            }} 
            onClick={(e) => { 
              e.stopPropagation(); 
              const phone = store.phone || '08040404040';
              window.open(`tel:${phone}`);
            }}
          >
            Call
          </Button>
          <Button 
            size="medium" 
            variant="outlined" 
            sx={{ 
              flex: 1, 
              py: 1, 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              textTransform: 'none', 
              color: '#f97316', 
              borderColor: '#f97316', 
              borderRadius: '10px',
              '&:hover': {
                borderColor: '#ea580c',
                bgcolor: 'rgba(249,115,22,0.04)'
              }
            }} 
            onClick={(e) => { 
              e.stopPropagation(); 
              navigate(`/consumer-ecommerce/shop/${targetId}/payment`);
            }}
          >
            Pay
          </Button>
          <Button 
            size="medium" 
            variant="outlined" 
            sx={{ 
              flex: 1, 
              py: 1, 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              textTransform: 'none', 
              color: '#f97316', 
              borderColor: '#f97316', 
              borderRadius: '10px',
              '&:hover': {
                borderColor: '#ea580c',
                bgcolor: 'rgba(249,115,22,0.04)'
              }
            }} 
            onClick={(e) => { 
              e.stopPropagation(); 
              alert('Standard delivery: 30-45 mins to your location.');
            }}
          >
            Delivery
          </Button>
          <Button 
            size="medium" 
            variant="contained" 
            sx={{ 
              flex: 1, 
              py: 1, 
              fontSize: '0.8rem', 
              fontWeight: 800, 
              textTransform: 'none', 
              bgcolor: '#f97316', 
              color: '#fff', 
              boxShadow: 'none', 
              borderRadius: '10px', 
              '&:hover': { 
                bgcolor: '#ea580c',
                boxShadow: 'none'
              } 
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/consumer-ecommerce/shop/${targetId}`);
            }}
          >
            View
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
