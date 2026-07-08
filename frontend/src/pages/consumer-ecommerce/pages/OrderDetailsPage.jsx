import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LuChevronLeft, LuPhone, LuMapPin, LuInfo, LuCalendar, LuHash, LuCheck } from 'react-icons/lu';
import { getAccessToken } from '../../../services/authStorage';
import BottomNav from '../components/BottomNav';
import '../../consumer-ecommerce/consumerEcommerce.css';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
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
          let status = 'Confirmed';
          const rawStatus = String(o.status || '').toUpperCase();
          if (rawStatus === 'COMPLETED') status = 'Delivered';
          else if (rawStatus === 'DISPATCHED') status = 'Shipped';
          else if (rawStatus === 'CANCELLED') status = 'Cancelled';
          else if (rawStatus === 'RETURNED') status = 'Returned';

          setOrder({
            id: String(o.id),
            orderId: o.order_number || `TR-${String(o.id).padStart(8, '0')}`,
            shopName: o.shop_name || 'Retail Store',
            shopImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=120&q=80',
            amount: o.total || o.grand_total || 0,
            date: o.created_at || new Date().toISOString(),
            status: status,
            items: o.items || [],
            location: o.address || 'No address specified',
            paymentMethod: o.payment_method || 'Online Pay',
            paymentStatus: o.payment_status || 'PAID',
            transactionId: o.payment_ref_id || 'N/A',
            subtotal: o.subtotal || 0,
            deliveryFee: o.delivery_fee || 0,
            phone: o.shop_phone || '',
            shopAddress: o.shop_address || 'Trikonekt Store Location'
          });
        }
      } catch (err) {
        console.error('Error loading order details from API:', err);
      } finally {
        setLoading(false);
      }
    };
 
    fetchOrderDetails();
  }, [id]);

  // Fallback to premium mockup orders matching screenshots
  const displayOrder = order || (() => {
    const mockDb = {
      '1001': {
        id: '1001',
        orderId: 'TR12345678',
        shopName: 'Fresh Mart',
        shopImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80',
        amount: 520.00,
        date: '2026-05-12T11:30:00Z',
        status: 'Delivered',
        items: [
          { product_title: 'Fortune Sunflower Oil 1L', quantity: 2, product_price: 160.00 },
          { product_title: 'Organic Tomato 1kg', quantity: 1, product_price: 40.00 },
          { product_title: 'Fresh Milk 1L Pack', quantity: 3, product_price: 60.00 }
        ],
        location: '#123, 5th Cross, Indiranagar, Bangalore, Karnataka - 560038',
        paymentMethod: 'Paid Online (UPI - PhonePe)',
        paymentStatus: 'PAID',
        transactionId: 'UPI9876543210',
        subtotal: 480.00,
        deliveryFee: 40.00,
        discount: 10.00,
        phone: '08045612398'
      },
      '1002': {
        id: '1002',
        orderId: 'TR12345677',
        shopName: 'Health Store',
        shopImage: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=120&q=80',
        amount: 250.00,
        date: '2026-05-11T09:20:00Z',
        status: 'Shipped',
        items: [
          { product_title: 'Organic Honey 500g', quantity: 1, product_price: 210.00 }
        ],
        location: '#123, 5th Cross, Indiranagar, Bangalore, Karnataka - 560038',
        paymentMethod: 'Paid Online (UPI)',
        paymentStatus: 'PAID',
        transactionId: 'UPI8876443210',
        subtotal: 210.00,
        deliveryFee: 40.00,
        discount: 0.00,
        phone: '08045612345'
      },
      '1003': {
        id: '1003',
        orderId: 'TR12345676',
        shopName: 'Tech World',
        shopImage: 'https://images.unsplash.com/photo-1600087626014-e652e18bbff2?auto=format&fit=crop&w=120&q=80',
        amount: 1299.00,
        date: '2026-05-10T18:10:00Z',
        status: 'Confirmed',
        items: [
          { product_title: 'Wireless Earbuds Pro', quantity: 1, product_price: 1259.00 }
        ],
        location: '#123, 5th Cross, Indiranagar, Bangalore, Karnataka - 560038',
        paymentMethod: 'Paid Online (Card)',
        paymentStatus: 'PAID',
        transactionId: 'TXN348721904',
        subtotal: 1259.00,
        deliveryFee: 40.00,
        discount: 0.00,
        phone: '08045618888'
      },
      '1004': {
        id: '1004',
        orderId: 'TR12345675',
        shopName: 'Book Land',
        shopImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=120&q=80',
        amount: 180.00,
        date: '2026-05-09T16:45:00Z',
        status: 'Cancelled',
        items: [
          { product_title: 'The Lean Startup (Book)', quantity: 1, product_price: 180.00 }
        ],
        location: '#123, 5th Cross, Indiranagar, Bangalore, Karnataka - 560038',
        paymentMethod: 'Refund Processed',
        paymentStatus: 'REFUNDED',
        transactionId: 'REF448931290',
        subtotal: 180.00,
        deliveryFee: 0.00,
        discount: 0.00,
        phone: '08045619999'
      }
    };
    return mockDb[id] || mockDb['1001'];
  })();

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return dateStr;
    }
  };

  return (
    <div className="ce-app" style={{ paddingTop: '72px', paddingBottom: '90px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <header className="ce-compact-page-header">
        <button onClick={() => navigate('/orders')} aria-label="Back">
          <LuChevronLeft size={20} />
        </button>
        <div>
          <h1>Order Details</h1>
          <p>Order Info &amp; Summary</p>
        </div>
        <span><LuInfo size={20} /></span>
      </header>

      {/* Main Container */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '430px', margin: '0 auto' }}>
        
        {/* Order Summary Card */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
              <LuHash size={14} />
              <span>Order #{displayOrder.orderId}</span>
            </div>
            <span className={`order-status-badge ${displayOrder.status.toLowerCase()}`}>
              {displayOrder.status}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
            <LuCalendar size={14} />
            <span>Placed on {formatDate(displayOrder.date)}</span>
          </div>
          {displayOrder.status && !['cancelled', 'rejected', 'failed'].includes(displayOrder.status.toLowerCase()) && (
            <Link
              to={`/track-order/${displayOrder.id}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '44px', width: '100%', background: 'rgba(249, 115, 22, 0.08)', color: '#f97316', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}
            >
              Track Order Live
            </Link>
          )}
        </div>

        {/* Order Items Section */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>Order Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayOrder.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: index < displayOrder.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 2px 0', color: '#0f172a' }}>{item.product_title || item.productTitle}</h4>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Qty: {item.quantity}</span>
                </div>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>₹{((item.price || item.product_price || item.productPrice || 0) * item.quantity).toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Details Section */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>Payment Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Payment Method</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{displayOrder.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Transaction ID</span>
              <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>{displayOrder.transactionId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Payment Status</span>
              <span style={{ fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <LuCheck size={14} /> {displayOrder.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Address Section */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>Delivery Address</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <LuMapPin size={18} color="#f97316" style={{ marginTop: '2px' }} />
            <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
              {displayOrder.location}
            </p>
          </div>
        </div>

        {/* Store Information Section */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>Store Information</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 2px 0', color: '#0f172a' }}>{displayOrder.shopName}</h4>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{displayOrder.shopAddress || 'Trikonekt Store Location'}</span>
            </div>
            <button
              onClick={() => window.open(`tel:${displayOrder.phone}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid #f97316', color: '#f97316', background: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
            >
              <LuPhone size={14} /> Call Store
            </button>
          </div>
        </div>

        {/* Price Breakdown Section */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>Price Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Subtotal</span>
              <span style={{ color: '#0f172a' }}>₹{displayOrder.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Delivery Charge</span>
              <span style={{ color: '#0f172a' }}>₹{displayOrder.deliveryFee.toFixed(2)}</span>
            </div>
            {displayOrder.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                <span>Discount Applied</span>
                <span>-₹{displayOrder.discount.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <strong style={{ fontSize: '15px', color: '#0f172a' }}>Total Paid</strong>
            <strong style={{ fontSize: '18px', color: '#f97316', fontWeight: 900 }}>₹{displayOrder.amount.toFixed(2)}</strong>
          </div>
        </div>

        {/* Support Section */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={() => alert('Support ticketing system is under development.')}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '48px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
          >
            <LuInfo size={18} /> Support Chat
          </button>
          <button
            onClick={() => navigate('/orders')}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '48px', borderRadius: '12px', border: 'none', background: '#FF7A00', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
          >
            Back to Orders
          </button>
        </div>

      </div>
    </div>
  );
}
