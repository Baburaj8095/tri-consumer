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
    const raw = String(mobile || '').trim();
    const digits = raw.replace(/[^0-9]/g, '');
    if (raw.startsWith('+91') || (digits.length > 10 && digits.startsWith('91'))) return { countryCode: '+91', nationalNumber: digits.slice(2) };
    if (raw.startsWith('+44')) return { countryCode: '+44', nationalNumber: digits.slice(2) };
    if (raw.startsWith('+1')) return { countryCode: '+1', nationalNumber: digits.slice(1) };
    return { countryCode: '+91', nationalNumber: digits.slice(-10) };
  }

  static mapErrorCode(code: number) {
    const map: Record<number, string> = { 400: 'Invalid request', 401: 'Unauthorized', 404: 'User not found', 409: 'Already registered', 429: 'Too many requests', 500: 'Server error' };
    return map[code] || `Unknown error: ${code}`;
  }
}
