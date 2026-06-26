import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress, Grid, Button, Stack, IconButton } from '@mui/material';
import { LuSlidersHorizontal, LuChevronDown, LuLayoutGrid, LuSearch } from 'react-icons/lu';

import TriAppShell from '../../../components/ui/TriAppShell';
import Header from '../components/Header';
import TriProductCard from '../../../components/ui/TriProductCard';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';

// Visual category mappings matching the screenshot
const sidebarCategories = [
  { name: 'All', icon: '🍎', image: 'https://images.unsplash.com/photo-1610832958506-ee5633619144?auto=format&fit=crop&w=80&q=80' },
  { name: 'Electronics', icon: '💻', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=80&q=80' },
  { name: 'Fashion', icon: '👕', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=80&q=80' },
  { name: 'Grocery', icon: '👜', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80' },
  { name: 'Home & Kitchen', icon: '🍳', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=80&q=80' },
  { name: 'Beauty', icon: '🧴', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=80&q=80' },
  { name: 'Sports', icon: '🏋️', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=80&q=80' },
  { name: 'Books', icon: '📚', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=80&q=80' },
  { name: 'More', icon: '💬', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=80&q=80' },
];

function addToCart(product) {
  try {
    let cart = JSON.parse(localStorage.getItem('tri_consumer_cart') || '{"shopId":null,"shopName":"","items":[]}');
    if (cart.shopId && String(cart.shopId) !== String(product.shop_id)) {
      const confirmed = window.confirm(
        `Your cart has items from "${cart.shopName}". Starting a new cart will remove them. Continue?`
      );
      if (!confirmed) return false;
      cart = { shopId: product.shop_id, shopName: product.shop_name || 'Online Shop', items: [], orderChannel: 'ONLINE_DELIVERY' };
    }
    if (!cart.shopId) {
      cart.shopId = product.shop_id;
      cart.shopName = product.shop_name || 'Online Shop';
      cart.orderChannel = 'ONLINE_DELIVERY';
    }
    const existing = cart.items.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.items.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        mrp: product.mrp,
        image: product.image || product.image_url || FALLBACK_IMAGE,
        quantity: 1,
      });
    }
    localStorage.setItem('tri_consumer_cart', JSON.stringify(cart));
    return true;
  } catch (_) {
    return false;
  }
}

export default function DeliveryPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  const fetchProducts = useCallback((cat = '', q = '') => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 100, offset: 0 });
    if (cat && cat !== 'All') params.append('category', cat);
    if (q) params.append('search', q);

    axios.get(`${CAPTAIN_API_URL}/captain/shops/online/products?${params.toString()}`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : 
                     Array.isArray(res.data?.products) ? res.data.products : 
                     Array.isArray(res.data?.results) ? res.data.results : [];
        setProducts(data);
      })
      .catch(err => console.error('Failed to fetch online products:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts(activeCat, search);
  }, [activeCat, search, fetchProducts]);

  const handleAdd = (product) => {
    if (addToCart(product)) {
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <TriAppShell bottomNavIndex={3}>
      {/* Orange Gradient Compact Header */}
      <Header mode="compact" title="Online Shop" subtitle="Products & daily deals" />

      {/* Main Content Area: Left Category Sidebar + Right Product Area */}
      <Box 
        sx={{ 
          display: 'flex', 
          flex: 1, 
          height: 'calc(100vh - 108px - 68px)', // Screen height minus header and bottom navigation
          maxWidth: '430px', 
          width: '100%', 
          margin: '0 auto', 
          bgcolor: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        {/* Left Sidebar Categories */}
        <Box 
          sx={{ 
            width: '84px', 
            bgcolor: '#F8F9FB', 
            borderRight: '1px solid #F1F5F9',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 2,
            gap: 2,
            flexShrink: 0
          }}
        >
          {sidebarCategories.map((c) => {
            const isSelected = activeCat.toLowerCase() === c.name.toLowerCase();
            return (
              <Box
                key={c.name}
                onClick={() => { setActiveCat(c.name); setSearch(''); }}
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  px: 0.5
                }}
              >
                {/* Active Category Vertical Line */}
                {isSelected && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      left: 0, 
                      top: '15%', 
                      height: '70%', 
                      width: '4px', 
                      bgcolor: '#FF7A00',
                      borderTopRightRadius: '4px',
                      borderBottomRightRadius: '4px'
                    }} 
                  />
                )}

                {/* Category Circle Image */}
                <Box 
                  sx={{ 
                    width: '54px', 
                    height: '54px', 
                    borderRadius: '50%', 
                    overflow: 'hidden', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isSelected ? '#FFEFE0' : '#FFFFFF',
                    border: isSelected ? '1.5px solid #FF7A00' : '1px solid #E2E8F0',
                    transition: 'all 0.2s',
                    mb: 0.8
                  }}
                >
                  <Box 
                    component="img"
                    src={c.image}
                    alt={c.name}
                    sx={{ width: '38px', height: '38px', objectFit: 'contain' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </Box>

                {/* Category Label */}
                <Typography 
                  sx={{ 
                    fontSize: '11px', 
                    fontWeight: isSelected ? 700 : 500, 
                    color: isSelected ? '#FF7A00' : '#475569',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    fontFamily: '"Inter", sans-serif'
                  }}
                >
                  {c.name}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Right Main Product Area */}
        <Box 
          sx={{ 
            flex: 1, 
            overflowY: 'auto',
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}
        >
          {/* Horizontal Filters Row */}
          <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center" 
            sx={{ 
              overflowX: 'auto', 
              pb: 0.5, 
              flexShrink: 0,
              '&::-webkit-scrollbar': { display: 'none' } 
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<LuSlidersHorizontal size={13} />}
              endIcon={<LuChevronDown size={12} />}
              sx={{ 
                borderRadius: '12px', 
                borderColor: '#E2E8F0', 
                color: '#475569',
                fontSize: '12px', 
                fontWeight: 600,
                textTransform: 'none',
                py: 0.5,
                px: 1.5,
                bgcolor: '#FFFFFF',
                flexShrink: 0
              }}
            >
              Filters
            </Button>
            {['Sort', 'Category', 'Brand', 'Price'].map(filterName => (
              <Button
                key={filterName}
                variant="outlined"
                size="small"
                endIcon={<LuChevronDown size={12} />}
                sx={{ 
                  borderRadius: '12px', 
                  borderColor: '#E2E8F0', 
                  color: '#475569',
                  fontSize: '12px', 
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 0.5,
                  px: 1.5,
                  bgcolor: '#FFFFFF',
                  flexShrink: 0
                }}
              >
                {filterName}
              </Button>
            ))}
            <IconButton 
              size="small"
              sx={{ 
                border: '1px solid #E2E8F0', 
                borderRadius: '12px', 
                p: 0.6,
                color: '#475569',
                bgcolor: '#FFFFFF'
              }}
            >
              <LuLayoutGrid size={15} />
            </IconButton>
          </Stack>

          {/* Promotion Offer Banner */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
              borderRadius: '20px',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #FED7AA',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <Box sx={{ flex: 1, zIndex: 1 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#9A3412', fontFamily: '"Inter", sans-serif', lineHeight: 1.2 }}>
                Fresh seasonal fruits
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#C2410C', fontFamily: '"Inter", sans-serif', mt: 0.5, mb: 1.2 }}>
                Nutritional goodness in every bite
              </Typography>
              <Box
                sx={{
                  bgcolor: '#FF7A00',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  px: 1.8,
                  py: 0.6,
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'inline-block',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 122, 0, 0.25)',
                  fontFamily: '"Inter", sans-serif'
                }}
              >
                Shop Now
              </Box>
            </Box>
            <Box 
              component="img"
              src="https://images.unsplash.com/photo-1610832958506-ee5633619144?auto=format&fit=crop&w=150&q=80"
              alt="Fruits basket"
              sx={{ width: '90px', height: '90px', objectFit: 'contain', zIndex: 1 }}
            />
          </Box>

          {/* Product Grid Area */}
          {loading ? (
            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', py: 10 }}>
              <CircularProgress sx={{ color: '#FF7A00' }} />
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
              <LuSearch size={40} style={{ color: '#CBD5E1', marginBottom: 12 }} />
              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#334155', mb: 0.5, fontFamily: '"Inter", sans-serif' }}>
                No products found
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#64748B', fontFamily: '"Inter", sans-serif' }}>
                Try selecting another category or searching again
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={1.5}>
              {products.map(product => (
                <Grid item xs={6} key={product.id}>
                  <TriProductCard 
                    product={product} 
                    onAdd={handleAdd} 
                    onClick={() => navigate(`/consumer-ecommerce/product/${product.id}`)} 
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </TriAppShell>
  );
}