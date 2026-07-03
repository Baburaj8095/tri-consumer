import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
import { Address, Product, Shop } from '../types/domain';
import { RootStackParamList } from '../types/navigation';
import { useCartStore } from '../store/cartStore';
import { useLocationStore } from '../store/locationStore';
import { formatErrorMessage } from '../utils/errorFormatter';
import { colors } from '../theme/colors';

const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
const fallbackNativeProducts: Product[] = fallbackProducts.map(p => ({ id: p.id, name: p.name, price: Number(p.newPrice.replace(/[^0-9]/g, '')), image: p.image, shop_name: 'Tri Deals' }));

export function DeliveryScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Delivery'>) {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const addProduct = useCartStore(state => state.addProduct);
  const loadProducts = async () => { setLoading(true); setError(''); try { setProducts(await catalogService.getOnlineProducts({ ...(activeCat !== 'All' ? { category: activeCat } : {}), ...(query.trim() ? { search: query.trim() } : {}) })); } catch (err) { setProducts([]); setError(formatErrorMessage(err)); } finally { setLoading(false); } };
  useEffect(() => { const timer = setTimeout(() => { void loadProducts(); }, 300); return () => clearTimeout(timer); }, [activeCat, query]);
  const filtered = useMemo(() => products.filter(item => {
    const title = String(item.title || item.name || '').toLowerCase();
    const q = query.trim().toLowerCase();
    return (activeCat === 'All' || title.includes(activeCat.toLowerCase())) && (!q || title.includes(q));
  }), [products, query, activeCat]);
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <Text style={styles.pageTitle}>Delivery Marketplace</Text><Text style={styles.pageSubtitle}>Browse products with native search, filters and cart actions.</Text>
    <TextInput style={styles.searchInput} placeholder="Search products" value={query} onChangeText={setQuery} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{['All', 'Electronics', 'Fashion', 'Grocery', 'Home', 'Beauty'].map(cat => <Pressable key={cat} onPress={() => setActiveCat(cat)} style={[styles.chip, activeCat === cat && styles.chipActive]}><Text style={[styles.chipText, activeCat === cat && styles.chipTextActive]}>{cat}</Text></Pressable>)}</ScrollView>
    {loading ? <ActivityIndicator color={colors.primary} /> : null}{error ? <><InfoCard title="Online marketplace unavailable" subtitle={error} /><AppButton label="Retry" onPress={loadProducts} /></> : null}
    <View style={styles.productGrid}>{filtered.map(item => <ProductCard key={String(item.id)} product={item} onPress={() => navigation.navigate('ProductDetails', { id: String(item.id) })} onAdd={() => void addProduct(item)} />)}</View>
    {!loading && !error && !filtered.length ? <InfoCard title="No live products found" subtitle="Try another search or category." /> : null}
  </ScrollView></BaseScreen>;
}

