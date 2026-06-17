import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Stack, Tabs, Tab, Card, CardContent, Chip, CircularProgress, Container } from '@mui/material';
import { LuChevronLeft, LuStore, LuCalendar, LuHash, LuInfo } from 'react-icons/lu';
import { getAccessToken } from '../../../services/authStorage';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 = All, 1 = Orders, 2 = Giftcards, 3 = Recharges

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get(`${CAPTAIN_API_URL}/captain/offline-payments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setPayments(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load consumer orders:', err);
        setLoading(false);
      });
  }, [navigate]);

  const getStatusChip = (status) => {
    const stat = (status || '').toUpperCase();
    if (stat === 'APPROVED' || stat === 'ACCEPTED' || stat === 'SUCCESS') {
      return <Chip label="Approved" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 800, borderRadius: '6px' }} />;
    } else if (stat === 'REJECTED' || stat === 'FAILED') {
      return <Chip label="Rejected" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 800, borderRadius: '6px' }} />;
    } else {
      return <Chip label="Pending" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', fontWeight: 800, borderRadius: '6px' }} />;
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

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#f97316' }} />
      </Box>
    );
  }

  // Filter list by tab
  // For now, manual offline payments are listed under 'All' and 'Orders'
  const filteredPayments = activeTab === 0 || activeTab === 1 ? payments : [];

  return (
    <div className="ce-app" style={{ paddingTop: 84, paddingBottom: 80, minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header className="ce-compact-page-header">
        <Link to="/consumer-ecommerce" aria-label="Back"><LuChevronLeft /></Link>
        <div>
          <h1>My Orders</h1>
          <p>Your transaction history</p>
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
              fontWeight: 700,
              color: '#64748b',
              fontSize: '0.9rem',
              '&.Mui-selected': {
                color: '#f97316'
              }
            }
          }}
        >
          <Tab label="All" />
          <Tab label="Orders" />
          <Tab label="Giftcards" />
          <Tab label="Recharges" />
        </Tabs>
      </Box>

      {/* List Container */}
      <Container maxWidth="xs" sx={{ mt: 3 }}>
        {filteredPayments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <LuInfo size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
            <Typography sx={{ fontWeight: 700, color: '#64748b', mb: 0.5 }}>
              No transactions found
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Your offline payment history will appear here.
            </Typography>
          </Box>
        ) : (
          filteredPayments.map((pm) => (
            <Card 
              key={pm.id} 
              sx={{ 
                borderRadius: '16px', 
                mb: 2, 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(249, 115, 22, 0.1)', color: '#f97316', display: 'grid', placeItems: 'center' }}>
                      <LuStore size={18} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                      {pm.shopName}
                    </Typography>
                  </Stack>
                  {getStatusChip(pm.status)}
                </Stack>

                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
                    <LuHash size={14} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      Ref: {pm.refId}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
                    <LuCalendar size={14} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {formatDate(pm.createdAt)}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                      AMOUNT PAID
                    </Typography>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                      ₹{pm.amount.toFixed(2)}
                    </Typography>
                  </Box>
                  {pm.status === 'APPROVED' && (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800, display: 'block' }}>
                        +₹{(pm.amount * 0.05).toFixed(2)} Cashback
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Container>

      <BottomNav />
    </div>
  );
}
