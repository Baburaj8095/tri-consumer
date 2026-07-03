import { apiClient } from '../api/client';

export async function fetchHubbleIframeUrl() {
  const response = await apiClient.get('/api/hubble/iframe-url', { params: { platform: 'rn' } });
  return response.data?.data || response.data;
}

export async function fetchHubbleTransactions(limit = 50) {
  const response = await apiClient.get('/api/hubble/transactions/me', { params: { limit } });
  return response.data?.data || [];
}
