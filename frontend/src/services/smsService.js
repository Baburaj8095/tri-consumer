import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export default class SMSService {
  async sendOtp(mobile, _otp, purpose = 'LOGIN') {
    const { countryCode, nationalNumber } = this.splitMobile(mobile);
    const response = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
      countryCode,
      mobile: nationalNumber,
      purpose,
    });
    return response.data;
  }

  async verifyOtp(mobile, otp, purpose = 'LOGIN') {
    const { countryCode, nationalNumber } = this.splitMobile(mobile);
    const response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
      countryCode,
      mobile: nationalNumber,
      otp,
      purpose,
    });
    return response.data;
  }

  splitMobile(mobile) {
    const digits = String(mobile || '').replace(/[^0-9]/g, '');
    if (digits.length > 10 && digits.startsWith('91')) {
      return { countryCode: '+91', nationalNumber: digits.slice(2) };
    }
    return { countryCode: '+91', nationalNumber: digits.slice(-10) };
  }

  static mapErrorCode(code) {
    const map = {
      400: 'Invalid request',
      401: 'Unauthorized',
      404: 'User not found',
      409: 'Already registered',
      429: 'Too many requests',
      500: 'Server error',
    };
    return map[code] || `Unknown error: ${code}`;
  }
}
