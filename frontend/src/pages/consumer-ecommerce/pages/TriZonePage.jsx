import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Stack, Typography, Grid, Button } from '@mui/material';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import TriIcon from '../../../components/ui/TriIcon.jsx';
import TriCard from '../../../components/ui/TriCard.jsx';
import '../consumerEcommerce.css';

const featuredServices = [
  { label: 'Top Picks', icon: 'thumb_up', tone: 'orange' },
  { label: 'Tri Services', icon: 'local_shipping', tone: 'orange' },
  { label: 'Daily Needs', icon: 'shopping_basket', tone: 'orange' },
  { label: 'Finance', icon: 'payments', tone: 'orange' },
  { label: 'Community', icon: 'groups', tone: 'orange' },
];

const allServices = [
  { title: 'Tri Pay', desc: 'Secure payments & utility bills', icon: 'account_balance_wallet', to: '/consumer-ecommerce/tripay' },
  { title: 'Tri Delivery', desc: 'Fast local logistics & couriers', icon: 'local_shipping', to: '/consumer-ecommerce/tripickdrop' },
  { title: 'Tri Eat', desc: 'Fresh food delivered from restaurants', icon: 'restaurant', to: '/consumer-ecommerce/trieat' },
  { title: 'Tri Travel', desc: 'Instant ride & ticket booking', icon: 'directions_car', to: '/consumer-ecommerce/tritrip' },
  { title: 'Tri Health', desc: 'Medicines & virtual diagnostics', icon: 'medical_services', to: '/consumer-ecommerce/delivery' },
  { title: 'Tri Education', desc: 'Online classes, courses & skills', icon: 'school', to: '/consumer-ecommerce/delivery' },
];

const exploreCategories = [
  { label: 'Fashion', icon: 'apparel' },
  { label: 'Electronics', icon: 'devices' },
  { label: 'Home Decor', icon: 'home' },
  { label: 'Beauty', icon: 'content_cut' },
  { label: 'Sports', icon: 'fitness_center' },
  { label: 'More', icon: 'grid_view' },
];

const recentlyUsed = [
  { title: 'Tri Pay', icon: 'account_balance_wallet', time: '2 hours ago', to: '/consumer-ecommerce/tripay' },
  { title: 'Tri Eat', icon: 'restaurant', time: 'Yesterday', to: '/consumer-ecommerce/trieat' },
];

export default function TriZonePage() {
  return (
    <div className="ce-app ce-zone-page" style={{ paddingTop: 0, minHeight: '100vh', backgroundColor: '#F8F9FB', pb: 10 }}>
      {/* Reusable Hero Header style matching Home (without quick services) */}
      <Header mode="home" showQuickServices={false} />

      {/* Main Container */}
      <Box sx={{ maxWidth: '430px', margin: '0 auto', width: '100%', px: 2, pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Section 1: Featured Services (Top row buttons) */}
        <Box>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Featured Services
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            {featuredServices.map((service) => (
              <Box
                key={service.label}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '72px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Box
                  sx={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '16px',
                    bgcolor: '#FFFFFF',
                    color: '#FF7A00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.04)',
                    border: '1px solid #E2E8F0',
                    mb: 1,
                    transition: 'all 0.15s',
                    '&:active': { transform: 'scale(0.9)' }
                  }}
                >
                  <TriIcon name={service.icon} size={24} color="#FF7A00" />
                </Box>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#475569', textAlign: 'center', fontFamily: '"Inter", sans-serif' }}>
                  {service.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Section 2: All Services Grid */}
        <Box>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            All Services
          </Typography>
          <Grid container spacing={2}>
            {allServices.map((service) => (
              <Grid item xs={6} key={service.title}>
                <TriCard
                  noPadding
                  component={Link}
                  to={service.to}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    height: '100%',
                    textDecoration: 'none',
                    bgcolor: '#FFFFFF',
                    borderRadius: '20px', // standard card border radius
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(255, 122, 0, 0.02)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: '#FF7A00',
                      boxShadow: '0 8px 24px rgba(255, 122, 0, 0.06)'
                    }
                  }}
                >
                  <Box sx={{ color: '#FF7A00', mb: 1.5 }}>
                    <TriIcon name={service.icon} size={28} />
                  </Box>
                  <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', mb: 0.5, fontFamily: '"Inter", sans-serif' }}>
                    {service.title}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 500, fontFamily: '"Inter", sans-serif', lineHeight: 1.3 }}>
                    {service.desc}
                  </Typography>
                </TriCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Section 3: Explore Categories */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Explore Categories
            </Typography>
            <Link to="/consumer-ecommerce/delivery" style={{ fontSize: '12px', fontWeight: 700, color: '#FF7A00', textDecoration: 'none' }}>
              View All
            </Link>
          </Stack>
          <Grid container spacing={1.5}>
            {exploreCategories.map((c) => (
              <Grid item xs={4} key={c.label}>
                <Box
                  component={Link}
                  to="/consumer-ecommerce/delivery"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1.5,
                    bgcolor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    '&:active': { transform: 'scale(0.95)' }
                  }}
                >
                  <TriIcon name={c.icon} size={22} color="#64748B" sx={{ mb: 0.8 }} />
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#475569', textAlign: 'center', fontFamily: '"Inter", sans-serif' }}>
                    {c.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Section 4: Recently Used */}
        <Box>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Recently Used
          </Typography>
          <Stack spacing={1.5}>
            {recentlyUsed.map((item) => (
              <Stack
                key={item.title}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                component={Link}
                to={item.to}
                sx={{
                  bgcolor: '#FFFFFF',
                  borderRadius: '16px',
                  p: 1.5,
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none'
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ bgcolor: 'rgba(255, 122, 0, 0.08)', color: '#FF7A00', width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContext: 'center' }}>
                    <TriIcon name={item.icon} size={20} sx={{ m: 'auto' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', fontFamily: '"Inter", sans-serif' }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500, fontFamily: '"Inter", sans-serif' }}>
                      {item.time}
                    </Typography>
                  </Box>
                </Stack>
                <TriIcon name="arrow_forward_ios" size={14} color="#94A3B8" />
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Section 5: Recommended (Special Offer) */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Recommended Offers
          </Typography>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
              borderRadius: '20px',
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1.5px solid #FED7AA',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(255, 122, 0, 0.05)'
            }}
          >
            <Box sx={{ flex: 1.2, zIndex: 1 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 800, color: '#EA580C', fontFamily: '"Inter", sans-serif', textTransform: 'uppercase', letterSpacing: '0.8px', mb: 0.5 }}>
                Special Offer
              </Typography>
              <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#9A3412', fontFamily: '"Inter", sans-serif', lineHeight: 1.2 }}>
                Up to 60% Off
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#C2410C', fontFamily: '"Inter", sans-serif', mt: 0.5, mb: 2 }}>
                On top delivery services this week
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/consumer-ecommerce/delivery"
                sx={{
                  bgcolor: '#FF7A00',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  px: 2.5,
                  py: 0.8,
                  fontSize: '11px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(255, 122, 0, 0.25)',
                  '&:hover': { bgcolor: '#E06B00' }
                }}
              >
                Explore Now
              </Button>
            </Box>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=320&q=80"
              alt="Gift box"
              sx={{ width: '100px', height: '100px', objectFit: 'contain', zIndex: 1 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </Box>
        </Box>

      </Box>

      <BottomNav />
    </div>
  );
}