export function NearbyStoresScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'NearbyStores'>) {
  const location = useLocationStore(state => state.location);
  const [shops, setShops] = useState<Shop[]>([]);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Array<{ id?: string | number; name?: string; category_name?: string }>>([]);
  const [sponsored, setSponsored] = useState<Shop[]>([]);
  const [activeCategory, setActiveCategory] = useState('All Stores');
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const loadStores = async () => { setLoading(true); setError(''); try { const [liveShops, liveCategories, liveSponsored] = await Promise.all([catalogService.getB2CMerchants(location.lat, location.lng), catalogService.getMerchantCategories(), catalogService.getSponsoredShops()]); setShops(liveShops); setCategories(liveCategories); setSponsored(liveSponsored); } catch (err) { setShops([]); setCategories([]); setSponsored([]); setError(formatErrorMessage(err)); } finally { setLoading(false); } };
  useEffect(() => { void loadStores(); }, [location.lat, location.lng]);
  const filtered = shops.filter(shop => { const text = `${shop.shop_name || ''} ${shop.business_name || ''} ${shop.city || ''} ${shop.category_name || shop.category || ''}`.toLowerCase(); return text.includes(query.trim().toLowerCase()) && (activeCategory === 'All Stores' || text.includes(activeCategory.toLowerCase())); });
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <Text style={styles.pageTitle}>Nearby Stores</Text><Text style={styles.pageSubtitle}>{location.formattedAddress}</Text>
    <TextInput style={styles.searchInput} placeholder="Search stores near you" value={query} onChangeText={setQuery} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{['All Stores', ...categories.map(item => item.name || item.category_name || '').filter(Boolean)].map(cat => <Pressable key={cat} onPress={() => setActiveCategory(cat)} style={[styles.chip, activeCategory === cat && styles.chipActive]}><Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>{cat}</Text></Pressable>)}</ScrollView>
    {sponsored.length ? <><SectionHeader title="Sponsored stores" /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{sponsored.map(store => <View key={`s-${store.id}`} style={{ width: 260 }}><StoreCard store={store} onPress={() => navigation.navigate('ShopDetails', { id: String(store.shop_id || store.id) })} /></View>)}</ScrollView></> : null}
    {loading ? <ActivityIndicator color={colors.primary} /> : null}{error ? <><InfoCard title="Nearby stores unavailable" subtitle={error} /><AppButton label="Retry" onPress={loadStores} /></> : null}
    {filtered.map(store => <StoreCard key={String(store.id)} store={store} onPress={() => navigation.navigate('ShopDetails', { id: String(store.shop_id || store.id) })} />)}
    {!loading && !error && !filtered.length ? <InfoCard title="No live stores found" subtitle="Try another search, category, or delivery location." /> : null}
  </ScrollView></BaseScreen>;
}

