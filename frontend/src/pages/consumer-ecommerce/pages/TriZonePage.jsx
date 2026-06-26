import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Stack, Typography, Grid, Button } from '@mui/material';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import TriIcon from '../../../components/ui/TriIcon.jsx';
import '../consumerEcommerce.css';

// Segmented Service Definitions
const featuredServices = [
  { title: 'Tri Pay', desc: 'Secure payments & bills', icon: 'payments', to: '/consumer-ecommerce/tripay', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=360&q=80', badge: 'Popular' },
  { title: 'Tri Eat', desc: 'Fresh food delivery', icon: 'restaurant', to: '/consumer-ecommerce/trieat', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=360&q=80', badge: 'Hot' },
  { title: 'Tri Drop', desc: 'Local logistics & couriers', icon: 'local_shipping', to: '/consumer-ecommerce/tripickdrop', image: 'https://images.unsplash.com/photo-1580907115718-4ad3328d894a?auto=format&fit=crop&w=360&q=80', badge: '20 Min' },
  { title: 'Tri Travel', desc: 'Ride & ticket booking', icon: 'directions_car', to: '/consumer-ecommerce/tritrip', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=360&q=80' },
];

const popularServices = [
  { title: 'Daily Needs', desc: 'Everyday grocery essentials', icon: 'shopping_basket', to: '/consumer-ecommerce/delivery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80' },
  { title: 'Society Home', desc: 'Civic forums & management', icon: 'groups', to: '/consumer-ecommerce/society', image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=360&q=80' },
];

const financeServices = [
  { title: 'Pay Utility Bills', desc: 'Electricity, water, gas & broadband', icon: 'account_balance', to: '/consumer-ecommerce/tripay' },
  { title: 'Mobile Recharge', desc: 'Prepaid plans & postpaid bills', icon: 'smartphone', to: '/consumer-ecommerce/tripay' },
  { title: 'Send Money', desc: 'Instant bank to bank transfer', icon: 'swap_horiz', to: '/consumer-ecommerce/tripay' },
];

const deliveryServices = [
  { title: 'Restaurant Food', desc: 'Order from top nearby restaurants', icon: 'restaurant', to: '/consumer-ecommerce/trieat' },
  { title: 'Grocery Delivery', desc: 'Fresh fruits, veggies & staples', icon: 'shopping_cart', to: '/consumer-ecommerce/delivery' },
  { title: 'Express Courier', desc: 'Send documents & parcels instantly', icon: 'send', to: '/consumer-ecommerce/tripickdrop' },
];

const healthcareServices = [
  { title: 'Buy Medicines', desc: 'Up to 20% off on prescriptions', icon: 'medical_services', to: '/consumer-ecommerce/delivery' },
  { title: 'Consult Doctor', desc: 'Chat with qualified specialists', icon: 'chat', to: '/consumer-ecommerce/delivery' },
  { title: 'Lab Tests', desc: 'Free home sample collection', icon: 'science', to: '/consumer-ecommerce/delivery' },
];

const educationServices = [
  { title: 'Skill Classes', desc: 'Coding, design, languages & crafts', icon: 'school', to: '/consumer-ecommerce/delivery' },
  { title: 'Pay School Fees', desc: 'Quick school & college tuition', icon: 'receipt_long', to: '/consumer-ecommerce/tripay' },
  { title: 'Competitions', desc: 'Participate & win exciting scholarships', icon: 'emoji_events', to: '/consumer-ecommerce/delivery' },
];

const communityServices = [
  { title: 'Society Forums', desc: 'Discuss issues with neighbors', icon: 'forum', to: '/consumer-ecommerce/society' },
  { title: 'Local Events', desc: 'Festivals & sports near you', icon: 'event', to: '/consumer-ecommerce/society' },
  { title: 'Volunteer Groups', desc: 'Join civic welfare campaigns', icon: 'volunteer_activism', to: '/consumer-ecommerce/society' },
];

const governmentServices = [
  { title: 'Civic Requests', desc: 'Garbage, streetlight & road requests', icon: 'gavel', to: '/consumer-ecommerce/society' },
  { title: 'Property Tax', desc: 'Pay municipal dues securely', icon: 'account_balance_wallet', to: '/consumer-ecommerce/tripay' },
  { title: 'Certificates', desc: 'Apply for birth, death & residency docs', icon: 'assignment', to: '/consumer-ecommerce/society' },
];

const recentlyUsed = [
  { title: 'Tri Pay', icon: 'payments', time: '2 hours ago', to: '/consumer-ecommerce/tripay' },
  { title: 'Tri Eat', icon: 'restaurant', time: 'Yesterday', to: '/consumer-ecommerce/trieat' },
];

function ServiceIllustrationCard({ title, desc, icon, to, image, badge }) {
  return (
    <Box
      component={Link}
      to={to}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        textDecoration: 'none',
        bgcolor: '#FFFFFF',
        borderRadius: '20px', // Standard: 20px Card Radius
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(255, 122, 0, 0.02)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#FF7A00',
          boxShadow: '0 8px 24px rgba(255, 122, 0, 0.08)'
        }
      }}
    >
      <Box sx={{ width: '100%', height: 110, position: 'relative', bgcolor: '#FFF5E6' }}>
        <img 
          src={image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80'} 
          alt={title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        {badge && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#EF4444', color: '#FFFFFF', fontSize: '9px', fontWeight: 850, px: 1, py: 0.25, borderRadius: '6px', fontFamily: '"Inter", sans-serif', textTransform: 'uppercase' }}>
            {badge}
          </Box>
        )}
      </Box>
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '13px', color: '#1E293B', mb: 0.5, fontFamily: '"Inter", sans-serif' }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 500, fontFamily: '"Inter", sans-serif', lineHeight: 1.3 }}>
          {desc}
        </Typography>
      </Box>
    </Box>
  );
}

