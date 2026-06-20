import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Stack, Tabs, Tab, Card, CardContent, Chip, CircularProgress, Container, Button } from '@mui/material';
import { 
  LuChevronLeft, LuStore, LuCalendar, LuHash, LuInfo, 
  LuShoppingBag, LuTruck, LuX, LuTimer 
} from 'react-icons/lu';
import { getAccessToken, tryTokenRefresh } from '../../../services/authStorage';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [onlineOrders, setOnlineOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 = All, 1 = Orders, 2 = Giftcards, 3 = Recharges

  const loadAllHistory = async (authToken) => {
    try {
      const [paymentsRes, ordersRes] = await Promise.all([
        axios.get(`${CAPTAIN_API_URL}/captain/offline-payments`, {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        axios.get(`${CAPTAIN_API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ]);
      setPayments(paymentsRes.data || []);
      setOnlineOrders(ordersRes.data || []);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        const refreshed = await tryTokenRefresh();
        if (refreshed) {
          const newToken = getAccessToken();
          try {
            const [paymentsRetry, ordersRetry] = await Promise.all([
              axios.get(`${CAPTAIN_API_URL}/captain/offline-payments`, {
                headers: { Authorization: `Bearer ${newToken}` }
              }),
              axios.get(`${CAPTAIN_API_URL}/api/orders`, {
                headers: { Authorization: `Bearer ${newToken}` }
              })
            ]);
            setPayments(paymentsRetry.data || []);
            setOnlineOrders(ordersRetry.data || []);
            setLoading(false);
            return;
          } catch (retryErr) {
            console.error('Failed to reload details after refresh:', retryErr);
          }
        }
      }
      console.error('Failed to load transaction history:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate('/login');
      return;
    }
    loadAllHistory(token);
  }, [navigate]);

  // Handle shoppper cancellation endpoint
  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this pending delivery order?");
    if (!confirmCancel) return;

    const token = getAccessToken();
    if (!token) return;

    try {
      await axios.post(`${CAPTAIN_API_URL}/api/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Order cancelled successfully.');
      setLoading(true);
      await loadAllHistory(token);
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert(err.response?.data?.message || 'Failed to cancel the order. Some stores might already have processed it.');
    }
  };

  const isOrderPaid = (item) => String(item.paymentStatus || item.payment_status || '').toUpperCase() === 'PAID';
  const getOfflinePaymentId = (item) => item.offlinePaymentId || item.offline_payment_id;
  const isNearbyDeliveryOrder = (item) => String(item.orderChannel || item.order_channel || '').toUpperCase() === 'NEARBY_DELIVERY';

  const handlePayDeliveryOrder = (item) => {
    const amount = Number(item.grandTotal || item.grand_total || item.total || 0);
    if (!item.shopId && !item.shop_id) {
      alert('Shop information is missing for this order. Please refresh and try again.');
      return;
    }
    if (!amount || amount < 10) {
      alert('Invalid delivery order amount. Please contact support.');
      return;
    }
    navigate(`/consumer-ecommerce/shop/${item.shopId || item.shop_id}/checkout?amount=${amount}&onlineOrderId=${item.id}`);
  };

  const getOfflineStatusChip = (status) => {
    const stat = (status || '').toUpperCase();
    if (stat === 'APPROVED' || stat === 'ACCEPTED' || stat === 'SUCCESS') {
      return <Chip label="Approved" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 800, borderRadius: '6px' }} />;
    } else if (stat === 'REJECTED' || stat === 'FAILED') {
      return <Chip label="Rejected" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 800, borderRadius: '6px' }} />;
    } else {
      return <Chip label="Pending" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', fontWeight: 800, borderRadius: '6px' }} />;
    }
  };

  const getOnlineStatusChip = (status) => {
    const stat = (status || '').toUpperCase();
    switch (stat) {
      case 'PENDING_CONFIRMATION':
        return <Chip icon={<LuTimer size={14} style={{ color: '#d97706' }} />} label="Pending Approval" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', fontWeight: 800, borderRadius: '6px' }} />;
      case 'CONFIRMED':
        return <Chip icon={<LuStore size={14} style={{ color: '#3b82f6' }} />} label="Accepted" size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 800, borderRadius: '6px' }} />;
      case 'PREPARING':
        return <Chip label="Preparing" size="small" sx={{ bgcolor: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', fontWeight: 800, borderRadius: '6px' }} />;
      case 'DISPATCHED':
        return <Chip icon={<LuTruck size={14} style={{ color: '#a855f7' }} />} label="Out for Delivery" size="small" sx={{ bgcolor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', fontWeight: 800, borderRadius: '6px' }} />;
      case 'COMPLETED':
        return <Chip label="Completed" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 800, borderRadius: '6px' }} />;
      case 'CANCELLED':
        return <Chip icon={<LuX size={14} style={{ color: '#ef4444' }} />} label="Cancelled" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 800, borderRadius: '6px' }} />;
      default:
        return <Chip label={status} size="small" sx={{ bgcolor: 'rgba(100, 116, 139, 0.1)', color: '#64748b', fontWeight: 800, borderRadius: '6px' }} />;
    }
  };

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

  // Combine and sort both lists chronologically for the "All" tab
  const allHistorySorted = useMemo(() => {
    const combined = [
      ...payments.map(p => ({
        ...p,
        recordType: 'OFFLINE_PAYMENT',
        dateParsed: new Date(p.createdAt || p.created_at || 0)
      })),
      ...onlineOrders.map(o => ({
        ...o,
        recordType: 'ONLINE_ORDER',
        dateParsed: new Date(o.createdAt || o.created_at || 0)
      }))
    ];
    return combined.sort((a, b) => b.dateParsed - a.dateParsed);
  }, [payments, onlineOrders]);

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#f97316' }} />
      </Box>
    );
  }

  return (
    <div className="ce-app" style={{ paddingTop: 84, paddingBottom: 80, minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header className="ce-compact-page-header">
        <Link to="/consumer-ecommerce" aria-label="Back"><LuChevronLeft /></Link>
        <div>
          <h1>My Orders</h1>
          <p>Your transaction history & deliveries</p>
        </div>
        <span><LuStore /></span>
      </header>

      {/* Tabs */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0', zIndex: 10 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, val) => setActiveTab(val)}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#f97316',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 800,
              color: '#64748b',
              fontSize: '0.85rem',
              '&.Mui-selected': {
                color: '#f97316'
              }
            }
          }}
        >
          <Tab label="All Tracks" />
          <Tab label="Delivery Orders" />
          <Tab label="Giftcards" />
          <Tab label="Recharges" />
        </Tabs>
      </Box>

      {/* List Container */}
      <Container maxWidth="xs" sx={{ mt: 3, px: 2 }}>

        {/* Tab 0: All Tracks (Merged Payments and Orders) */}
        {activeTab === 0 && (
          allHistorySorted.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
              <LuInfo size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
              <Typography sx={{ fontWeight: 800, color: '#64748b', mb: 0.5 }}>
                No records yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Join the Trikonekt offline or online delivery tracks to see your list here.
              </Typography>
            </Box>
          ) : (
            allHistorySorted.map((item) => {
              if (item.recordType === 'OFFLINE_PAYMENT') {
                return (
                  <Card 
                    key={`pm-${item.id}`} 
                    sx={{ 
                      borderRadius: '16px', mb: 2, border: '1px solid #e2e8f0', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden'
                    }}
                  >
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(249, 115, 22, 0.1)', color: '#f97316', display: 'grid', placeItems: 'center' }}>
                            <LuStore size={18} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                              {item.shopName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                              OFFLINE PAY
                            </Typography>
                          </Box>
                        </Stack>
                        {getOfflineStatusChip(item.status)}
                      </Stack>

                      <Stack spacing={0.5} sx={{ mb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
                          <LuHash size={13} />
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            Ref: {item.refId}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
                          <LuCalendar size={13} />
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {formatDate(item.createdAt)}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                            AMOUNT PAID
                          </Typography>
                          <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                            ₹{item.amount.toFixed(2)}
                          </Typography>
                        </Box>
                        {(item.status === 'APPROVED' || item.status === 'SUCCESS') && (
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800, display: 'block' }}>
                              +₹{(item.amount * 0.05).toFixed(2)} Cashback
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              } else {
                // Return Online Delivery order item
                return (
                  <Card 
                    key={`order-${item.id}`} 
                    sx={{ 
                      borderRadius: '16px', mb: 2, border: '1px solid #cbd5e1', 
                      boxShadow: '0 4px 12px rgba(234, 88, 12, 0.04)', overflow: 'hidden'
                    }}
                  >
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', display: 'grid', placeItems: 'center' }}>
                            <LuShoppingBag size={18} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                              {item.shopName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#ea580c', fontWeight: 800 }}>
                              ONLINE B2C DELIVERY
                            </Typography>
                          </Box>
                        </Stack>
                        {getOnlineStatusChip(item.status)}
                      </Stack>

                      {/* Items bullet summary */}
                      <Box sx={{ mb: 2, bgcolor: '#f8fafc', p: 1.5, borderRadius: '10px' }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, mb: 0.5 }}>
                          Order Items:
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, lineHeight: 1.4 }}>
                          {item.items ? item.items.map(it => `${it.product_title || it.productTitle || 'Product'} (x${it.quantity})`).join(', ') : 'Category Product'}
                        </Typography>
                        {item.notes && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#94a3b8', fontStyle: 'italic' }}>
                            Instructions: "{item.notes}"
                          </Typography>
                        )}
                      </Box>

                      <Stack spacing={0.5} sx={{ mb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
                          <LuHash size={13} />
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            Order ID: #{item.id}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
                          <LuCalendar size={13} />
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {formatDate(item.createdAt)}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                            TOTAL DIRECT DEBIT
                          </Typography>
                          <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#ea580c' }}>
                            ₹{item.total.toFixed(2)}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontWeight: 600 }}>
                            via {item.paymentMethod || 'ONLINE'} • Status: {item.paymentStatus || 'PENDING'}
                          </Typography>
                        </Box>

                        {isNearbyDeliveryOrder(item) && item.status === 'COMPLETED' && !isOrderPaid(item) && !getOfflinePaymentId(item) && (
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => handlePayDeliveryOrder(item)}
                            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', bgcolor: '#f97316', boxShadow: 'none' }}
                          >
                            Pay Store
                          </Button>
                        )}

                        {isNearbyDeliveryOrder(item) && getOfflinePaymentId(item) && !isOrderPaid(item) && (
                          <Chip label="Pay approval pending" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', fontWeight: 800, borderRadius: '6px' }} />
                        )}

                        {item.status === 'PENDING_CONFIRMATION' && (
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => handleCancelOrder(item.id)}
                            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                          >
                            Cancel
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              }
            })
          )
        )}

        {/* Tab 1: Delivery Orders only */}
        {activeTab === 1 && (
          onlineOrders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
              <LuShoppingBag size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
              <Typography sx={{ fontWeight: 800, color: '#64748b', mb: 0.5 }}>
                No active delivery orders
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                You haven't ordered any delivery packages yet. Browse our online eligible catalogs to get started!
              </Typography>
              <Link to="/consumer-ecommerce/near-me" style={{ textDecoration: 'none' }}>
                <Button variant="contained" sx={{ mt: 3, bgcolor: '#ea580c', fontWeight: 800, textTransform: 'none', borderRadius: '10px' }}>
                  Browse Shops
                </Button>
              </Link>
            </Box>
          ) : (
            onlineOrders.map((item) => (
              <Card 
                key={`orders-only-${item.id}`} 
                sx={{ 
                  borderRadius: '16px', mb: 2, border: '1px solid #cbd5e1', 
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.04)', overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', display: 'grid', placeItems: 'center' }}>
                        <LuShoppingBag size={18} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                          {item.shopName}
                        </Typography>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ea580c' }}>
                          ONLINE STATE CONTROL
                        </span>
                      </Box>
                    </Stack>
                    {getOnlineStatusChip(item.status)}
                  </Stack>

                  {/* Items bullet summary */}
                  <Box sx={{ mb: 2, bgcolor: '#f8fafc', p: 1.5, borderRadius: '10px' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, mb: 0.5 }}>
                      Order Items:
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, lineHeight: 1.4 }}>
                      {item.items ? item.items.map(it => `${it.product_title || it.productTitle || 'Product'} (x${it.quantity})`).join(', ') : 'Category Product'}
                    </Typography>
                    {item.notes && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#94a3b8', fontStyle: 'italic' }}>
                        Instructions: "{item.notes}"
                      </Typography>
                    )}
                  </Box>

                  <Stack spacing={0.5} sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
                      <LuHash size={13} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        Order ID: #{item.id}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
                      <LuCalendar size={13} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {formatDate(item.createdAt)}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                        TOTAL AMOUNT
                      </Typography>
                      <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#ea580c' }}>
                        ₹{item.total.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontWeight: 600 }}>
                        via {item.paymentMethod || 'ONLINE'} • Payment: {item.paymentStatus || 'PENDING'}
                      </Typography>
                    </Box>

                    {isNearbyDeliveryOrder(item) && item.status === 'COMPLETED' && !isOrderPaid(item) && !getOfflinePaymentId(item) && (
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => handlePayDeliveryOrder(item)}
                        sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', bgcolor: '#f97316', boxShadow: 'none' }}
                      >
                        Pay Store
                      </Button>
                    )}

                    {isNearbyDeliveryOrder(item) && getOfflinePaymentId(item) && !isOrderPaid(item) && (
                      <Chip label="Pay approval pending" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', fontWeight: 800, borderRadius: '6px' }} />
                    )}

                    {item.status === 'PENDING_CONFIRMATION' && (
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        onClick={() => handleCancelOrder(item.id)}
                        sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))
          )
        )}

        {/* Tab 2: Giftcards Mock Placeholder */}
        {activeTab === 2 && (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <LuInfo size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
            <Typography sx={{ fontWeight: 800, color: '#64748b', mb: 0.5 }}>
              No Active Gift Adz or Coupons
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Gift Adz wallet purchases and virtual tickets will resolve here once acquired.
            </Typography>
          </Box>
        )}

        {/* Tab 3: Recharges Mock Placeholder */}
        {activeTab === 3 && (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <LuInfo size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
            <Typography sx={{ fontWeight: 800, color: '#64748b', mb: 0.5 }}>
              No Mobile / Utility Recharges
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              All Tri Pay utility transaction statements are securely stored on our centralized network blocks.
            </Typography>
          </Box>
        )}

      </Container>

      <BottomNav />
    </div>
  );
}




