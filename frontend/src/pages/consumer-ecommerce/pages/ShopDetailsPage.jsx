import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, IconButton, Stack, Button, Divider, Paper } from '@mui/material';
import { 
  LuChevronLeft, LuPhone, LuMessageCircle, 
  LuMessageSquare, LuInfo, LuMapPin, LuStar, LuShare2, LuShoppingBag, LuPlus, LuMinus
} from 'react-icons/lu';
import { useLocation as useGeoLocation } from '../context/LocationContext';
import fallbackImg from '../../../images/fallback_img.png';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

export default function ShopDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isNearbyDeliveryMode = searchParams.get('mode') === 'nearby-delivery';
  const { location: userLoc } = useGeoLocation();
  const nearbyLat = searchParams.get('lat') || userLoc?.lat;
  const nearbyLng = searchParams.get('lng') || userLoc?.lng;
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopError, setShopError] = useState(false);

  // Cart local state representation loaded from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('tri_consumer_cart');
      return stored ? JSON.parse(stored) : { shopId: null, shopName: '', items: [] };
    } catch (_) {
      return { shopId: null, shopName: '', items: [] };
    }
  });

  useEffect(() => {
    const locationQuery = nearbyLat && nearbyLng ? `?lat=${nearbyLat}&lng=${nearbyLng}` : '';
    const shopUrl = isNearbyDeliveryMode
      ? `${CAPTAIN_API_URL}/captain/consumer/nearby-shops/${id}${locationQuery}`
      : `${CAPTAIN_API_URL}/captain/consumer/shops/${id}`;
    const productsUrl = isNearbyDeliveryMode
      ? `${CAPTAIN_API_URL}/captain/consumer/nearby-shops/${id}/delivery-products${locationQuery}`
      : `${CAPTAIN_API_URL}/captain/consumer/shops/${id}/products`;

    // 1. Fetch consumer-safe B2C online-enabled shop details
    setShopError(false);
    axios.get(shopUrl)
      .then(res => {
        setShop(res.data);
      })
      .catch(err => {
        console.error('Failed to fetch consumer-safe online store details:', err);
        setShopError(true);
        setShop(null);
      });

    // 2. Fetch consumer-safe online product catalog
    axios.get(productsUrl)
      .then(res => {
        // Backend already enforces B2C, active, in-stock, online-delivery products.
        // Keep this frontend guard as a defensive fallback for older deployments.
        const onlineOnly = (res.data || []).filter(p => p.is_active && p.online_delivery);
        setProducts(onlineOnly);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load shop products:', err);
        setLoading(false);
      });
  }, [id, isNearbyDeliveryMode, nearbyLat, nearbyLng]);

  // Save cart to local storage whenever state changes
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('tri_consumer_cart', JSON.stringify(newCart));
  };

  const handleAddToCart = (product) => {
    const shopName = shop?.shop_name || 'Store';
    
    // Check if cart already holds items from a different shop
    if (cart.shopId && cart.shopId.toString() !== id.toString() && cart.items.length > 0) {
      const confirmReset = window.confirm("You have items from another store in your cart. Would you like to clear those and start fresh with this store?");
      if (!confirmReset) {
        return;
      }
      // Reset cart to this shop
      const freshCart = {
        shopId: parseInt(id),
        shopName: shopName,
        orderChannel: isNearbyDeliveryMode ? 'NEARBY_DELIVERY' : 'ONLINE_DELIVERY',
        latitude: nearbyLat ? Number(nearbyLat) : null,
        longitude: nearbyLng ? Number(nearbyLng) : null,
        items: [{ productId: product.id, title: product.title, price: product.price, quantity: 1, image: product.image }]
      };
      saveCart(freshCart);
      return;
    }

    // Insert or increment quantity
    let updatedItems = [...cart.items];
    const existing = updatedItems.find(item => item.productId === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      updatedItems.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        image: product.image
      });
    }

    saveCart({
      shopId: parseInt(id),
      shopName: shopName,
      orderChannel: isNearbyDeliveryMode ? 'NEARBY_DELIVERY' : 'ONLINE_DELIVERY',
      latitude: nearbyLat ? Number(nearbyLat) : null,
      longitude: nearbyLng ? Number(nearbyLng) : null,
      items: updatedItems
    });
  };

  const handleUpdateQty = (productId, delta) => {
    let updatedItems = cart.items.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: item.quantity + delta };
      }
      return item;
    }).filter(item => item.quantity > 0);

    saveCart({
      ...cart,
      items: updatedItems
    });
  };

  if (shopError) {
    return (
      <Box p={4} textAlign="center">
        <Typography sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>
          Store not available for home delivery
        </Typography>
        <Typography sx={{ color: '#64748b', mb: 2 }}>
          This store may be inactive, offline-only, outside your delivery radius, or unavailable for consumer delivery shopping.
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ textTransform: 'none', fontWeight: 800 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!shop) return <Box p={4} textAlign="center">Loading store details...</Box>;

  const shopName = shop.shop_name || 'Store';
  const address = shop.address || shop.city || 'Local Area';

  // Compute stats
  const totalItemsCount = cart.shopId?.toString() === id.toString()
    ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const totalCartPrice = cart.shopId?.toString() === id.toString()
    ? cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : 0;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: totalItemsCount > 0 ? 14 : 6, maxWidth: '480px', margin: '0 auto', boxShadow: '0 0 20px rgba(0,0,0,0.05)', position: 'relative' }}>
      {/* Cover Image Container */}
      <Box sx={{ position: 'relative', width: '100%', height: 200, overflow: 'hidden' }}>
        <Box 
          component="img"
          src={shop.shop_image || fallbackImg} 
          alt={shopName} 
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)' }} />
        
        {/* Absolute Header Overlay */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: 'absolute', top: 0, left: 0, right: 0, p: 2, zIndex: 10 }}>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ 
              color: '#FFFFFF', 
              bgcolor: 'rgba(15, 23, 42, 0.4)', 
              backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.6)' } 
            }}
          >
            <LuChevronLeft />
          </IconButton>
          <IconButton 
            sx={{ 
              color: '#FFFFFF', 
              bgcolor: 'rgba(15, 23, 42, 0.4)', 
              backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.6)' } 
            }}
            onClick={() => alert('Shared store details!')}
          >
            <LuShare2 />
          </IconButton>
        </Stack>

        {/* Floating Store Title */}
        <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
          <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1.4rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)', fontFamily: '"Inter", sans-serif' }}>
            {shopName}
          </Typography>
        </Box>
      </Box>

      {/* Main Info */}
      <Box sx={{ p: 2, bgcolor: '#fff' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Box sx={{ bgcolor: '#10b981', color: '#fff', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            4.5 <LuStar size={12} fill="#fff" />
          </Box>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>118 Ratings</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, ml: 1 }}>
            {isNearbyDeliveryMode ? 'Nearby Delivery Active' : 'Online Delivery Active'}
          </Typography>
        </Stack>

        <Typography sx={{ fontSize: '0.85rem', color: '#475569', mb: 0.5 }}>{address} • Within {shop.delivery_radius_km || 5.0}  km</Typography>
        <Typography sx={{ fontSize: '0.85rem', color: '#FF7A00', fontWeight: 700, mb: 2 }}>Min Order Threshold: ₹{shop.min_order_value || 0}</Typography>

        {/* Action Circles */}
        <Stack direction="row" justifyContent="space-around" sx={{ mb: 2 }}>
          {[
            { icon: <LuPhone />, label: 'Call', color: '#3b82f6' },
            { icon: <LuMessageCircle />, label: 'WhatsApp', color: '#22c55e' },
            { icon: <LuMessageSquare />, label: 'Ask Anything', color: '#8b5cf6' },
            { icon: <LuInfo />, label: 'Enquiry', color: '#f59e0b' },
            { icon: <LuMapPin />, label: 'Direction', color: '#64748b' },
          ].map((action, i) => (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => alert(`${action.label} clicked for store`)}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${action.color}`, color: action.color, display: 'grid', placeItems: 'center', fontSize: '1.2rem', transition: 'all 0.2s', '&:hover': { bgcolor: `${action.color}15` } }}>
                {action.icon}
              </Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>{action.label}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Dynamic Products Catalog */}
      <Box sx={{ p: 2, mt: 1 }}>
        <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', mb: 1.5 }}>Online Catalog</Typography>
        
        {loading ? (
          <Box sx={{ py: 4, textAlign: 'center', color: '#64748b' }}>
            Loading store products...
          </Box>
        ) : products.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', color: '#64748b', borderRadius: 3 }}>
            <LuShoppingBag size={40} style={{ color: '#cbd5e1', marginBottom: 8 }} />
            {!shop?.home_delivery_enabled ? (
              <>
                <Typography sx={{ fontWeight: 800 }}>Home Delivery Disabled</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                  This store does not offer home delivery. You can still visit in person or place an offline order.
                </Typography>
              </>
            ) : (isNearbyDeliveryMode && shop?.is_delivery_available === false) ? (
              <>
                <Typography sx={{ fontWeight: 800, color: '#f59e0b' }}>Delivery Out of Range</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                  You are outside this store's delivery range (max: {shop?.delivery_radius_km || 5} km). You can still order for counter pickup or visit the store.
                </Typography>
              </>
            ) : (
              <>
                <Typography sx={{ fontWeight: 800 }}>No products available online</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                  This store doesn't have active delivery items cataloged yet.
                </Typography>
              </>
            )}
          </Paper>
        ) : (
          <Stack spacing={1.5}>
            {products.map(product => {
              // Find if this item is in the cart
              const cartItem = cart.shopId?.toString() === id.toString()
                ? cart.items.find(item => item.productId === product.id)
                : null;

              return (
                <Paper key={product.id} elevation={0} sx={{ p: 1.5, borderRadius: 4, border: '1px solid #e2e8f0', display: 'flex', gap: 2 }}>
                  <img 
                    src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'} 
                    alt={product.title} 
                    loading="lazy"
                    decoding="async"
                    style={{ width: 90, height: 90, borderRadius: 12, objectFit: 'cover' }} 
                  />
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>{product.title}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 0.5 }}>
                      {product.description || 'Fresh item direct from store deliverable to your doorstep.'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
                        <Typography sx={{ fontWeight: 800, color: '#f97316' }}>₹{product.price}</Typography>
                        {product.mrp && product.mrp > product.price && (
                          <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#94a3b8' }}>₹{product.mrp}</Typography>
                        )}
                      </Box>

                      {/* ADD to Cart toggle / qty control */}
                      {cartItem ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #FF7A00', borderRadius: '8px', bgcolor: 'rgba(255, 122, 0, 0.05)' }}>
                          <IconButton size="small" onClick={() => handleUpdateQty(product.id, -1)} sx={{ color: '#FF7A00' }}>
                            <LuMinus size={14} />
                          </IconButton>
                          <Typography sx={{ fontWeight: 800, color: '#FF7A00', px: 1, fontSize: '0.85rem' }}>{cartItem.quantity}</Typography>
                          <IconButton size="small" onClick={() => handleUpdateQty(product.id, 1)} sx={{ color: '#FF7A00' }}>
                            <LuPlus size={14} />
                          </IconButton>
                        </Box>
                      ) : (
                        <Button 
                          onClick={() => handleAddToCart(product)}
                          variant="outlined" 
                          color="primary"
                          size="small" 
                          sx={{ 
                            fontWeight: 800,
                            borderRadius: '8px', px: 2 
                          }}
                        >
                          ADD
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Business Details Box */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ bgcolor: '#fff', borderRadius: 3, p: 2, border: '1px solid #e2e8f0' }}>
          <Typography sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>Business Summary</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, mb: 1 }}>
            Premium certified online partner with secure logistics delivery ensuring fast delivery, and authentic quality products directly to you.
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
                {shop.contact_number || '080 4040 4040'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Sliding Floating Bottom Bar for active persistent Cart */}
      {totalItemsCount > 0 && (
        <Box 
          sx={{ 
            position: 'fixed', bottom: 0, left: 0, right: 0, 
            bgcolor: '#FF7A00', color: '#fff', p: 2, 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
            boxShadow: '0 -4px 16px rgba(255, 122, 0, 0.25)', zIndex: 100,
            maxWidth: '480px', mx: 'auto'
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>{totalItemsCount} item{totalItemsCount > 1 ? 's' : ''} added</Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', opacity: 0.9 }}>From {shopName}</Typography>
          </Box>
          <Button 
            component={Link} 
            to="/consumer-ecommerce/cart"
            variant="contained" 
            sx={{ 
              bgcolor: '#fff', color: '#FF7A00', fontWeight: 800, textTransform: 'none', px: 3, py: 1, borderRadius: 2,
              '&:hover': { bgcolor: '#fdf2e9' }
            }}
          >
            View Cart • ₹{totalCartPrice.toFixed(2)}
          </Button>
        </Box>
      )}
    </Box>
  );
}
