import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, Container, Stack, List, ListItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material';
import { LuChevronLeft, LuStore, LuSmartphone, LuCheck, LuDollarSign } from 'react-icons/lu';
import { getAccessToken } from '../../../services/authStorage';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

export default function UpiPaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract amount and refId from URL params
  const params = new URLSearchParams(location.search);
  const amountStr = params.get('amount') || '0';
  const amount = parseFloat(amountStr);
  const refId = params.get('refId') || '';

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate('/login');
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
            phone: found.phone || found.contact_number || '',
            location: found.city || found.address || 'Local Area',
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load shop details:', err);
        setLoading(false);
      });
  }, [id, navigate]);

  const handleOpenUpiApp = () => {
    // Standard UPI string: upi://pay?pa=merchant@upi&pn=MerchantName&am=10.00&tr=RefId
    const merchantVpa = 'trikonekt.merchant@upi';
    const merchantName = shop ? encodeURIComponent(shop.name) : 'Merchant';
    const upiUrl = `upi://pay?pa=${merchantVpa}&pn=${merchantName}&am=${amount.toFixed(2)}&tr=${refId}&cu=INR`;
    
    // Deep link wrapper
    window.location.href = upiUrl;

    // Fallback alert for desktop testing
    setTimeout(() => {
      alert('If a UPI app did not open, you can pay directly to the merchant using cash or scan their store UPI QR code.');
    }, 1000);
  };

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
        <Link to={`/consumer-ecommerce/shop/${id}/checkout?amount=${amount}`} aria-label="Back"><LuChevronLeft /></Link>
        <div>
          <h1>UPI Instructions</h1>
          <p>Manual payment verification</p>
        </div>
        <span><LuStore /></span>
      </header>

      <Container maxWidth="xs" sx={{ mt: 3 }}>
        {/* Payment Summary */}
        <Box sx={{ 
          bgcolor: '#fff', 
          borderRadius: '20px', 
          p: 3, 
          mb: 3, 
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
            Total Amount to Pay
          </Typography>
          <Typography sx={{ fontSize: '2.2rem', fontWeight: 900, color: '#f97316', mb: 1 }}>
            ₹{amount.toFixed(2)}
          </Typography>
          {refId && (
            <Typography variant="caption" sx={{ bgcolor: '#f1f5f9', px: 1.5, py: 0.75, borderRadius: '8px', fontWeight: 700, color: '#475569', display: 'inline-block' }}>
              Ref: {refId}
            </Typography>
          )}
        </Box>

        {/* Action Button to Launch UPI */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleOpenUpiApp}
          startIcon={<LuSmartphone />}
          sx={{
            py: 1.5,
            borderRadius: '12px',
            bgcolor: '#0ea5e9',
            fontWeight: 800,
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: 'none',
            mb: 3,
            '&:hover': {
              bgcolor: '#0284c7',
              boxShadow: 'none'
            }
          }}
        >
          Open UPI App
        </Button>

        {/* Instructions list */}
        <Box sx={{ 
          bgcolor: '#fff', 
          borderRadius: '20px', 
          p: 3, 
          mb: 4,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <Typography sx={{ fontWeight: 800, color: '#0f172a', mb: 2, fontSize: '0.95rem' }}>
            Follow these steps:
          </Typography>

          <List sx={{ p: 0 }}>
            <ListItem sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: 32, mt: 0.5, color: '#f97316' }}>
                <LuDollarSign size={20} />
              </ListItemIcon>
              <ListItemText 
                primary="Pay the Merchant" 
                secondary="Hand cash directly at the counter or scan the store's physical UPI QR code to transfer the amount."
                primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}
                secondaryTypographyProps={{ fontSize: '0.75rem', mt: 0.25 }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: 32, mt: 0.5, color: '#f97316' }}>
                <LuCheck size={20} />
              </ListItemIcon>
              <ListItemText 
                primary="Await Merchant Approval" 
                secondary="Once you make the payment, the merchant will receive a notification on their dashboard to accept or reject the payment request."
                primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}
                secondaryTypographyProps={{ fontSize: '0.75rem', mt: 0.25 }}
              />
            </ListItem>
          </List>
        </Box>

        {/* Open Orders button */}
        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate('/consumer-ecommerce/my-orders')}
          sx={{
            py: 1.5,
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
          Open Orders
        </Button>
      </Container>

      <BottomNav />
    </div>
  );
}
