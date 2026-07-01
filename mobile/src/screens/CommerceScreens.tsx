import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { BaseScreen } from '../components/BaseScreen';
import { InfoCard } from '../components/InfoCard';
import { CartLineItem, OrderCard, ProductCard, SectionHeader, StoreCard } from '../components/CommerceCards';
import { catalogService } from '../services/catalogService';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { products as fallbackProducts } from '../constants/mockData';
import { Product, Shop } from '../types/domain';
import { RootStackParamList } from '../types/navigation';
import { useCartStore } from '../store/cartStore';
import { useLocationStore } from '../store/locationStore';
import { formatErrorMessage } from '../utils/errorFormatter';
import { colors } from '../theme/colors';

const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
const fallbackNativeProducts: Product[] = fallbackProducts.map(p => ({ id: p.id, name: p.name, price: Number(p.newPrice.replace(/[^0-9]/g, '')), image: p.image, shop_name: 'Tri Deals' }));

export function DeliveryScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Delivery'>) {
  const [products, setProducts] = useState<Product[]>(fallbackNativeProducts);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const addProduct = useCartStore(state => state.addProduct);
  useEffect(() => { void catalogService.getOnlineProducts().then(data => { const list = Array.isArray(data) ? data : data?.products || data?.results || []; if (list.length) setProducts(list); }).catch(() => setProducts(fallbackNativeProducts)); }, []);
  const filtered = useMemo(() => products.filter(item => {
    const title = String(item.title || item.name || '').toLowerCase();
    const q = query.trim().toLowerCase();
    return (activeCat === 'All' || title.includes(activeCat.toLowerCase())) && (!q || title.includes(q));
  }), [products, query, activeCat]);
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <Text style={styles.pageTitle}>Delivery Marketplace</Text><Text style={styles.pageSubtitle}>Browse products with native search, filters and cart actions.</Text>
    <TextInput style={styles.searchInput} placeholder="Search products" value={query} onChangeText={setQuery} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{['All', 'Electronics', 'Fashion', 'Grocery', 'Home', 'Beauty'].map(cat => <Pressable key={cat} onPress={() => setActiveCat(cat)} style={[styles.chip, activeCat === cat && styles.chipActive]}><Text style={[styles.chipText, activeCat === cat && styles.chipTextActive]}>{cat}</Text></Pressable>)}</ScrollView>
    <View style={styles.productGrid}>{filtered.map(item => <ProductCard key={String(item.id)} product={item} onPress={() => navigation.navigate('ProductDetails', { id: String(item.id) })} onAdd={() => void addProduct(item)} />)}</View>
    {!filtered.length ? <InfoCard title="No products found" subtitle="Try another search or category." /> : null}
  </ScrollView></BaseScreen>;
}

