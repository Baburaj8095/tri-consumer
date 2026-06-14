import React, { useEffect, useState } from 'react';
import { AiOutlineCheckCircle, AiOutlineLeft } from 'react-icons/ai';
import { FaEye, FaEyeSlash, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './loginRegistration.css';
import SMSService from '../../services/smsService';
import { storeAuth } from '../../services/authStorage';
import { formatErrorMessage } from '../../utils/errorFormatter';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function RegisterForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const queryParams = new URLSearchParams(window.location.search);
  const urlSponsorId = queryParams.get('sponsor_id') || queryParams.get('sponsor') || '';

  const [formData, setFormData] = useState({
    sponsorId: urlSponsorId,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mobile OTP state
  const [showOtpField, setShowOtpField] = useState(false);
  const [mobileOtp, setMobileOtp] = useState(['', '', '', '', '', '']);
  const mobileOtpRefs = React.useRef([]);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [msgId, setMsgId] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  
  // OTP Timer Logic
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    const sponsorId = formData.sponsorId.trim();
    if (!sponsorId) {
      setSponsorStatus('');
      setFormData((prev) => ({ ...prev, sponsorName: '' }));
      setSponsorLoading(false);
      return;
    }

    setSponsorLoading(true);
    setSponsorStatus('');
    
    const fetchSponsor = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/sponsor/validate`, {
          params: { sponsorId }
        });
        if (response.data?.success && response.data?.data?.sponsorName) {
          setFormData((prev) => ({ ...prev, sponsorName: response.data.data.sponsorName }));
          setSponsorStatus('verified');
        } else {
          setFormData((prev) => ({ ...prev, sponsorName: '' }));
          setSponsorStatus('invalid');
        }
      } catch (err) {
        setFormData((prev) => ({ ...prev, sponsorName: '' }));
        setSponsorStatus('invalid');
      } finally {
        setSponsorLoading(false);
      }
    };

    const timer = window.setTimeout(fetchSponsor, 800);
    return () => window.clearTimeout(timer);
  }, [formData.sponsorId]);

  useEffect(() => {
    if (formData.pinCode.length !== 6) {
      setFormData((prev) => ({ ...prev, village: '', taluk: '', district: '', state: '', country: '' }));
    }
  }, [formData.pinCode]);

  useEffect(() => {
    const pinCode = formData.pinCode.trim();
    if (pinCode.length !== 6) return;

    const fetchLocation = async () => {
      setPinLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/location/pincode/${pinCode}`);
        const location = response.data?.data;

        if (response.data?.success && location) {

          setFormData((prev) => ({
            ...prev,
            village: location.village || '',
            taluk: location.taluk || '',
            district: location.district || '',
            state: location.state || '',
            country: location.country || 'India'
          }));
          setErrors((prev) => ({ ...prev, pinCode: null }));
        } else {
          setFormData((prev) => ({ ...prev, village: '', taluk: '', district: '', state: '', country: '' }));
          setErrors((prev) => ({ ...prev, pinCode: 'Pincode not found' }));
        }
      } catch (err) {
        const message = err.response?.data?.message || 'Error fetching location';
        setErrors((prev) => ({ ...prev, pinCode: message }));
      } finally {
        setPinLoading(false);
      }
    };

    const timer = setTimeout(fetchLocation, 600);
    return () => clearTimeout(timer);
  }, [formData.pinCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === 'mobileNumber') {
      updatedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setIsMobileVerified(false);
      setShowOtpField(false);
      setMobileOtp(['', '', '', '', '', '']);
      setOtpError('');
    }

    if (name === 'pinCode') {
      updatedValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    }

    setFormData((prev) => ({ ...prev, [name]: updatedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.sponsorId.trim()) newErrors.sponsorId = 'Sponsor ID is required';
      if (sponsorStatus === 'invalid') newErrors.sponsorId = 'Sponsor ID not recognized';
      if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile Number is required';
      else if (formData.mobileNumber.length < 10) newErrors.mobileNumber = 'Enter a valid mobile number';
      if (!isMobileVerified) newErrors.mobileNumber = 'Please verify your mobile number to continue';
    } else if (currentStep === 2) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address';
      if (!formData.password.trim()) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    } else if (currentStep === 3) {
      if (!formData.pinCode.trim()) newErrors.pinCode = 'Pincode is required';
      else if (formData.pinCode.length !== 6) newErrors.pinCode = 'Enter a valid 6-digit pincode';
      if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms';
    }
    return newErrors;
  };

  const handleNextStep = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      navigate('/login');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalErrors = validateStep(3);

    if (Object.keys(finalErrors).length) {
      setErrors(finalErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        sponsorId: formData.sponsorId.trim().toUpperCase(),
        sponsorName: formData.sponsorName,
        fullName: formData.fullName,
        countryCode: formData.countryCode,
        mobile: formData.mobileNumber,
        email: formData.email,
        pinCode: formData.pinCode,
        district: formData.district,
        state: formData.state,
        password: formData.password,
      });
      storeAuth(response.data);
      alert('Registration complete!');
      navigate('/login');
    } catch (err) {
      const message = formatErrorMessage(err);
      setErrors((prev) => ({ ...prev, submit: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOtpError('');
    const mobile = formData.mobileNumber.trim();
    if (!mobile || mobile.length < 10) {
      setErrors((prev) => ({ ...prev, mobileNumber: 'Enter a valid mobile number first' }));
      return;
    }
    const mobilePattern = /^[+]?[0-9]{10,15}$/;
    if (!mobilePattern.test(mobile)) {
      setErrors((prev) => ({ ...prev, mobileNumber: 'Invalid mobile number format' }));
      return;
    }
    setIsOtpLoading(true);
    const smsService = new SMSService();
    try {
      const result = await smsService.sendOtp(`${formData.countryCode || '+91'}${mobile}`, null, 'REGISTRATION');
      setMsgId(result?.message || 'OTP_SENT');
      setShowOtpField(true);
      setResendTimer(30);
      setMobileOtp(['', '', '', '', '', '']);
    } catch (err) {
      console.warn('Registration OTP send failed.', err);
      setOtpError(err.response?.data?.message || err.message || 'Unable to send OTP');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = mobileOtp.join('');
    if (code.length < 6) {
      setOtpError('Enter a 6-digit OTP');
      return;
    }
    setIsOtpLoading(true);
    try {
      const smsService = new SMSService();
      await smsService.verifyOtp(`${formData.countryCode || '+91'}${formData.mobileNumber}`, code, 'REGISTRATION');
      setIsMobileVerified(true);
      setShowOtpField(false);
      setErrors((prev) => ({ ...prev, mobileNumber: null }));
      setOtpError('');
    } catch (err) {
      setOtpError(err.response?.data?.message || err.message || 'Invalid OTP');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const numValue = value.replace(/[^0-9]/g, '');
    if (numValue.length > 1) return;

    const newOtp = [...mobileOtp];
    newOtp[index] = numValue;
    setMobileOtp(newOtp);

    if (numValue && index < 5) {
      mobileOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !mobileOtp[index] && index > 0) {
      mobileOtpRefs.current[index - 1]?.focus();
    }
  };

  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return 0;
    let strength = 0;
    if (pass.length >= 6) strength += 33;
    if (pass.match(/[a-zA-Z]/)) strength += 33;
    if (pass.match(/[0-9]/)) strength += 34;
    return strength;
  };
  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="auth-shell">
      <div className="auth-screen">
        <div className="auth-card registration-card multi-step-card">
          
          <div className="multi-step-header">
            <button type="button" className="back-button" onClick={handlePrevStep}>
              <AiOutlineLeft size={20} />
            </button>
            <div className="auth-chip">Step {step} of 3</div>
          </div>

          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
            <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
            <div className={`step-line ${step >= 3 ? 'active' : ''}`} />
            <div className={`step-dot ${step >= 3 ? 'active' : ''}`} />
          </div>

          <div className="step-title">
            {step === 1 && "Verification"}
            {step === 2 && "Personal Details"}
            {step === 3 && "Address Details"}
          </div>

          <form className="registration-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-scroll mobile-scroll">
              
              {/* --- STEP 1 --- */}
              {step === 1 && (
                <div className="step-content animate-slide-up">
                  <div className="form-group">
                    <label className="field-label" htmlFor="sponsorId">Sponsor ID <span style={{ color: '#ff3b30' }}>*</span></label>
                    <div className="field-with-action">
                      <input
                        id="sponsorId"
                        name="sponsorId"
                        type="text"
                        className={`text-field ${errors.sponsorId ? 'ce-input-error' : ''}`}
                        placeholder="Enter Sponsor ID"
                        value={formData.sponsorId}
                        onChange={handleChange}
                      />
                      <div className="field-action-icon">
                        {sponsorLoading ? <span className="loader-dot" /> : sponsorStatus === 'verified' ? <AiOutlineCheckCircle className="verified-icon" /> : null}
                      </div>
                    </div>
                    {sponsorStatus === 'verified' && formData.sponsorName && (
                      <div className="verified-success-banner">
                        <AiOutlineCheckCircle size={16} /> Verified: {formData.sponsorName}
                      </div>
                    )}
                    {errors.sponsorId && <span className="ce-error-text">{errors.sponsorId}</span>}
                  </div>

                  <div className="form-group">
                    <label className="field-label" htmlFor="mobileNumber">Mobile Number <span style={{ color: '#ff3b30' }}>*</span></label>
                    <div className="field-with-code" style={{ position: 'relative' }}>
                      <select
                        name="countryCode"
                        className="text-field code-select"
                        value={formData.countryCode}
                        onChange={handleChange}
                        disabled={isMobileVerified}
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                      </select>
                      <input
                        id="mobileNumber"
                        name="mobileNumber"
                        type="tel"
                        className={`text-field ${errors.mobileNumber ? 'ce-input-error' : ''}`}
                        placeholder="Enter mobile number"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        maxLength={10}
                        style={{ paddingRight: isMobileVerified ? '48px' : '16px' }}
                        disabled={isMobileVerified}
                      />
                      
                      {isMobileVerified && (
                        <AiOutlineCheckCircle style={{ position: 'absolute', right: '16px', color: '#10b981', fontSize: '20px' }} />
                      )}
                    </div>
                    
                    {errors.mobileNumber && <span className="ce-error-text">{errors.mobileNumber}</span>}

                    {showOtpField && !isMobileVerified && (
                      <div className="otp-verification-box">
                        <div className="otp-box-title">Enter 6-digit OTP</div>
                        <div className="otp-row">
                          {mobileOtp.map((digit, i) => (
                            <input 
                              key={i} 
                              ref={(el) => (mobileOtpRefs.current[i] = el)}
                              className={`otp-input-large ${otpError ? 'ce-input-error' : ''}`}
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(i, e)}
                              type="text"
                              inputMode="numeric"
                            />
                          ))}
                        </div>
                        {otpError && <div className="ce-error-text" style={{ marginTop: '8px', fontSize: '13px' }}>{otpError}</div>}
                        
                        <div className="otp-actions-row">
                          <span className="timer-text">
                            {resendTimer > 0 ? `Resend OTP in 00:${resendTimer < 10 ? '0'+resendTimer : resendTimer}` : (
                              <button type="button" onClick={handleSendOtp} className="link-button" disabled={isOtpLoading}>
                                {isOtpLoading ? 'Sending...' : 'Resend OTP'}
                              </button>
                            )}
                          </span>
                        </div>

                        <button type="button" onClick={handleVerifyOtp} className="verify-btn">
                          Confirm OTP
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- STEP 2 --- */}
              {step === 2 && (
                <div className="step-content animate-slide-up">
                  <div className="form-group">
                    <label className="field-label" htmlFor="fullName">Full Name <span style={{ color: '#ff3b30' }}>*</span></label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className={`text-field ${errors.fullName ? 'ce-input-error' : ''}`}
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && <span className="ce-error-text">{errors.fullName}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="field-label" htmlFor="email">Email ID</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`text-field ${errors.email ? 'ce-input-error' : ''}`}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <span className="ce-error-text">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label className="field-label">Gender <span style={{ color: '#ff3b30' }}>*</span></label>
                    <div className="gender-row">
                      {['female', 'male', 'other'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={`chip-button ${formData.gender === option ? 'active' : ''}`}
                          onClick={() => setFormData((prev) => ({ ...prev, gender: option }))}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="field-label" htmlFor="password">Password <span style={{ color: '#ff3b30' }}>*</span></label>
                    <div className="field-with-action">
                      <input
                        id="password"
                        name="password"
                        type={passwordVisible ? 'text' : 'password'}
                        className={`text-field ${errors.password ? 'ce-input-error' : ''}`}
                        placeholder="Create a secure password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button type="button" className="password-toggle" onClick={() => setPasswordVisible((prev) => !prev)}>
                        {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="password-strength-bar">
                        <div className="strength-fill" style={{ width: `${passwordStrength}%`, background: passwordStrength < 50 ? '#ff3b30' : passwordStrength < 100 ? '#f59e0b' : '#10b981' }} />
                      </div>
                    )}
                    {errors.password && <span className="ce-error-text">{errors.password}</span>}
                  </div>
                </div>
              )}

              {/* --- STEP 3 --- */}
              {step === 3 && (
                <div className="step-content animate-slide-up">
                  <div className="form-group">
                    <label className="field-label" htmlFor="pinCode">Pincode <span style={{ color: '#ff3b30' }}>*</span></label>
                    <div className="field-with-action">
                      <input
                        id="pinCode"
                        name="pinCode"
                        type="text"
                        className={`text-field ${errors.pinCode ? 'ce-input-error' : ''}`}
                        placeholder="Enter pincode"
                        value={formData.pinCode}
                        onChange={handleChange}
                      />
                      <div className="field-action-icon">
                        {pinLoading ? <span className="loader-dot" /> : formData.village ? <AiOutlineCheckCircle className="verified-icon" /> : null}
                      </div>
                    </div>
                    {!formData.village && !errors.pinCode && <div className="helper-text">Enter pincode to auto-fetch location</div>}
                    {errors.pinCode && <span className="ce-error-text">{errors.pinCode}</span>}
                  </div>

                  <div className="address-collapse-box animate-slide-up">
                    <div className="address-grid">
                        {['village', 'taluk', 'district', 'state', 'country'].map((field) => (
                          <div key={field} className="address-item">
                            <label className="field-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                            <input
                              type="text"
                              className="text-field text-field-disabled"
                              value={formData[field]}
                              disabled
                              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            />
                          </div>
                        ))}
                    </div>
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
                </div>
              )}
            </div>

            {/* Sticky CTA Footer */}
            <div className="sticky-cta-footer">
              <div className="trust-indicator">
                <FaShieldAlt color="#10b981" /> <span>Secure & Encrypted Registration</span>
              </div>
              {step < 3 ? (
                isMobileVerified ? (
                  <button type="button" className="primary-button cta-btn" onClick={handleNextStep}>
                    Continue <FaArrowRight size={14} />
                  </button>
                ) : !showOtpField ? (
                  <button type="button" className="primary-button cta-btn" onClick={handleSendOtp} disabled={isOtpLoading}>
                    {isOtpLoading ? 'Sending OTP...' : 'Send OTP First'}
                  </button>
                ) : null
              ) : (
                <button type="button" className="primary-button cta-btn" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Create Account'} <FaArrowRight size={14} />
                </button>
              )}
              {errors.submit && <div className="ce-error-text" style={{ textAlign: 'center', marginTop: '8px' }}>{errors.submit}</div>}
              {step === 1 && (
                <div className="secondary-link" style={{ marginTop: '12px' }}>
                  <span>Already have an account? </span>
                  <button type="button" onClick={() => navigate('/login')}>Login</button>
                </div>
              )}
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
