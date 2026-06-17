import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, Container, Stack, CircularProgress } from '@mui/material';
import { LuChevronLeft, LuStore, LuCheck } from 'react-icons/lu';
import { getAccessToken } from '../../../services/authStorage';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

export default function SecureCheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('MANUAL');
  const [error, setError] = useState('');

  // Extract amount from URL params
  const params = new URLSearchParams(location.search);
  const amountStr = params.get('amount') || '0';
  const amount = parseFloat(amountStr);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate('/login');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      navigate(`/consumer-ecommerce/shop/${id}/payment`);
      return;
    }

    axios.get(`${CAPTAIN_API_URL}/captain/merchants/b2c`)
      .then(res => {
        const data = res.data || [];
        const found = data.find(s => String(s.id) === String(id));
        if (found) {
          setShop({
            id: found.id,
            name: found.shop_name || found.business_name || found.full_name || 'B2C Merchant',
            category: 'Retail Store',
            location: found.city || found.address || 'Local Area',
          });
        } else {
          setError('Shop not found');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load shop details:', err);
        setError('Error loading shop details');
        setLoading(false);
      });
  }, [id, amount, navigate]);

  const handlePayNow = () => {
    const token = getAccessToken();
    if (!token) {
      navigate('/login');
      return;
    }

    setPaying(true);
    setError('');

    axios.post(
      `${CAPTAIN_API_URL}/captain/offline-payments`,
      {
        shopId: parseInt(id),
        amount: amount,
        paymentMethod: paymentMethod
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
      .then(res => {
        const data = res.data;
        navigate(`/consumer-ecommerce/shop/${id}/upi-payment?amount=${amount}&refId=${data.refId || data.ref_id}`);
      })
      .catch(err => {
        console.error('Failed to initiate manual payment:', err);
        setError('Error processing payment request. Please try again.');
        setPaying(false);
      });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#f97316' }} />
      </Box>
    );
  }

  return (
    <div className="ce-app" style={{ paddingTop: 84, paddingBottom: 160, minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header className="ce-compact-page-header">
        <Link to={`/consumer-ecommerce/shop/${id}/payment`} aria-label="Back"><LuChevronLeft /></Link>
        <div>
          <h1>Secure Checkout</h1>
          <p>Choose your payment method</p>
        </div>
        <span><LuStore /></span>
      </header>

      <Container maxWidth="xs" sx={{ mt: 3 }}>
        {error && (
          <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', p: 2, borderRadius: '12px', mb: 3, fontSize: '0.9rem', fontWeight: 600 }}>
            {error}
          </Box>
        )}

        {/* Shop Summary */}
        {shop && (
          <Box sx={{ 
            bgcolor: '#fff', 
            borderRadius: '20px', 
            p: 3, 
            mb: 3, 
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ 
                width: 50, 
                height: 50, 
                borderRadius: '12px', 
                bgcolor: 'rgba(249, 115, 22, 0.1)', 
                color: '#f97316', 
                display: 'grid', 
                placeItems: 'center',
                flexShrink: 0
              }}>
                <LuStore size={26} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', lineHeight: 1.2 }}>
                  {shop.name}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, mt: 0.5 }}>
                  {shop.category} • {shop.location}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Payment Methods */}
        <Typography sx={{ fontWeight: 800, color: '#0f172a', mb: 2, fontSize: '0.95rem' }}>
          Select Payment Method
        </Typography>

        <Stack spacing={2}>
          {/* Manual Payment option */}
          <Box 
            onClick={() => setPaymentMethod('MANUAL')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#fff',
              borderRadius: '16px',
              p: 2.5,
              border: '2px solid',
              borderColor: paymentMethod === 'MANUAL' ? '#f97316' : '#e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: paymentMethod === 'MANUAL' ? '0 4px 12px rgba(249,115,22,0.06)' : 'none'
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                Manual Payment (Pay Offline)
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, mt: 0.5 }}>
                Pay cash at counter or scan merchant UPI QR
              </Typography>
            </Box>
            {paymentMethod === 'MANUAL' && (
              <LuCheck size={24} color="#f97316" />
            )}
          </Box>

          {/* Razorpay Option */}
          <Box 
            onClick={() => setPaymentMethod('RAZORPAY')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#fff',
              borderRadius: '16px',
              p: 2.5,
              border: '2px solid',
              borderColor: paymentMethod === 'RAZORPAY' ? '#f97316' : '#e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: 0.75
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                Razorpay Online
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, mt: 0.5 }}>
                Pay online securely via Cards, UPI, or NetBanking
              </Typography>
            </Box>
            {paymentMethod === 'RAZORPAY' && (
              <LuCheck size={24} color="#f97316" />
            )}
          </Box>
        </Stack>
      </Container>

      {/* Bottom Summary Bar */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        bgcolor: '#fff', 
        borderTop: '1px solid #e2e8f0', 
        p: 3, 
        zIndex: 50,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.02)'
      }}>
        <Container maxWidth="xs">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Payable
              </Typography>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
                ₹{amount.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#f97316', fontWeight: 800 }}>
                Cashback Earned: ₹{(amount * 0.05).toFixed(2)}
              </Typography>
            </Box>
          </Stack>

          <Button
            fullWidth
            variant="contained"
            disabled={paying}
            onClick={handlePayNow}
            sx={{
              py: 1.75,
              borderRadius: '12px',
              bgcolor: '#f97316',
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#ea580c',
                boxShadow: 'none'
              }
            }}
          >
            {paying ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Pay Now'}
          </Button>
        </Container>
      </Box>

      <BottomNav />
    </div>
  );
}