export function CartScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Cart'>) {
  const { cart, updateQty, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState<Address>({ recipients_name: '', recipients_phone: '', address_line1: '', city: '', pincode: '', addressType: 'HOME', isDefault: true });
  const [paymentMode, setPaymentMode] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [validation, setValidation] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const localSubtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serverSubtotal = Number(validation?.subtotal ?? validation?.sub_total ?? localSubtotal);
  const delivery = Number(validation?.deliveryFee ?? validation?.delivery_fee ?? (serverSubtotal > 0 ? 45 : 0));
  const tax = Number(validation?.tax ?? validation?.tax_amount ?? serverSubtotal * 0.05);
  const total = Number(validation?.grandTotal ?? validation?.grand_total ?? validation?.total ?? serverSubtotal + delivery + tax);

  const loadAddresses = async () => {
    setLoading(true); setError('');
    try {
      const data = await cartService.getAddresses();
      const list: Address[] = Array.isArray(data) ? data : data?.results || [];
      setAddresses(list);
      if (list.length) setSelectedAddressId((list.find(item => item.isDefault) || list[0]).id || null);
    } catch (err) { setError(formatErrorMessage(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadAddresses(); }, []);
  useEffect(() => {
    if (!cart.items.length) { setValidation(null); return; }
    let active = true;
    void cartService.validateCart(cart, selectedAddressId).then(data => { if (active) { setValidation(data || null); setError(''); } }).catch(err => { if (active) setError(`Cart validation failed: ${formatErrorMessage(err)}`); });
    return () => { active = false; };
  }, [cart, selectedAddressId]);

  const saveAddress = async () => {
    if (!address.recipients_name.trim() || !/^\d{10,15}$/.test(address.recipients_phone) || !address.address_line1.trim() || !address.city.trim() || !/^\d{6}$/.test(address.pincode)) {
      setError('Enter recipient name, a valid phone, address, city, and 6-digit PIN code.'); return;
    }
    try { await cartService.createAddress(address); setShowAddressForm(false); await loadAddresses(); }
    catch (err) { setError(formatErrorMessage(err)); }
  };

  const placeOrder = async () => {
    if (!cart.items.length) { setError('Your cart is empty.'); return; }
    if (!selectedAddressId) { setError('Select or add a delivery address.'); return; }
    if (validation && validation.is_valid === false) { setError(String(validation.message || 'Resolve the cart issues before checkout.')); return; }
    setPlacing(true); setError('');
    try {
      const order = await cartService.createOrder(cart, selectedAddressId, paymentMode);
      const orderId = String(order?.id || order?.order_id || '');
      const paymentUrl = order?.payment_intent_url || order?.paymentIntentUrl;
      await clearCart();
      if (paymentMode === 'ONLINE' && paymentUrl) {
        if (!(await Linking.canOpenURL(paymentUrl))) throw new Error('The payment link cannot be opened on this device.');
        await Linking.openURL(paymentUrl);
      }
      if (orderId) navigation.replace('TrackOrder', { id: orderId });
      else navigation.replace('MyOrders');
    } catch (err) { setError(formatErrorMessage(err)); }
    finally { setPlacing(false); }
  };
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <Text style={styles.pageTitle}>Your Cart</Text><Text style={styles.pageSubtitle}>{cart.shopName || 'Add items from a store to start checkout'}</Text>
    {cart.items.map(item => <CartLineItem key={String(item.productId)} item={item} onIncrement={() => void updateQty(item.productId, 1)} onDecrement={() => void updateQty(item.productId, -1)} />)}
    {!cart.items.length ? <InfoCard title="Cart is empty" subtitle="Go to Delivery Marketplace and add products." /> : null}
    <SectionHeader title="Delivery address" />
    {loading ? <ActivityIndicator color={colors.primary} /> : addresses.map(item => <Pressable key={String(item.id)} onPress={() => setSelectedAddressId(item.id || null)} style={[styles.addressCard, selectedAddressId === item.id && styles.addressCardSelected]}><Text style={styles.bold}>{item.recipients_name} · {item.recipients_phone}</Text><Text style={styles.pageSubtitle}>{item.address_line1}{item.address_line2 ? `, ${item.address_line2}` : ''}, {item.city} - {item.pincode}</Text></Pressable>)}
    <AppButton label={showAddressForm ? 'Cancel new address' : 'Add delivery address'} variant="secondary" onPress={() => setShowAddressForm(v => !v)} />
    {showAddressForm ? <View style={styles.billCard}><AddressField label="Recipient name" value={address.recipients_name} onChange={recipients_name => setAddress(p => ({ ...p, recipients_name }))} /><AddressField label="Phone" value={address.recipients_phone} onChange={recipients_phone => setAddress(p => ({ ...p, recipients_phone: recipients_phone.replace(/[^0-9]/g, '') }))} keyboard="phone-pad" /><AddressField label="Address line 1" value={address.address_line1} onChange={address_line1 => setAddress(p => ({ ...p, address_line1 }))} /><AddressField label="Address line 2 (optional)" value={address.address_line2 || ''} onChange={address_line2 => setAddress(p => ({ ...p, address_line2 }))} /><AddressField label="Landmark (optional)" value={address.landmark || ''} onChange={landmark => setAddress(p => ({ ...p, landmark }))} /><AddressField label="City" value={address.city} onChange={city => setAddress(p => ({ ...p, city }))} /><AddressField label="PIN code" value={address.pincode} onChange={pincode => setAddress(p => ({ ...p, pincode: pincode.replace(/[^0-9]/g, '').slice(0, 6) }))} keyboard="number-pad" /><AppButton label="Save address" onPress={saveAddress} /></View> : null}
    <SectionHeader title="Payment method" /><View style={styles.paymentChoices}>{(['ONLINE', 'COD'] as const).map(mode => <Pressable key={mode} onPress={() => setPaymentMode(mode)} style={[styles.paymentChoice, paymentMode === mode && styles.addressCardSelected]}><Text style={styles.bold}>{mode === 'ONLINE' ? 'Pay online' : 'Cash on delivery'}</Text></Pressable>)}</View>
    <View style={styles.billCard}><BillRow label="Subtotal" value={serverSubtotal} /><BillRow label="Delivery" value={delivery} /><BillRow label="Taxes" value={tax} /><View style={styles.billDivider} /><BillRow label="Grand total" value={total} bold /></View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}<AppButton label={placing ? 'Placing order...' : `Place ${paymentMode === 'COD' ? 'COD' : 'online'} order`} onPress={placeOrder} /><AppButton label="Clear cart" variant="secondary" onPress={() => void clearCart()} />
  </ScrollView></BaseScreen>;
}

function AddressField({ label, value, onChange, keyboard = 'default' }: { label: string; value: string; onChange: (value: string) => void; keyboard?: 'default' | 'phone-pad' | 'number-pad' }) {
  return <View><Text style={styles.inputLabel}>{label}</Text><TextInput style={styles.searchInput} value={value} onChangeText={onChange} keyboardType={keyboard} placeholder={label} placeholderTextColor={colors.muted} /></View>;
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

export function ProductDetailsScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'ProductDetails'>) {
  const [product, setProduct] = useState<Product | null>(null);
  const addProduct = useCartStore(state => state.addProduct);
  useEffect(() => {
    void catalogService.getOnlineProducts({ limit: 100 }).then(data => {
      const list: Product[] = Array.isArray(data) ? data : [];
      setProduct(list.find(item => String(item.id) === String(route.params.id)) || null);
    }).catch(() => setProduct(null));
  }, [route.params.id]);
  const title = product?.title || product?.name || `Product #${route.params.id}`;
  const price = Number(product?.price || 0);
  const mrp = Number(product?.mrp || price * 1.2 || 0);
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <Image source={{ uri: product?.image || product?.image_url || fallbackImage }} style={styles.productHero} />
    <Text style={styles.pageTitle}>{title}</Text><Text style={styles.pageSubtitle}>{product?.shop_name || 'Tri Consumer Store'}</Text>
    <View style={styles.priceRow}><Text style={styles.detailPrice}>₹{price.toFixed(0)}</Text>{mrp > price ? <Text style={styles.mrpText}>₹{mrp.toFixed(0)}</Text> : null}<Text style={styles.offerPill}>Best price</Text></View>
    <InfoCard title="Product Highlights" subtitle="Fresh product details, variants, seller information and recommendations are preserved in the native flow. Add to cart continues to use the shared cart store." />
    <InfoCard title="Delivery & Returns" subtitle="Fast local delivery, secure checkout, store payment and order tracking are available after adding this item." />
    <AppButton label="Add to cart" onPress={() => product ? void addProduct(product) : Alert.alert('Product unavailable', 'Product data is still loading.')} />
    <AppButton label="Go to cart" variant="secondary" onPress={() => navigation.navigate('Cart')} />
  </ScrollView></BaseScreen>;
}

export function StorePaymentScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'StorePayment'>) {
  const [amount, setAmount] = useState('');
  const parsed = Number(amount || 0);
  return <BaseScreen title="Store Payment" subtitle={`Pay Store #${route.params.id} using the same amount-entry flow as web.`}>
    <View style={styles.paymentCard}><Text style={styles.inputLabel}>Enter payable amount</Text><TextInput style={styles.amountInput} value={amount} onChangeText={text => setAmount(text.replace(/[^0-9.]/g, ''))} placeholder="0.00" keyboardType="decimal-pad" placeholderTextColor={colors.muted} /><Text style={styles.pageSubtitle}>Confirm the amount with the merchant before initiating payment.</Text></View>
    <AppButton label="Continue to secure checkout" onPress={() => parsed > 0 ? navigation.navigate('SecureCheckout', { id: route.params.id, amount: parsed }) : Alert.alert('Invalid amount', 'Please enter a valid amount.')} />
  </BaseScreen>;
}

