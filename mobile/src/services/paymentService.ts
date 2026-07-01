import { captainClient } from '../api/client';

export const paymentService = {
  initiateOfflinePayment: (shopId: string | number, amount: number, paymentMethod = 'MANUAL', onlineOrderId?: string | number) =>
    captainClient.post('/captain/offline-payments', {
      shopId: Number(shopId),
      amount,
      paymentMethod,
      ...(onlineOrderId ? { online_order_id: Number(onlineOrderId) } : {}),
    }).then(res => res.data),
};