import { captainClient } from '../api/client';

export const catalogService = {
  getOnlineProducts: (params?: Record<string, string | number>) =>
    captainClient.get('/captain/shops/online/products', { params: { limit: 100, offset: 0, ...params } }).then(res => res.data),
  getB2CMerchants: (lat?: number, lng?: number) =>
    captainClient.get('/captain/merchants/b2c', { params: lat && lng ? { lat, lng, radius_km: 25 } : undefined }).then(res => res.data),
  getMerchantCategories: () => captainClient.get('/captain/merchant/categories').then(res => res.data),
  getSponsoredShops: () => captainClient.get('/api/ads/sponsored-shops', { params: { limit: 6, target: 'CONSUMER_NEARBY_B2C' } }).then(res => res.data),
  getShopDetails: (id: string | number) => captainClient.get(`/captain/consumer/shops/${id}`).then(res => res.data),
  getNearbyShopDetails: (id: string | number, lat?: number, lng?: number) =>
    captainClient.get(`/captain/consumer/nearby-shops/${id}`, { params: lat && lng ? { lat, lng } : undefined }).then(res => res.data),
  getShopProducts: (id: string | number) => captainClient.get(`/captain/consumer/shops/${id}/products`).then(res => res.data),
  getNearbyShopDeliveryProducts: (id: string | number, lat?: number, lng?: number) =>
    captainClient.get(`/captain/consumer/nearby-shops/${id}/delivery-products`, { params: lat && lng ? { lat, lng } : undefined }).then(res => res.data),
};