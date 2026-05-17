import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineCheckCircle, AiOutlineLeft, AiOutlineUser, AiOutlineLock, AiOutlineGoogle, AiOutlineWhatsApp, AiOutlineApple } from 'react-icons/ai';
import { FaEye, FaEyeSlash, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './loginRegistration.css';

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
  const [loginOtpData, setLoginOtpData] = useState({ mobile: '' });
  const [newPasswordData, setNewPasswordData] = useState({ password: '', confirmPassword: '' });
  const [generalError, setGeneralError] = useState('');

  // Lock body scroll for premium mobile experience
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (loginError) setLoginError('');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginData.username.trim() || !loginData.password.trim()) {
      setLoginError('Please enter username and password');
      return;
    }
    
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      if (loginData.username !== 'consumer' || loginData.password !== 'password') {
        setLoginError('Invalid username or password (use consumer/password)');
        setIsLoading(false);
        return;
      }
      setView('otp');
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setIsLoading(false);
    }, 1200);
  };

  const handleOtpSubmit = () => {
    const code = otp.join('');
    if (code.length < 6) {
      setOtpError('Please enter a 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      if (code !== '123456') {
        setOtpError('Invalid OTP (use 123456)');
        setIsLoading(false);
        return;
      }

      if (view === 'forgot-password-otp') {
        setView('reset-password');
      } else {
        alert('Logged in successfully!');
        navigate('/'); // Redirect to home/dashboard
      }
      setIsLoading(false);
    }, 1000);
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
                <div className="brand-logo-circle">
                  <AiOutlineUser size={40} color="white" />
                </div>
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
                  <p className="otp-subtitle-v2">We've sent a 6-digit code to your registered device.</p>

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
                  
                  <button className="primary-button cta-btn" onClick={handleOtpSubmit} disabled={isLoading} style={{ marginTop: '24px' }}>
                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                  
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button className="text-button" onClick={() => setView('login')}>Back to Login</button>
                  </div>
                </div>
              </div>
            )}

            {view === 'login-otp-request' && (
              <div className="animate-slide-up">
                <form className="registration-form" onSubmit={(e) => { e.preventDefault(); setView('otp'); }}>
                  <div className="form-group">
                    <label className="field-label">Mobile Number</label>
                    <div className="field-with-icon">
                      <AiOutlineUser className="input-icon" />
                      <input
                        type="tel"
                        className="text-field has-icon"
                        placeholder="Enter mobile number"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <button className="primary-button cta-btn" type="submit">Send OTP Code</button>
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
