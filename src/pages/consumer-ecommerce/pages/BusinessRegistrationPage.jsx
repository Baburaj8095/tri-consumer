import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash, FaCheckCircle, FaShield, FaSpinner } from 'react-icons/fa';
import BottomNav from '../components/BottomNav.jsx';
import '../consumerEcommerce.css';

const sponsorLookup = {
  TRI001: 'Trikonekt Partner',
  VIP100: 'Luxe Sponsor',
  GROW20: 'Growth Circle',
};

const pincodeLookup = {
  '560001': { village: 'Bengaluru GPO', taluk: 'Bengaluru South', district: 'Bengaluru', state: 'Karnataka', country: 'India' },
  '110001': { village: 'Connaught Place', taluk: 'New Delhi', district: 'Central Delhi', state: 'Delhi', country: 'India' },
  '400001': { village: 'Fort', taluk: 'South Mumbai', district: 'Mumbai', state: 'Maharashtra', country: 'India' },
};

export default function BusinessRegistrationPage() {
  const [formData, setFormData] = useState({
    sponsorId: '',
    sponsorName: '',
    fullName: '',
    countryCode: '+91',
    mobileNumber: '',
    email: '',
    gender: 'female',
    pinCode: '',
    village: '',
    taluk: '',
    district: '',
    state: '',
    country: '',
    password: '',
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const [sponsorStatus, setSponsorStatus] = useState('');
  const [sponsorLoading, setSponsorLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!formData.pinCode || formData.pinCode.length !== 6) {
      setFormData((prev) => ({ ...prev, village: '', taluk: '', district: '', state: '', country: '' }));
    }
  }, [formData.pinCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let fieldValue = value;

    if (name === 'mobileNumber') {
      fieldValue = value.replace(/[^0-9]/g, '');
    }

    if (name === 'pinCode') {
      fieldValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    }

    if (name === 'sponsorId') {
      setSponsorStatus('');
      setFormData((prev) => ({ ...prev, sponsorName: '' }));
    }

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const fetchSponsor = () => {
    const sponsorId = formData.sponsorId.trim().toUpperCase();
    if (!sponsorId) return;
    setSponsorLoading(true);
    setSponsorStatus('');
    setTimeout(() => {
      const sponsorName = sponsorLookup[sponsorId];
      if (sponsorName) {
        setFormData((prev) => ({ ...prev, sponsorName }));
        setSponsorStatus('verified');
      } else {
        setFormData((prev) => ({ ...prev, sponsorName: '' }));
        setSponsorStatus('invalid');
      }
      setSponsorLoading(false);
    }, 900);
  };

  const fetchAddress = () => {
    const pinCode = formData.pinCode.trim();
    if (pinCode.length !== 6) return;
    setPinLoading(true);
    setTimeout(() => {
      const address = pincodeLookup[pinCode];
      if (address) {
        setFormData((prev) => ({ ...prev, ...address }));
      } else {
        setFormData((prev) => ({ ...prev, village: '', taluk: '', district: '', state: '', country: '' }));
      }
      setPinLoading(false);
    }, 900);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.sponsorId.trim()) newErrors.sponsorId = 'Sponsor ID is required';
    if (sponsorStatus === 'invalid') newErrors.sponsorId = 'Invalid Sponsor ID';
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required';
    } else if (formData.mobileNumber.length < 10) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.pinCode.trim()) newErrors.pinCode = 'Pincode is required';
    if (formData.pinCode.trim().length !== 6) newErrors.pinCode = 'Enter a valid 6-digit pincode';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (formData.password.trim().length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept terms to continue';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      alert('Registration submitted successfully');
    }, 1200);
  };

  return (
    <div className="ce-app" style={{ background: '#f8fafc' }}>
      <header className="ce-header">
        <div className="ce-header-inner">
          <Link to="/consumer-ecommerce" className="ce-icon-btn" aria-label="Back to dashboard">
            <FaArrowLeft />
          </Link>
          <div className="ce-header-title-container">
            <h1 className="ce-header-title">Register for Shopping</h1>
            <span className="ce-header-subtitle">Smart onboarding for secure and faster checkout.</span>
          </div>
          <div style={{ width: '42px' }} />
        </div>
      </header>

      <main className="ce-container" style={{ paddingTop: '80px', paddingBottom: '132px' }}>
        <form onSubmit={handleSubmit} className="ce-form-card registration-form-card">
          <div className="registration-top-row">
            <div>
              <p className="registration-step">Step 1 of 1</p>
              <h2 className="registration-title">Create your account</h2>
              <p className="registration-copy">Complete your details once and enjoy premium shopping benefits.</p>
            </div>
            <Link to="/auth" className="registration-login-link">Already have an account? Login</Link>
          </div>

          <div className="trust-banner">
            <FaShieldAlt className="trust-icon" />
            <div>
              <strong>Secure registration</strong> with mobile verification and data-safe onboarding.
            </div>
          </div>

          <div className="ce-form-group">
            <label className="ce-label" htmlFor="sponsorId">Sponsor ID *</label>
            <div className="field-with-action">
              <input
                id="sponsorId"
                name="sponsorId"
                type="text"
                className={`ce-input ${errors.sponsorId ? 'ce-input-error' : ''}`}
                placeholder="Enter Sponsor ID"
                value={formData.sponsorId}
                onChange={handleChange}
                onBlur={fetchSponsor}
              />
              <div className="field-action-icon">
                {sponsorLoading ? <FaSpinner className="loader-icon" /> : sponsorStatus === 'verified' ? <FaCheckCircle className="success-icon" /> : null}
              </div>
            </div>
            {sponsorStatus === 'verified' && <p className="helper-text verified-text">Verified sponsor: {formData.sponsorName}</p>}
            {sponsorStatus === 'invalid' && <span className="ce-error-text">Sponsor ID not recognized</span>}
            {errors.sponsorId && <span className="ce-error-text">{errors.sponsorId}</span>}
          </div>

          <div className="ce-form-group">
            <label className="ce-label">Sponsor Name</label>
            <input
              type="text"
              className="ce-input ce-input-disabled"
              value={formData.sponsorName}
              disabled
              placeholder="Sponsor name will appear here"
            />
          </div>

          <div className="field-grid two-col-grid">
            <div className="ce-form-group">
              <label className="ce-label" htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className={`ce-input ${errors.fullName ? 'ce-input-error' : ''}`}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && <span className="ce-error-text">{errors.fullName}</span>}
            </div>
            <div className="ce-form-group">
              <label className="ce-label" htmlFor="email">Email ID (Optional)</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`ce-input ${errors.email ? 'ce-input-error' : ''}`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="ce-error-text">{errors.email}</span>}
            </div>
          </div>

          <div className="field-grid two-col-grid">
            <div className="ce-form-group">
              <label className="ce-label" htmlFor="mobileNumber">Mobile Number *</label>
              <div className="field-with-code">
                <select
                  name="countryCode"
                  className="ce-input code-select"
                  value={formData.countryCode}
                  onChange={handleChange}
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                </select>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  className={`ce-input ${errors.mobileNumber ? 'ce-input-error' : ''}`}
                  placeholder="10-digit mobile number"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                />
              </div>
              {errors.mobileNumber && <span className="ce-error-text">{errors.mobileNumber}</span>}
            </div>
            <div className="ce-form-group">
              <label className="ce-label">Gender</label>
              <div className="gender-row">
                {['male', 'female', 'other'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`gender-chip ${formData.gender === option ? 'active' : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, gender: option }))}
                  >
                    {option[0].toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="field-grid two-col-grid">
            <div className="ce-form-group">
              <label className="ce-label" htmlFor="pinCode">Pincode *</label>
              <div className="field-with-action">
                <input
                  id="pinCode"
                  name="pinCode"
                  type="text"
                  className={`ce-input ${errors.pinCode ? 'ce-input-error' : ''}`}
                  placeholder="Enter pincode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  onBlur={fetchAddress}
                />
                <div className="field-action-icon">
                  {pinLoading ? <FaSpinner className="loader-icon" /> : formData.village ? <FaCheckCircle className="success-icon" /> : null}
                </div>
              </div>
              {errors.pinCode && <span className="ce-error-text">{errors.pinCode}</span>}
            </div>
            <div className="ce-form-group">
              <label className="ce-label" htmlFor="password">Password *</label>
              <div className="field-with-action">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? 'text' : 'password'}
                  className={`ce-input ${errors.password ? 'ce-input-error' : ''}`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button type="button" className="password-toggle" onClick={() => setPasswordVisible((prev) => !prev)}>
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className="ce-error-text">{errors.password}</span>}
            </div>
          </div>

          <div className="address-grid">
            {['village', 'taluk', 'district', 'state', 'country'].map((field) => (
              <div key={field} className="address-item">
                <label className="ce-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type="text"
                  className="ce-input ce-input-disabled"
                  value={formData[field]}
                  disabled
                  placeholder={formData[field] ? formData[field] : 'Auto-filled from pincode'}
                />
              </div>
            ))}
          </div>

          <label className="terms-row">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, termsAccepted: e.target.checked }));
                if (errors.termsAccepted) setErrors((prev) => ({ ...prev, termsAccepted: null }));
              }}
            />
            <span>
              I agree to the <a href="#" className="link-text">Terms & Conditions</a> and <a href="#" className="link-text">Privacy Policy</a>.
            </span>
          </label>
          {errors.termsAccepted && <span className="ce-error-text">{errors.termsAccepted}</span>}

          <button type="submit" className="ce-submit-btn sticky-submit" disabled={isSubmitted}>
            {isSubmitted ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}