export function UpiPaymentScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'UpiPayment'>) {
  const amount = Number(route.params.amount || 0);
  const openUpi = async () => {
    const merchantName = encodeURIComponent(`Trikonekt Store ${route.params.id}`);
    const reference = encodeURIComponent(route.params.refId || `TRI-${Date.now()}`);
    const url = `upi://pay?pa=trikonekt.merchant@upi&pn=${merchantName}&am=${amount.toFixed(2)}&tr=${reference}&cu=INR`;
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    else Alert.alert('No UPI app found', 'Install a UPI app or pay at the merchant counter.');
  };
  return <BaseScreen title="UPI Payment" subtitle="Complete the merchant payment and wait for confirmation.">
    <View style={styles.qrCard}><Text style={styles.qrGlyph}>▦</Text><Text style={styles.checkoutAmountText}>₹{amount.toFixed(2)}</Text><Text style={styles.pageSubtitle}>Shop #{route.params.id}</Text><Text style={styles.refText}>Reference: {route.params.refId || 'Pending reference'}</Text></View>
    <InfoCard title="Payment instructions" subtitle="Scan the merchant QR or pay at counter. Once merchant approves, your transaction appears in My Orders." />
    <AppButton label="Open UPI app" onPress={openUpi} />
    <AppButton label="I have paid" onPress={() => navigation.navigate('MyOrders')} />
    <AppButton label="Track related order" variant="secondary" onPress={() => navigation.navigate('TrackOrder', { id: String(route.params.onlineOrderId || route.params.refId || route.params.id) })} />
  </BaseScreen>;
}

