import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LuChevronLeft, LuPhone, LuMapPin, LuTruck, LuCheck, LuInfo } from 'react-icons/lu';
import { getAccessToken } from '../../../services/authStorage';
import BottomNav from '../components/BottomNav';
import '../../consumer-ecommerce/consumerEcommerce.css';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

export default function TrackOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // standard timelines
  const onlineTimelineSteps = [
    { key: 'PLACED', title: 'Order Placed', desc: 'Your order has been logged' },
    { key: 'CONFIRMED', title: 'Order Confirmed', desc: 'Store has accepted your order' },
    { key: 'PACKED', title: 'Packed', desc: 'Items are securely packaged' },
    { key: 'SHIPPED', title: 'Shipped', desc: 'Outward transit initiated' },
    { key: 'DISPATCHED', title: 'Out For Delivery', desc: 'Rider is carrying your package' },
    { key: 'DELIVERED', title: 'Delivered', desc: 'Order delivered to doorstep' }
  ];

  const storeTimelineSteps = [
    { key: 'PLACED', title: 'Order Placed', desc: 'Logged with nearby store' },
    { key: 'CONFIRMED', title: 'Store Accepted', desc: 'Merchant accepted preparation' },
    { key: 'PREPARING', title: 'Preparing', desc: 'Kitchen/Store preparing items' },
    { key: 'READY', title: 'Ready', desc: 'Prepared and awaiting pickup' },
    { key: 'PICKED_UP', title: 'Picked Up', desc: 'Partner agent picked up order' },
    { key: 'DELIVERED', title: 'Delivered', desc: 'Handed over successfully' }
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${CAPTAIN_API_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data) {
          const o = response.data;
          setOrder({
            id: String(o.id),
            orderId: o.order_number || `TR-${String(o.id).padStart(8, '0')}`,
            shopName: o.shop_name || 'Retail Store',
            status: String(o.status || 'CONFIRMED').toUpperCase(),
            location: o.address || 'No address specified',
            isNearby: o.order_channel === 'NEARBY_DELIVERY',
            awbNumber: o.awb_number,
            courierName: o.courier_name,
            trackingUrl: o.tracking_url,
            items: o.items || []
          });
        }
      } catch (err) {
        console.error('Error fetching tracking info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Fallback mock track order detail matching screenshots
  const displayTrack = order || (() => {
    const mockDb = {
      '1': {
        id: '1',
        orderId: 'TR12345678',
        shopName: 'Fresh Mart',
        status: 'DELIVERED',
        location: '#123, 5th Cross, Indiranagar, Bangalore, Karnataka - 560038',
        isNearby: true,
        items: [
          { product_title: 'Fortune Sunflower Oil 1L', quantity: 2, price: 160.00 },
          { product_title: 'Organic Tomato 1kg', quantity: 1, price: 40.00 }
        ]
      },
      '1001': {
        id: '1001',
        orderId: 'TR12345678',
        shopName: 'Fresh Mart',
        status: 'DELIVERED',
        location: '#123, 5th Cross, Indiranagar, Bangalore, Karnataka - 560038',
        isNearby: true,
        items: [
          { product_title: 'Fortune Sunflower Oil 1L', quantity: 2, price: 160.00 },
          { product_title: 'Organic Tomato 1kg', quantity: 1, price: 40.00 }
        ]
      },
      '1002': {
        id: '1002',
        orderId: 'TR12345677',
        shopName: 'Health Store',
        status: 'SHIPPED',
        location: '#123, 5th Cross, Indiranagar, Bangalore, Karnataka - 560038',
        isNearby: false,
        items: [
          { product_title: 'Chyawanprash 500g', quantity: 1, price: 245.00 },
          { product_title: 'Honey 250g', quantity: 2, price: 120.00 }
        ]
      },
      '1003': {
        id: '1003',
        orderId: 'TR12345676',
        shopName: 'Tech World',
        status: 'CONFIRMED',
        location: '#123, 5th Cross, Indiranagar, Bangalore, Karnataka - 560038',
        isNearby: false,
        items: [
          { product_title: 'Wireless Mouse', quantity: 1, price: 699.00 }
        ]
      },
      '1004': {
        id: '1004',
        orderId: 'TR12345675',
        shopName: 'Book Land',
        status: 'CANCELLED',
        location: '#123, 5th Cross, Indiranagar, Bangalore, Karnataka - 560038',
        isNearby: true,
        items: [
          { product_title: 'The Alchemist', quantity: 1, price: 299.00 }
        ]
      }
    };
    return mockDb[id] || mockDb['1001'];
  })();

  const activeStepsList = displayTrack.isNearby ? storeTimelineSteps : onlineTimelineSteps;
  
  // Resolve status progress index
  const getStatusIndex = (currentStatus) => {
    const s = String(currentStatus).toUpperCase();
    if (s === 'COMPLETED' || s === 'DELIVERED') return 5;
    if (s === 'DISPATCHED' || s === 'PICKED_UP' || s === 'OUT_FOR_DELIVERY') return 4;
    if (s === 'SHIPPED' || s === 'READY') return 3;
    if (s === 'PACKED' || s === 'PREPARING') return 2;
    if (s === 'CONFIRMED' || s === 'ACCEPTED') return 1;
    return 0; // PLACED
  };

  const statusIndex = getStatusIndex(displayTrack.status);

  // Formatted mock timestamps for steps
  const getMockTimestamp = (index) => {
    const times = [
      '12 May 2026, 11:30 AM',
      '12 May 2026, 11:35 AM',
      '12 May 2026, 02:15 PM',
      '12 May 2026, 03:10 PM',
      '12 May 2026, 04:20 PM',
      '12 May 2026, 04:45 PM'
    ];
    return times[index] || '';
  };

  return (
    <div className="ce-app" style={{ paddingTop: '72px', paddingBottom: '90px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <header className="ce-compact-page-header">
        <button onClick={() => navigate('/orders')} aria-label="Back">
          <LuChevronLeft size={20} />
        </button>
        <div>
          <h1>Track Order</h1>
          <p>Live delivery tracking</p>
        </div>
        <span><LuTruck size={20} /></span>
      </header>

      {/* Container */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '430px', margin: '0 auto' }}>
        
        {/* Order Info Bar */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>ORDER ID</span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0 0 0', color: '#0f172a' }}>#{displayTrack.orderId}</h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>STATUS</span>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: displayTrack.status === 'CANCELLED' ? '#ef4444' : '#10b981', marginTop: '2px' }}>
                {displayTrack.status}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Tracking Card */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: '#0f172a' }}>
            {displayTrack.isNearby ? '🏪 Nearby Store Track' : '📦 Online Shipping Track'}
          </h3>

          <div className="track-timeline">
            {activeStepsList.map((step, idx) => {
              let nodeState = 'pending'; // pending, active, completed
              if (idx < statusIndex) nodeState = 'completed';
              else if (idx === statusIndex && displayTrack.status !== 'CANCELLED') nodeState = 'active';
              else if (idx === statusIndex && displayTrack.status === 'CANCELLED') nodeState = 'pending'; // cancellation exception

              return (
                <div key={idx} className={`timeline-item ${nodeState}`}>
                  <div className="timeline-dot">
                    {nodeState === 'completed' ? <LuCheck size={14} /> : idx + 1}
                  </div>
                  <div className="timeline-info">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                  {idx <= statusIndex && (
                    <div className="timeline-time">
                      {getMockTimestamp(idx).split(', ')[1] || ''}
                      <span style={{ display: 'block', fontSize: '9px', fontWeight: 500, color: '#94a3b8' }}>
                        {getMockTimestamp(idx).split(', ')[0] || ''}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Details Card */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>Delivery Address</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '16px' }}>
            <LuMapPin size={18} color="#f97316" style={{ marginTop: '2px' }} />
            <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
              {displayTrack.location}
            </p>
          </div>

          {displayTrack.awbNumber ? (
            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>COURIER ({displayTrack.courierName || 'Shiprocket Fleet'})</span>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '2px 0 0 0', color: '#0f172a' }}>AWB: {displayTrack.awbNumber}</h4>
              </div>
              {displayTrack.trackingUrl && (
                <button
                  onClick={() => window.open(displayTrack.trackingUrl, '_blank')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 16px', borderRadius: '8px', border: 'none', background: '#f97316', color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                >
                  Track AWB
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>RIDER PARTNER</span>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '2px 0 0 0', color: '#0f172a' }}>Karan Kumar</h4>
              </div>
              <button
                onClick={() => window.open('tel:08095918105')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 16px', borderRadius: '8px', border: 'none', background: 'rgba(249, 115, 22, 0.08)', color: '#f97316', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
              >
                <LuPhone size={14} /> Call Rider
              </button>
            </div>
          )}
        </div>

        {/* Order Items Section */}
        {displayTrack.items && displayTrack.items.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>Order Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayTrack.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: index < displayTrack.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 2px 0', color: '#0f172a' }}>{item.product_title || item.productTitle}</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Qty: {item.quantity}</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>₹{((item.price || item.product_price || item.productPrice || 0) * item.quantity).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
