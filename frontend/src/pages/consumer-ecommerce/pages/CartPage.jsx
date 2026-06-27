import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, FaLocationDot, FaPlus, FaMinus, FaTrash, 
  FaCartShopping, FaRegClipboard
} from 'react-icons/fa6';
import { Box, Typography, Divider, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, TextField, Stack } from '@mui/material';

import { getAccessToken, tryTokenRefresh, clearAuth } from '../../../services/authStorage';
import CheckoutPageTemplate from '../../../components/templates/CheckoutPageTemplate';
import TriCard from '../../../components/ui/TriCard';
import TriButton from '../../../components/ui/TriButton';
import TriEmptyState from '../../../components/ui/TriEmptyState';
import TriAddressCard from '../../../components/ui/TriAddressCard';
import TriIcon from '../../../components/ui/TriIcon';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

export default function CartPage() {
  const navigate = useNavigate();

  // 1. Core State
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('tri_consumer_cart');
      return stored ? JSON.parse(stored) : { shopId: null, shopName: '', items: [] };
    } catch (_) {
      return { shopId: null, shopName: '', items: [] };
    }
  });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [validation, setValidation] = useState(null);
  
  // Loading & Action flags
  const [isValidating, setIsValidating] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // COD or ONLINE
  const isNearbyDeliveryOrder = cart.orderChannel === 'NEARBY_DELIVERY';

  // Address Modal
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientsName: '', recipientsPhone: '', addressLine1: '', addressLine2: '',
    landmark: '', city: '', pincode: '', addressType: 'HOME', isDefault: true
  });

  const fetchAddresses = async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const res = await axios.get(`${CAPTAIN_API_URL}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data || [];
      setAddresses(list);
      if (list.length > 0) setSelectedAddressId((list.find(a => a.isDefault) || list[0]).id);
    } catch (err) {
      if (err.response?.status === 401) {
        const refreshed = await tryTokenRefresh();
        if (refreshed) {
          const newToken = getAccessToken();
          try {
            const res = await axios.get(`${CAPTAIN_API_URL}/api/addresses`, {
              headers: { Authorization: `Bearer ${newToken}` }
            });
            const list = res.data || [];
            setAddresses(list);
            if (list.length > 0) setSelectedAddressId((list.find(a => a.isDefault) || list[0]).id);
            return;
          } catch (retryErr) {
            console.error('Failed to reload addresses after token refresh:', retryErr);
          }
        }
        // If refresh fails, clear invalid auth and send to login
        clearAuth();
        navigate('/login');
      } else {
        console.error('Failed to load user addresses:', err);
      }
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const runValidation = async (currentCart, addressId) => {
    if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
      setValidation(null);
      return;
    }
    setIsValidating(true);
    setErrorMessage('');
    const token = getAccessToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const payload = {
      shop_id: currentCart.shopId,
      address_id: addressId || null,
      order_channel: currentCart.orderChannel || 'ONLINE_DELIVERY',
      items: currentCart.items.map(it => ({ product_id: it.productId, quantity: it.quantity }))
    };

    try {
      const res = await axios.post(`${CAPTAIN_API_URL}/api/cart/validate`, payload, { headers });
      setValidation(res.data);
    } catch (err) {
      setErrorMessage('Backend validation service is offline. Proceeding with offline subtotal limits.');
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => { runValidation(cart, selectedAddressId); }, [cart, selectedAddressId]);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('tri_consumer_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateQty = (productId, delta) => {
    const updatedItems = cart.items.map(item => {
      if (item.productId === productId) return { ...item, quantity: item.quantity + delta };
      return item;
    }).filter(item => item.quantity > 0);
    saveCart({ ...cart, items: updatedItems });
  };

  const handleRemoveProduct = (productId) => {
    saveCart({ ...cart, items: cart.items.filter(item => item.productId !== productId) });
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return alert('Please login to save delivery addresses');
    try {
      await axios.post(`${CAPTAIN_API_URL}/api/addresses`, newAddress, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddressForm(false);
      setNewAddress({ recipientsName: '', recipientsPhone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', pincode: '', addressType: 'HOME', isDefault: true });
      await fetchAddresses();
    } catch (err) {
      if (err.response?.status === 401) {
        const refreshed = await tryTokenRefresh();
        if (refreshed) {
          const newToken = getAccessToken();
          try {
            await axios.post(`${CAPTAIN_API_URL}/api/addresses`, newAddress, {
              headers: { Authorization: `Bearer ${newToken}` }
            });
            setShowAddressForm(false);
            setNewAddress({ recipientsName: '', recipientsPhone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', pincode: '', addressType: 'HOME', isDefault: true });
            await fetchAddresses();
            return;
          } catch (retryErr) {
            console.error('Failed to save address after token refresh:', retryErr);
            alert(retryErr.response?.data?.message || retryErr.response?.data?.error || 'Failed to submit address.');
          }
        } else {
          clearAuth();
          alert('Your session has expired. Please login again.');
          navigate('/login');
        }
      } else {
        alert(err.response?.data?.message || err.response?.data?.error || 'Failed to submit address.');
      }
    }
  };

  const handleProceedCheckout = async () => {
    if (!selectedAddressId) return setErrorMessage("Please select a delivery address");
    if (validation && !validation.is_valid) return setErrorMessage("Please resolve cart issues before proceeding");
    
    setIsPlacingOrder(true);
    setErrorMessage('');
    const token = getAccessToken();
    if (!token) {
      setIsPlacingOrder(false);
      clearAuth();
      navigate('/login');
      return;
    }

    const payload = {
      shop_id: cart.shopId,
      address_id: selectedAddressId,
      order_channel: cart.orderChannel || 'ONLINE_DELIVERY',
      payment_mode: paymentMethod,
      items: cart.items.map(it => ({ product_id: it.productId, quantity: it.quantity }))
    };

    try {
      const res = await axios.post(`${CAPTAIN_API_URL}/api/orders/place`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('tri_consumer_cart');
      window.dispatchEvent(new Event('storage'));
      
      if (paymentMethod === 'ONLINE' && res.data.payment_intent_url) {
        window.location.href = res.data.payment_intent_url; // Stripe or Razorpay redirect
      } else {
        navigate(`/consumer-ecommerce/order-success/${res.data.order_id}`);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        const refreshed = await tryTokenRefresh();
        if (refreshed) {
          const newToken = getAccessToken();
          try {
            const res = await axios.post(`${CAPTAIN_API_URL}/api/orders/place`, payload, {
              headers: { Authorization: `Bearer ${newToken}` }
            });
            localStorage.removeItem('tri_consumer_cart');
            window.dispatchEvent(new Event('storage'));
            if (paymentMethod === 'ONLINE' && res.data.payment_intent_url) {
              window.location.href = res.data.payment_intent_url;
            } else {
              navigate(`/consumer-ecommerce/order-success/${res.data.order_id}`);
            }
            return;
          } catch (retryErr) {
            console.error('Failed to place order after token refresh:', retryErr);
            setErrorMessage(retryErr.response?.data?.message || retryErr.response?.data?.error || "Failed to place order.");
          }
        } else {
          clearAuth();
          alert('Your session has expired. Please login again.');
          navigate('/login');
        }
      } else {
        setErrorMessage(err.response?.data?.message || err.response?.data?.error || "Failed to place order.");
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const totalItemsCount = cart.items ? cart.items.reduce((acc, item) => acc + (item.quantity || 1), 0) : 0;
  const localItemTotal = cart.items ? cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
  const itemTotal = validation ? validation.sub_total : localItemTotal;
  const deliveryFee = validation ? validation.delivery_fee : (itemTotal > 0 ? 45 : 0);
  const taxes = itemTotal * 0.05;
  const grandTotal = validation ? validation.total : (itemTotal + deliveryFee + taxes);

  if (totalItemsCount === 0) {
    return (
      <CheckoutPageTemplate title="Your Cart" onBack={() => navigate(-1)}>
        <TriEmptyState
          icon={FaCartShopping}
          title="Your shopping cart is empty"
          description="Explore local markets and add active online category products directly to your doorstep."
          actionLabel="Find Shops Near Me"
          onAction={() => navigate('/consumer-ecommerce/near-me')}
        />
      </CheckoutPageTemplate>
    );
  }

  const StickyAction = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>Grand Total</Typography>
        <Typography variant="h3" color="text.primary">₹{grandTotal.toFixed(2)}</Typography>
      </Box>
      <TriButton 
        onClick={handleProceedCheckout} 
        disabled={isValidating || isPlacingOrder} 
        fullWidth={false}
        sx={{ width: '180px', borderRadius: '12px' }}
      >
        {isPlacingOrder ? <CircularProgress size={24} color="inherit" /> : 'Place Order'}
      </TriButton>
    </Box>
  );

  return (
    <CheckoutPageTemplate 
      title="Checkout Cart" 
      subtitle={isNearbyDeliveryOrder ? `Delivering from ${cart.shopName}` : ''}
      onBack={() => navigate(-1)}
      stickyAction={StickyAction}
    >
      {errorMessage && (
        <TriCard sx={{ bgcolor: 'error.main', color: '#fff', border: 'none' }}>
          <Typography variant="body2" fontWeight={800}>{errorMessage}</Typography>
        </TriCard>
      )}

      {validation && !validation.is_valid && (
        <TriCard sx={{ bgcolor: 'error.main', color: '#fff', border: 'none' }}>
          <Typography variant="body2" fontWeight={800}>⚠️ {validation.message}</Typography>
        </TriCard>
      )}

      {/* Cart Items */}
      <Box>
        <Typography variant="h5" fontWeight={800} mb={2}>
          {isNearbyDeliveryOrder ? `Items from ${cart.shopName}` : 'Order Items'}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {cart.items.map(item => {
            const validatedItem = validation?.items?.find(it => it.product_id === item.productId);
            const isAvailable = validatedItem ? validatedItem.isAvailable : true;
            return (
              <TriCard key={item.productId} sx={{ p: 1.5, borderRadius: '20px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box component="img" src={item.image} alt={item.title} sx={{ width: 60, height: 60, borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', fontFamily: '"Inter", sans-serif' }} noWrap>
                      {item.title}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#FF7A00', fontFamily: '"Inter", sans-serif', mt: 0.2 }}>
                      ₹{item.price}
                    </Typography>
                    {validatedItem && validatedItem.message !== "In Stock" && (
                      <Typography sx={{ fontSize: '10px', color: isAvailable ? '#22C55E' : '#EF4444', fontWeight: 700, fontFamily: '"Inter", sans-serif', mt: 0.2 }} noWrap>
                        {validatedItem.message}
                      </Typography>
                    )}
                  </Box>

                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: '#F8F9FB', borderRadius: '10px', p: 0.5, border: '1px solid #E2E8F0' }}>
                      <IconButton 
                        onClick={() => handleUpdateQty(item.productId, -1)} 
                        size="small" 
                        sx={{ p: 0.2, color: '#64748B' }}
                      >
                        <TriIcon name="remove" size={14} />
                      </IconButton>
                      <Typography sx={{ fontSize: '13px', fontWeight: 800, width: 18, textAlign: 'center', fontFamily: '"Inter", sans-serif', color: '#1E293B' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton 
                        onClick={() => handleUpdateQty(item.productId, 1)} 
                        size="small" 
                        disabled={!isAvailable}
                        sx={{ p: 0.2, color: '#64748B' }}
                      >
                        <TriIcon name="add" size={14} />
                      </IconButton>
                    </Stack>

                    <IconButton 
                      onClick={() => handleRemoveProduct(item.productId)} 
                      size="small"
                      sx={{ color: '#EF4444', p: 0.5 }}
                    >
                      <TriIcon name="delete" size={18} />
                    </IconButton>
                  </Stack>
                </Box>
              </TriCard>
            );
          })}
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Addresses */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={800}>Delivery Address</Typography>
          <TriButton variant="text" size="small" onClick={() => setShowAddressForm(true)}>+ ADD NEW</TriButton>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {addresses.map(a => (
            <TriAddressCard key={a.id} address={a} selected={selectedAddressId === a.id} onSelect={() => setSelectedAddressId(a.id)} />
          ))}
          {addresses.length === 0 && (
            <Typography variant="body2" color="text.secondary">No addresses saved. Please add one.</Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Bill Details */}
      <Box mb={2}>
        <Typography variant="h5" fontWeight={800} mb={2} display="flex" alignItems="center" gap={1}>
          <FaRegClipboard /> Bill Details
        </Typography>
        <TriCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Item Total</Typography>
            <Typography variant="body2" fontWeight={700}>₹{itemTotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Delivery Fee</Typography>
            <Typography variant="body2" fontWeight={700} sx={{ color: deliveryFee === 0 ? '#22C55E' : 'text.primary' }}>
              {deliveryFee === 0 ? 'FREE Delivery' : `₹${deliveryFee.toFixed(2)}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Taxes</Typography>
            <Typography variant="body2" fontWeight={700}>₹{taxes.toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h5" fontWeight={800}>To Pay</Typography>
            <Typography variant="h5" fontWeight={900}>₹{grandTotal.toFixed(2)}</Typography>
          </Box>
        </TriCard>
      </Box>

      {/* Add Address Dialog */}
      <Dialog open={showAddressForm} onClose={() => setShowAddressForm(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Add New Address</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddNewAddress} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Recipient's Name" value={newAddress.recipientsName} onChange={e => setNewAddress({...newAddress, recipientsName: e.target.value})} fullWidth required />
            <TextField label="Phone Number" value={newAddress.recipientsPhone} onChange={e => setNewAddress({...newAddress, recipientsPhone: e.target.value})} fullWidth required />
            <TextField label="Address Line 1" value={newAddress.addressLine1} onChange={e => setNewAddress({...newAddress, addressLine1: e.target.value})} fullWidth required />
            <TextField label="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} fullWidth required />
            <TextField label="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} fullWidth required />
            <TriButton type="submit">Save Address</TriButton>
          </Box>
        </DialogContent>
      </Dialog>
    </CheckoutPageTemplate>
  );
}