export function OrderDetailsScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'OrderDetails'>) {
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { setLoading(true); void orderService.getOrderDetails(route.params.id).then(data => setOrder(data?.data || data || null)).catch(() => setOrder(null)).finally(() => setLoading(false)); }, [route.params.id]);
  const status = String(order?.status || 'Pending');
  return <BaseScreen title="Order Details" subtitle={`Order #${route.params.id}`}>
    <View style={styles.orderDetailCard}><Text style={styles.statusLarge}>{status}</Text><Text style={styles.pageSubtitle}>{loading ? 'Loading order information...' : 'Order summary, payment state and item details.'}</Text>{Object.entries(order || {}).slice(0, 6).map(([key, value]) => <View key={key} style={styles.detailRow}><Text style={styles.detailKey}>{key.replace(/_/g, ' ')}</Text><Text style={styles.detailValue}>{String(value ?? '-')}</Text></View>)}</View>
    {!order ? <InfoCard title="Order data unavailable" subtitle="The native details layout is ready. Live data will populate when the API returns this order." /> : null}
    <AppButton label="Track order" onPress={() => navigation.navigate('TrackOrder', { id: route.params.id })} />
    <AppButton label="Cancel order" variant="secondary" onPress={() => Alert.alert('Cancel order?', 'This action cannot be undone after the merchant processes it.', [{ text: 'Keep order', style: 'cancel' }, { text: 'Cancel order', style: 'destructive', onPress: async () => { try { const next = await orderService.cancelOrder(route.params.id); setOrder(next?.data || next || order); Alert.alert('Cancelled', 'Order cancellation request submitted.'); } catch (err) { Alert.alert('Cancel failed', formatErrorMessage(err)); } } }])} />
  </BaseScreen>;
}

export function TrackOrderScreen({ route }: NativeStackScreenProps<RootStackParamList, 'TrackOrder'>) {
  const steps = ['Order placed', 'Payment verified', 'Merchant accepted', 'Packed for delivery', 'Out for delivery', 'Delivered'];
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const load = async () => { try { const data = await orderService.getOrderDetails(route.params.id); if (active) { setOrder(data || null); setError(''); } } catch (err) { if (active) setError(formatErrorMessage(err)); } finally { if (active) setLoading(false); } };
    void load();
    const timer = setInterval(() => void load(), 15000);
    return () => { active = false; clearInterval(timer); };
  }, [route.params.id]);
  const status = String(order?.status || order?.order_status || 'PENDING').toUpperCase();
  const statusIndex: Record<string, number> = { PENDING: 0, PLACED: 0, PAYMENT_PENDING: 0, PAID: 1, PAYMENT_VERIFIED: 1, ACCEPTED: 2, CONFIRMED: 2, PACKED: 3, READY: 3, OUT_FOR_DELIVERY: 4, DELIVERED: 5 };
  const completedIndex = statusIndex[status] ?? 0;
  return <BaseScreen title="Track Order" subtitle={`Live tracking timeline for #${route.params.id}`}>
    {loading ? <ActivityIndicator color={colors.primary} /> : null}{error ? <Text style={styles.errorText}>{error}</Text> : null}
    <InfoCard title={`Current status: ${status.replace(/_/g, ' ')}`} subtitle="Order status refreshes automatically every 15 seconds." />
    <View style={styles.timelineCard}>{steps.map((step, index) => <View key={step} style={styles.timelineRow}><View style={[styles.timelineDot, index <= completedIndex && styles.timelineDotActive]} /><View style={{ flex: 1 }}><Text style={styles.timelineTitle}>{step}</Text><Text style={styles.pageSubtitle}>{index <= completedIndex ? 'Completed' : 'Pending update'}</Text></View></View>)}</View>
  </BaseScreen>;
}

