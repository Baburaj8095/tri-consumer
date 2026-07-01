import React from 'react';
import { PlaceholderScreen } from './PlaceholderScreen';

export const NearMeScreen = () => <PlaceholderScreen title="Near Me" webRoute="/consumer-ecommerce/near-me" summary="Nearby products/services discovery flow." integrationPoints={["GET /captain/shops/online/products with search/category filters"]} />;
export const AdsScreen = () => <PlaceholderScreen title="Ads" webRoute="/consumer-ecommerce/ads" summary="Cashback/gift/shopping ad experiences." integrationPoints={["GET /api/ads/banners?target=CONSUMER_ONLINE_B2C"]} />;
export const SocietyScreen = () => <PlaceholderScreen title="Society" webRoute="/consumer-ecommerce/society" summary="Community initiatives placeholder." />;
export const BusinessRegistrationScreen = () => <PlaceholderScreen title="Business Registration" webRoute="/consumer-ecommerce/business" summary="List your business flow placeholder." />;
export const ConsumerScannerScreen = () => <PlaceholderScreen title="Consumer Scanner" webRoute="/consumer-ecommerce/scanner" summary="Scanner flow placeholder. Requires Expo camera/barcode package later." todos={["Install and configure expo-camera or barcode scanner package."]} />;
export const TriPayScreen = () => <PlaceholderScreen title="Tri Pay" webRoute="/consumer-ecommerce/tripay" summary="Bills, recharge, QR, wallet payments placeholder." todos={["Choose native payment/recharge SDKs or webview strategy."]} />;
export const TriEatScreen = () => <PlaceholderScreen title="Tri Eat" webRoute="/consumer-ecommerce/trieat" summary="Food delivery marketplace placeholder." />;
export const TriTripScreen = () => <PlaceholderScreen title="Tri Trip" webRoute="/consumer-ecommerce/tritrip" summary="Ride/travel booking placeholder." />;
export const TriPickDropScreen = () => <PlaceholderScreen title="Tri Pick Drop" webRoute="/consumer-ecommerce/tripickdrop" summary="Parcel pickup/drop booking placeholder." />;
export const TriZoneScreen = () => <PlaceholderScreen title="Tri Zone" webRoute="/consumer-ecommerce/tri-zone" summary="Local service zone placeholder." />;
export const TriInventoryBillingScreen = () => <PlaceholderScreen title="Tri Inventory Billing" webRoute="/business/inventory-billing" summary="Business inventory/billing link placeholder." />;
export const ProfileScreen = () => <PlaceholderScreen title="Profile" webRoute="/consumer-ecommerce/profile" summary="User profile fetch/update flow." integrationPoints={["GET /api/users/me", "PUT /api/users/profile"]} />;
export const ConsumerKYCScreen = () => <PlaceholderScreen title="Consumer KYC" webRoute="/consumer-ecommerce/kyc" summary="KYC profile/status/start flow." integrationPoints={["GET /api/kyc/status", "GET /api/kyc/profile", "POST /api/kyc/start"]} />;
export const OrdersScreen = () => <PlaceholderScreen title="Orders" webRoute="/orders" summary="Refinement route equivalent for delivery order list." integrationPoints={["GET /api/orders", "GET /captain/offline-payments"]} />;