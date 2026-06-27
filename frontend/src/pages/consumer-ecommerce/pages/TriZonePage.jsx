import React from 'react';
import { Box, Stack, Typography, Button, IconButton } from '@mui/material';
import TriIcon from '../../../components/ui/TriIcon.jsx';
import TriAppShell from '../../../components/ui/TriAppShell.jsx';
import Header from '../components/Header.jsx';
import giftBoxPromo from '../../../images/gift_box_promo.png';
import '../consumerEcommerce.css';

const recentlyUsed = [
  { name: 'Tri Pay', icon: 'wallet', color: '#FF7A00', bg: '#FFEFE0' },
  { name: 'Tri Delivery', icon: 'local_shipping', color: '#16A34A', bg: '#E8F5E9' },
  { name: 'Hotels', icon: 'hotel', color: '#0284C7', bg: '#E0F2FE' },
  { name: 'Restaurants', icon: 'restaurant', color: '#DB2777', bg: '#FCE4EC' },
  { name: 'Finance', icon: 'payments', color: '#7C3AED', bg: '#F3E8FF' }
];

const topPicks = [
  { title: 'Tri Pay', desc: 'Secure payments', icon: 'wallet', color: '#FF7A00' },
  { title: 'Tri Services', desc: 'Local services', icon: 'build', color: '#16A34A' },
  { title: 'Daily Needs', desc: 'Essentials', icon: 'shopping_basket', color: '#0284C7' },
  { title: 'Finance', desc: 'Business & pay', icon: 'payments', color: '#7C3AED' },
  { title: 'Community', desc: 'Society forums', icon: 'favorite', color: '#DC2626' },
  { title: 'Tri Delivery', desc: 'Fast delivery', icon: 'local_shipping', color: '#FF7A00' },
  { title: 'Tri Eat', desc: 'Order food', icon: 'restaurant', color: '#16A34A' },
  { title: 'Tri Travel', desc: 'Book tickets', icon: 'flight', color: '#0284C7' },
  { title: 'Tri Health', desc: 'Health services', icon: 'medical_services', color: '#16A34A' },
  { title: 'Tri Education', desc: 'Learn & grow', icon: 'school', color: '#7C3AED' },
  { title: 'Government', desc: 'Govt. services', icon: 'account_balance', color: '#FF7A00' },
  { title: 'More Services', desc: 'Explore more', icon: 'more_horiz', color: '#475569' }
];

const popularServices = [
  { name: 'Hotels', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=280&q=80' },
  { name: 'Salons', image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=280&q=80' },
  { name: 'Restaurants', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=280&q=80' },
  { name: 'Travel', image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=280&q=80' }
];

export default function TriZonePage() {
  const handleCardClick = (e, label) => {
    e.preventDefault();
    alert(`"${label}" is Coming Soon!`);
  };

  return (
    <TriAppShell bottomNavIndex={1}>
      <Header />

      {/* Main Grid Container */}
      <Box sx={{ maxWidth: '430px', margin: '0 auto', width: '100%', px: 2, pt: 2, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        
        {/* Recently Used Section */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Recently Used
            </Typography>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#FF7A00', cursor: 'pointer', fontFamily: '"Inter", sans-serif' }}>
              View all
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            {recentlyUsed.map((item) => (
              <Box
                key={item.name}
                onClick={(e) => handleCardClick(e, item.name)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '76px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  p: 1.2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                  '&:active': { transform: 'scale(0.95)' }
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: item.bg,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1
                  }}
                >
                  <TriIcon name={item.icon} size={20} />
                </Box>
                <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#334155', textAlign: 'center', fontFamily: '"Inter", sans-serif', whiteSpace: 'nowrap' }}>
                  {item.name}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Top Picks Section (3x4 equal grid) */}
        <Box>
          <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Top Picks
          </Typography>

          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: 1.5 
            }}
          >
            {topPicks.map((pick) => (
              <Box
                key={pick.title}
                onClick={(e) => handleCardClick(e, pick.title)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  maxWidth: '85px',
                  mx: 'auto',
                  height: '92px',
                  bgcolor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease-in-out',
                  '&:hover': {
                    borderColor: '#FF7A00',
                    boxShadow: '0 6px 16px rgba(255,122,0,0.06)'
                  },
                  '&:active': { transform: 'scale(0.95)' }
                }}
              >
                <Box sx={{ color: pick.color, mb: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TriIcon name={pick.icon} size={22} />
                </Box>
                <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#1E293B', textAlign: 'center', fontFamily: '"Inter", sans-serif', px: 0.5, lineHeight: 1.1 }}>
                  {pick.title}
                </Typography>
                <Typography sx={{ fontSize: '7.5px', color: '#94A3B8', fontWeight: 600, textAlign: 'center', fontFamily: '"Inter", sans-serif', px: 0.5, mt: 0.2, lineHeight: 1.1 }}>
                  {pick.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Promo Banner Card */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #FFF9F5 0%, #FFF0E6 100%)',
            borderRadius: '24px',
            p: 2.2,
            border: '1.5px solid #FFEBE0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 6px 18px rgba(255, 122, 0, 0.04)'
          }}
        >
          <Box sx={{ flex: 1, pr: 1.5 }}>
            <Stack direction="row" alignItems="baseline" spacing={0.5}>
              <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif' }}>
                Get up to
              </Typography>
              <Typography sx={{ fontSize: '17px', fontWeight: 900, color: '#FF7A00', fontFamily: '"Inter", sans-serif' }}>
                25% OFF
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '11px', color: '#64748B', fontFamily: '"Inter", sans-serif', fontWeight: 600, mb: 1.5 }}>
              on selected services
            </Typography>
            <Button
              sx={{
                bgcolor: '#FF7A00',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                px: 2,
                py: 0.6,
                borderRadius: '12px',
                textTransform: 'none',
                fontFamily: '"Inter", sans-serif',
                boxShadow: '0 4px 12px rgba(255, 122, 0, 0.2)',
                '&:hover': { bgcolor: '#E06A00' }
              }}
            >
              Explore Offers
            </Button>
          </Box>
          <Box
            component="img"
            src={giftBoxPromo}
            alt="Promo Offer"
            sx={{ width: 100, height: 100, objectFit: 'contain' }}
          />
        </Box>

        {/* Popular Services Section */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Popular Services
            </Typography>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#FF7A00', cursor: 'pointer', fontFamily: '"Inter", sans-serif' }}>
              View all
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            {popularServices.map((service) => (
              <Box
                key={service.name}
                sx={{
                  minWidth: '130px',
                  bgcolor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  p: 1,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  flexShrink: 0,
                  cursor: 'pointer'
                }}
              >
                <Box sx={{ width: '100%', height: '80px', borderRadius: '14px', overflow: 'hidden', mb: 1 }}>
                  <Box component="img" src={service.image} alt={service.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Typography sx={{ fontSize: '12px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', px: 0.5 }} noWrap>
                  {service.name}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

      </Box>

    </TriAppShell>
  );
}



