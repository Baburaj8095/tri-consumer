import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, Container, Stack, CircularProgress, Chip, IconButton } from '@mui/material';
import { LuChevronLeft, LuShoppingCart, LuStore, LuShieldCheck, LuTruck, LuArrowLeft, LuStar } from 'react-icons/lu';
import TriIcon from '../../../components/ui/TriIcon.jsx';
import { products } from '../services/mockData.js';
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
          setActiveImageIndex(0);
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
        <CircularProgress sx={{ color: '#FF7A00' }} />
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
          <Button component={Link} to="/consumer-ecommerce/delivery" variant="contained" sx={{ mt: 3, bgcolor: '#FF7A00', '&:hover': { bgcolor: '#E06B00' }, textTransform: 'none', fontWeight: 800 }}>
            Back to Shopping
          </Button>
        </Box>
      </div>
    );
  }

  const hasDiscount = Boolean(product.discount_percent && product.discount_percent > 0);
  const img = product.image || product.image_url || FALLBACK_IMAGE;

  // Mock gallery images using the main product image and some related category backups
  const galleryImages = [
    img,
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1600087626014-e652e18bbff2?auto=format&fit=crop&w=300&q=80'
  ];

  return (
    <div className="ce-app" style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', paddingBottom: 120 }}>
      {/* Header */}
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
              background: '#FF7A00', color: '#fff',
              fontSize: '0.65rem', fontWeight: 900,
              borderRadius: '50%', width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </Link>
      </Box>

      {/* Main Image Gallery */}
      <Box sx={{ width: '100%', bgcolor: '#f8fafc', py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <Box 
          component="img"
          src={galleryImages[activeImageIndex]}
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
          sx={{ width: '100%', maxWidth: 350, height: 280, objectFit: 'contain', mixBlendMode: 'multiply' }}
        />
        {hasDiscount && (
          <Box sx={{ position: 'absolute', top: 16, left: 16, bgcolor: '#ef4444', color: '#fff', px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 800, fontSize: '0.8rem', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}>
            {Math.round(product.discount_percent)}% OFF
          </Box>
        )}

        {/* Gallery Thumbnails */}
        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          {galleryImages.map((image, idx) => (
            <Box
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              sx={{
                width: 50,
                height: 50,
                borderRadius: '8px',
                border: '2px solid',
                borderColor: idx === activeImageIndex ? '#FF7A00' : '#E2E8F0',
                bgcolor: '#FFFFFF',
                cursor: 'pointer',
                overflow: 'hidden',
                p: 0.25
              }}
            >
              <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.src = FALLBACK_IMAGE; }} />
            </Box>
          ))}
        </Stack>
      </Box>

      <Container maxWidth="md" sx={{ px: 2, py: 3 }}>
        <Typography variant="h5" fontWeight={900} color="#0f172a" lineHeight={1.3} mb={1}>
          {product.title}
        </Typography>

        {/* Rating and Reviews */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Box sx={{ bgcolor: '#10b981', color: '#fff', px: 1.2, py: 0.4, borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            4.5 <LuStar size={12} fill="#fff" />
          </Box>
          <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>118 Reviews</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#FF7A00', fontWeight: 700 }}>
            Prime Member Free Delivery
          </Typography>
        </Stack>
        
        <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
          <Typography variant="h4" fontWeight={900} color="#0f172a">
            ₹{product.price?.toLocaleString('en-IN')}
          </Typography>
          {hasDiscount && product.mrp > product.price && (
            <Typography variant="body1" color="#94a3b8" sx={{ textDecoration: 'line-through', fontWeight: 600 }}>
              ₹{product.mrp?.toLocaleString('en-IN')}
            </Typography>
          )}
        </Stack>

        {/* Special Offers & Cashback */}
        <Box sx={{ p: 2, bgcolor: '#FFF5E6', borderRadius: '20px', border: '1.5px solid #FFE0B2', mb: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E293B', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TriIcon name="local_offer" size={18} color="#FF7A00" /> Special Offers & Cashback
          </Typography>
          <Stack spacing={1}>
            <Typography sx={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
              💰 Get 10% instant Cashback with Tri Pay UPI.
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
              🚚 Join Tri Prime to unlock FREE delivery on this item!
            </Typography>
          </Stack>
        </Box>
        
        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <LuStore style={{ color: '#FF7A00' }} />
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
            <LuTruck size={24} style={{ color: '#FF7A00', marginBottom: 4 }} />
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
        <Typography variant="body2" color="#475569" lineHeight={1.6} mb={4}>
          {product.description || 'No detailed description available for this product.'}
        </Typography>

        {/* Related Products Section */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', mb: 2, fontFamily: '"Inter", sans-serif' }}>
            Related Products
          </Typography>
          <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            {products.slice(0, 5).map((p) => (
              <Box
                key={`related-${p.id}`}
                component={Link}
                to={`/consumer-ecommerce/product/${p.id}`}
                onClick={() => { window.scrollTo(0, 0); }}
                sx={{
                  minWidth: 130,
                  maxWidth: 130,
                  bgcolor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  p: 1.5,
                  textDecoration: 'none',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  '&:active': { transform: 'scale(0.95)' }
                }}
              >
                <Box component="img" src={p.image} sx={{ width: '100%', height: 80, objectFit: 'contain', borderRadius: '12px', mb: 1 }} />
                <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif' }} noWrap>
                  {p.name}
                </Typography>
                <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#FF7A00', mt: 0.5, fontFamily: '"Inter", sans-serif' }}>
                  {p.newPrice}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Recently Viewed Section */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', mb: 2, fontFamily: '"Inter", sans-serif' }}>
            Recently Viewed Products
          </Typography>
          <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            {products.slice(2, 7).map((p) => (
              <Box
                key={`recent-${p.id}`}
                component={Link}
                to={`/consumer-ecommerce/product/${p.id}`}
                onClick={() => { window.scrollTo(0, 0); }}
                sx={{
                  minWidth: 130,
                  maxWidth: 130,
                  bgcolor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  p: 1.5,
                  textDecoration: 'none',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  '&:active': { transform: 'scale(0.95)' }
                }}
              >
                <Box component="img" src={p.image} sx={{ width: '100%', height: 80, objectFit: 'contain', borderRadius: '12px', mb: 1 }} />
                <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif' }} noWrap>
                  {p.name}
                </Typography>
                <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#FF7A00', mt: 0.5, fontFamily: '"Inter", sans-serif' }}>
                  {p.newPrice}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Container>

      {/* Sticky footer action buttons */}
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
