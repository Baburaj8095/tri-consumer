import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, IconButton, Stack, Button, Divider } from '@mui/material';
import { 
  LuChevronLeft, LuPhone, LuMessageCircle, 
  LuMessageSquare, LuInfo, LuMapPin, LuStar, LuShare2 
} from 'react-icons/lu';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

export default function ShopDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);

  useEffect(() => {
    // We can fetch details or just use b2c merchants list and filter by ID
    axios.get(`${CAPTAIN_API_URL}/captain/merchants/b2c`)
      .then(res => {
        const found = res.data?.find(s => s.id.toString() === id);
        if (found) setShop(found);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!shop) return <Box p={4} textAlign="center">Loading...</Box>;

  const shopName = shop.shop_name || shop.business_name || shop.full_name || 'Store';
  const address = shop.address || shop.city || 'Local Area';

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 10 }}>
      {/* Header Bar */}
      <Box sx={{ bgcolor: '#fff', p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#0f172a' }}>
          <LuChevronLeft />
        </IconButton>
        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', flexGrow: 1 }}>{shopName}</Typography>
        <IconButton sx={{ color: '#0f172a' }}><LuShare2 /></IconButton>
      </Box>

      {/* Main Info */}
      <Box sx={{ p: 2, bgcolor: '#fff' }}>
        <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#0f172a', mb: 0.5 }}>{shopName}</Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Box sx={{ bgcolor: '#10b981', color: '#fff', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            4.1 <LuStar size={12} fill="#fff" />
          </Box>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>293 Ratings</Typography>
        </Stack>

        <Typography sx={{ fontSize: '0.85rem', color: '#475569', mb: 0.5 }}>{address} • 26 min • 8.4 km</Typography>
        <Typography sx={{ fontSize: '0.85rem', color: '#475569', mb: 2 }}>Diagnostic Centre • 25 Years in Healthcare</Typography>

        {/* Action Circles */}
        <Stack direction="row" justifyContent="space-around" sx={{ mb: 2 }}>
          {[
            { icon: <LuPhone />, label: 'Call', color: '#3b82f6' },
            { icon: <LuMessageCircle />, label: 'WhatsApp', color: '#22c55e' },
            { icon: <LuMessageSquare />, label: 'Ask Anything', color: '#8b5cf6' },
            { icon: <LuInfo />, label: 'Enquiry', color: '#f59e0b' },
            { icon: <LuMapPin />, label: 'Direction', color: '#64748b' },
          ].map((action, i) => (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => alert(`${action.label} clicked`)}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${action.color}`, color: action.color, display: 'grid', placeItems: 'center', fontSize: '1.2rem', transition: 'all 0.2s', '&:hover': { bgcolor: `${action.color}15` } }}>
                {action.icon}
              </Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>{action.label}</Typography>
            </Box>
          ))}
        </Stack>

        {/* Photos Horizontal Scroll */}
        <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
          {[1,2,3].map(i => (
            <Box key={i} sx={{ width: 140, minWidth: 140, height: 100, borderRadius: 2, overflow: 'hidden' }}>
              <img src={`https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=280&q=80`} alt="Shop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Summary Box */}
      <Box sx={{ p: 2, mt: 1 }}>
        <Box sx={{ bgcolor: '#fff', borderRadius: 3, p: 2, border: '1px solid #e2e8f0' }}>
          <Typography sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>Business Summary</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, mb: 1 }}>
            Diagnostic center offering comprehensive imaging services and accredited lab facilities for accurate results.
            <Typography component="span" sx={{ color: '#3b82f6', fontWeight: 600, ml: 1, cursor: 'pointer' }}>more</Typography>
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <LuMapPin size={18} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
              <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                {address}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <LuPhone size={18} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
              <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                {shop.phone || '080 4040 4040'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Sticky Bottom Actions */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#fff', p: 2, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 1 }}>
        <Button variant="contained" sx={{ flex: 1, bgcolor: '#3b82f6', textTransform: 'none', fontWeight: 800, borderRadius: 2 }}>Call Now</Button>
        <Button variant="contained" sx={{ flex: 1, bgcolor: '#0ea5e9', textTransform: 'none', fontWeight: 800, borderRadius: 2 }}>Enquire Now</Button>
        <Button variant="contained" sx={{ flex: 1, bgcolor: '#22c55e', textTransform: 'none', fontWeight: 800, borderRadius: 2 }}>WhatsApp</Button>
      </Box>
    </Box>
  );
}
