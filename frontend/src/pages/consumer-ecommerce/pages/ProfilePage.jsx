import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Avatar, IconButton, Divider, Grid, Dialog, DialogTitle, DialogContent, TextField, CircularProgress, Snackbar, Alert } from '@mui/material';
import { LuCamera, LuUser, LuMail, LuPhone, LuMapPin, LuLock, LuLogOut, LuGift, LuCopy, LuCheck, LuWallet, LuPackageCheck, LuHeartHandshake, LuShoppingBag } from 'react-icons/lu';

import { getAccessToken, clearAuth } from '../../../services/authStorage';
import TriAppShell from '../../../components/ui/TriAppShell';
import TriHeader from '../../../components/ui/TriHeader';
import TriCard from '../../../components/ui/TriCard';
import TriButton from '../../../components/ui/TriButton';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('triConsumerUser') || 'null'); } 
    catch { return null; }
  });
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('triConsumerProfilePic') || '');

  const [activeModal, setActiveModal] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [editForm, setEditForm] = useState({
    fullName: '', email: '', mobile: '', address: '', pinCode: '', district: '', state: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    password: '', confirmPassword: '',
  });

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return navigate('/login');

    axios.get(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      const data = res.data?.data || res.data;
      if (data) {
        setProfile(data);
        localStorage.setItem('triConsumerUser', JSON.stringify(data));
        setEditForm({
          fullName: data.fullName || data.full_name || '', email: data.email || '',
          mobile: data.mobile || data.phone || '', address: data.address || '',
          pinCode: data.pinCode || data.pincode || '', district: data.district || data.city || '',
          state: data.state || '',
        });
      }
    }).catch(err => console.error('Failed to load profile:', err));
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setProfilePic(dataUrl);
      localStorage.setItem('triConsumerProfilePic', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setLoading(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/api/users/profile`, editForm, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      const data = res.data?.data || res.data;
      if (data) {
        setProfile(data);
        localStorage.setItem('triConsumerUser', JSON.stringify(data));
      }
      setActiveModal(null);
      setToastMessage('Profile updated successfully!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.detail || 'Failed to update profile.');
    } finally { setLoading(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (passwordForm.password !== passwordForm.confirmPassword) return setErrorMsg('Passwords do not match');
    if (passwordForm.password.length < 6) return setErrorMsg('Password must be at least 6 characters');
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/users/change-password`, { password: passwordForm.password }, { 
        headers: { Authorization: `Bearer ${getAccessToken()}` } 
      });
      setActiveModal(null);
      setPasswordForm({ password: '', confirmPassword: '' });
      setToastMessage('Password updated successfully!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.detail || 'Failed to update password.');
    } finally { setLoading(false); }
  };

  const referralId = profile?.prefixed_id || profile?.unique_id || profile?.username || '';
  const referralLink = `${window.location.origin}/register?sponsor_id=${referralId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setIsSuccess(true);
    setToastMessage('Referral link copied!');
    setTimeout(() => setIsSuccess(false), 2000);
  };

  const handleLogoutConfirm = () => {
    clearAuth();
    setActiveModal(null);
    navigate('/login');
  };

  const displayName = profile?.fullName || profile?.full_name || 'My Profile';
  const displayId = profile?.prefixed_id || profile?.unique_id || (profile?.id ? `TR-${String(profile.id).padStart(10, '0')}` : '—');
  const displayMobile = profile?.mobile || profile?.phone || '—';
  
  const NavItem = ({ icon: Icon, title, onClick, color }) => (
    <Box 
      onClick={onClick}
      sx={{ 
        display: 'flex', alignItems: 'center', gap: 2, py: 2, 
        cursor: 'pointer', borderBottom: '1px solid', borderColor: 'divider' 
      }}
    >
      <Box sx={{ bgcolor: 'rgba(249, 115, 22, 0.1)', p: 1, borderRadius: 2, color: color || 'primary.main', display: 'flex' }}>
        <Icon size={20} />
      </Box>
      <Typography variant="body1" fontWeight={700} sx={{ flex: 1, color: color || 'text.primary' }}>{title}</Typography>
    </Box>
  );

  return (
    <TriAppShell bottomNavIndex={2} bg="background">
      <TriHeader title="My Profile" rightElement={<TriButton variant="text" onClick={() => setActiveModal('edit')}>Edit</TriButton>} />
      
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, flex: 1, maxWidth: 600, mx: 'auto', width: '100%' }}>
        
        {/* Profile Card */}
        <TriCard sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pt: 4, position: 'relative' }}>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Avatar 
              src={profilePic} 
              sx={{ width: 90, height: 90, bgcolor: 'primary.main', fontSize: '2rem', fontWeight: 800, border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
            >
              {!profilePic && displayName.charAt(0).toUpperCase()}
            </Avatar>
            <IconButton 
              size="small" 
              onClick={() => fileInputRef.current?.click()}
              sx={{ position: 'absolute', bottom: -5, right: -5, bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              <LuCamera size={14} />
            </IconButton>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
          </Box>
          <Typography variant="h4" fontWeight={900} color="text.primary">{displayName}</Typography>
          <Typography variant="caption" sx={{ bgcolor: 'rgba(249, 115, 22, 0.1)', color: 'primary.main', px: 1, py: 0.5, borderRadius: 1, mt: 1, fontWeight: 800 }}>
            ⭐ Prime Member
          </Typography>
        </TriCard>

        {/* Stats Strip */}
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TriCard sx={{ textAlign: 'center', p: 1.5 }}>
              <Typography variant="h6" fontWeight={800} color="text.primary">{displayId}</Typography>
              <Typography variant="caption" color="text.secondary">Member ID</Typography>
            </TriCard>
          </Grid>
          <Grid item xs={4}>
            <TriCard sx={{ textAlign: 'center', p: 1.5 }}>
              <Typography variant="h6" fontWeight={800} color="text.primary">{displayMobile.replace('+91', '').trim()}</Typography>
              <Typography variant="caption" color="text.secondary">Mobile</Typography>
            </TriCard>
          </Grid>
          <Grid item xs={4}>
            <TriCard sx={{ textAlign: 'center', p: 1.5 }}>
              <Typography variant="h6" fontWeight={800} color="success.main">₹{profile?.walletBalance || '0.00'}</Typography>
              <Typography variant="caption" color="text.secondary">Wallet</Typography>
            </TriCard>
          </Grid>
        </Grid>

        {/* Referral Section */}
        <TriCard sx={{ bgcolor: 'primary.main', color: '#fff', border: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: 2, display: 'flex' }}><LuGift size={24} /></Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" fontWeight={800}>Refer & Earn</Typography>
              <Typography variant="caption">Share your link and earn rewards!</Typography>
            </Box>
            <IconButton onClick={handleCopyLink} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.2)' }}>
              {isSuccess ? <LuCheck /> : <LuCopy />}
            </IconButton>
          </Box>
        </TriCard>

        {/* Quick Links */}
        <TriCard noPadding sx={{ p: '0 16px' }}>
          <NavItem icon={LuShoppingBag} title="My Orders" onClick={() => navigate('/consumer-ecommerce/my-orders')} />
          <NavItem icon={LuUser} title="KYC Verification" onClick={() => navigate('/consumer-ecommerce/kyc')} />
          <NavItem icon={LuLock} title="Change Password" onClick={() => { setErrorMsg(''); setActiveModal('password'); }} />
          <NavItem icon={LuLogOut} title="Log Out" color="#ef4444" onClick={() => setActiveModal('logout')} />
        </TriCard>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog open={activeModal === 'edit'} onClose={() => setActiveModal(null)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={800}>Edit Profile</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            <TextField label="Full Name" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} fullWidth required />
            <TextField label="Email" type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} fullWidth />
            <TextField label="Mobile Number" value={editForm.mobile} onChange={e => setEditForm({...editForm, mobile: e.target.value})} fullWidth required />
            <TextField label="Address" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} fullWidth />
            <TextField label="PIN Code" value={editForm.pinCode} onChange={e => setEditForm({...editForm, pinCode: e.target.value})} fullWidth />
            <TextField label="District / City" value={editForm.district} onChange={e => setEditForm({...editForm, district: e.target.value})} fullWidth />
            <TextField label="State" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} fullWidth />
            <TriButton type="submit" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Save Changes'}</TriButton>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={activeModal === 'password'} onClose={() => setActiveModal(null)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={800}>Change Password</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handlePasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            <TextField label="New Password" type="password" value={passwordForm.password} onChange={e => setPasswordForm({...passwordForm, password: e.target.value})} fullWidth required />
            <TextField label="Confirm Password" type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} fullWidth required />
            <TriButton type="submit" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Update Password'}</TriButton>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Logout Dialog */}
      <Dialog open={activeModal === 'logout'} onClose={() => setActiveModal(null)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={800} sx={{ textAlign: 'center' }}>Are you sure?</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" mb={3}>You will be logged out of your account.</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TriButton variant="outlined" color="inherit" onClick={() => setActiveModal(null)}>Cancel</TriButton>
            <TriButton color="error" onClick={handleLogoutConfirm}>Log Out</TriButton>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar open={!!toastMessage} autoHideDuration={3000} onClose={() => setToastMessage('')} message={toastMessage} />
    </TriAppShell>
  );
}
