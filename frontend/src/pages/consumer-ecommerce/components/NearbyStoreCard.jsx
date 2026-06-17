import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Button } from '@mui/material';
import { LuMapPin, LuStar } from 'react-icons/lu';

export default function NearbyStoreCard({ store }) {
  const navigate = useNavigate();

  return (
    <Box 
      onClick={() => navigate(`/consumer-ecommerce/shop/${store.id}`)}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        bgcolor: '#fff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        p: 1.5,
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: '#0d9488',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }
      }}
    >
      {/* Left: Image */}
      <Box sx={{
        width: 100,
        minWidth: 100,
        height: 110,
        borderRadius: '12px',
        overflow: 'hidden',
        mr: 2,
        flexShrink: 0,
      }}>
        <img 
          src={store.image} 
          alt={store.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </Box>

      {/* Right: Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Name & Category */}
        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', lineHeight: 1.2, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {store.name}
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {store.category}
        </Typography>

        {/* Location */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1, color: '#64748b' }}>
          <LuMapPin size={14} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {store.location}
          </Typography>
        </Stack>

        {/* Stats Row */}
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: '4px 8px' }}>
          <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', px: 1, py: 0.25, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
            5% Cashback
          </Box>
          <Box sx={{ border: '1px solid #e2e8f0', px: 1, py: 0.25, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LuMapPin size={12} /> {store.distance || '1.2 Km'}
          </Box>
          <Box sx={{ border: '1px solid #e2e8f0', px: 1, py: 0.25, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {store.rating} <LuStar size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} /> (202)
          </Box>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={0.5} sx={{ mt: 'auto', flexWrap: 'wrap', gap: '6px' }}>
          <Button size="small" variant="outlined" sx={{ flex: '1 1 calc(50% - 4px)', minWidth: 0, py: 0.5, fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', color: '#0d9488', borderColor: '#0d9488', borderRadius: '8px' }} onClick={(e) => { e.stopPropagation(); alert('Calling shop...'); }}>
            Call
          </Button>
          <Button size="small" variant="outlined" sx={{ flex: '1 1 calc(50% - 4px)', minWidth: 0, py: 0.5, fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', color: '#0d9488', borderColor: '#0d9488', borderRadius: '8px' }} onClick={(e) => { e.stopPropagation(); alert('Opening payment...'); }}>
            Pay
          </Button>
          <Button size="small" variant="outlined" sx={{ flex: '1 1 calc(50% - 4px)', minWidth: 0, py: 0.5, fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', color: '#0d9488', borderColor: '#0d9488', borderRadius: '8px' }} onClick={(e) => { e.stopPropagation(); alert('Delivery options...'); }}>
            Delivery
          </Button>
          <Button size="small" variant="contained" sx={{ flex: '1 1 calc(50% - 4px)', minWidth: 0, py: 0.5, fontSize: '0.7rem', fontWeight: 800, textTransform: 'none', bgcolor: '#0d9488', color: '#fff', boxShadow: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#0b7a70' } }}>
            View
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
