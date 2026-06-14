import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineCheckCircle, AiOutlineLeft, AiOutlineUser, AiOutlineLock, AiOutlineGoogle, AiOutlineWhatsApp, AiOutlineApple } from 'react-icons/ai';
import { FaEye, FaEyeSlash, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './loginRegistration.css';
import logo from './logo.png';
import SMSService from '../../services/smsService';
import { generateOtp } from '../../services/otpGenerator';
import { storeAuth } from '../../services/authStorage';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function LoginForm() {
  const navigate = useNavigate();
  const [view, setView] = useState('login'); // 'login' | 'otp' | 'login-otp-request' | 'forgot-password' | 'forgot-password-otp' | 'reset-password'
  const [loginData, setLoginData] = useState({ username: '', password: '', rememberMe: false });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [otpError, setOtpError] = useState('');

  const [forgotPasswordData, setForgotPasswordData] = useState({ identifier: '' });
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [msgId, setMsgId] = useState('');
  const [loginOtpData, setLoginOtpData] = useState({ mobile: '' });
  const [newPasswordData, setNewPasswordData] = useState({ password: '', confirmPassword: '' });
  const [generalError, setGeneralError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [countryCode, setCountryCode] = useState('+91');

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
      const message = err.response?.data?.message || err.message || 'Unable to login';
      setLoginError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setOtpError('Please enter a 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setOtpError('');
    try {
      if (view === 'forgot-password-otp') {
        setView('reset-password');
        return;
      }

      if (loginOtpData.mobile) {
        const fullMobile = `${countryCode}${loginOtpData.mobile}`;
        const result = await smsService.verifyOtp(fullMobile, code, 'LOGIN');
        storeAuth(result);
      } else if (code !== generatedOtp) {
        setOtpError('Invalid OTP');
        return;
      }

      alert('Logged in successfully!');
      navigate('/consumer-ecommerce');
      setGeneratedOtp('');
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'OTP verification failed';
      setOtpError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const numValue = value.replace(/[^0-9]/g, '');
    if (numValue.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = numValue;
    setOtp(newOtp);

    if (numValue && index < 5) {
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
    setLoginOtpData({ mobile: e.target.value });
    if (loginError) setLoginError('');
  };

  const smsService = new SMSService();

  // Send OTP via AquaSMS
  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoginError('');
    setOtpError('');
    const mobile = loginOtpData.mobile.trim();
    if (!mobile) {
      setLoginError('Please enter mobile number');
      return;
    }
    const mobilePattern = /^[0-9]{10,15}$/;
    if (!mobilePattern.test(mobile)) {
      setLoginError('Invalid mobile number format');
      return;
    }
    setIsLoading(true);
    const otpCode = generateOtp();
    try {
      const fullMobile = `${countryCode}${mobile}`;
      const result = await smsService.sendOtp(fullMobile, otpCode, 'LOGIN');
      setGeneratedOtp('');
      setMsgId(result?.data?.message || 'OTP_SENT');
      setView('otp');
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      console.warn('OTP send failed.', err);
      const message = err.response?.data?.message || err.message || 'Unable to send OTP';
      setLoginError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTrustIndicators = () => (
    <div className="trust-indicator" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AiOutlineCheckCircle color="#10b981" /> <span>Secure Login</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaShieldAlt color="#10b981" /> <span>Data Protected</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-shell login-bg">
      <div className="auth-screen">
        <div className="auth-card multi-step-card login-card-overhaul">
          
          <div className="multi-step-header">
            {view !== 'login' ? (
              <button type="button" className="back-button" onClick={() => setView('login')}>
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
                        placeholder="Enter username"
                        value={loginData.username}
                        onChange={handleLoginChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label className="field-label" htmlFor="loginPassword" style={{ marginBottom: 0 }}>Password</label>
                      <button type="button" className="link-button small-text" onClick={() => setView('forgot-password')}>Forgot?</button>
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

                  <button type="button" className="secondary-outline-button" onClick={() => setView('login-otp-request')}>
                    Continue with OTP
                  </button>



                  <div className="compact-footer">
                    <span>New here? </span>
                    <button type="button" className="bold-orange" onClick={() => navigate('/register')}>Create Account</button>
                  </div>
                </form>
              </div>
            )}

            {(view === 'otp' || view === 'forgot-password-otp') && (
              <div className="animate-slide-up">
                <div className="otp-card-v2">
                  <div className="otp-icon-header">
                    <AiOutlineCheckCircle size={48} color="#ff6b17" />
                  </div>
                  <h2 className="otp-title-v2">Enter Verification Code</h2>
                  <p className="otp-subtitle-v2">
                    We've sent a 6-digit code to <strong style={{ color: '#2d3748' }}>{countryCode} {loginOtpData.mobile}</strong>.
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
                          onClick={handleSendOtp} 
                          className="bold-orange" 
                          disabled={isLoading}
                          style={{ fontSize: '13px', textDecoration: 'underline' }}
                        >
                          {isLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                      )}
                    </span>
                  </div>

                  <button className="primary-button cta-btn" onClick={handleOtpSubmit} disabled={isLoading} style={{ marginTop: '24px' }}>
                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                  
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button className="text-button" onClick={() => setView('login-otp-request')}>Change Phone Number</button>
                  </div>
                </div>
              </div>
            )}

            {view === 'login-otp-request' && (
              <div className="animate-slide-up">
                <form className="registration-form" onSubmit={handleSendOtp}>
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
                        placeholder="Enter mobile number"
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

            {view === 'forgot-password' && (
              <div className="animate-slide-up">
                <form className="registration-form" onSubmit={(e) => { e.preventDefault(); setView('forgot-password-otp'); }}>
                  <div className="form-group">
                    <label className="field-label">Email or Mobile</label>
                    <div className="field-with-icon">
                      <AiOutlineUser className="input-icon" />
                      <input
                        type="text"
                        className="text-field has-icon"
                        placeholder="Enter email or mobile"
                      />
                    </div>
                  </div>
                  <button className="primary-button cta-btn" type="submit">Get Verification Code</button>
                  <div className="secondary-link" style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button type="button" onClick={() => setView('login')}>Back to Login</button>
                  </div>
                </form>
              </div>
            )}

            {view === 'reset-password' && (
              <div className="animate-slide-up">
                <form className="registration-form" onSubmit={(e) => { e.preventDefault(); alert('Updated!'); setView('login'); }}>
                  <div className="form-group">
                    <label className="field-label">New Password</label>
                    <input type="password" className="text-field" placeholder="Create new password" />
                  </div>
                  <div className="form-group">
                    <label className="field-label">Confirm New Password</label>
                    <input type="password" className="text-field" placeholder="Confirm new password" />
                  </div>
                  <button className="primary-button cta-btn" type="submit">Securely Update Password</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
