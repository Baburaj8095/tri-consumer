import { apiClient } from '../api/client';

export const profileService = {
  getProfile: () => apiClient.get('/api/users/me').then(res => res.data),
  updateProfile: (payload: Record<string, unknown>) => apiClient.put('/api/users/profile', payload).then(res => res.data),
  getKycStatus: () => apiClient.get('/api/kyc/status').then(res => res.data),
  getKycProfile: () => apiClient.get('/api/kyc/profile').then(res => res.data),
  startKyc: () => apiClient.post('/api/kyc/start', {}, { params: { platform: 'rn' } }).then(res => res.data),
};