const styles = StyleSheet.create({
  container: { paddingVertical: 18, paddingBottom: 34 }, pageTitle: { color: colors.text, fontSize: 28, fontWeight: '900', marginBottom: 6 }, pageSubtitle: { color: colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  searchInput: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 12, color: colors.text }, chipRow: { paddingBottom: 14, gap: 8 }, chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface }, chipActive: { backgroundColor: colors.primary, borderColor: colors.primary }, chipText: { color: colors.textSecondary, fontWeight: '800' }, chipTextActive: { color: '#fff' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, billCard: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 16, marginTop: 8, marginBottom: 10 }, billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 }, billLabel: { color: colors.textSecondary, fontWeight: '700' }, billValue: { color: colors.text, fontWeight: '800' }, billDivider: { height: 1, backgroundColor: colors.border, marginVertical: 8 }, bold: { fontWeight: '900', color: colors.text, fontSize: 17 },
  checkoutAmount: { backgroundColor: colors.surfaceSoft, borderRadius: 24, padding: 20, alignItems: 'center', marginBottom: 16 }, checkoutAmountText: { color: colors.primary, fontSize: 36, fontWeight: '900' }, shopHero: { width: '100%', height: 190, borderRadius: 28, marginBottom: 16, backgroundColor: colors.border }, productHero: { width: '100%', height: 260, borderRadius: 28, marginBottom: 18, backgroundColor: colors.border },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }, detailPrice: { color: colors.primary, fontSize: 28, fontWeight: '900' }, mrpText: { color: colors.muted, fontSize: 16, fontWeight: '800', textDecorationLine: 'line-through' }, offerPill: { color: colors.success, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, overflow: 'hidden', fontWeight: '900' },
  paymentCard: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14 }, inputLabel: { color: colors.text, fontSize: 13, fontWeight: '900', marginBottom: 8 }, amountInput: { height: 58, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: '#f8fafc', paddingHorizontal: 16, color: colors.text, fontSize: 24, fontWeight: '900', marginBottom: 12 },
  qrCard: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: 22, alignItems: 'center', marginBottom: 16 }, qrGlyph: { color: colors.primary, fontSize: 92, fontWeight: '900', lineHeight: 100 }, refText: { color: colors.textSecondary, fontWeight: '800', textAlign: 'center' },
  orderDetailCard: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14 }, statusLarge: { color: colors.primary, fontSize: 24, fontWeight: '900', marginBottom: 8 }, detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 10 }, detailKey: { color: colors.textSecondary, fontWeight: '800', textTransform: 'capitalize' }, detailValue: { color: colors.text, fontWeight: '900', flex: 1, textAlign: 'right' },
  timelineCard: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14 }, timelineRow: { flexDirection: 'row', gap: 12, marginBottom: 14 }, timelineDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.border, marginTop: 2 }, timelineDotActive: { backgroundColor: colors.primary }, timelineTitle: { color: colors.text, fontWeight: '900', fontSize: 15 },
  addressCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginBottom: 10 }, addressCardSelected: { borderColor: colors.primary, backgroundColor: '#fff7ed' }, paymentChoices: { flexDirection: 'row', gap: 10, marginBottom: 12 }, paymentChoice: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, alignItems: 'center', backgroundColor: colors.surface }, errorText: { color: colors.danger, fontWeight: '700', marginVertical: 10 },
});
