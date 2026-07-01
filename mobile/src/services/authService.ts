import { apiClient } from '../api/client';

export const authService = {
  login: (username: string, password: string) => apiClient.post('/api/auth/login', { username: username.trim(), password }).then(res => res.data),
  register: (payload: Record<string, unknown>) => apiClient.post('/api/auth/register', payload).then(res => res.data),
  validateSponsor: (sponsorId: string) => apiClient.get('/api/auth/sponsor/validate', { params: { sponsorId } }).then(res => res.data),
  lookupPincode: (pinCode: string) => apiClient.get(`/api/location/pincode/${pinCode}`).then(res => res.data),
  getProfile: () => apiClient.get('/api/users/me').then(res => res.data),
  updateProfile: (payload: Record<string, unknown>) => apiClient.put('/api/users/profile', payload).then(res => res.data),
};