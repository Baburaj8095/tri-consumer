import { apiClient } from '../api/client';

export async function fetchHubbleIframeUrl() {
  // TODO: In React Native, render returned iframeUrl with WebView if gift cards are enabled.
  const response = await apiClient.get('/api/hubble/iframe-url');
  return response.data?.data || response.data;
}

export async function fetchHubbleTransactions(limit = 50) {
  const response = await apiClient.get('/api/hubble/transactions/me', { params: { limit } });
  return response.data?.data || [];
}