import { captainClient } from '../api/client';

export const orderService = {
  getOrders: () => captainClient.get('/api/orders').then(res => res.data?.data || res.data || []),
  getOrderDetails: (id: string | number) => captainClient.get(`/api/orders/${id}`).then(res => res.data?.data || res.data),
  cancelOrder: (id: string | number) => captainClient.post(`/api/orders/${id}/cancel`, {}).then(res => res.data),
  getOfflinePayments: () => captainClient.get('/captain/offline-payments').then(res => res.data?.data || res.data || []),
};
