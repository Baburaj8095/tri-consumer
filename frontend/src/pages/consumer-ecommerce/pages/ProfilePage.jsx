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
} from 'react-icons/lu';
import { getAccessToken, clearAuth } from '../../../services/authStorage';
import '../consumerEcommerce.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('triConsumerUser') || 'null');
    } catch (_) {
      return null;
    }
  });
  
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('triConsumerProfilePic') || '');
  
  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'edit' | 'password' | 'refer' | 'contact' | 'logout' | null
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    address: '',
    pinCode: '',
    district: '',
    state: '',
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  });

  // Load profile from backend
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

  // File Upload Handlers
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

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

  // Edit Profile Submit
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
      setTimeout(() => {
        setIsSuccess(false);
        setActiveModal(null);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.detail || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  // Change Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (passwordForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const token = getAccessToken();

    try {
      await axios.post(`${API_BASE_URL}/api/users/change-password`, {
        password: passwordForm.password,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsSuccess(true);
      setPasswordForm({ password: '', confirmPassword: '' });
      setTimeout(() => {
        setIsSuccess(false);
        setActiveModal(null);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  // Referral Link Copy
  const referralId = profile?.prefixed_id || profile?.unique_id || profile?.username || '';
  const referralLink = `${window.location.origin}/register?sponsor_id=${referralId}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  // Logout Handlers
  const handleLogoutConfirm = () => {
    clearAuth();
    setActiveModal(null);
    navigate('/login');
  };

  return (
    <div className="ce-profile-page-container">
      {/* Header */}
      <div className="ce-profile-page-header">
        <button className="ce-back-btn" onClick={() => navigate('/consumer-ecommerce')} aria-label="Go back">
          <LuChevronLeft size={24} />
        </button>
        <h1 className="ce-header-title">Settings</h1>
        <div style={{ width: 24 }} />
      </div>

      {/* User profile card */}
      <div className="ce-profile-user-card">
        <div className="ce-avatar-wrapper" onClick={handleAvatarClick} title="Upload photo">
          {profilePic ? (
            <img src={profilePic} alt="User Avatar" className="ce-profile-avatar-img" />
          ) : (
            <div className="ce-profile-avatar-placeholder">
              <LuUser size={40} />
            </div>
          )}
          <div className="ce-camera-badge">
            <LuCamera size={14} />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        <div className="ce-profile-user-info">
          <h2>{profile?.fullName || profile?.full_name || 'Loading user...'}</h2>
          <button 
            type="button" 
            className="ce-edit-account-btn"
            onClick={() => {
              setErrorMsg('');
              setActiveModal('edit');
            }}
          >
            Edit Account
          </button>
        </div>
      </div>

      {/* Settings Options List */}
      <div className="ce-settings-options-list">
        <button className="ce-settings-item" onClick={() => { setErrorMsg(''); setActiveModal('password'); }}>
          <div className="ce-settings-item-left">
            <div className="ce-settings-icon-circle color-blue">
              <LuLock size={18} />
            </div>
            <span>Change Password</span>
          </div>
          <LuChevronRight size={18} className="ce-chevron-arrow" />
        </button>

        <button className="ce-settings-item" onClick={() => { setIsSuccess(false); setActiveModal('refer'); }}>
          <div className="ce-settings-item-left">
            <div className="ce-settings-icon-circle color-orange">
              <LuGift size={18} />
            </div>
            <span>Refer Friends & Businesses</span>
          </div>
          <LuChevronRight size={18} className="ce-chevron-arrow" />
        </button>

        <button className="ce-settings-item" onClick={() => setActiveModal('contact')}>
          <div className="ce-settings-item-left">
            <div className="ce-settings-icon-circle color-green">
              <LuPhone size={18} />
            </div>
            <span>Contact Us</span>
          </div>
          <LuChevronRight size={18} className="ce-chevron-arrow" />
        </button>

        <button className="ce-settings-item text-red" onClick={() => setActiveModal('logout')}>
          <div className="ce-settings-item-left">
            <div className="ce-settings-icon-circle color-red">
              <LuLogOut size={18} />
            </div>
            <span>Logout</span>
          </div>
          <LuChevronRight size={18} className="ce-chevron-arrow" />
        </button>
      </div>

      {/* MODALS */}

      {/* Edit Profile Modal */}
      {activeModal === 'edit' && (
        <div className="ce-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h3>Edit Profile</h3>
              <button className="ce-modal-close" onClick={() => setActiveModal(null)}><LuX size={20} /></button>
            </div>
            
            {isSuccess ? (
              <div className="ce-modal-success">
                <LuCheck size={40} className="success-icon" style={{ strokeWidth: 3, color: '#22c55e' }} />
                <p>Profile updated successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} className="ce-modal-form">
                {errorMsg && <div className="ce-form-error">{errorMsg}</div>}
                
                <div className="ce-form-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  />
                </div>

                <div className="ce-form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>

                <div className="ce-form-field">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  />
                </div>

                <div className="ce-form-field">
                  <label>Address</label>
                  <textarea
                    rows={2}
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>

                <div className="ce-form-row">
                  <div className="ce-form-field">
                    <label>Pincode</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={editForm.pinCode}
                      onChange={(e) => setEditForm({ ...editForm, pinCode: e.target.value })}
                    />
                  </div>
                  <div className="ce-form-field">
                    <label>District/City</label>
                    <input
                      type="text"
                      value={editForm.district}
                      onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    />
                  </div>
                </div>

                <div className="ce-form-field">
                  <label>State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  />
                </div>

                <button type="submit" className="ce-modal-submit-btn" disabled={loading}>
                  {loading ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {activeModal === 'password' && (
        <div className="ce-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h3>Change Password</h3>
              <button className="ce-modal-close" onClick={() => setActiveModal(null)}><LuX size={20} /></button>
            </div>

            {isSuccess ? (
              <div className="ce-modal-success">
                <LuCheck size={40} className="success-icon" style={{ strokeWidth: 3, color: '#22c55e' }} />
                <p>Password changed successfully!</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="ce-modal-form">
                {errorMsg && <div className="ce-form-error">{errorMsg}</div>}

                <div className="ce-form-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  />
                </div>

                <div className="ce-form-field">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>

                <button type="submit" className="ce-modal-submit-btn" disabled={loading}>
                  {loading ? 'Changing Password...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Refer Friends Modal */}
      {activeModal === 'refer' && (
        <div className="ce-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h3>Refer Friends & Businesses</h3>
              <button className="ce-modal-close" onClick={() => setActiveModal(null)}><LuX size={20} /></button>
            </div>

            <div className="ce-referral-content">
              <div className="ce-referral-illustration">
                <LuGift size={48} className="illustration-gift" />
              </div>
              <p className="ce-referral-copy-text">Share your link below to refer new users and businesses to Trikonekt.</p>
              
              <div className="ce-referral-link-box">
                <input type="text" readOnly value={referralLink} />
                <button type="button" onClick={handleCopyLink} aria-label="Copy link">
                  {isSuccess ? <span className="copy-check">Copied!</span> : <LuCopy size={16} />}
                </button>
              </div>

              <div className="ce-referral-social-actions">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`Join me on Trikonekt! Use my referral link: ${referralLink}`)}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="ce-social-btn whatsapp-btn"
                >
                  Share on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
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
                <div>
                  <h4>Call Support</h4>
                  <p>+91 99999 99999</p>
                </div>
              </div>
              
              <div className="ce-contact-row">
                <LuMail size={20} className="ce-contact-icon color-blue" />
                <div>
                  <h4>Email Support</h4>
                  <p>contact@trikonekt.com</p>
                </div>
              </div>

              <div className="ce-contact-row">
                <LuMapPin size={20} className="ce-contact-icon color-orange" />
                <div>
                  <h4>Head Office</h4>
                  <p>Trikonekt Marketing, Kerala, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {activeModal === 'logout' && (
        <div className="ce-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="ce-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ce-modal-header">
              <h3>Confirm Logout</h3>
              <button className="ce-modal-close" onClick={() => setActiveModal(null)}><LuX size={20} /></button>
            </div>
            
            <div className="ce-logout-confirm-content">
              <p>Are you sure you want to log out of your account?</p>
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
