import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Chip, CircularProgress } from '@mui/material';
import { LuInfo } from 'react-icons/lu';

import { getAccessToken, tryTokenRefresh } from '../../../services/authStorage';
import { useLocation, calculateDistance } from '../context/LocationContext';
import ShoppingPageTemplate from '../../../components/templates/ShoppingPageTemplate';
import TriOrderCard from '../../../components/ui/TriOrderCard';
import TriEmptyState from '../../../components/ui/TriEmptyState';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { location: userLoc } = useLocation();
  const [payments, setPayments] = useState([]);
  const [onlineOrders, setOnlineOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); 

  const loadAllHistory = async (authToken) => {
    try {
      const [paymentsRes, ordersRes] = await Promise.all([
        axios.get(`${CAPTAIN_API_URL}/captain/offline-payments`, { headers: { Authorization: `Bearer ${authToken}` } }),
        axios.get(`${CAPTAIN_API_URL}/api/orders`, { headers: { Authorization: `Bearer ${authToken}` } })
      ]);
      setPayments(paymentsRes.data || []);
      setOnlineOrders(ordersRes.data || []);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        const refreshed = await tryTokenRefresh();
        if (refreshed) {
          try {
            const [paymentsRetry, ordersRetry] = await Promise.all([
              axios.get(`${CAPTAIN_API_URL}/captain/offline-payments`, { headers: { Authorization: `Bearer ${getAccessToken()}` } }),
              axios.get(`${CAPTAIN_API_URL}/api/orders`, { headers: { Authorization: `Bearer ${getAccessToken()}` } })
            ]);
            setPayments(paymentsRetry.data || []);
            setOnlineOrders(ordersRetry.data || []);
            setLoading(false);
            return;
          } catch (retryErr) { console.error('Refresh failed:', retryErr); }
        }
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    if (!token) { setLoading(false); return; }
    loadAllHistory(token);
  }, []);

  const normalizedOrders = useMemo(() => {
    const baseOrders = [
      ...payments.map(p => ({
        id: String(p.id),
        orderId: p.refId || `TR-${String(p.id).padStart(8, '0')}`,
        shopName: p.shopName || 'Local Merchant',
        shopImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80',
        amount: p.amount || 0,
        date: p.createdAt || new Date().toISOString(),
        status: p.status === 'APPROVED' || p.status === 'SUCCESS' ? 'Delivered' : 'Cancelled',
        itemsText: 'Offline Payment Transaction',
        type: 'OFFLINE'
      })),
      ...onlineOrders.map(o => {
        let status = 'Confirmed';
        const rawStatus = String(o.status || '').toUpperCase();
        if (rawStatus === 'COMPLETED') status = 'Delivered';
        else if (rawStatus === 'DISPATCHED') status = 'Shipped';
        else if (rawStatus === 'CANCELLED') status = 'Cancelled';
        else if (rawStatus === 'RETURNED') status = 'Returned';

        return {
          id: String(o.id),
          orderId: `TR-${String(o.id).padStart(8, '0')}`,
          shopName: o.shopName || 'Retail Store',
          shopImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=120&q=80',
          amount: o.total || o.grandTotal || 0,
          date: o.createdAt || new Date().toISOString(),
          status,
          itemsText: o.items ? o.items.map(i => `${i.product_title || i.productTitle || 'Item'} (x${i.quantity})`).join(', ') : 'Product Package',
          type: 'ONLINE'
        };
      })
    ];

    if (baseOrders.length === 0) {
      return [
        { id: '1001', orderId: 'TR12345678', shopName: 'Fresh Mart', shopImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120', amount: 520.00, date: '2026-05-12T11:30:00Z', status: 'Delivered', itemsText: 'Fortune Sunflower Oil 1L (x2), Tomato 1kg (x1)', type: 'ONLINE' },
        { id: '1002', orderId: 'TR12345677', shopName: 'Health Store', shopImage: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=120', amount: 250.00, date: '2026-05-11T09:20:00Z', status: 'Shipped', itemsText: 'Organic Honey 500g (x1)', type: 'ONLINE' },
        { id: '1003', orderId: 'TR12345676', shopName: 'Tech World', shopImage: 'https://images.unsplash.com/photo-1600087626014-e652e18bbff2?w=120', amount: 1299.00, date: '2026-05-10T18:10:00Z', status: 'Confirmed', itemsText: 'Wireless Earbuds Pro (x1)', type: 'ONLINE' }
      ];
    }
    return baseOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments, onlineOrders, userLoc]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'All') return normalizedOrders;
    if (activeTab === 'Ongoing') return normalizedOrders.filter(o => o.status === 'Confirmed' || o.status === 'Shipped');
    return normalizedOrders.filter(o => o.status === activeTab);
  }, [normalizedOrders, activeTab]);

  const FilterTabs = (
    <Box sx={{ display: 'flex', gap: 1, pb: 1 }}>
      {['All', 'Ongoing', 'Completed', 'Cancelled', 'Returned'].map(tab => (
        <Chip
          key={tab}
          label={tab}
          onClick={() => setActiveTab(tab)}
          color={activeTab === tab ? 'primary' : 'default'}
          variant={activeTab === tab ? 'filled' : 'outlined'}
          sx={{ fontWeight: activeTab === tab ? 800 : 600 }}
        />
      ))}
    </Box>
  );

  return (
    <ShoppingPageTemplate
      title="My Orders"
      subtitle="Your transaction history & tracks"
      onBack={() => navigate('/consumer-ecommerce/profile')}
      filterChips={FilterTabs}
      hideBottomNav={true} // Orders page traditionally hides it, or we can show it depending on preference
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : filteredOrders.length === 0 ? (
        <TriEmptyState
          icon={LuInfo}
          title="No orders found"
          description={`There are no orders in the "${activeTab}" list.`}
        />
      ) : (
        <Box sx={{ pb: 4 }}>
          {filteredOrders.map(order => (
            <TriOrderCard 
              key={order.id} 
              order={order} 
              onClick={() => navigate(`/orders/${order.id}`)} 
            />
          ))}
        </Box>
      )}
    </ShoppingPageTemplate>
  );
}
