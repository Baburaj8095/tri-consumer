import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LuChevronLeft,
  LuLoader,
  LuBadgeCheck,
  LuUser,
  LuMapPin,
  LuStore,
  LuShieldCheck
} from 'react-icons/lu';
import '../consumerEcommerce.css';
import BottomNav from '../components/BottomNav.jsx';

export default function BusinessRegistrationPage() {
  const navigate = useNavigate();
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [autoDetails, setAutoDetails] = useState(null);

  const [businessCategory, setBusinessCategory] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleMobileChange = e => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 10) {
      setMobileNumber(val);
      if (val.length === 10) {
        // Set autodetected details immediately
        setAutoDetails({
          name: 'Baburaj',
          pinCode: '560103',
          city: 'Bangalore'
        });
        setErrors(prev => ({ ...prev, mobileNumber: null }));
      } else {
        setAutoDetails(null);
      }
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (mobileNumber.length < 10) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    if (!businessCategory.trim()) {
      newErrors.category = 'Please specify your business category';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setSuccess(true);
    } catch (err) {
      setErrors({ api: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ce-app ce-commerce-home ce-biz-reg-layout">
      {/* Sticky Top Header */}
      <header className="ce-compact-page-header">
        <Link to="/consumer-ecommerce" aria-label="Back">
          <LuChevronLeft />
        </Link>
        <div>
          <h1>List Your Business</h1>
          <p>Onboarding Dashboard</p>
        </div>
        <span><LuStore /></span>
      </header>

      {/* Scrollable container */}
      <main className="ce-biz-reg-container">
        {success ? (
          <div className="ce-biz-reg-success-card">
            <div className="success-icon-container">
              <LuBadgeCheck />
            </div>
            <h2>Registration Successful!</h2>
            <p className="success-description">
              Congratulations! Your business registration request has been successfully submitted to our team.
            </p>
            <div className="success-details-box">
              <div className="detail-row">
                <span>Owner Name:</span>
                <strong>{autoDetails?.name || 'Baburaj'}</strong>
              </div>
              <div className="detail-row">
                <span>Mobile Number:</span>
                <strong>+91 {mobileNumber}</strong>
              </div>
              <div className="detail-row">
                <span>Business Type:</span>
                <strong>{businessCategory}</strong>
              </div>
              <div className="detail-row">
                <span>Service City:</span>
                <strong>{autoDetails?.city} ({autoDetails?.pinCode})</strong>
              </div>
            </div>
            <div className="success-next-steps">
              <LuShieldCheck className="next-steps-icon" />
              <div>
                <strong>What's Next?</strong>
                <p>An Admin will call you on your verified mobile number to complete document verification and activate your online storefront.</p>
              </div>
            </div>
            <button className="ce-biz-reg-submit-btn" style={{ boxShadow: 'none' }} onClick={() => navigate('/consumer-ecommerce')}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="ce-biz-reg-form">
            {/* Onboarding graphic section */}
            <div className="ce-biz-reg-hero">
              <div className="ce-biz-reg-hero-svg-wrap">
                <svg viewBox="0 0 200 120" className="ce-biz-hero-svg">
                  <path d="M10 100 h180" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                  <rect x="45" y="45" width="110" height="55" rx="8" fill="#FFFFFF" stroke="#F97316" strokeWidth="2.5" />
                  <rect x="55" y="65" width="30" height="35" rx="3" fill="#FFE5D9" />
                  <rect x="95" y="60" width="50" height="25" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
                  <path d="M40 45 l15 -15 h100 l15 15 Z" fill="#F97316" />
                  <path d="M55 30 l10 15 M75 30 l10 15 M95 30 l10 15 M115 30 l10 15 M135 30 l10 15" stroke="#FFFFFF" strokeWidth="3" />
                  <text x="120" y="76" fill="#EA580C" fontSize="9" fontWeight="bold" textAnchor="middle">OPEN</text>
                  <g transform="translate(140, 20)">
                    <circle cx="10" cy="10" r="10" fill="#FFEDD5" />
                    <path d="M10 4 c-2.5 0 -4.5 2 -4.5 4.5 c0 3.5 4.5 7.5 4.5 7.5 s4.5 -4 4.5 -7.5 c0 -2.5 -2 -4.5 -4.5 -4.5 Z" fill="#EA580C" />
                    <circle cx="10" cy="8.5" r="1.5" fill="#FFFFFF" />
                  </g>
                  <g transform="translate(25, 25)" fill="#FBBF24">
                    <path d="M10 2 l2 5 h5 l-4 3 l2 5 l-5 -4 l-5 4 l2 -5 l-4 -3 h5 Z" transform="scale(0.8)" />
                  </g>
                  <g transform="translate(38, 15)" fill="#FBBF24">
                    <path d="M10 2 l2 5 h5 l-4 3 l2 5 l-5 -4 l-5 4 l2 -5 l-4 -3 h5 Z" transform="scale(0.6)" />
                  </g>
                  <g transform="translate(165, 55)" fill="#FB923C">
                    <circle cx="5" cy="5" r="2" />
                    <circle cx="12" cy="10" r="3" />
                  </g>
                </svg>
              </div>
              <h2>List Your Business</h2>
              <p>Reach nearby customers and grow your business with Trikonekt platform</p>
            </div>

            {/* Input fields stack */}
            <div className="ce-biz-reg-card">
              <h3>1. Contact Verification</h3>
              <div className="form-field-group">
                <label htmlFor="reg-mobile">Enter Mobile Number</label>
                <div className={`input-field-wrapper ${errors.mobileNumber ? 'has-error' : ''}`}>
                  <span className="country-prefix">+91</span>
                  <input
                    id="reg-mobile"
                    type="tel"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={handleMobileChange}
                    placeholder="9886178729"
                  />
                </div>
                {errors.mobileNumber && (
                  <span className="field-error-message">{errors.mobileNumber}</span>
                )}
              </div>
            </div>

            {/* Auto-filled profile section (displays once number is verified) */}
            {autoDetails && (
              <div className="ce-biz-reg-card auto-profile-card">
                <div className="card-header-badge">
                  <span className="badge-tag">Auto Detected</span>
                </div>
                <h3>2. Business Owner Profile</h3>
                <div className="form-field-group">
                  <label>Full Name</label>
                  <div className="input-field-wrapper disabled-field">
                    <span className="field-icon"><LuUser /></span>
                    <input type="text" value={autoDetails.name} readOnly />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field-group">
                    <label>PIN Code</label>
                    <div className="input-field-wrapper disabled-field">
                      <span className="field-icon"><LuMapPin /></span>
                      <input type="text" value={autoDetails.pinCode} readOnly />
                    </div>
                  </div>
                  <div className="form-field-group">
                    <label>Location/City</label>
                    <div className="input-field-wrapper disabled-field">
                      <span className="field-icon"><LuStore /></span>
                      <input type="text" value={autoDetails.city} readOnly />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Business Type / Category */}
            <div className="ce-biz-reg-card">
              <h3>3. Business Category</h3>
              <div className="form-field-group">
                <label htmlFor="reg-category">Type Your Business</label>
                <div className={`input-field-wrapper ${errors.category ? 'has-error' : ''}`}>
                  <span className="field-icon"><LuStore /></span>
                  <input
                    id="reg-category"
                    type="text"
                    value={businessCategory}
                    onChange={e => {
                      setBusinessCategory(e.target.value);
                      setErrors(prev => ({ ...prev, category: null }));
                    }}
                    placeholder="e.g. Plumber, Grocery, Restaurant"
                  />
                </div>
                {errors.category && (
                  <span className="field-error-message">{errors.category}</span>
                )}
              </div>
            </div>

            {/* Action Button Container */}
            <div className="ce-biz-reg-cta-container">
              <button
                type="submit"
                className="ce-biz-reg-submit-btn"
                disabled={loading}
              >
                {loading ? 'Submitting Application...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </main>

      <BottomNav />
    </div>
  );
}