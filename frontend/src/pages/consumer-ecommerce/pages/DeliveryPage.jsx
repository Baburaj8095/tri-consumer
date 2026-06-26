import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress, Grid, Button, Stack, IconButton } from '@mui/material';
import { LuSlidersHorizontal, LuChevronDown, LuLayoutGrid, LuSearch } from 'react-icons/lu';

import TriAppShell from '../../../components/ui/TriAppShell';
import Header from '../components/Header';
import TriProductCard from '../../../components/ui/TriProductCard';
import TriIcon from '../../../components/ui/TriIcon';

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
      <Header mode="compact" onSearch={(val) => setSearch(val)} />

      {/* Main Content Area in Single Scrollable Container */}
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          flex: 1, 
          maxWidth: '430px', 
          width: '100%', 
          margin: '0 auto', 
          bgcolor: '#FFFFFF',
          pb: 10
        }}
      >
        {/* Row 1: Horizontal Scroll Categories */}
        <Box sx={{ px: 2, pt: 2, pb: 1, bgcolor: '#FFFFFF', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', gap: 2.2, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' }, pb: 1 }}>
            {sidebarCategories.map((c) => {
              const isSelected = activeCat.toLowerCase() === c.name.toLowerCase();
              return (
                <Box
                  key={c.name}
                  onClick={() => { setActiveCat(c.name); setSearch(''); }}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'transform 0.15s ease-in-out',
                    '&:active': { transform: 'scale(0.95)' }
                  }}
                >
                  <Box 
                    sx={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      overflow: 'hidden', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isSelected ? '#FFEFE0' : '#F8F9FB',
                      border: isSelected ? '2px solid #FF7A00' : '1px solid #E2E8F0',
                      boxShadow: isSelected ? '0 4px 12px rgba(255, 122, 0, 0.12)' : 'none',
                      mb: 0.8,
                      transition: 'all 0.2s'
                    }}
                  >
                    <Box 
                      component="img"
                      src={c.image}
                      alt={c.name}
                      sx={{ width: '40px', height: '40px', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </Box>
                  <Typography 
                    sx={{ 
                      fontSize: '11px', 
                      fontWeight: isSelected ? 800 : 600, 
                      color: isSelected ? '#FF7A00' : '#475569',
                      textAlign: 'center',
                      fontFamily: '"Inter", sans-serif'
                    }}
                  >
                    {c.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Row 2: Filter Chips */}
        <Box sx={{ px: 2, pb: 1.5, flexShrink: 0 }}>
          <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center" 
            sx={{ 
              overflowX: 'auto', 
              pb: 0.5, 
              '&::-webkit-scrollbar': { display: 'none' } 
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<TriIcon name="tune" size={16} />}
              sx={{ 
                borderRadius: '12px', 
                borderColor: '#E2E8F0', 
                color: '#475569',
                fontSize: '12px', 
                fontWeight: 600,
                textTransform: 'none',
                py: 0.6,
                px: 2,
                bgcolor: '#FFFFFF',
                flexShrink: 0
              }}
            >
              Filters
            </Button>
            {['Sort', 'Category', 'Price', 'Brand'].map(filterName => (
              <Button
                key={filterName}
                variant="outlined"
                size="small"
                endIcon={<TriIcon name="arrow_drop_down" size={16} />}
                sx={{ 
                  borderRadius: '12px', 
                  borderColor: '#E2E8F0', 
                  color: '#475569',
                  fontSize: '12px', 
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 0.6,
                  px: 2,
                  bgcolor: '#FFFFFF',
                  flexShrink: 0
                }}
              >
                {filterName}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* Row 3: Offer Banner (Taller: 150px) */}
        <Box sx={{ px: 2, pb: 2, flexShrink: 0 }}>
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
              height: 150,
              boxShadow: '0 4px 15px rgba(255, 122, 0, 0.05)'
            }}
          >
            <Box sx={{ flex: 1.2, zIndex: 1 }}>
              <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#9A3412', fontFamily: '"Inter", sans-serif', lineHeight: 1.2 }}>
                Fresh seasonal fruits
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#C2410C', fontFamily: '"Inter", sans-serif', mt: 0.8, mb: 2 }}>
                Nutritional goodness in every bite
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#FF7A00',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  px: 2.5,
                  py: 0.8,
                  fontSize: '12px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(255, 122, 0, 0.25)',
                  '&:hover': { bgcolor: '#E06B00' }
                }}
              >
                Shop Now
              </Button>
            </Box>
            <Box 
              component="img"
              src="https://images.unsplash.com/photo-1610832958506-ee5633619144?auto=format&fit=crop&w=280&q=80"
              alt="Fruits basket"
              sx={{ 
                height: '110px', 
                width: '110px', 
                objectFit: 'contain',
                zIndex: 1,
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </Box>
        </Box>

        {/* Row 4: Product Grid Area */}
        <Box sx={{ px: 2, pb: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
              <CircularProgress sx={{ color: '#FF7A00' }} />
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
              <TriIcon name="search_off" size={48} color="#CBD5E1" sx={{ mb: 1.5 }} />
              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#334155', mb: 0.5, fontFamily: '"Inter", sans-serif' }}>
                No products found
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#64748B', fontFamily: '"Inter", sans-serif' }}>
                Try selecting another category or searching again
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
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