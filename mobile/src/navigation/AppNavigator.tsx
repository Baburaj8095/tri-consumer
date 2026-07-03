import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useInitialHydration } from '../hooks/useInitialHydration';
import { LoginScreen, RegisterScreen } from '../screens/AuthScreens';
import { ConsumerHomeScreen } from '../screens/HomeScreen';
import {
  CartScreen,
  DeliveryScreen,
  MyOrdersScreen,
  NearbyStoresScreen,
  OrderDetailsScreen,
  ProductDetailsScreen,
  SecureCheckoutScreen,
  ShopDetailsScreen,
  StorePaymentScreen,
  TrackOrderScreen,
  UpiPaymentScreen,
} from '../screens/CommerceScreens';
import {
  AdsScreen,
  BusinessRegistrationScreen,
  ConsumerKYCScreen,
  ConsumerScannerScreen,
  NearMeScreen,
  OrdersScreen,
  ProfileScreen,
  SocietyScreen,
  TriEatScreen,
  TriInventoryBillingScreen,
  TriPayScreen,
  TriPickDropScreen,
  TriTripScreen,
  TriZoneScreen,
} from '../screens/ServicePlaceholders';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { LoadingScreen } from '../screens/LoadingScreen';
import { GiftCardsScreen } from '../screens/GiftCardsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  useInitialHydration();
  const { hydrated, token } = useAuthStore();

  if (!hydrated) return <LoadingScreen message="Restoring your session..." />;

  return (
    <Stack.Navigator
      key={token ? 'authenticated' : 'guest'}
      initialRouteName={token ? 'ConsumerHome' : 'Login'}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {!token ? <>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      </> : <>
      <Stack.Screen name="ConsumerHome" component={ConsumerHomeScreen} options={{ title: 'Tri Consumer' }} />
      <Stack.Screen name="Delivery" component={DeliveryScreen} />
      <Stack.Screen name="NearbyStores" component={NearbyStoresScreen} options={{ title: 'Nearby Stores' }} />
      <Stack.Screen name="NearMe" component={NearMeScreen} options={{ title: 'Near Me' }} />
      <Stack.Screen name="Ads" component={AdsScreen} />
      <Stack.Screen name="Society" component={SocietyScreen} />
      <Stack.Screen name="BusinessRegistration" component={BusinessRegistrationScreen} options={{ title: 'Business' }} />
      <Stack.Screen name="ConsumerScanner" component={ConsumerScannerScreen} options={{ title: 'Scanner' }} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="TriPay" component={TriPayScreen} options={{ title: 'Tri Pay' }} />
      <Stack.Screen name="TriEat" component={TriEatScreen} options={{ title: 'Tri Eat' }} />
      <Stack.Screen name="TriTrip" component={TriTripScreen} options={{ title: 'Tri Trip' }} />
      <Stack.Screen name="TriPickDrop" component={TriPickDropScreen} options={{ title: 'Tri Pick Drop' }} />
      <Stack.Screen name="TriZone" component={TriZoneScreen} options={{ title: 'Tri Zone' }} />
      <Stack.Screen name="TriInventoryBilling" component={TriInventoryBillingScreen} options={{ title: 'Inventory Billing' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ConsumerKYC" component={ConsumerKYCScreen} options={{ title: 'KYC' }} />
      <Stack.Screen name="GiftCards" component={GiftCardsScreen} options={{ title: 'Gift Cards' }} />
      <Stack.Screen name="ShopDetails" component={ShopDetailsScreen} options={{ title: 'Shop Details' }} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Product Details' }} />
      <Stack.Screen name="StorePayment" component={StorePaymentScreen} options={{ title: 'Store Payment' }} />
      <Stack.Screen name="SecureCheckout" component={SecureCheckoutScreen} options={{ title: 'Secure Checkout' }} />
      <Stack.Screen name="UpiPayment" component={UpiPaymentScreen} options={{ title: 'UPI Payment' }} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: 'My Orders' }} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: 'Order Details' }} />
      <Stack.Screen name="TrackOrder" component={TrackOrderScreen} options={{ title: 'Track Order' }} />
      </>}
    </Stack.Navigator>
  );
}
