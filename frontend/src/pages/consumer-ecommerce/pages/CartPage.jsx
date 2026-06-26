import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, FaLocationDot, FaPlus, FaMinus, FaTrash, 
  FaRegClipboard, FaBuilding, FaBriefcase, FaHouse, FaCirclePlus, FaTicket
} from 'react-icons/fa6';
import BottomNav from '../components/BottomNav.jsx';
import { getAccessToken } from '../../../services/authStorage';
import '../consumerEcommerce.css';

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
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // COD or ONLINE
  const isNearbyDeliveryOrder = cart.orderChannel === 'NEARBY_DELIVERY';

  // Address modal/form toggle & state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientsName: '',
    recipientsPhone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    pincode: '',
    addressType: 'HOME',
    isDefault: true
  });

  // 2. Fetch Saved Addresses on Mount
  const fetchAddresses = async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const res = await axios.get(`${CAPTAIN_API_URL}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data || [];
      setAddresses(list);
      
      // Select default or first address
      if (list.length > 0) {
        const def = list.find(a => a.isDefault) || list[0];
        setSelectedAddressId(def.id);
      }
    } catch (err) {
      console.error('Failed to load user addresses:', err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // 3. Real-time Cart Validation Trigger
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
      latitude: currentCart.latitude || null,
      longitude: currentCart.longitude || null,
      items: currentCart.items.map(it => ({
        product_id: it.productId,
        quantity: it.quantity
      }))
    };

    try {
      const res = await axios.post(`${CAPTAIN_API_URL}/api/cart/validate`, payload, { headers });
      setValidation(res.data);
    } catch (err) {
      console.error('Error validating cart with backend:', err);
      setErrorMessage('Backend validation service is offline. Proceeding with offline subtotal limits.');
    } finally {
      setIsValidating(false);
    }
  };

  // Run validation whenever cart contents change or address selection changes
  useEffect(() => {
    runValidation(cart, selectedAddressId);
  }, [cart, selectedAddressId]);

  // 4. Cart Operations
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('tri_consumer_cart', JSON.stringify(newCart));
  };

  const handleUpdateQty = (productId, delta) => {
    const updatedItems = cart.items.map(item => {
      if (item.productId === productId) {
        const nextQty = item.quantity + delta;
        return { ...item, quantity: nextQty };
      }
      return item;
    }).filter(item => item.quantity > 0);

    const updatedCart = { ...cart, items: updatedItems };
    saveCart(updatedCart);
  };

  const handleRemoveProduct = (productId) => {
    const updatedItems = cart.items.filter(item => item.productId !== productId);
    const updatedCart = { ...cart, items: updatedItems };
    saveCart(updatedCart);
  };

  // 5. Create Address Handler
  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) {
      alert('Please login to save delivery addresses');
      return;
    }

    // Basic Validation
    if (!newAddress.recipientsName || !newAddress.recipientsPhone || !newAddress.addressLine1 || !newAddress.city || !newAddress.pincode) {
      alert('Please fill out all required address fields.');
      return;
    }

    try {
      const payload = {
        recipientsName: newAddress.recipientsName,
        recipientsPhone: newAddress.recipientsPhone,
        addressLine1: newAddress.addressLine1,
        addressLine2: newAddress.addressLine2,
        landmark: newAddress.landmark,
        city: newAddress.city,
        pincode: newAddress.pincode,
        addressType: newAddress.addressType,
        isDefault: newAddress.isDefault
      };

      await axios.post(`${CAPTAIN_API_URL}/api/addresses`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear address state & close form
      setShowAddressForm(false);
      setNewAddress({
        recipientsName: '',
        recipientsPhone: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        pincode: '',
        addressType: 'HOME',
        isDefault: true
      });

      // Reload address list
      await fetchAddresses();
    } catch (err) {
      console.error('Failed to save address:', err);
      alert(err.response?.data?.error || 'Failed to submit address. Try checking the field formats.');
    }
  };

  // 6. Complete Lease Lock and Place Order
  const handleProceedCheckout = async () => {
    const token = getAccessToken();
    if (!token) {
      alert('Please sign in to place deliveries.');
      navigate('/login');
      return;
    }

    if (!selectedAddressId) {
      setErrorMessage('Please configure a deliverable address.');
      alert('A shipping delivery address is required.');
      return;
    }

    if (!validation || !validation.is_valid) {
      setErrorMessage(validation?.message || 'Your order contains issues. Please verify compatibility.');
      alert(validation?.message || 'Please fix cart issues before checkout.');
      return;
    }

    setIsPlacingOrder(true);
    setErrorMessage('');

    const itemsPayload = cart.items.map(it => ({
      product_id: it.productId,
      quantity: it.quantity
    }));

    try {
      // Step A: Lock virtual lock lease under Spring transactional protections
      await axios.post(`${CAPTAIN_API_URL}/api/orders/lease`, itemsPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const effectivePaymentMethod = cart.orderChannel === 'NEARBY_DELIVERY' ? 'COD' : paymentMethod;

      // Step B: Post the final verified CreateOrderRequest payload
      const orderPayload = {
        shop_id: cart.shopId,
        address_id: selectedAddressId,
        order_channel: cart.orderChannel || 'ONLINE_DELIVERY',
        latitude: cart.latitude || null,
        longitude: cart.longitude || null,
        payment_method: effectivePaymentMethod,
        notes: notes || '',
        items: itemsPayload
      };

      const orderRes = await axios.post(`${CAPTAIN_API_URL}/api/orders`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orderData = orderRes.data || {};
      const orderNumber = orderData.order_number;
      const grandTotal = orderData.grand_total || orderData.total || 0;

      // Clear the local state cart
      localStorage.removeItem('tri_consumer_cart');

      if (effectivePaymentMethod === 'ONLINE' && orderNumber) {
        // Generate UPI deep-link and open it
        const upiLink = `upi://pay?pa=trikonekt.payments@upi&pn=Trikonekt&am=${grandTotal.toFixed(2)}&tr=${orderNumber}&tn=Online%20Order%20${orderNumber}`;
        window.location.href = upiLink;

        // After returning from UPI app, poll payment status every 3 seconds for up to 2 minutes
        let pollCount = 0;
        const maxPolls = 40;
        const pollInterval = setInterval(async () => {
          pollCount++;
          try {
            const statusRes = await axios.get(`${CAPTAIN_API_URL}/api/payments/status/${orderNumber}`);
            const { payment_status, order_status } = statusRes.data;

            if (payment_status === 'PAID' || order_status === 'PENDING_CONFIRMATION') {
              clearInterval(pollInterval);
              navigate(`/consumer-ecommerce/my-orders?highlight=${orderNumber}`);
            } else if (payment_status === 'FAILED' || pollCount >= maxPolls) {
              clearInterval(pollInterval);
              setErrorMessage('Payment could not be verified. Your order is saved — retry payment from My Orders.');
              setIsPlacingOrder(false);
              navigate(`/consumer-ecommerce/my-orders?highlight=${orderNumber}`);
            }
          } catch (_) { /* ignore poll errors */ }
        }, 3000);
      } else {
        // COD / Near Store delivery — go straight to orders. Near Store delivery is paid after completion via Pay Store.
        navigate('/consumer-ecommerce/my-orders');
      }

    } catch (err) {
      console.error('Order state placement failed:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to finish checkout. Some items may be out of stock.');
      setIsPlacingOrder(false);
    }
  };

  // 7. Render Computations
  const totalItemsCount = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  
  // Calculate raw local totals while waiting for validation response
  const localItemTotal = cart.items ? cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
  const itemTotal = validation ? validation.sub_total : localItemTotal;
  const deliveryFee = validation ? validation.delivery_fee : (itemTotal > 0 ? 45 : 0);
  const taxes = itemTotal * 0.05;
  const grandTotal = validation ? validation.total : (itemTotal + deliveryFee + taxes);

  // If Cart is Empty
  if (totalItemsCount === 0) {
    return (
      <div className="ce-app" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <header className="ce-header ce-delivery-header">
          <div className="ce-header-inner ce-delivery-header-inner" style={{ gridTemplateColumns: '42px 1fr 42px' }}>
            <button onClick={() => navigate(-1)} className="ce-icon-btn ce-delivery-back-btn">
              <FaArrowLeft />
            </button>
            <div className="ce-delivery-header-title-wrap">
              <h1 className="ce-delivery-title" style={{ fontSize: '1.1rem', fontWeight: 900 }}>Your Delivery Cart</h1>
            </div>
            <div></div>
          </div>
        </header>
        <main className="ce-container" style={{ paddingTop: '120px', textAlign: 'center', paddingLeft: '24px', paddingRight: '24px' }}>
          <div style={{ fontSize: '4.5rem', color: '#cbd5e1', marginBottom: '16px' }}>
            <FaTrash />
          </div>
          <h2 style={{ color: '#1e293b', fontWeight: 800, fontSize: '1.4rem' }}>Your shopping cart is empty</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '8px', lineHeight: 1.5 }}>
            Explore local markets and add active online category products directly to your doorstep.
          </p>
          <Link to="/consumer-ecommerce/near-me" className="ce-submit-btn" style={{ display: 'inline-block', marginTop: '24px', width: 'auto', padding: '12px 28px', textDecoration: 'none', background: '#ea580c', borderRadius: '12px', fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>
            Find Shops Near Me
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="ce-app" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '160px' }}>
      {/* Header */}
      <header className="ce-header ce-delivery-header">
        <div className="ce-header-inner ce-delivery-header-inner" style={{ gridTemplateColumns: '42px 1fr 42px' }}>
          <button onClick={() => navigate(-1)} className="ce-icon-btn ce-delivery-back-btn">
            <FaArrowLeft />
          </button>
          <div className="ce-delivery-header-title-wrap">
            <h1 className="ce-delivery-title" style={{ fontSize: '1.1rem', fontWeight: 900 }}>Checkout Cart</h1>
            {isNearbyDeliveryOrder && (
              <p className="ce-delivery-location" style={{ justifyContent: 'center', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>
                <FaLocationDot style={{ marginRight: '4px' }} /> Delivering from {cart.shopName}
              </p>
            )}
          </div>
          <div></div>
        </div>
      </header>

      {/* Main Container */}
      <main className="ce-container" style={{ paddingTop: '80px', paddingLeft: '16px', paddingRight: '16px' }}>
        
        {/* Error Warning Banner */}
        {errorMessage && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '16px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 700 }}>
            {errorMessage}
          </div>
        )}
        
        {validation && !validation.is_valid && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid #fee2e2', padding: '16px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 700 }}>
            ⚠️ {validation.message}
          </div>
        )}

        {/* 1. Cart Items list */}
        <section style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
            {isNearbyDeliveryOrder ? `Items from ${cart.shopName}` : 'Online Order Items'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.items.map(item => {
              // Find item-specific message from validation response
              const validatedItem = validation?.items?.find(it => it.product_id === item.productId);
              const isAvailable = validatedItem ? validatedItem.isAvailable : true;
              const hasAlert = validatedItem && validatedItem.message && validatedItem.message !== "In Stock";

              return (
                <div key={item.productId} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'} 
                    alt={item.title} 
                    style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>{item.title}</h4>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ea580c', display: 'block', marginTop: '2px' }}>
                      ₹{item.price}
                    </span>
                    {hasAlert && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isAvailable ? '#22c55e' : '#ef4444', marginTop: '4px', display: 'block' }}>
                        {validatedItem.message}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '4px', borderRadius: '28px', border: '1px solid #e2e8f0' }}>
                    <button 
                      onClick={() => handleUpdateQty(item.productId, -1)} 
                      style={{ border: 'none', background: 'none', color: '#64748b', display: 'flex', cursor: 'pointer', padding: '6px' }}
                    >
                      <FaMinus size={11} />
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', minWidth: '18px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => handleUpdateQty(item.productId, 1)} 
                      style={{ border: 'none', background: 'none', color: '#64748b', display: 'flex', cursor: 'pointer', padding: '6px' }}
                    >
                      <FaPlus size={11} />
                    </button>
                  </div>

                  <button 
                    onClick={() => handleRemoveProduct(item.productId)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Delivery Address Book Selection */}
        <section style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
              Delivery Destination
            </h3>
            {!showAddressForm && (
              <button 
                onClick={() => setShowAddressForm(true)}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#ea580c', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                <FaCirclePlus size={14} /> Add Address
              </button>
            )}
          </div>

          {/* New address inline form */}
          {showAddressForm && (
            <form onSubmit={handleAddNewAddress} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 900, color: '#1e293b' }}>Add Shipping Address</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Recipient's Name *</label>
                  <input 
                    type="text" 
                    value={newAddress.recipientsName}
                    onChange={e => setNewAddress({ ...newAddress, recipientsName: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Recipient's Phone *</label>
                  <input 
                    type="tel" 
                    value={newAddress.recipientsPhone}
                    onChange={e => setNewAddress({ ...newAddress, recipientsPhone: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Address Line 1 *</label>
                <input 
                  type="text" 
                  value={newAddress.addressLine1}
                  onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                  placeholder="House No, Building, Flat, Apartment, Street"
                  required
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Address Line 2</label>
                  <input 
                    type="text" 
                    value={newAddress.addressLine2}
                    onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                    placeholder="Floor, Block, Area"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Landmark</label>
                  <input 
                    type="text" 
                    value={newAddress.landmark}
                    onChange={e => setNewAddress({ ...newAddress, landmark: e.target.value })}
                    placeholder="Nearby landmark"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>City *</label>
                  <input 
                    type="text" 
                    value={newAddress.city}
                    placeholder="e.g. Bangalore"
                    onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Pincode *</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="6 digits"
                    value={newAddress.pincode}
                    onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g,'') })}
                    required
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {['HOME', 'WORK', 'OTHER'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewAddress({ ...newAddress, addressType: type })}
                    style={{
                      padding: '8px', borderRadius: '8px', border: '1px solid', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                      borderColor: newAddress.addressType === type ? '#ea580c' : '#cbd5e1',
                      backgroundColor: newAddress.addressType === type ? 'rgba(234,88,12,0.06)' : '#fff',
                      color: newAddress.addressType === type ? '#ea580c' : '#475569'
                    }}
                  >
                    {type === 'HOME' && <FaHouse style={{ marginRight: '4px' }} />}
                    {type === 'WORK' && <FaBriefcase style={{ marginRight: '4px' }} />}
                    {type === 'OTHER' && <FaBuilding style={{ marginRight: '4px' }} />}
                    {type}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddressForm(false)}
                  style={{ padding: '8px 16px', background: 'none', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ padding: '8px 16px', background: '#ea580c', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          {/* List existing selectable addresses */}
          {addresses.length === 0 ? (
            <div style={{ padding: '16px 0', textAlign: 'center', color: '#64748b' }}>
              <p style={{ fontSize: '0.85rem', margin: '0 0 10px 0', fontWeight: 600 }}>No saved addresses found.</p>
              {!showAddressForm && (
                <button 
                  onClick={() => setShowAddressForm(true)}
                  style={{ backgroundColor: 'rgba(234,88,12,0.1)', border: 'none', padding: '8px 16px', borderRadius: '8px', color: '#ea580c', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Create Shipping Address
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {addresses.map(addr => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div 
                    key={addr.id} 
                    onClick={() => setSelectedAddressId(addr.id)}
                    style={{
                      border: '1.5px solid', cursor: 'pointer', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px', transition: 'all 0.1s',
                      borderColor: isSelected ? '#ea580c' : '#cbd5e1',
                      backgroundColor: isSelected ? 'rgba(234,88,12,0.03)' : '#fff'
                    }}
                  >
                    <div style={{ marginTop: '3px', color: isSelected ? '#ea580c' : '#64748b' }}>
                      <FaLocationDot size={15} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{addr.recipientsName}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#e2e8f0', color: '#475569' }}>
                          {addr.addressType}
                        </span>
                        {addr.isDefault && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981' }}>DEFAULT</span>
                        )}
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                        {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}{addr.landmark && `${addr.landmark}, `}{addr.city} - {addr.pincode}
                      </p>
                      <span style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        Phone: {addr.recipientsPhone}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. Notes & Delivery Instructions */}
        <section style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
            <FaRegClipboard style={{ marginRight: '6px' }} /> Delivery Instructions
          </h3>
          <textarea 
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Leave with security guard, do not ring bell if late, etc."
            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '0.85rem', resize: 'none', outline: 'none' }}
          />
        </section>

        {/* 4. Payment Methods option */}
        <section style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
             Payment Options
          </h3>
          {isNearbyDeliveryOrder ? (
            <div style={{ border: '1.5px solid #ea580c', backgroundColor: 'rgba(234,88,12,0.03)', padding: '12px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1e293b' }}>
                Pay after delivery via Pay Store
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block', lineHeight: 1.4 }}>
                Your nearby store delivery order will be placed now. Once the merchant marks it delivered, pay using the same existing offline Pay Store flow from My Orders.
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              {['ONLINE', 'COD'].map(method => (
                <div 
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  style={{
                    flex: 1, border: '1.5px solid', cursor: 'pointer', padding: '12px', borderRadius: '12px', textAlign: 'center', transition: 'all 0.1s',
                    borderColor: paymentMethod === method ? '#ea580c' : '#cbd5e1',
                    backgroundColor: paymentMethod === method ? 'rgba(234,88,12,0.03)' : '#fff'
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1e293b' }}>
                    {method === 'ONLINE' ? 'Pay Online (Razorpay)' : 'Cash on Delivery (COD)'}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                    {method === 'ONLINE' ? 'Seamless UPI, Cards' : 'Pay when parcel arrives'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5. Bill Details Section */}
        <section style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
            Bill Summary
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569' }}>
              <span>Item Subtotal</span>
              <span style={{ fontWeight: 700 }}>₹{itemTotal.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569' }}>
              <span>Delivery Shipping Partner</span>
              <span style={{ fontWeight: 700 }}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569' }}>
              <span>Government Taxes (5%)</span>
              <span style={{ fontWeight: 700 }}>₹{taxes.toFixed(2)}</span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
              <span>Amount To Pay</span>
              <span style={{ color: '#ea580c' }}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Bottom Pay Bar */}
      <div 
        style={{ 
          position: 'fixed', bottom: '68px', left: 0, right: 0, 
          backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', 
          padding: '16px 20px', zIndex: 100, display: 'flex', 
          justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.05)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block' }}>TOTAL AMOUNT</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
            ₹{grandTotal.toFixed(2)}
          </span>
        </div>

        <button 
          onClick={handleProceedCheckout}
          disabled={isValidating || isPlacingOrder || (validation && !validation.is_valid)}
          style={{ 
            backgroundColor: (isValidating || isPlacingOrder || (validation && !validation.is_valid)) ? '#f9bc8e' : '#ea580c', 
            color: '#fff', border: 'none', padding: '12px 28px', 
            borderRadius: '12px', fontSize: '0.95rem', fontWeight: 800, 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)'
          }}
        >
          {isPlacingOrder ? (
            <span>Placing Order...</span>
          ) : isValidating ? (
            <span>Checking Stocks...</span>
          ) : (
            <>
              {isNearbyDeliveryOrder ? 'Place Delivery Order' : 'Proceed to Pay'} <FaArrowLeft style={{ transform: 'rotate(180deg)' }} />
            </>
          )}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}



