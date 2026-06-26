import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, Container, Stack, CircularProgress, Chip, IconButton } from '@mui/material';
import { LuChevronLeft, LuShoppingCart, LuStore, LuShieldCheck, LuTruck, LuArrowLeft } from 'react-icons/lu';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

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

  useEffect(() => {
    axios.get(`${CAPTAIN_API_URL}/captain/shops/online/products?limit=500&offset=0`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : 
                     Array.isArray(res.data?.products) ? res.data.products : 
                     Array.isArray(res.data?.results) ? res.data.results : [];
        const found = data.find(p => String(p.id) === String(id));
        if (found) {
          setProduct(found);
        } else {
          setError('Product not found or unavailable for online delivery.');
        }
      })
      .catch(err => {
        console.error('Failed to load product details:', err);
        setError('Error loading product details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    setAddingToCart(true);
    
    try {
      let cart = JSON.parse(localStorage.getItem('tri_consumer_cart') || '{"shopId":null,"shopName":"","items":[]}');
      
      if (cart.shopId && String(cart.shopId) !== String(product.shop_id)) {
        const confirmed = window.confirm(
          `Your cart has items from "${cart.shopName}". Starting a new cart will remove them. Continue?`
        );
        if (!confirmed) {
          setAddingToCart(false);
          return;
        }
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
      window.dispatchEvent(new Event('storage')); 
      
      setTimeout(() => {
        setAddingToCart(false);
      }, 500);
      
    } catch (e) {
      console.error(e);
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      navigate('/consumer-ecommerce/cart');
    }, 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#f97316' }} />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <div className="ce-app" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <header className="ce-compact-page-header">
          <Link to="/consumer-ecommerce/delivery" aria-label="Back"><LuChevronLeft /></Link>
          <div>
            <h1>Product Error</h1>
            <p>Item unavailable</p>
          </div>
        </header>
        <Box sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography color="error" variant="h6" fontWeight={700}>{error}</Typography>
          <Button component={Link} to="/consumer-ecommerce/delivery" variant="contained" sx={{ mt: 3, bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' }, textTransform: 'none', fontWeight: 800 }}>
            Back to Shopping
          </Button>
        </Box>
      </div>
    );
  }

  const hasDiscount = product.discount_percent && product.discount_percent > 0;
  const img = product.image || product.image_url || FALLBACK_IMAGE;

  return (
    <div className="ce-app" style={{ minHeight: '100vh', backgroundColor: '#fff', paddingBottom: 100 }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 50, bgcolor: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#0f172a' }}>
          <LuArrowLeft />
        </IconButton>
        <Typography fontWeight={800} fontSize="1rem" noWrap sx={{ mx: 2, flex: 1, textAlign: 'center' }}>
          Product Details
        </Typography>
        <Link to="/consumer-ecommerce/cart" style={{ position: 'relative', color: '#0f172a', display: 'flex', alignItems: 'center', padding: 8 }}>
          <LuShoppingCart size={22} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              background: '#ea580c', color: '#fff',
              fontSize: '0.65rem', fontWeight: 900,
              borderRadius: '50%', width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </Link>
      </Box>

      <Box sx={{ width: '100%', bgcolor: '#f8fafc', display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <Box 
          component="img"
          src={img}
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
          sx={{ width: '100%', maxWidth: 500, height: 'auto', objectFit: 'contain', aspectRatio: '1/1', mixBlendMode: 'multiply' }}
        />
        {hasDiscount && (
          <Box sx={{ position: 'absolute', top: 16, left: 16, bgcolor: '#ef4444', color: '#fff', px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 800, fontSize: '0.8rem', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}>
            {Math.round(product.discount_percent)}% OFF
          </Box>
        )}
      </Box>

      <Container maxWidth="md" sx={{ px: 2, py: 3 }}>
        <Typography variant="h5" fontWeight={900} color="#0f172a" lineHeight={1.3} mb={1}>
          {product.title}
        </Typography>
        
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <Typography variant="h4" fontWeight={900} color="#0f172a">
            ₹{product.price?.toLocaleString('en-IN')}
          </Typography>
          {hasDiscount && product.mrp > product.price && (
            <Typography variant="body1" color="#94a3b8" sx={{ textDecoration: 'line-through', fontWeight: 600 }}>
              ₹{product.mrp?.toLocaleString('en-IN')}
            </Typography>
          )}
        </Stack>
        
        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <LuStore style={{ color: '#f97316' }} />
            <Typography fontWeight={700} fontSize="0.9rem" color="#334155">
              Sold by: <span style={{ color: '#0f172a' }}>{product.shop_name || 'Online Merchant'}</span>
            </Typography>
          </Stack>
          {product.category && (
            <Chip label={product.category} size="small" sx={{ fontWeight: 700, bgcolor: '#e2e8f0', color: '#475569', mt: 1 }} />
          )}
        </Box>
        
        <Stack direction="row" spacing={2} mb={4} sx={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', py: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <LuTruck size={24} style={{ color: '#f97316', marginBottom: 4 }} />
            <Typography fontSize="0.75rem" fontWeight={700} color="#475569" textAlign="center">Free Delivery<br/>on Prime</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <LuShieldCheck size={24} style={{ color: '#22c55e', marginBottom: 4 }} />
            <Typography fontSize="0.75rem" fontWeight={700} color="#475569" textAlign="center">Secure<br/>Transaction</Typography>
          </Box>
        </Stack>

        <Typography variant="h6" fontWeight={800} color="#0f172a" mb={1}>
          Description
        </Typography>
        <Typography variant="body2" color="#475569" lineHeight={1.6}>
          {product.description || 'No detailed description available for this product.'}
        </Typography>
      </Container>

      <Box sx={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', maxWidth: '430px', width: '100%', bgcolor: '#fff', borderTop: '1px solid #f1f5f9', p: 2, display: 'flex', gap: 2, zIndex: 40, pb: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
        <Button 
          variant="outlined" 
          onClick={handleAddToCart}
          disabled={addingToCart}
          sx={{ flex: 1, borderColor: '#FF7A00', color: '#FF7A00', fontWeight: 800, textTransform: 'none', py: 1.5, borderRadius: 2, '&:hover': { borderColor: '#ea580c', bgcolor: '#fff7ed' } }}
        >
          {addingToCart ? <CircularProgress size={24} sx={{ color: '#FF7A00' }} /> : 'Add to Cart'}
        </Button>
        <Button 
          variant="contained" 
          onClick={handleBuyNow}
          sx={{ flex: 1, bgcolor: '#FF7A00', color: '#fff', fontWeight: 800, textTransform: 'none', py: 1.5, borderRadius: 2, '&:hover': { bgcolor: '#ea580c' }, boxShadow: '0 4px 12px rgba(255, 122, 0, 0.3)' }}
        >
          Buy Now
        </Button>
      </Box>
    </div>
  );
}
