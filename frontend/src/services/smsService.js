import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * SMSService
 * Frontend service managing OTP dispatch and verification with Aqua SMS backend gateway.
 */
export default class SMSService {
  /**
   * Dispatch OTP to mobile number via backend Aqua SMS integration
   * @param {string} mobile - 10-digit mobile number or with country code
   * @param {string|null} _otp - Optional client hint (ignored; server generates OTP)
   * @param {'LOGIN'|'REGISTRATION'|'FORGOT_PASSWORD'} purpose - Purpose of OTP
   */
  async sendOtp(mobile, _otp = null, purpose = 'LOGIN') {
    const { countryCode, nationalNumber } = this.splitMobile(mobile);
    if (!nationalNumber || nationalNumber.length < 10) {
      throw new Error('Please enter a valid 10-digit mobile number');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
        countryCode,
        mobile: nationalNumber,
        purpose,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return response.data;
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      const status = err.response?.status;
      if (serverMessage) {
        throw new Error(serverMessage);
      }
      if (status) {
        throw new Error(SMSService.mapErrorCode(status));
      }
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        throw new Error('SMS service request timed out. Please try again.');
      }
      throw new Error('Failed to connect to authentication server. Please check your network connection.');
    }
  }

  /**
   * Verify entered OTP with backend
   * @param {string} mobile - Mobile number
   * @param {string} otp - 6-digit OTP code entered by user
   * @param {'LOGIN'|'REGISTRATION'|'FORGOT_PASSWORD'} purpose - Purpose of OTP
   */
  async verifyOtp(mobile, otp, purpose = 'LOGIN') {
    const { countryCode, nationalNumber } = this.splitMobile(mobile);
    const cleanOtp = String(otp || '').trim().replace(/[^0-9]/g, '');

    if (cleanOtp.length !== 6) {
      throw new Error('Please enter a valid 6-digit verification code');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
        countryCode,
        mobile: nationalNumber,
        otp: cleanOtp,
        purpose,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return response.data;
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      const status = err.response?.status;
      if (serverMessage) {
        throw new Error(serverMessage);
      }
      if (status === 400) {
        throw new Error('Invalid OTP code. Please check your SMS and try again.');
      }
      if (status) {
        throw new Error(SMSService.mapErrorCode(status));
      }
      throw new Error('Failed to verify OTP. Please try again.');
    }
  }

  /**
   * Reset password using verified OTP
   * @param {string} mobile - Mobile number
   * @param {string} otp - 6-digit OTP code entered by user
   * @param {string} newPassword - New password
   */
  async resetPassword(mobile, otp, newPassword) {
    const { countryCode, nationalNumber } = this.splitMobile(mobile);
    const cleanOtp = String(otp || '').trim().replace(/[^0-9]/g, '');

    if (cleanOtp.length !== 6) {
      throw new Error('Please enter a valid 6-digit verification code');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        countryCode,
        mobile: nationalNumber,
        otp: cleanOtp,
        newPassword,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return response.data;
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      const status = err.response?.status;
      if (serverMessage) {
        throw new Error(serverMessage);
      }
      if (status) {
        throw new Error(SMSService.mapErrorCode(status));
      }
      throw new Error('Failed to reset password. Please try again.');
    }
  }

  splitMobile(mobile) {
    const digits = String(mobile || '').replace(/[^0-9]/g, '');
    if (digits.length === 10) {
      return { countryCode: '+91', nationalNumber: digits };
    }
    if (digits.length === 12 && digits.startsWith('91')) {
      return { countryCode: '+91', nationalNumber: digits.slice(2) };
    }
    if (digits.length > 10) {
      const prefixLen = digits.length - 10;
      return { countryCode: `+${digits.slice(0, prefixLen)}`, nationalNumber: digits.slice(-10) };
    }
    return { countryCode: '+91', nationalNumber: digits };
  }

  static mapErrorCode(code) {
    const map = {
      400: 'Invalid verification request or OTP',
      401: 'Unauthorized session',
      404: 'No account found with this mobile number. Please register first.',
      409: 'This mobile number is already registered. Please login instead.',
      429: 'Too many OTP requests. Please wait a few minutes before trying again.',
      500: 'SMS delivery gateway service error. Please try again later.',
      502: 'Gateway timeout communicating with SMS provider.',
      503: 'SMS delivery service currently unavailable.',
    };
    return map[code] || `Service error (${code}). Please try again.`;
  }
}
