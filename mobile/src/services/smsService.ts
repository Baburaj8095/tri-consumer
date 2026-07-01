import { apiClient } from '../api/client';

export default class SMSService {
  async sendOtp(mobile: string, _otp?: string | null, purpose = 'LOGIN') {
    const { countryCode, nationalNumber } = this.splitMobile(mobile);
    const response = await apiClient.post('/api/auth/send-otp', { countryCode, mobile: nationalNumber, purpose });
    return response.data;
  }

  async verifyOtp(mobile: string, otp: string, purpose = 'LOGIN') {
    const { countryCode, nationalNumber } = this.splitMobile(mobile);
    const response = await apiClient.post('/api/auth/verify-otp', { countryCode, mobile: nationalNumber, otp, purpose });
    return response.data;
  }

  splitMobile(mobile: string) {
    const digits = String(mobile || '').replace(/[^0-9]/g, '');
    if (digits.length > 10 && digits.startsWith('91')) return { countryCode: '+91', nationalNumber: digits.slice(2) };
    return { countryCode: '+91', nationalNumber: digits.slice(-10) };
  }

  static mapErrorCode(code: number) {
    const map: Record<number, string> = { 400: 'Invalid request', 401: 'Unauthorized', 404: 'User not found', 409: 'Already registered', 429: 'Too many requests', 500: 'Server error' };
    return map[code] || `Unknown error: ${code}`;
  }
}