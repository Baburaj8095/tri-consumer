import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineCheckCircle, AiOutlineLeft, AiOutlineUser, AiOutlineLock } from 'react-icons/ai';
import { FaEye, FaEyeSlash, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './loginRegistration.css';
import logo from './logo.png';
import SMSService from '../../services/smsService';
import { storeAuth } from '../../services/authStorage';
import { formatErrorMessage } from '../../utils/errorFormatter';
import { AuthTopTicker, AuthLeftAds, AuthRightAds, AuthBottomBar } from './AuthAdsShowcase';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const smsService = new SMSService();

function LoginForm() {
  const navigate = useNavigate();
  const [view, setView] = useState('login'); // 'login' | 'otp' | 'login-otp-request' | 'forgot-password' | 'forgot-password-otp' | 'reset-password'
  const [loginData, setLoginData] = useState({ username: '', password: '', rememberMe: false });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  
  // OTP states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [otpError, setOtpError] = useState('');

  // Mobile and Password reset states
  const [loginOtpData, setLoginOtpData] = useState({ mobile: '' });
  const [forgotPasswordData, setForgotPasswordData] = useState({ mobile: '' });
  const [verifiedResetOtp, setVerifiedResetOtp] = useState('');
  const [newPasswordData, setNewPasswordData] = useState({ password: '', confirmPassword: '' });
  const [resendTimer, setResendTimer] = useState(0);
  const [countryCode, setCountryCode] = useState('+91');

  // OTP Countdown Timer Logic
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (loginError) setLoginError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.username.trim() || !loginData.password.trim()) {
      setLoginError('Please enter username and password');
      return;
    }
    
    setIsLoading(true);
    setLoginError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: loginData.username.trim(),
        password: loginData.password,
      });

      storeAuth(response.data);
      navigate('/consumer-ecommerce');
    } catch (err) {
      const message = formatErrorMessage(err);
      setLoginError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP submission for login
  const handleLoginOtpSubmit = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setOtpError('Please enter a 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setOtpError('');
    try {
      const fullMobile = `${countryCode}${loginOtpData.mobile.trim()}`;
      const result = await smsService.verifyOtp(fullMobile, code, 'LOGIN');
      storeAuth(result?.data || result);
      setOtp(['', '', '', '', '', '']);
      navigate('/consumer-ecommerce');
    } catch (err) {
      const message = err.message || formatErrorMessage(err);
      setOtpError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input digits
  const handleOtpChange = (index, value) => {
    const clean = value.replace(/[^0-9]/g, '');
    if (!clean) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    // Support paste of entire 6-digit code
    if (clean.length === 6) {
      const digits = clean.split('');
      setOtp(digits);
      otpRefs.current[5]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = clean.slice(-1);
    setOtp(newOtp);

    if (index < 5 && clean) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle mobile input change for OTP request
  const handleLoginOtpChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setLoginOtpData({ mobile: value });
    if (loginError) setLoginError('');
  };

  // Send OTP for Login via Aqua SMS
  const handleSendLoginOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoginError('');
    setOtpError('');
    const mobile = loginOtpData.mobile.trim();
    if (!mobile || mobile.length < 10) {
      setLoginError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const fullMobile = `${countryCode}${mobile}`;
      await smsService.sendOtp(fullMobile, null, 'LOGIN');
      setView('otp');
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const message = err.message || formatErrorMessage(err);
      setLoginError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password OTP trigger
  const handleSendForgotPasswordOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoginError('');
    setOtpError('');
    const mobile = forgotPasswordData.mobile.trim();
    if (!mobile || mobile.length < 10) {
      setLoginError('Please enter your 10-digit registered mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const fullMobile = `${countryCode}${mobile}`;
      await smsService.sendOtp(fullMobile, null, 'FORGOT_PASSWORD');
      setView('forgot-password-otp');
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const message = err.message || formatErrorMessage(err);
      setLoginError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify forgot password OTP
  const handleVerifyForgotPasswordOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setOtpError('Please enter the 6-digit code received via SMS');
      return;
    }

    setIsLoading(true);
    setOtpError('');
    try {
      const fullMobile = `${countryCode}${forgotPasswordData.mobile.trim()}`;
      await smsService.verifyOtp(fullMobile, code, 'FORGOT_PASSWORD');
      setVerifiedResetOtp(code);
      setView('reset-password');
      setOtpError('');
    } catch (err) {
      const message = err.message || formatErrorMessage(err);
      setOtpError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit new password to backend
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!newPasswordData.password || newPasswordData.password.length < 6) {
      setLoginError('New password must be at least 6 characters long');
      return;
    }
    if (newPasswordData.password !== newPasswordData.confirmPassword) {
      setLoginError('Passwords do not match. Please verify and try again.');
      return;
    }

    setIsLoading(true);
    try {
      const fullMobile = `${countryCode}${forgotPasswordData.mobile.trim()}`;
      await smsService.resetPassword(fullMobile, verifiedResetOtp, newPasswordData.password);
      setStatusMessage('Password updated successfully! Please login with your new password.');
      setView('login');
      setNewPasswordData({ password: '', confirmPassword: '' });
      setVerifiedResetOtp('');
      setLoginData((prev) => ({ ...prev, username: forgotPasswordData.mobile.trim(), password: '' }));
    } catch (err) {
      const message = err.message || formatErrorMessage(err);
      setLoginError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell login-bg gm-beige-theme">
      {/* Top Floating Promo Announcement Ticker */}
      <AuthTopTicker />

      <div className="auth-portal-layout">
        {/* Left Column Promotional Ads */}
        <aside aria-label="Special Offers" className="auth-ads-column auth-ads-left">
          <AuthLeftAds />
        </aside>

        {/* Center Login Form Screen */}
        <div className="auth-screen">
          <div className="auth-card multi-step-card login-card-overhaul gm-beige-glass-card">
          
          <div className="multi-step-header">
            {view !== 'login' ? (
              <button 
                type="button" 
                className="back-button" 
                onClick={() => {
                  setView('login');
                  setLoginError('');
                  setOtpError('');
                }}
              >
                <AiOutlineLeft size={20} />
              </button>
            ) : <div style={{ width: '36px' }} />}
            <div className="auth-chip">Consumer Login</div>
            <div style={{ width: '36px' }} />
          </div>

          <div className="form-scroll mobile-scroll">
            <div className="login-welcome-section">
              <div className="brand-logo-container">
                <img
                  src={logo}
                  alt="Trikonekt Logo"
                  className="brand-logo-circle"
                  style={{
                    transform: 'none',
                    background: 'transparent',
                    boxShadow: 'none',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <h1 className="welcome-title">Welcome Back</h1>
              <p className="welcome-subtitle">Login to continue shopping</p>
            </div>

            {statusMessage && (
              <div style={{ 
                margin: '10px 0', 
                padding: '10px 14px', 
                borderRadius: '10px', 
                background: 'rgba(16, 185, 129, 0.12)', 
                border: '1px solid rgba(16, 185, 129, 0.3)', 
                color: '#065f46', 
                fontSize: '13px', 
                textAlign: 'center',
                fontWeight: 500
              }}>
                ✓ {statusMessage}
              </div>
            )}

            {/* Standard Username / Password Login */}
            {view === 'login' && (
              <div className="animate-slide-up">
                <form className="registration-form" onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label className="field-label" htmlFor="username">Username / Mobile</label>
                    <div className="field-with-icon">
                      <AiOutlineUser className="input-icon" />
                      <input
                        id="username"
                        name="username"
                        type="text"
                        className="text-field has-icon"
                        placeholder="Enter username or mobile"
                        value={loginData.username}
                        onChange={handleLoginChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label className="field-label" htmlFor="loginPassword" style={{ marginBottom: 0 }}>Password</label>
                      <button 
                        type="button" 
                        className="link-button small-text" 
                        onClick={() => {
                          setLoginError('');
                          setView('forgot-password');
                        }}
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="field-with-icon">
                      <AiOutlineLock className="input-icon" />
                      <input
                        id="loginPassword"
                        name="password"
                        type={passwordVisible ? 'text' : 'password'}
                        className={`text-field has-icon ${loginError ? 'ce-input-error' : ''}`}
                        placeholder="Enter password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                      />
                      <button type="button" className="password-toggle" onClick={() => setPasswordVisible(!passwordVisible)}>
                        {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="login-options-row">
                    <label className="remember-me-label">
                      <input 
                        type="checkbox" 
                        name="rememberMe" 
                        checked={loginData.rememberMe} 
                        onChange={handleLoginChange} 
                      />
                      <span>Remember Me</span>
                    </label>
                  </div>

                  {loginError && <div className="ce-error-text" style={{ textAlign: 'center', margin: '8px 0' }}>{loginError}</div>}

                  <button className="primary-button cta-btn gradient-btn" type="submit" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Login Securely'} <FaArrowRight size={14} />
                  </button>

                  <div className="divider-section">
                    <span className="divider-line"></span>
                    <span className="divider-text">OR</span>
                    <span className="divider-line"></span>
                  </div>

                  <button 
                    type="button" 
                    className="secondary-outline-button" 
                    onClick={() => {
                      setLoginError('');
                      setView('login-otp-request');
                    }}
                  >
                    Continue with OTP
                  </button>

                  <div className="compact-footer">
                    <span>New here? </span>
                    <button type="button" className="bold-orange" onClick={() => navigate('/register')}>Create Account</button>
                  </div>
                </form>
              </div>
            )}

            {/* Mobile OTP Input View (for Login) */}
            {view === 'otp' && (
              <div className="animate-slide-up">
                <div className="otp-card-v2">
                  <div className="otp-icon-header">
                    <AiOutlineCheckCircle size={48} color="#ff6b17" />
                  </div>
                  <h2 className="otp-title-v2">Enter Verification Code</h2>
                  <p className="otp-subtitle-v2">
                    We've sent a 6-digit code via SMS to <strong style={{ color: '#2d3748' }}>{countryCode} {loginOtpData.mobile}</strong>.
                  </p>

                  <div className="otp-row-v2">
                    {otp.map((digit, i) => (
                      <input 
                        key={i} 
                        ref={(el) => (otpRefs.current[i] = el)}
                        className={`otp-input-v2 ${otpError ? 'ce-input-error' : ''}`}
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        type="text"
                        inputMode="numeric"
                      />
                    ))}
                  </div>
                  {otpError && <div className="ce-error-text" style={{ textAlign: 'center', marginTop: '12px' }}>{otpError}</div>}
                  
                  <div className="otp-actions-row" style={{ textAlign: 'center', marginTop: '16px' }}>
                    <span className="timer-text">
                      {resendTimer > 0 ? `Resend OTP in 00:${resendTimer < 10 ? '0' + resendTimer : resendTimer}` : (
                        <button 
                          type="button" 
                          onClick={handleSendLoginOtp} 
                          className="bold-orange" 
                          disabled={isLoading}
                          style={{ fontSize: '13px', textDecoration: 'underline' }}
                        >
                          {isLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                      )}
                    </span>
                  </div>

                  <button className="primary-button cta-btn" onClick={handleLoginOtpSubmit} disabled={isLoading} style={{ marginTop: '24px' }}>
                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                  
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button className="text-button" onClick={() => setView('login-otp-request')}>Change Phone Number</button>
                  </div>
                </div>
              </div>
            )}

            {/* Request OTP for Login Screen */}
            {view === 'login-otp-request' && (
              <div className="animate-slide-up">
                <form className="registration-form" onSubmit={handleSendLoginOtp}>
                  <div className="form-group">
                    <label className="field-label">Mobile Number</label>
                    <div className="field-with-code">
                      <select
                        name="countryCode"
                        className="text-field code-select"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        style={{ maxWidth: '90px' }}
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                      </select>
                      <input
                        type="tel"
                        className={`text-field ${loginError ? 'ce-input-error' : ''}`}
                        placeholder="Enter 10-digit mobile number"
                        maxLength={10}
                        value={loginOtpData.mobile}
                        onChange={handleLoginOtpChange}
                      />
                    </div>
                  </div>
                  {loginError && <div className="ce-error-text" style={{ textAlign: 'center', margin: '4px 0' }}>{loginError}</div>}
                  <button className="primary-button cta-btn" type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send OTP Code'}
                  </button>
                  <div className="secondary-link" style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button type="button" onClick={() => setView('login')}>Back to Login</button>
                  </div>
                </form>
              </div>
            )}

            {/* Forgot Password: Request OTP */}
            {view === 'forgot-password' && (
              <div className="animate-slide-up">
                <form className="registration-form" onSubmit={handleSendForgotPasswordOtp}>
                  <div className="form-group">
                    <label className="field-label">Registered Mobile Number</label>
                    <div className="field-with-code">
                      <select
                        name="countryCode"
                        className="text-field code-select"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        style={{ maxWidth: '90px' }}
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                      </select>
                      <input
                        type="tel"
                        className={`text-field ${loginError ? 'ce-input-error' : ''}`}
                        placeholder="Enter 10-digit registered mobile"
                        maxLength={10}
                        value={forgotPasswordData.mobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                          setForgotPasswordData({ mobile: val });
                          if (loginError) setLoginError('');
                        }}
                      />
                    </div>
                  </div>
                  {loginError && <div className="ce-error-text" style={{ textAlign: 'center', margin: '4px 0' }}>{loginError}</div>}
                  <button className="primary-button cta-btn" type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending OTP...' : 'Get Verification Code'}
                  </button>
                  <div className="secondary-link" style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button type="button" onClick={() => setView('login')}>Back to Login</button>
                  </div>
                </form>
              </div>
            )}

            {/* Forgot Password: OTP Verification */}
            {view === 'forgot-password-otp' && (
              <div className="animate-slide-up">
                <div className="otp-card-v2">
                  <div className="otp-icon-header">
                    <AiOutlineCheckCircle size={48} color="#ff6b17" />
                  </div>
                  <h2 className="otp-title-v2">Verify Reset Code</h2>
                  <p className="otp-subtitle-v2">
                    We've sent a 6-digit code via SMS to <strong style={{ color: '#2d3748' }}>{countryCode} {forgotPasswordData.mobile}</strong>.
                  </p>

                  <div className="otp-row-v2">
                    {otp.map((digit, i) => (
                      <input 
                        key={i} 
                        ref={(el) => (otpRefs.current[i] = el)}
                        className={`otp-input-v2 ${otpError ? 'ce-input-error' : ''}`}
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        type="text"
                        inputMode="numeric"
                      />
                    ))}
                  </div>
                  {otpError && <div className="ce-error-text" style={{ textAlign: 'center', marginTop: '12px' }}>{otpError}</div>}

                  <div className="otp-actions-row" style={{ textAlign: 'center', marginTop: '16px' }}>
                    <span className="timer-text">
                      {resendTimer > 0 ? `Resend OTP in 00:${resendTimer < 10 ? '0' + resendTimer : resendTimer}` : (
                        <button 
                          type="button" 
                          onClick={handleSendForgotPasswordOtp} 
                          className="bold-orange" 
                          disabled={isLoading}
                          style={{ fontSize: '13px', textDecoration: 'underline' }}
                        >
                          {isLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                      )}
                    </span>
                  </div>

                  <button className="primary-button cta-btn" onClick={handleVerifyForgotPasswordOtp} disabled={isLoading} style={{ marginTop: '24px' }}>
                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button className="text-button" onClick={() => setView('forgot-password')}>Change Mobile Number</button>
                  </div>
                </div>
              </div>
            )}

            {/* Reset Password Form */}
            {view === 'reset-password' && (
              <div className="animate-slide-up">
                <form className="registration-form" onSubmit={handleResetPasswordSubmit}>
                  <div className="form-group">
                    <label className="field-label">New Password</label>
                    <div className="field-with-icon">
                      <AiOutlineLock className="input-icon" />
                      <input 
                        type={resetPasswordVisible ? 'text' : 'password'} 
                        className="text-field has-icon" 
                        placeholder="Create new password (min 6 chars)" 
                        value={newPasswordData.password}
                        onChange={(e) => setNewPasswordData((p) => ({ ...p, password: e.target.value }))}
                      />
                      <button type="button" className="password-toggle" onClick={() => setResetPasswordVisible(!resetPasswordVisible)}>
                        {resetPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="field-label">Confirm New Password</label>
                    <div className="field-with-icon">
                      <AiOutlineLock className="input-icon" />
                      <input 
                        type={resetPasswordVisible ? 'text' : 'password'} 
                        className="text-field has-icon" 
                        placeholder="Confirm new password" 
                        value={newPasswordData.confirmPassword}
                        onChange={(e) => setNewPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                      />
                    </div>
                  </div>
                  {loginError && <div className="ce-error-text" style={{ textAlign: 'center', margin: '4px 0' }}>{loginError}</div>}
                  <button className="primary-button cta-btn" type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Securely Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column Promotional Ads */}
      <aside aria-label="Deals & Rewards" className="auth-ads-column auth-ads-right">
        <AuthRightAds />
      </aside>
    </div>

    {/* Bottom Service Guarantees & Trust Bar */}
    <AuthBottomBar />
  </div>
  );
}

export default LoginForm;
