import { captainClient } from '../api/client';

const listData = (payload: any) => {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  return data?.results || data?.products || data?.shops || data?.categories || [];
};

export const catalogService = {
  getOnlineProducts: (params?: Record<string, string | number>) =>
    captainClient.get('/captain/shops/online/products', { params: { limit: 100, offset: 0, ...params } }).then(res => listData(res.data)),
  getB2CMerchants: (lat?: number, lng?: number) =>
    captainClient.get('/captain/merchants/b2c', { params: lat != null && lng != null ? { lat, lng, radius_km: 25 } : undefined }).then(res => listData(res.data)),
  getMerchantCategories: () => captainClient.get('/captain/merchant/categories').then(res => listData(res.data)),
  getSponsoredShops: () => captainClient.get('/api/ads/sponsored-shops', { params: { limit: 6, target: 'CONSUMER_NEARBY_B2C' } }).then(res => listData(res.data)),
  getShopDetails: (id: string | number) => captainClient.get(`/captain/consumer/shops/${id}`).then(res => res.data),
  getNearbyShopDetails: (id: string | number, lat?: number, lng?: number) =>
    captainClient.get(`/captain/consumer/nearby-shops/${id}`, { params: lat && lng ? { lat, lng } : undefined }).then(res => res.data),
  getShopProducts: (id: string | number) => captainClient.get(`/captain/consumer/shops/${id}/products`).then(res => listData(res.data)),
  getNearbyShopDeliveryProducts: (id: string | number, lat?: number, lng?: number) =>
    captainClient.get(`/captain/consumer/nearby-shops/${id}/delivery-products`, { params: lat && lng ? { lat, lng } : undefined }).then(res => res.data),
};