export function NearbyStoresScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'NearbyStores'>) {
  const location = useLocationStore(state => state.location);
  const [shops, setShops] = useState<Shop[]>([]);
  const [query, setQuery] = useState('');
  useEffect(() => { void catalogService.getB2CMerchants(location.lat, location.lng).then(data => setShops(Array.isArray(data) ? data : [])).catch(() => setShops([])); }, [location.lat, location.lng]);
  const filtered = shops.filter(shop => `${shop.shop_name || ''} ${shop.business_name || ''} ${shop.city || ''}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <Text style={styles.pageTitle}>Nearby Stores</Text><Text style={styles.pageSubtitle}>{location.formattedAddress}</Text>
    <TextInput style={styles.searchInput} placeholder="Search stores near you" value={query} onChangeText={setQuery} />
    <InfoCard title="Sponsored stores" subtitle="Native carousel placeholder for sponsored-shop ads and impression tracking." />
    {filtered.map(store => <StoreCard key={String(store.id)} store={store} onPress={() => navigation.navigate('ShopDetails', { id: String(store.shop_id || store.id) })} />)}
    {!filtered.length ? <InfoCard title="No stores loaded" subtitle="Native store cards are ready for live API data." /> : null}
  </ScrollView></BaseScreen>;
}

export function CartScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Cart'>) {
  const { cart, updateQty, clearCart } = useCartStore();
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal > 0 ? 45 : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + delivery + tax;
  const validate = async () => { try { Alert.alert('Cart validation', JSON.stringify(await cartService.validateCart(cart), null, 2)); } catch (err) { Alert.alert('Validation failed', formatErrorMessage(err)); } };
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <Text style={styles.pageTitle}>Your Cart</Text><Text style={styles.pageSubtitle}>{cart.shopName || 'Add items from a store to start checkout'}</Text>
    {cart.items.map(item => <CartLineItem key={String(item.productId)} item={item} onIncrement={() => void updateQty(item.productId, 1)} onDecrement={() => void updateQty(item.productId, -1)} />)}
    {!cart.items.length ? <InfoCard title="Cart is empty" subtitle="Go to Delivery Marketplace and add products." /> : null}
    <View style={styles.billCard}><BillRow label="Subtotal" value={subtotal} /><BillRow label="Delivery" value={delivery} /><BillRow label="Taxes" value={tax} /><View style={styles.billDivider} /><BillRow label="Grand total" value={total} bold /></View>
    <AppButton label="Validate cart" variant="secondary" onPress={validate} /><AppButton label="Checkout" onPress={() => navigation.navigate('SecureCheckout', { id: String(cart.shopId || '0'), amount: Number(total.toFixed(2)) })} /><AppButton label="Clear cart" variant="secondary" onPress={() => void clearCart()} />
  </ScrollView></BaseScreen>;
}

function BillRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) { return <View style={styles.billRow}><Text style={[styles.billLabel, bold && styles.bold]}>{label}</Text><Text style={[styles.billValue, bold && styles.bold]}>₹{value.toFixed(2)}</Text></View>; }

export function MyOrdersScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'MyOrders'>) {
  const [records, setRecords] = useState<Array<{ id: string | number; recordType: string; status?: string; createdAt?: string; created_at?: string }>>([]);
  useEffect(() => { void Promise.all([orderService.getOfflinePayments(), orderService.getOrders()]).then(([payments, orders]) => setRecords([...(payments || []).map((p: { id: string | number; status?: string }) => ({ ...p, recordType: 'OFFLINE_PAYMENT' })), ...(orders || []).map((o: { id: string | number; status?: string }) => ({ ...o, recordType: 'ONLINE_ORDER' }))])).catch(() => setRecords([])); }, []);
  return <BaseScreen title="My Orders" subtitle="Native transaction timeline for delivery orders and offline payments.">{records.map(item => <OrderCard key={`${item.recordType}-${item.id}`} title={`${item.recordType.replace('_', ' ')} #${item.id}`} subtitle={item.createdAt || item.created_at || 'Recent activity'} status={item.status} onPress={() => navigation.navigate('OrderDetails', { id: String(item.id) })} />)}{!records.length ? <InfoCard title="No records yet" subtitle="Your native order timeline will appear here after orders or payments." /> : null}</BaseScreen>;
}

export function SecureCheckoutScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'SecureCheckout'>) {
  const { id, amount = 0, onlineOrderId } = route.params;
  const pay = async () => { try { const data = await paymentService.initiateOfflinePayment(id, amount, 'MANUAL', onlineOrderId); navigation.navigate('UpiPayment', { id, amount, refId: data.refId || data.ref_id, onlineOrderId }); } catch (err) { Alert.alert('Payment failed', formatErrorMessage(err)); } };
  return <BaseScreen title="Secure Checkout" subtitle="Native payment selection and Pay Store settlement flow."><View style={styles.checkoutAmount}><Text style={styles.checkoutAmountText}>₹{amount.toFixed(2)}</Text><Text style={styles.pageSubtitle}>Shop #{id}</Text></View><InfoCard title="Manual payment" subtitle="Pay cash at counter or scan merchant UPI QR. Merchant approval flow remains integrated." /><InfoCard title="Razorpay / Online" subtitle="TODO: integrate native payment SDK or Linking/WebView flow for production." /><AppButton label="Initiate manual payment" onPress={pay} /></BaseScreen>;
}

