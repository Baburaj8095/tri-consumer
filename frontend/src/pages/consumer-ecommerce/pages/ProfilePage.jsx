import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LuChevronLeft,
  LuChevronRight,
  LuLock,
  LuGift,
  LuPhone,
  LuLogOut,
  LuCamera,
  LuUser,
  LuMail,
  LuMapPin,
  LuX,
  LuCopy,
  LuCheck,
  LuWallet,
  LuHash,
} from 'react-icons/lu';
import { getAccessToken, clearAuth } from '../../../services/authStorage';
import '../consumerEcommerce.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('triConsumerUser') || 'null');
    } catch (_) {
      return null;
    }
  });

  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('triConsumerProfilePic') || '');

  const [activeModal, setActiveModal] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    address: '',
    pinCode: '',
    district: '',
    state: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      const data = res.data?.data || res.data;
      if (data) {
        setProfile(data);
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
    }).catch((err) => {
      console.error('Failed to load profile details:', err);
    });
  }, [navigate]);

  const handleAvatarClick = () => fileInputRef.current?.click();

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
    setErrorMsg('');
    setLoading(true);
    const token = getAccessToken();
    try {
      const res = await axios.put(`${API_BASE_URL}/api/users/profile`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || res.data;
      if (data) {
        setProfile(data);
        localStorage.setItem('triConsumerUser', JSON.stringify(data));
      }
      setIsSuccess(true);
      setTimeout(() => { setIsSuccess(false); setActiveModal(null); }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (passwordForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const token = getAccessToken();
    try {
      await axios.post(`${API_BASE_URL}/api/users/change-password`, {
        password: passwordForm.password,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setIsSuccess(true);
      setPasswordForm({ password: '', confirmPassword: '' });
      setTimeout(() => { setIsSuccess(false); setActiveModal(null); }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const referralId = profile?.prefixed_id || profile?.unique_id || profile?.username || '';
  const referralLink = `${window.location.origin}/register?sponsor_id=${referralId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  const handleLogoutConfirm = () => {
    clearAuth();
    setActiveModal(null);
    navigate('/login');
  };

  const displayName = profile?.fullName || profile?.full_name || 'My Profile';
  const displayId = profile?.prefixed_id || profile?.unique_id || (profile?.id ? `TR-${String(profile.id).padStart(10, '0')}` : '—');
  const rawMobile = profile?.mobile || profile?.phone || '';
  const displayMobile = rawMobile ? (rawMobile.startsWith('+91') ? rawMobile : `+91 ${rawMobile}`) : '—';
  const displayPinCode = profile?.pinCode || profile?.pincode || '—';
  // Build location cleanly – avoid duplicate fields
  const locParts = [];
  if (profile?.district) locParts.push(profile.district);
  if (profile?.state && profile.state !== profile?.district) locParts.push(profile.state);
  if (locParts.length > 0) locParts.push('India');
  const displayLocation = locParts.join(', ') || profile?.address || '—';
  const walletBalance = profile?.walletBalance ?? profile?.wallet_balance ?? null;

  return (
    <div className="pf-page">
      {/* ── Header ── */}
      <div className="pf-header">
        <button className="pf-back-btn" onClick={() => navigate('/consumer-ecommerce')} aria-label="Go back">
          <LuChevronLeft size={20} />
        </button>
        <span className="pf-header-title">Profile</span>
        <div style={{ width: 36 }} />
      </div>

      {/* ── Avatar + Name Card ── */}
      <div className="pf-hero">
        <div className="pf-avatar-wrap" onClick={handleAvatarClick} title="Change photo">
          {profilePic ? (
            <img src={profilePic} alt="Avatar" className="pf-avatar-img" />
          ) : (
            <div className="pf-avatar-placeholder">
              <LuUser size={36} />
            </div>
          )}
          <div className="pf-camera-badge">
            <LuCamera size={12} />
          </div>
          <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>

        <div className="pf-hero-info">
          <p className="pf-hero-label">PROFILE</p>
          <h2 className="pf-hero-name">{displayName}</h2>
          <p className="pf-hero-subtitle">Prime Consumer Member</p>
          <button className="pf-edit-link" onClick={() => { setErrorMsg(''); setActiveModal('edit'); }}>
            Edit Account / Settings
          </button>
        </div>
      </div>

      {/* ── Info Cards Grid ── */}
      <div className="pf-cards-section">

        {/* Row 1: ID + Pincode */}
        <div className="pf-cards-row">
          <div className="pf-info-card">
            <div className="pf-info-card-icon"><LuHash size={18} /></div>
            <span className="pf-info-card-label">ID Number</span>
            <strong className="pf-info-card-value">{displayId}</strong>
          </div>
          <div className="pf-info-card">
            <div className="pf-info-card-icon"><LuMapPin size={18} /></div>
            <span className="pf-info-card-label">Pin Code</span>
            <strong className="pf-info-card-value">{displayPinCode}</strong>
          </div>
        </div>

        {/* Row 2: Phone + Wallet (2-col) */}
        <div className="pf-cards-row">
          <div className="pf-info-card">
            <div className="pf-info-card-icon"><LuPhone size={18} /></div>
            <span className="pf-info-card-label">Phone</span>
            <strong className="pf-info-card-value" style={{ fontSize: '13px' }}>{displayMobile}</strong>
          </div>
          {walletBalance !== null ? (
            <div className="pf-info-card">
              <div className="pf-info-card-icon"><LuWallet size={18} /></div>
              <span className="pf-info-card-label">Wallet</span>
              <strong className="pf-info-card-value">₹{Number(walletBalance).toFixed(2)}</strong>
            </div>
          ) : (
            <div className="pf-info-card">
              <div className="pf-info-card-icon"><LuMapPin size={18} /></div>
              <span className="pf-info-card-label">Location</span>
              <strong className="pf-info-card-value" style={{ fontSize: '13px' }}>{displayLocation}</strong>
            </div>
          )}
        </div>

        {/* Location full-width if wallet also present */}
        {walletBalance !== null && (
          <div className="pf-info-card pf-info-card-full">
            <div className="pf-info-card-icon"><LuMapPin size={18} /></div>
            <div>
              <span className="pf-info-card-label">Location</span>
              <strong className="pf-info-card-value">{displayLocation}</strong>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <button className="pf-action-row" onClick={() => { setErrorMsg(''); setActiveModal('password'); }}>
          <div className="pf-action-icon pf-action-icon--blue"><LuLock size={18} /></div>
          <span>Change Password</span>
          <LuChevronRight size={16} className="pf-chevron" />
        </button>

        <button className="pf-action-row" onClick={() => { setIsSuccess(false); setActiveModal('refer'); }}>
          <div className="pf-action-icon pf-action-icon--orange"><LuGift size={18} /></div>
          <span>Refer Friends &amp; Businesses</span>
          <LuChevronRight size={16} className="pf-chevron" />
        </button>

        <button className="pf-action-row" onClick={() => setActiveModal('contact')}>
          <div className="pf-action-icon pf-action-icon--green"><LuPhone size={18} /></div>
          <span>Contact Us</span>
          <LuChevronRight size={16} className="pf-chevron" />
        </button>

        {/* Logout */}
        <button className="pf-action-row pf-logout-row" onClick={() => setActiveModal('logout')}>
          <LuLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* ══ MODALS ══ */}

      {/* Edit Profile */}
      {activeModal === 'edit' && (
        <div className="ce-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h3>Edit Profile</h3>
              <button className="ce-modal-close" onClick={() => setActiveModal(null)}><LuX size={20} /></button>
            </div>
            {isSuccess ? (
              <div className="ce-modal-success">
                <LuCheck size={40} style={{ strokeWidth: 3, color: '#22c55e' }} />
                <p>Profile updated successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} className="ce-modal-form">
                {errorMsg && <div className="ce-form-error">{errorMsg}</div>}
                <div className="ce-form-field">
                  <label>Full Name</label>
                  <input type="text" required value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
                </div>
                <div className="ce-form-field">
                  <label>Email Address</label>
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <div className="ce-form-field">
                  <label>Mobile Number</label>
                  <input type="tel" required value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} />
                </div>
                <div className="ce-form-field">
                  <label>Address</label>
                  <textarea rows={2} value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                </div>
                <div className="ce-form-row">
                  <div className="ce-form-field">
                    <label>Pincode</label>
                    <input type="text" maxLength={10} value={editForm.pinCode} onChange={(e) => setEditForm({ ...editForm, pinCode: e.target.value })} />
                  </div>
                  <div className="ce-form-field">
                    <label>District/City</label>
                    <input type="text" value={editForm.district} onChange={(e) => setEditForm({ ...editForm, district: e.target.value })} />
                  </div>
                </div>
                <div className="ce-form-field">
                  <label>State</label>
                  <input type="text" value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} />
                </div>
                <button type="submit" className="ce-modal-submit-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Change Password */}
      {activeModal === 'password' && (
        <div className="ce-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h3>Change Password</h3>
              <button className="ce-modal-close" onClick={() => setActiveModal(null)}><LuX size={20} /></button>
            </div>
            {isSuccess ? (
              <div className="ce-modal-success">
                <LuCheck size={40} style={{ strokeWidth: 3, color: '#22c55e' }} />
                <p>Password changed successfully!</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="ce-modal-form">
                {errorMsg && <div className="ce-form-error">{errorMsg}</div>}
                <div className="ce-form-field">
                  <label>New Password</label>
                  <input type="password" required placeholder="Enter new password" value={passwordForm.password} onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })} />
                </div>
                <div className="ce-form-field">
                  <label>Confirm Password</label>
                  <input type="password" required placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                </div>
                <button type="submit" className="ce-modal-submit-btn" disabled={loading}>
                  {loading ? 'Changing...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Refer Friends */}
      {activeModal === 'refer' && (
        <div className="ce-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h3>Refer Friends &amp; Businesses</h3>
              <button className="ce-modal-close" onClick={() => setActiveModal(null)}><LuX size={20} /></button>
            </div>
            <div className="ce-referral-content">
              <div className="ce-referral-illustration"><LuGift size={48} className="illustration-gift" /></div>
              <p className="ce-referral-copy-text">Share your link to refer new users and businesses to Trikonekt.</p>
              <div className="ce-referral-link-box">
                <input type="text" readOnly value={referralLink} />
                <button type="button" onClick={handleCopyLink} aria-label="Copy link">
                  {isSuccess ? <span className="copy-check">Copied!</span> : <LuCopy size={16} />}
                </button>
              </div>
              <div className="ce-referral-social-actions">
                <a href={`https://wa.me/?text=${encodeURIComponent(`Join me on Trikonekt! ${referralLink}`)}`} target="_blank" rel="noreferrer" className="ce-social-btn whatsapp-btn">
                  Share on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us */}
      {activeModal === 'contact' && (
        <div className="ce-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h3>Contact Us</h3>
              <button className="ce-modal-close" onClick={() => setActiveModal(null)}><LuX size={20} /></button>
            </div>
            <div className="ce-contact-content">
              <div className="ce-contact-row">
                <LuPhone size={20} className="ce-contact-icon color-green" />
                <div><h4>Call Support</h4><p>+91 99999 99999</p></div>
              </div>
              <div className="ce-contact-row">
                <LuMail size={20} className="ce-contact-icon color-blue" />
                <div><h4>Email Support</h4><p>contact@trikonekt.com</p></div>
              </div>
              <div className="ce-contact-row">
                <LuMapPin size={20} className="ce-contact-icon color-orange" />
                <div><h4>Head Office</h4><p>Trikonekt Marketing, Kerala, India</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirm */}
      {activeModal === 'logout' && (
        <div className="ce-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h3>Confirm Logout</h3>
              <button className="ce-modal-close" onClick={() => setActiveModal(null)}><LuX size={20} /></button>
            </div>
            <div className="ce-logout-confirm-content">
              <p>Are you sure you want to log out?</p>
              <div className="ce-logout-actions">
                <button type="button" className="ce-btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="button" className="ce-btn-primary red-bg" onClick={handleLogoutConfirm}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
