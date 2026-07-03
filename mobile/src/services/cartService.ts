import { captainClient } from '../api/client';
import { Address, CartStateShape } from '../types/domain';

export const cartService = {
  getAddresses: () => captainClient.get('/api/addresses').then(res => res.data?.data || res.data || []),
  createAddress: (address: Address) => captainClient.post('/api/addresses', address).then(res => res.data),
  validateCart: (cart: CartStateShape, addressId?: string | number | null) =>
    captainClient.post('/api/cart/validate', {
      shop_id: cart.shopId,
      address_id: addressId || null,
      order_channel: cart.orderChannel || 'ONLINE_DELIVERY',
      latitude: cart.latitude || null,
      longitude: cart.longitude || null,
      items: cart.items.map(item => ({ product_id: item.productId, quantity: item.quantity })),
    }).then(res => res.data?.data || res.data),
  createOrder: (cart: CartStateShape, addressId: string | number, paymentMode: 'ONLINE' | 'COD' = 'ONLINE') =>
    captainClient.post('/api/orders', {
      shop_id: cart.shopId,
      address_id: addressId,
      order_channel: cart.orderChannel || 'ONLINE_DELIVERY',
      payment_mode: paymentMode,
      latitude: cart.latitude || null,
      longitude: cart.longitude || null,
      items: cart.items.map(item => ({ product_id: item.productId, quantity: item.quantity })),
    }).then(res => res.data?.data || res.data),
};
