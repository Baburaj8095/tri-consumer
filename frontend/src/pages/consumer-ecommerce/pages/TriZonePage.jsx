import React from 'react';
import { Box, Stack, Typography, Grid, Button, InputBase, IconButton } from '@mui/material';
import BottomNav from '../components/BottomNav.jsx';
import TriIcon from '../../../components/ui/TriIcon.jsx';
import '../consumerEcommerce.css';

// Exactly 9 Services for a clean 3x3 grid (equal size/height)
const services = [
  { title: 'Top Picks', desc: 'Recommended choice', icon: 'thumb_up' },
  { title: 'Tri Services', desc: 'Local logistics', icon: 'local_shipping' },
  { title: 'Daily Needs', desc: 'Grocery essentials', icon: 'shopping_basket' },
  { title: 'Finance', desc: 'Business & pay', icon: 'business_center' },
  { title: 'Community', desc: 'Society forums', icon: 'favorite' },
  { title: 'Tri Pay', desc: 'Secure payments', icon: 'payments' },
  { title: 'Tri Delivery', desc: 'Fast delivery', icon: 'local_shipping' },
  { title: 'Tri Eat', desc: 'Order food', icon: 'restaurant' },
  { title: 'Tri Travel', desc: 'Book tickets', icon: 'directions_bus' },
];

export default function TriZonePage() {
  const handleCardClick = (e, label) => {
    e.preventDefault();
    alert(`"${label}" is Coming Soon!`);
  };

  return (
    <div className="ce-app ce-zone-page" style={{ paddingTop: 0, minHeight: '100vh', backgroundColor: '#F8F9FB', paddingBottom: '90px' }}>
      
      {/* Custom Header matching screenshot */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF9E44 0%, #FF7A00 100%)',
          pt: 4,
          pb: 3,
          px: 2.5,
          color: '#FFFFFF',
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
          boxShadow: '0 6px 20px rgba(255, 122, 0, 0.12)',
          maxWidth: '430px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2.5 }}>
          <Box>
            <Typography sx={{ fontSize: '20px', fontWeight: 800, fontFamily: '"Inter", sans-serif', color: '#FFFFFF', lineHeight: 1.2 }}>
              Tri Zone
            </Typography>
            <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>
              Everything you need, in one place
            </Typography>
          </Box>
          <IconButton sx={{ color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.12)', width: 38, height: 38, borderRadius: '10px' }}>
            <TriIcon name="notifications" size={20} />
          </IconButton>
        </Stack>

        {/* Search Bar inside Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#FFFFFF', borderRadius: '24px', px: 2, py: 1 }}>
          <TriIcon name="search" size={20} color="#64748B" sx={{ mr: 1.5 }} />
          <InputBase
            placeholder="Search services, products & more"
            sx={{
              flex: 1,
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: '"Inter", sans-serif',
              color: '#1E293B',
              '&::placeholder': { color: '#94A3B8', opacity: 1 }
            }}
          />
          <TriIcon name="mic" size={20} color="#64748B" />
        </Box>
      </Box>

      {/* Main Grid Container */}
      <Box sx={{ maxWidth: '430px', margin: '0 auto', width: '100%', px: 2, pt: 3.5, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        
        {/* Section: All Services Headline */}
        <Box>
          <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 2 }}>
            All Services
          </Typography>

          {/* Unified 3x3 Grid: 3 columns, 9 equal square cards */}
          <Grid container spacing={1.5}>
            {services.map((service) => (
              <Grid item xs={4} key={service.title}>
                <Box
                  onClick={(e) => handleCardClick(e, service.title)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '115px',
                    bgcolor: '#FFFFFF',
                    borderRadius: '20px', // Standard: 20px Card Radius
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease-in-out',
                    '&:hover': {
                      borderColor: '#FF7A00',
                      boxShadow: '0 6px 16px rgba(255,122,0,0.06)'
                    },
                    '&:active': { transform: 'scale(0.95)' }
                  }}
                >
                  <Box sx={{ color: '#FF7A00', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TriIcon name={service.icon} size={24} />
                  </Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 800, color: '#334155', textAlign: 'center', fontFamily: '"Inter", sans-serif', px: 0.5, lineHeight: 1.2 }}>
                    {service.title}
                  </Typography>
                  <Typography sx={{ fontSize: '9px', color: '#94A3B8', fontWeight: 600, textAlign: 'center', fontFamily: '"Inter", sans-serif', px: 0.5, mt: 0.2, lineHeight: 1.2 }}>
                    {service.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

      </Box>

      <BottomNav />
    </div>
  );
}



