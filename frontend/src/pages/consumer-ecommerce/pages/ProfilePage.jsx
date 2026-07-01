import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Divider, 
  TextField, 
  CircularProgress, 
  Snackbar, 
  Alert, 
  Paper 
} from '@mui/material';

import { getAccessToken, clearAuth } from '../../../services/authStorage';
import TriAppShell from '../../../components/ui/TriAppShell';
import TriHeader from '../../../components/ui/TriHeader';
import TriCard from '../../../components/ui/TriCard';
import TriButton from '../../../components/ui/TriButton';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export default function ProfilePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [editForm, setEditForm] = useState({
    fullName: '', 
    email: '', 
    mobile: '', 
    address: '', 
    pinCode: '', 
    district: '', 
    state: '',
  });

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return navigate('/login');

    setLoading(true);
    axios.get(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      const data = res.data?.data || res.data;
      if (data) {
        localStorage.setItem('triConsumerUser', JSON.stringify(data));
        setEditForm({
          fullName: data.fullName || data.full_name || '', 
          email: data.email || '',
          mobile: data.mobile || data.phone || '', 
          address: data.address || '',
          pinCode: data.pinCode || data.pincode || '', 
          district: data.district || data.city || '',
          state: data.state || '',
        });
      }
    }).catch(err => {
      console.error('Failed to load profile:', err);
      if (err.response?.status === 401) {
        clearAuth();
        navigate('/login');
      } else {
        setErrorMsg('Failed to load profile details.');
      }
    }).finally(() => {
      setLoading(false);
    });
  }, [navigate]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); 
    setSaving(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/api/users/profile`, editForm, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      const data = res.data?.data || res.data;
      if (data) {
        localStorage.setItem('triConsumerUser', JSON.stringify(data));
      }
      setToastMessage('Profile details updated successfully!');
    } catch (err) {
      if (err.response?.status === 401) {
        clearAuth();
        navigate('/login');
      } else {
        setErrorMsg(err.response?.data?.message || err.response?.data?.detail || 'Failed to update profile.');
      }
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <TriAppShell bottomNavIndex={2} bg="background">
      <TriHeader title="Edit Profile" onBack={() => navigate(-1)} />
      
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, flex: 1, maxWidth: 600, mx: 'auto', width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress color="warning" />
          </Box>
        ) : (
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" fontWeight={800} mb={3} color="text.primary">
              Personal Details
            </Typography>
            <Box component="form" onSubmit={handleEditSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
              <TextField 
                label="Full Name" 
                value={editForm.fullName} 
                onChange={e => setEditForm({...editForm, fullName: e.target.value})} 
                fullWidth 
                required 
                variant="outlined"
              />
              <TextField 
                label="Email" 
                type="email" 
                value={editForm.email} 
                onChange={e => setEditForm({...editForm, email: e.target.value})} 
                fullWidth 
                variant="outlined"
              />
              <TextField 
                label="Mobile Number" 
                value={editForm.mobile} 
                onChange={e => setEditForm({...editForm, mobile: e.target.value})} 
                fullWidth 
                required 
                variant="outlined"
              />
              <TextField 
                label="Address" 
                value={editForm.address} 
                onChange={e => setEditForm({...editForm, address: e.target.value})} 
                fullWidth 
                variant="outlined"
              />
              <TextField 
                label="PIN Code" 
                value={editForm.pinCode} 
                onChange={e => setEditForm({...editForm, pinCode: e.target.value})} 
                fullWidth 
                variant="outlined"
              />
              <TextField 
                label="District / City" 
                value={editForm.district} 
                onChange={e => setEditForm({...editForm, district: e.target.value})} 
                fullWidth 
                variant="outlined"
              />
              <TextField 
                label="State" 
                value={editForm.state} 
                onChange={e => setEditForm({...editForm, state: e.target.value})} 
                fullWidth 
                variant="outlined"
              />
              <TriButton 
                type="submit" 
                disabled={saving} 
                sx={{ 
                  mt: 2, 
                  py: 1.5, 
                  fontWeight: 800,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderRadius: 2
                }}
              >
                {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
              </TriButton>
            </Box>
          </Paper>
        )}
      </Box>
      <Snackbar open={!!toastMessage} autoHideDuration={3000} onClose={() => setToastMessage('')} message={toastMessage} />
    </TriAppShell>
  );
}