function ServiceTextCard({ title, desc, icon, to }) {
  return (
    <Box
      component={Link}
      to={to}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        bgcolor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        textDecoration: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: '#FF7A00',
          boxShadow: '0 4px 12px rgba(255, 122, 0, 0.04)'
        }
      }}
    >
      <Box 
        sx={{ 
          width: 42, 
          height: 42, 
          borderRadius: '12px', 
          bgcolor: 'rgba(255, 122, 0, 0.08)', 
          color: '#FF7A00', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <TriIcon name={icon} size={20} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '12px', color: '#1E293B', fontFamily: '"Inter", sans-serif' }} noWrap>
          {title}
        </Typography>
        <Typography sx={{ fontSize: '10px', color: '#64748B', fontWeight: 500, fontFamily: '"Inter", sans-serif' }} noWrap>
          {desc}
        </Typography>
      </Box>
    </Box>
  );
}

export default function TriZonePage() {
  return (
    <div className="ce-app ce-zone-page" style={{ paddingTop: 0, minHeight: '100vh', backgroundColor: '#F8F9FB', paddingBottom: '90px' }}>
      {/* Loaded Compact Hero Header variant */}
      <Header mode="compact" />

      {/* Main Container with strictly verified spacings: 16px section bottom, 12px title bottom */}
      <Box sx={{ maxWidth: '430px', margin: '0 auto', width: '100%', px: 2, pt: 3, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        
        {/* Segment 1: Featured Services */}
        <Box>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Featured Services
          </Typography>
          <Grid container spacing={2}>
            {featuredServices.map((service) => (
              <Grid item xs={6} key={service.title}>
                <ServiceIllustrationCard {...service} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Segment 2: Popular Services */}
        <Box sx={{ mt: -0.5 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Popular Services
          </Typography>
          <Grid container spacing={2}>
            {popularServices.map((service) => (
              <Grid item xs={6} key={service.title}>
                <ServiceIllustrationCard {...service} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Segment 3: Finance */}
        <Box sx={{ mt: -0.5 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Finance & Payments
          </Typography>
          <Stack spacing={1.2}>
            {financeServices.map((service) => (
              <ServiceTextCard key={service.title} {...service} />
            ))}
          </Stack>
        </Box>

        {/* Segment 4: Delivery */}
        <Box sx={{ mt: -0.5 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Delivery & Food
          </Typography>
          <Stack spacing={1.2}>
            {deliveryServices.map((service) => (
              <ServiceTextCard key={service.title} {...service} />
            ))}
          </Stack>
        </Box>

        {/* Segment 5: Healthcare */}
        <Box sx={{ mt: -0.5 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Healthcare & Diagnostics
          </Typography>
          <Stack spacing={1.2}>
            {healthcareServices.map((service) => (
              <ServiceTextCard key={service.title} {...service} />
            ))}
          </Stack>
        </Box>

        {/* Segment 6: Education */}
        <Box sx={{ mt: -0.5 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Education & Learning
          </Typography>
          <Stack spacing={1.2}>
            {educationServices.map((service) => (
              <ServiceTextCard key={service.title} {...service} />
            ))}
          </Stack>
        </Box>

        {/* Segment 7: Community */}
        <Box sx={{ mt: -0.5 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Community & Neighborhood
          </Typography>
          <Stack spacing={1.2}>
            {communityServices.map((service) => (
              <ServiceTextCard key={service.title} {...service} />
            ))}
          </Stack>
        </Box>

        {/* Segment 8: Government */}
        <Box sx={{ mt: -0.5 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Government & Civic
          </Typography>
          <Stack spacing={1.2}>
            {governmentServices.map((service) => (
              <ServiceTextCard key={service.title} {...service} />
            ))}
          </Stack>
        </Box>

        {/* Segment 9: Recently Used */}
        <Box sx={{ mt: -0.5 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Recently Used
          </Typography>
          <Stack spacing={1.2}>
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
                  borderRadius: '20px',
                  p: 1.5,
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#FF7A00' }
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ bgcolor: 'rgba(255, 122, 0, 0.08)', color: '#FF7A00', width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TriIcon name={item.icon} size={20} />
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

        {/* Segment 10 & 11: Recommended & Special Offers */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
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

