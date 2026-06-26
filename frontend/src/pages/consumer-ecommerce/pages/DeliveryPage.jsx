import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress, Badge, Grid, Chip } from '@mui/material';
import { LuSearch, LuShoppingCart, LuX } from 'react-icons/lu';

import ShoppingPageTemplate from '../../../components/templates/ShoppingPageTemplate';
import TriProductCard from '../../../components/ui/TriProductCard';
import TriButton from '../../../components/ui/TriButton';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';

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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeCat, setActiveCat] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // Sync Cart
  useEffect(() => {
    const syncCart = () => {
      try {
        const c = JSON.parse(localStorage.getItem('tri_consumer_cart') || '{"items":[]}');
        setCartCount(c.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0);
      } catch { setCartCount(0); }
    };
    syncCart();
    window.addEventListener('storage', syncCart);
    return () => window.removeEventListener('storage', syncCart);
  }, []);

  // Fetch Categories
  useEffect(() => {
    axios.get(`${CAPTAIN_API_URL}/captain/shops/online/categories`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : 
                     Array.isArray(res.data?.categories) ? res.data.categories : 
                     Array.isArray(res.data?.results) ? res.data.results : [];
        const validCats = data.map(c => typeof c === 'string' ? { name: c } : c);
        setCategories(validCats);
      })
      .catch(err => console.error('Failed to load categories', err));
  }, []);

  const fetchProducts = useCallback((cat = '', q = '') => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 100, offset: 0 });
    if (cat) params.append('category', cat);
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

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleAdd = (product) => {
    if (addToCart(product)) {
      window.dispatchEvent(new Event('storage'));
    }
  };

  const SearchBar = (
    <Box 
      component="form" 
      onSubmit={handleSearchSubmit}
      sx={{ 
        display: 'flex', alignItems: 'center', 
        bgcolor: 'background.default', 
        borderRadius: 2, 
        px: 2, py: 1, 
        border: '1px solid', borderColor: 'divider' 
      }}
    >
      <LuSearch style={{ color: '#94a3b8' }} />
      <Box 
        component="input"
        placeholder="Search products, brands…"
        value={searchInput}
        onChange={handleSearchChange}
        sx={{ 
          flex: 1, border: 'none', outline: 'none', 
          bgcolor: 'transparent', ml: 1, 
          fontSize: '0.9rem', color: 'text.primary',
          fontFamily: 'inherit'
        }}
      />
      {searchInput && (
        <Box 
          component="button" 
          type="button"
          onClick={() => { setSearchInput(''); setSearch(''); }}
          sx={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <LuX size={16} style={{ color: '#94a3b8' }} />
        </Box>
      )}
    </Box>
  );

  const FilterChips = (
    <Box sx={{ display: 'flex', gap: 1, pb: 1 }}>
      <Chip
        label="All Products"
        onClick={() => { setActiveCat(''); setSearch(''); }}
        color={activeCat === '' ? 'primary' : 'default'}
        variant={activeCat === '' ? 'filled' : 'outlined'}
        sx={{ fontWeight: activeCat === '' ? 800 : 600 }}
      />
      {categories.map(c => (
        <Chip
          key={c.id || c.name}
          label={c.name}
          onClick={() => { setActiveCat(c.name); setSearch(''); }}
          color={activeCat === c.name ? 'primary' : 'default'}
          variant={activeCat === c.name ? 'filled' : 'outlined'}
          sx={{ fontWeight: activeCat === c.name ? 800 : 600 }}
        />
      ))}
    </Box>
  );

  const HeaderRight = (
    <Link to="/consumer-ecommerce/cart" style={{ color: 'inherit' }}>
      <Badge badgeContent={cartCount > 99 ? '99+' : cartCount} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 900 } }}>
        <LuShoppingCart size={22} style={{ color: '#0f172a' }} />
      </Badge>
    </Link>
  );

  return (
    <ShoppingPageTemplate
      title="Online Shop"
      subtitle="Products & daily deals"
      headerRight={HeaderRight}
      searchBar={SearchBar}
      filterChips={FilterChips}
      bottomNavIndex={3} // Delivery is index 3 in BottomNav
    >
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, px: 2 }}>
          <LuSearch size={48} style={{ color: '#cbd5e1', marginBottom: 12 }} />
          <Typography variant="h6" fontWeight={800} color="text.primary" mb={1}>
            {search ? `No results for "${search}"` : activeCat ? `No products in "${activeCat}"` : 'No products available'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {search || activeCat ? 'Try a different search or category' : 'Check back soon'}
          </Typography>
          {(search || activeCat) && (
            <TriButton onClick={() => { setSearch(''); setActiveCat(''); setSearchInput(''); }} size="small" sx={{ width: 'auto' }}>
              Clear Filters
            </TriButton>
          )}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {products.map(product => (
            <Grid item xs={6} sm={4} md={3} key={product.id}>
              <TriProductCard 
                product={product} 
                onAdd={handleAdd} 
                onClick={() => navigate(`/consumer-ecommerce/product/${product.id}`)} 
              />
            </Grid>
          ))}
        </Grid>
      )}

    </ShoppingPageTemplate>
  );
}