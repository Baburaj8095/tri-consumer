import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, TextField, Button, Container, Stack, CircularProgress } from '@mui/material';
import { LuChevronLeft, LuStore, LuPhone } from 'react-icons/lu';
import { getAccessToken } from '../../../services/authStorage';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

export default function StorePaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

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
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80',
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
  }, [id, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 10) {
      setError('Amount must be at least ₹10');
      return;
    }

    navigate(`/consumer-ecommerce/shop/${id}/checkout?amount=${amt}`);
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
        <Link to="/consumer-ecommerce/nearby-stores" aria-label="Back"><LuChevronLeft /></Link>
        <div>
          <h1>Pay Store</h1>
          <p>Direct manual offline payment</p>
        </div>
        <span><LuStore /></span>
      </header>

      <Container maxWidth="xs" sx={{ mt: 3 }}>
        {shop && (
          <Box sx={{ 
            bgcolor: '#fff', 
            borderRadius: '20px', 
            p: 3, 
            mb: 3, 
            textAlign: 'center', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <Box sx={{ 
              width: 70, 
              height: 70, 
              borderRadius: '50%', 
              bgcolor: 'rgba(249, 115, 22, 0.1)', 
              color: '#f97316', 
              display: 'grid', 
              placeItems: 'center', 
              margin: '0 auto 16px' 
            }}>
              <LuStore size={36} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
              {shop.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 2 }}>
              {shop.location}
            </Typography>
            {shop.phone && (
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ color: '#64748b' }}>
                <LuPhone size={14} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {shop.phone}
                </Typography>
              </Stack>
            )}
          </Box>
        )}

        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ 
            bgcolor: '#fff', 
            borderRadius: '20px', 
            p: 3, 
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <Typography sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
            Enter Amount (₹)
          </Typography>

          <TextField
            fullWidth
            type="number"
            placeholder="Min ₹10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={!!error}
            helperText={error}
            inputProps={{ min: 10, step: 'any' }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&.Mui-focused fieldset': {
                  borderColor: '#f97316',
                }
              }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              py: 1.5,
              borderRadius: '12px',
              bgcolor: '#FF7A00',
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#FF8F22',
                boxShadow: 'none'
              }
            }}
          >
            Submit
          </Button>
        </Box>
      </Container>
    </div>
  );
}