export function ShopDetailsScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'ShopDetails'>) {
  const [products, setProducts] = useState<Product[]>([]);
  const addProduct = useCartStore(state => state.addProduct);
  useEffect(() => { void catalogService.getShopProducts(route.params.id).then(data => setProducts(Array.isArray(data) ? data : [])).catch(() => setProducts([])); }, [route.params.id]);
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}><Image source={{ uri: fallbackImage }} style={styles.shopHero} /><Text style={styles.pageTitle}>Shop #{route.params.id}</Text><Text style={styles.pageSubtitle}>Native storefront with mobile catalog, cart and store actions.</Text><SectionHeader title="Online catalog" /><View style={styles.productGrid}>{products.map(item => <ProductCard key={String(item.id)} product={item} onPress={() => navigation.navigate('ProductDetails', { id: String(item.id) })} onAdd={() => void addProduct(item, { shopId: route.params.id, shopName: `Shop #${route.params.id}` })} />)}</View>{!products.length ? <InfoCard title="No live products loaded" subtitle="Storefront layout is native-ready. Product API data will populate this catalog." /> : null}</ScrollView></BaseScreen>;
}

export function ProductDetailsScreen({ route }: NativeStackScreenProps<RootStackParamList, 'ProductDetails'>) { return <BaseScreen title="Product Details" subtitle={`Product #${route.params.id}`}><Image source={{ uri: fallbackImage }} style={styles.productHero} /><InfoCard title="Native product page" subtitle="TODO: connect selected product data, image carousel, variants, reviews, recommendations and sticky add-to-cart." /></BaseScreen>; }
export const StorePaymentScreen = () => <BaseScreen title="Store Payment" subtitle="Native amount entry and checkout navigation shell." />;
export const UpiPaymentScreen = () => <BaseScreen title="UPI Payment" subtitle="Native payment instructions/status shell. TODO: add Linking or native SDK." />;
export const OrderDetailsScreen = () => <BaseScreen title="Order Details" subtitle="Native order status/items/timeline shell." />;
export const TrackOrderScreen = () => <BaseScreen title="Track Order" subtitle="Native delivery tracking timeline shell." />;

const styles = StyleSheet.create({
  container: { paddingVertical: 18, paddingBottom: 34 }, pageTitle: { color: colors.text, fontSize: 28, fontWeight: '900', marginBottom: 6 }, pageSubtitle: { color: colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  searchInput: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 12, color: colors.text }, chipRow: { paddingBottom: 14, gap: 8 }, chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface }, chipActive: { backgroundColor: colors.primary, borderColor: colors.primary }, chipText: { color: colors.textSecondary, fontWeight: '800' }, chipTextActive: { color: '#fff' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, billCard: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 16, marginTop: 8, marginBottom: 10 }, billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 }, billLabel: { color: colors.textSecondary, fontWeight: '700' }, billValue: { color: colors.text, fontWeight: '800' }, billDivider: { height: 1, backgroundColor: colors.border, marginVertical: 8 }, bold: { fontWeight: '900', color: colors.text, fontSize: 17 },
  checkoutAmount: { backgroundColor: colors.surfaceSoft, borderRadius: 24, padding: 20, alignItems: 'center', marginBottom: 16 }, checkoutAmountText: { color: colors.primary, fontSize: 36, fontWeight: '900' }, shopHero: { width: '100%', height: 190, borderRadius: 28, marginBottom: 16, backgroundColor: colors.border }, productHero: { width: '100%', height: 260, borderRadius: 28, marginBottom: 18, backgroundColor: colors.border },
});