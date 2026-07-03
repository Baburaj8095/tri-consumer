import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Dimensions, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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
import { ConsumerHeader } from '../components/ConsumerHeader';

const fallbackImage = require('../../assets/fallback_img.png');
const fallbackNativeProducts: Product[] = fallbackProducts.map(p => ({ id: p.id, name: p.name, price: Number(p.newPrice.replace(/[^0-9]/g, '')), image: p.image, shop_name: 'Tri Deals' }));

const sidebarCategories = [
  { name: 'All', image: 'https://images.unsplash.com/photo-1610832958506-ee5633619144?auto=format&fit=crop&w=80&q=80' },
  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=80&q=80' },
  { name: 'Fashion', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=80&q=80' },
  { name: 'Grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80' },
  { name: 'Home', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=80&q=80' },
  { name: 'Beauty', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=80&q=80' },
];

export function DeliveryScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Delivery'>) {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const addProduct = useCartStore(state => state.addProduct);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await catalogService.getOnlineProducts({
        ...(activeCat !== 'All' ? { category: activeCat } : {}),
        ...(query.trim() ? { search: query.trim() } : {})
      });
      setProducts(data && data.length ? data : fallbackNativeProducts);
    } catch (err) {
      setProducts(fallbackNativeProducts);
      console.log('Failed fetching online products, showing fallback mock data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [activeCat, query]);

  const filtered = useMemo(() => products.filter(item => {
    const title = String(item.title || item.name || '').toLowerCase();
    const q = query.trim().toLowerCase();
    return (activeCat === 'All' || title.includes(activeCat.toLowerCase())) && (!q || title.includes(q));
  }), [products, query, activeCat]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <ConsumerHeader navigation={navigation} mode="compact" onSearch={setQuery} showBack={true} />
      
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Row 1: Category circles */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {sidebarCategories.map((c) => {
            const isSelected = activeCat.toLowerCase() === c.name.toLowerCase();
            return (
              <Pressable key={c.name} style={styles.catItem} onPress={() => { setActiveCat(c.name); setQuery(''); }}>
                <View style={[styles.catCircle, isSelected && styles.catCircleActive]}>
                  <Image source={{ uri: c.image }} style={styles.catImage} />
                </View>
                <Text style={[styles.catText, isSelected && styles.catTextActive]}>{c.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Row 2: Filter row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Pressable style={styles.filterBtn}>
            <Ionicons name="options-outline" size={14} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.filterBtnText}>Filters</Text>
          </Pressable>
          {['Sort', 'Category', 'Price', 'Brand'].map(f => (
            <Pressable key={f} style={styles.filterBtn}>
              <Text style={styles.filterBtnText}>{f}</Text>
              <Ionicons name="chevron-down" size={14} color="#475569" style={{ marginLeft: 4 }} />
            </Pressable>
          ))}
        </ScrollView>

        {/* Row 3: Fruits Promo Banner */}
        <View style={styles.fruitsPromo}>
          <View style={{ flex: 1.2, zIndex: 1 }}>
            <Text style={styles.fruitsPromoTitle}>Fresh seasonal fruits</Text>
            <Text style={styles.fruitsPromoSubtitle}>Nutritional goodness in every bite</Text>
            <Pressable style={styles.shopNowBtn} onPress={() => Alert.alert('Promo', 'Fresh seasonal fruits sale!')}>
              <Text style={styles.shopNowBtnText}>Shop Now</Text>
            </Pressable>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1610832958506-ee5633619144?auto=format&fit=crop&w=280&q=80' }}
            style={styles.fruitsPromoImage}
          />
        </View>

        {/* Row 4: Grid of product cards */}
        {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />}
        
        <View style={styles.productGrid}>
          {filtered.map(item => (
            <ProductCard 
              key={String(item.id)} 
              product={item} 
              onPress={() => navigation.navigate('ProductDetails', { id: String(item.id) })} 
              onAdd={() => {
                void addProduct(item, { orderChannel: 'ONLINE_DELIVERY' });
                Alert.alert('Success', `${item.title || item.name || 'Product'} added to cart!`);
              }} 
            />
          ))}
        </View>
        
        {!loading && !filtered.length ? (
          <InfoCard title="No products found" subtitle="Try selecting another category or searching again." />
        ) : null}

      </ScrollView>
    </View>
  );
}

export function NearbyStoresScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'NearbyStores'>) {
  const location = useLocationStore(state => state.location);
  const [shops, setShops] = useState<Shop[]>([]);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Array<{ id?: string | number; name?: string; category_name?: string }>>([]);
  const [sponsored, setSponsored] = useState<Shop[]>([]);
  const [activeCategory, setActiveCategory] = useState('All Stores');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStores = async () => {
    setLoading(true);
    setError('');
    try {
      const [liveShops, liveCategories, liveSponsored] = await Promise.all([
        catalogService.getB2CMerchants(location.lat, location.lng).catch(() => []),
        catalogService.getMerchantCategories().catch(() => []),
        catalogService.getSponsoredShops().catch(() => [])
      ]);
      
      const uniqueShops = (Array.isArray(liveShops) ? liveShops : []).filter((s, idx, self) => 
        self.findIndex(t => String(t.id) === String(s.id)) === idx
      );

      setShops(uniqueShops);
      
      const combinedCategories = Array.isArray(liveCategories) ? liveCategories : [];
      const uniqueCategories = combinedCategories.filter((c, idx, self) => 
        self.findIndex(t => (t.name || t.category_name) === (c.name || c.category_name)) === idx
      );
      setCategories(uniqueCategories);
      setSponsored(liveSponsored);
    } catch (err) {
      setShops([]);
      setCategories([]);
      setSponsored([]);
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStores();
  }, [location.lat, location.lng]);

  const filtered = shops.filter(shop => {
    const text = `${shop.shop_name || ''} ${shop.business_name || ''} ${shop.city || ''} ${shop.category_name || shop.category || ''}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (activeCategory === 'All Stores' || text.includes(activeCategory.toLowerCase()));
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <ConsumerHeader navigation={navigation} mode="compact" onSearch={setQuery} showBack={true} />
      
      <ScrollView contentContainerStyle={[styles.container, { paddingHorizontal: 16 }]} showsVerticalScrollIndicator={false}>
        
        {/* Row 1: Categories scroll chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {['All Stores', ...categories.map(item => item.name || item.category_name || '').filter(Boolean)].map(cat => (
            <Pressable key={cat} onPress={() => setActiveCategory(cat)} style={[styles.chip, activeCategory === cat && styles.chipActive]}>
              <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Row 2: Sponsored stores */}
        {sponsored.length ? (
          <View style={{ marginBottom: 16 }}>
            <SectionHeader title="Sponsored stores" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {sponsored.map(store => (
                <View key={`s-${store.id}`} style={{ width: 260, marginRight: 12 }}>
                  <StoreCard store={store} onPress={() => navigation.navigate('ShopDetails', { id: String(store.shop_id || store.id), mode: 'nearby-delivery' })} />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Loading and store cards list */}
        {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />}
        
        {error ? (
          <View style={{ marginVertical: 20 }}>
            <InfoCard title="Nearby stores unavailable" subtitle={error} />
            <AppButton label="Retry" onPress={loadStores} />
          </View>
        ) : null}

        {filtered.map(store => (
          <StoreCard 
            key={String(store.id)} 
            store={store} 
            onPress={() => navigation.navigate('ShopDetails', { id: String(store.shop_id || store.id), mode: 'nearby-delivery' })} 
          />
        ))}

        {!loading && !error && !filtered.length ? (
          <InfoCard title="No live stores found" subtitle="Try another search, category, or delivery location." />
        ) : null}

      </ScrollView>
    </View>
  );
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
  const [tab, setTab] = useState(0); // 0 = Offline Payment, 1 = Online Orders
  const [records, setRecords] = useState<Array<{ id: string | number; recordType: string; status?: string; createdAt?: string; created_at?: string }>>([]);

  useEffect(() => {
    void Promise.all([orderService.getOfflinePayments(), orderService.getOrders()])
      .then(([payments, orders]) => {
        setRecords([
          ...(payments || []).map((p: { id: string | number; status?: string }) => ({ ...p, recordType: 'OFFLINE_PAYMENT' })),
          ...(orders || []).map((o: { id: string | number; status?: string }) => ({ ...o, recordType: 'ONLINE_ORDER' }))
        ]);
      })
      .catch(() => setRecords([]));
  }, []);

  const filtered = records.filter(r => r.recordType === (tab === 0 ? 'OFFLINE_PAYMENT' : 'ONLINE_ORDER'));

  return (
    <BaseScreen>
      <View style={styles.tabs}>
        {['Offline Payment', 'Online Orders'].map((t, i) => (
          <Pressable key={t} onPress={() => setTab(i)} style={[styles.tab, tab === i && styles.tabActive]}>
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {filtered.map(item => (
          <OrderCard 
            key={`${item.recordType}-${item.id}`} 
            title={item.recordType === 'OFFLINE_PAYMENT' ? `Offline Pay #${item.id}` : `Order #${item.id}`} 
            subtitle={item.createdAt || item.created_at || 'Recent activity'} 
            status={item.status} 
            onPress={() => {
              if (item.recordType === 'ONLINE_ORDER') {
                navigation.navigate('OrderDetails', { id: String(item.id) });
              }
            }} 
          />
        ))}
        {!filtered.length ? (
          <InfoCard 
            title="No records yet" 
            subtitle={tab === 0 ? "Your offline store payments will appear here." : "Your online order history will appear here."} 
          />
        ) : null}
      </ScrollView>
    </BaseScreen>
  );
}

export function SecureCheckoutScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'SecureCheckout'>) {
  const { id, amount = 0, onlineOrderId } = route.params;
  const pay = async () => { try { const data = await paymentService.initiateOfflinePayment(id, amount, 'MANUAL', onlineOrderId); navigation.navigate('UpiPayment', { id, amount, refId: data.refId || data.ref_id, onlineOrderId }); } catch (err) { Alert.alert('Payment failed', formatErrorMessage(err)); } };
  return <BaseScreen><View style={styles.checkoutAmount}><Text style={styles.checkoutAmountText}>₹{amount.toFixed(2)}</Text><Text style={styles.pageSubtitle}>Shop #{id}</Text></View><InfoCard title="Manual payment" subtitle="Pay cash at counter or scan merchant UPI QR. Merchant approval flow remains integrated." /><InfoCard title="Razorpay / Online" subtitle="TODO: integrate native payment SDK or Linking/WebView flow for production." /><AppButton label="Initiate manual payment" onPress={pay} /></BaseScreen>;
}

const fallbackShops: Record<string, any> = {
  '1': {
    name: 'Poornima Store',
    category: 'Daily Needs & Grocery',
    rating: '4.5',
    reviews: '1.2K',
    mobile: '8095918105',
    home_delivery: true,
    delivery_charge: 30,
    delivery_time: '25 mins',
    lat: 12.971598,
    lng: 77.594562,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    address: 'No 15, Near Metro Station, Indiranagar, Bangalore'
  },
  '2': {
    name: 'Kanta Medical',
    category: 'Pharmacy & Health',
    rating: '4.8',
    reviews: '840',
    mobile: '9845012345',
    home_delivery: true,
    delivery_charge: 20,
    delivery_time: '15 mins',
    lat: 12.9789,
    lng: 77.6432,
    image: 'https://images.unsplash.com/photo-1607619056574-7b8d304a2723?auto=format&fit=crop&w=600&q=80',
    address: 'Shop 4, Outer Ring Road, Hebbal, Bangalore'
  },
  '39': {
    name: 'Tri Consumer Store',
    category: 'Supermarket & Essentials',
    rating: '4.2',
    reviews: '310',
    mobile: '9900112233',
    home_delivery: false,
    delivery_charge: 0,
    delivery_time: 'Store Pickup Only',
    lat: 12.9352,
    lng: 77.6244,
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
    address: 'Trizone Mall, Koramangala 5th Block, Bangalore'
  }
};

const fallbackProductsByShop: Record<string, Product[]> = {
  '1': [
    { id: 1001, title: 'Fresh Apples (Premium)', price: 120, mrp: 150, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&q=80', shop_name: 'Poornima Store' },
    { id: 1002, title: 'Organic Tomatoes', price: 40, mrp: 60, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80', shop_name: 'Poornima Store' },
    { id: 1003, title: 'Amul Fresh Milk (1L)', price: 66, mrp: 68, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80', shop_name: 'Poornima Store' },
    { id: 1004, title: 'Aashirvaad Atta (5kg)', price: 260, mrp: 290, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80', shop_name: 'Poornima Store' }
  ],
  '2': [
    { id: 1005, title: 'Paracetamol 650mg (15 Tab)', price: 30, mrp: 35, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80', shop_name: 'Kanta Medical' },
    { id: 1006, title: 'Vitamin C Chewable (30 Tab)', price: 90, mrp: 120, image: 'https://images.unsplash.com/photo-1616679911721-eff6eec18fcd?auto=format&fit=crop&w=300&q=80', shop_name: 'Kanta Medical' },
    { id: 1007, title: 'Premium N95 Face Mask', price: 45, mrp: 99, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80', shop_name: 'Kanta Medical' }
  ],
  '39': [
    { id: 1008, title: 'Parle G Biscuits', price: 9, mrp: 10, image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=300&q=80', shop_name: 'Tri Consumer Store' }
  ]
};

export function ShopDetailsScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'ShopDetails'>) {
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const { cart, addProduct } = useCartStore();

  const shopId = String(route.params.id);
  const isNearby = route.params.mode === 'nearby-delivery';
  
  const location = useLocationStore(state => state.location);
  const lat = location?.lat || route.params.lat;
  const lng = location?.lng || route.params.lng;
  
  const shopDetails = useMemo(() => {
    const fallback = fallbackShops[shopId] || fallbackShops['1'];
    if (!shop) return fallback;
    return {
      ...fallback,
      name: shop.shop_name || shop.name || fallback.name,
      category: shop.category_name || shop.category || fallback.category,
      address: shop.address || fallback.address,
      mobile: shop.contact_number || shop.phone || shop.mobile || fallback.mobile,
      home_delivery: shop.home_delivery_enabled !== undefined ? shop.home_delivery_enabled : (shop.home_delivery !== undefined ? shop.home_delivery : fallback.home_delivery),
      delivery_charge: shop.base_delivery_fee !== undefined ? shop.base_delivery_fee : (shop.delivery_charge !== undefined ? shop.delivery_charge : fallback.delivery_charge),
      delivery_time: shop.delivery_time || fallback.delivery_time || '30 mins',
      lat: shop.latitude || shop.lat || fallback.lat,
      lng: shop.longitude || shop.lng || fallback.lng,
      image: shop.shop_image || shop.image || fallback.image,
      rating: shop.rating || fallback.rating || '4.2',
      reviews: shop.reviews || fallback.reviews || '120',
      home_delivery_enabled: shop.home_delivery_enabled,
      is_delivery_available: shop.is_delivery_available,
      delivery_radius_km: shop.delivery_radius_km
    };
  }, [shopId, shop]);

  useEffect(() => {
    navigation.setOptions({
      title: shopDetails.name || 'Shop Details',
    });
  }, [shopDetails.name, navigation]);

  useEffect(() => {
    if (isNearby) {
      void catalogService.getNearbyShopDetails(route.params.id, lat, lng)
        .then(data => setShop(data))
        .catch(() => setShop(null));

      void catalogService.getNearbyShopDeliveryProducts(route.params.id, lat, lng)
        .then(data => setProducts(Array.isArray(data) ? data : []))
        .catch(() => setProducts([]));
    } else {
      void catalogService.getShopDetails(route.params.id)
        .then(data => setShop(data))
        .catch(() => setShop(null));

      void catalogService.getShopProducts(route.params.id)
        .then(data => setProducts(Array.isArray(data) ? data : []))
        .catch(() => setProducts([]));
    }
  }, [route.params.id, isNearby, lat, lng]);

  const shopCartItems = useMemo(() => {
    if (String(cart.shopId) === shopId) {
      return cart.items;
    }
    return [];
  }, [cart, shopId]);

  const totalCartPrice = useMemo(() => {
    return shopCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [shopCartItems]);

  const totalCartCount = useMemo(() => {
    return shopCartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [shopCartItems]);

  const homeDeliveryEnabled = shopDetails.home_delivery_enabled !== undefined 
    ? shopDetails.home_delivery_enabled 
    : shopDetails.home_delivery;

  const isDeliveryAvailable = shopDetails.is_delivery_available !== undefined 
    ? shopDetails.is_delivery_available 
    : true;

  const emptyStateInfo = useMemo(() => {
    if (!homeDeliveryEnabled) {
      return {
        title: "Home Delivery Disabled",
        subtitle: "This store does not offer home delivery. You can still visit in person or place an offline order."
      };
    }
    if (isNearby && isDeliveryAvailable === false) {
      return {
        title: "Delivery Out of Range",
        subtitle: `You are outside this store's delivery range (max: ${shopDetails.delivery_radius_km || 5} km). You can still order for counter pickup or visit the store.`
      };
    }
    return {
      title: "No products available online",
      subtitle: "This store doesn't have active delivery items cataloged yet."
    };
  }, [homeDeliveryEnabled, isNearby, isDeliveryAvailable, shopDetails.delivery_radius_km]);

  const handleCall = () => {
    const phone = shopDetails.mobile || '8095918105';
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Unable to place call.');
    });
  };

  const handleDirection = () => {
    const lat = shopDetails.lat || 12.971598;
    const lng = shopDetails.lng || 77.594562;
    const label = encodeURIComponent(shopDetails.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    });
  };

  const handlePay = () => {
    navigation.navigate('StorePayment', { id: shopId });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: totalCartCount > 0 ? 120 : 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Shop Image Hero */}
        <View style={styles.shopHeroContainer}>
          <Image source={shopDetails.image ? { uri: shopDetails.image } : fallbackImage} style={styles.shopHeroImage} />
          <View style={styles.shopRatingOverlay}>
            <Ionicons name="star" size={14} color="#fbbf24" style={{ marginRight: 4 }} />
            <Text style={styles.shopRatingText}>{shopDetails.rating}</Text>
            <Text style={styles.shopReviewsText}> ({shopDetails.reviews})</Text>
          </View>
        </View>

        {/* Shop Info details Card */}
        <View style={styles.shopInfoCard}>
          <Text style={styles.shopDetailName}>{shopDetails.name}</Text>
          <Text style={styles.shopDetailCategory}>{shopDetails.category}</Text>
          <Text style={styles.shopDetailAddress}>{shopDetails.address}</Text>

          {/* Delivery Availability Status Row */}
          <View style={styles.deliveryStatusRow}>
            {shopDetails.home_delivery ? (
              <View style={[styles.deliveryBadge, styles.deliveryBadgeAvailable]}>
                <Ionicons name="checkmark-circle" size={16} color="#16a34a" style={{ marginRight: 6 }} />
                <View>
                  <Text style={styles.deliveryBadgeTitle}>Home Delivery Available</Text>
                  <Text style={styles.deliveryBadgeSubtitle}>Charges: ₹{shopDetails.delivery_charge} • ETA: {shopDetails.delivery_time}</Text>
                </View>
              </View>
            ) : (
              <View style={[styles.deliveryBadge, styles.deliveryBadgeUnavailable]}>
                <Ionicons name="alert-circle" size={16} color="#ea580c" style={{ marginRight: 6 }} />
                <View>
                  <Text style={[styles.deliveryBadgeTitle, { color: '#c2410c' }]}>Store Pickup Only</Text>
                  <Text style={[styles.deliveryBadgeSubtitle, { color: '#ea580c' }]}>Home delivery is not active for this merchant.</Text>
                </View>
              </View>
            )}
          </View>

          {/* Contact Action Buttons row */}
          <View style={styles.contactActionsRow}>
            <Pressable style={styles.contactActionButton} onPress={handleCall}>
              <Ionicons name="call" size={18} color={colors.primary} style={{ marginBottom: 4 }} />
              <Text style={styles.contactActionText}>Call</Text>
            </Pressable>

            <Pressable style={styles.contactActionButton} onPress={handleDirection}>
              <Ionicons name="navigate" size={18} color={colors.primary} style={{ marginBottom: 4 }} />
              <Text style={styles.contactActionText}>Direction</Text>
            </Pressable>

            <Pressable style={[styles.contactActionButton, styles.payMerchantButton]} onPress={handlePay}>
              <Ionicons name="card" size={18} color="#fff" style={{ marginBottom: 4 }} />
              <Text style={[styles.contactActionText, { color: '#fff' }]}>Pay Merchant</Text>
            </Pressable>
          </View>
        </View>

        {/* Catalog Section */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <Text style={styles.catalogHeadingTitle}>Online Catalog</Text>
          {products.length > 0 ? (
            <View style={styles.productGrid}>
              {products.map(item => (
                <ProductCard 
                  key={String(item.id)} 
                  product={item} 
                  onPress={() => navigation.navigate('ProductDetails', { id: String(item.id) })} 
                  onAdd={() => {
                    void addProduct(item, { 
                      shopId: Number(shopId), 
                      shopName: shopDetails.name,
                      orderChannel: isNearby ? 'NEARBY_DELIVERY' : 'ONLINE_DELIVERY'
                    });
                    Alert.alert('Success', `${item.title || item.name || 'Product'} added to cart!`);
                  }} 
                />
              ))}
            </View>
          ) : (
            <InfoCard 
              title={emptyStateInfo.title} 
              subtitle={emptyStateInfo.subtitle} 
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Checkout Bar */}
      {totalCartCount > 0 && (
        <Pressable style={styles.floatingCheckoutBar} onPress={() => navigation.navigate('Cart')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.checkoutCartBadge}>
              <Text style={styles.checkoutCartBadgeText}>{totalCartCount}</Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.checkoutCartLabel}>Items from {shopDetails.name}</Text>
              <Text style={styles.checkoutCartPrice}>Total: ₹{totalCartPrice.toFixed(2)}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.checkoutBarActionText}>View Cart</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </View>
        </Pressable>
      )}
    </View>
  );
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
    <AppButton 
      label="Add to cart" 
      onPress={() => {
        if (product) {
          void addProduct(product);
          Alert.alert('Success', `${title} added to cart!`);
        } else {
          Alert.alert('Product unavailable', 'Product data is still loading.');
        }
      }} 
    />
    <AppButton label="Go to cart" variant="secondary" onPress={() => navigation.navigate('Cart')} />
  </ScrollView></BaseScreen>;
}

export function StorePaymentScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'StorePayment'>) {
  const [amount, setAmount] = useState('');
  const parsed = Number(amount || 0);
  return <BaseScreen>
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
  return <BaseScreen>
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
  return <BaseScreen>
    <View style={styles.orderDetailCard}><Text style={styles.statusLarge}>{status}</Text><Text style={styles.pageSubtitle}>{loading ? 'Loading order information...' : 'Order summary, payment state and item details.'}</Text>{Object.entries(order || {}).slice(0, 6).map(([key, value]) => <View key={key} style={styles.detailRow}><Text style={styles.detailKey}>{key.replace(/_/g, ' ')}</Text><Text style={styles.detailValue}>{String(value ?? '-')}</Text></View>)}</View>
    {!order ? <InfoCard title="Order data unavailable" subtitle="The native details layout is ready. Live data will populate when the API returns this order." /> : null}
    <AppButton label="Track order" onPress={() => navigation.navigate('TrackOrder', { id: route.params.id })} />
    <AppButton label="Cancel order" variant="secondary" onPress={() => Alert.alert('Cancel order?', 'This action cannot be undone after the merchant processes it.', [{ text: 'Keep order', style: 'cancel' }, { text: 'Cancel order', style: 'destructive', onPress: async () => { try { const next = await orderService.cancelOrder(route.params.id); setOrder(next?.data || next || order); Alert.alert('Cancelled', 'Order cancellation request submitted.'); } catch (err) { Alert.alert('Cancel failed', formatErrorMessage(err)); } } }])} />
  </BaseScreen>;
}

export function TrackOrderScreen({ route }: NativeStackScreenProps<RootStackParamList, 'TrackOrder'>) {
  const steps = ['Order placed', 'Payment verified', 'Merchant accepted', 'Packed for delivery', 'Out for delivery', 'Delivered'];
  const [order, setOrder] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await orderService.getOrderDetails(route.params.id);
        if (active) {
          setOrder(data || null);
          setError('');
        }
      } catch (err) {
        if (active) setError(formatErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const timer = setInterval(() => void load(), 15000);
    return () => { active = false; clearInterval(timer); };
  }, [route.params.id]);

  const status = String(order?.status || order?.order_status || 'PENDING').toUpperCase();
  const statusIndex: Record<string, number> = { 
    PENDING: 0, PLACED: 0, PAYMENT_PENDING: 0, 
    PAID: 1, PAYMENT_VERIFIED: 1, 
    ACCEPTED: 2, CONFIRMED: 2, 
    PACKED: 3, READY: 3, 
    OUT_FOR_DELIVERY: 4, DELIVERED: 5 
  };
  const completedIndex = statusIndex[status] ?? 0;

  const awbNumber = order?.awb_number;
  const courierName = order?.courier_name;
  const trackingUrl = order?.tracking_url;

  return (
    <BaseScreen>
      {loading && !order ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <InfoCard 
        title={`Current status: ${status.replace(/_/g, ' ')}`} 
        subtitle="Order status refreshes automatically every 15 seconds." 
      />

      <View style={styles.timelineCard}>
        {steps.map((step, index) => (
          <View key={step} style={styles.timelineRow}>
            <View style={[styles.timelineDot, index <= completedIndex && styles.timelineDotActive]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.timelineTitle}>{step}</Text>
              <Text style={styles.pageSubtitle}>{index <= completedIndex ? 'Completed' : 'Pending update'}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Address Info */}
      {order?.address ? (
        <View style={styles.orderDetailCard}>
          <Text style={styles.bold}>Delivery Address</Text>
          <Text style={[styles.pageSubtitle, { marginTop: 6, lineHeight: 18 }]}>
            {String(order.address)}
          </Text>
        </View>
      ) : null}

      {/* Shiprocket Courier Info */}
      {awbNumber ? (
        <View style={styles.orderDetailCard}>
          <Text style={styles.bold}>Courier Details</Text>
          <Text style={[styles.pageSubtitle, { marginTop: 4 }]}>
            Partner: {String(courierName || 'Shiprocket Fleet')}
          </Text>
          <Text style={[styles.pageSubtitle, { marginTop: 2 }]}>
            AWB: {String(awbNumber)}
          </Text>
          {trackingUrl ? (
            <AppButton 
              label="Track Shipment" 
              onPress={() => {
                Linking.openURL(String(trackingUrl)).catch(err => {
                  Alert.alert('Error', 'Could not open tracking link');
                  console.error(err);
                });
              }} 
            />
          ) : null}
        </View>
      ) : null}
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 18, paddingBottom: 34 }, pageTitle: { color: colors.text, fontSize: 28, fontWeight: '900', marginBottom: 6 }, pageSubtitle: { color: colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  searchInput: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 12, color: colors.text }, chipRow: { paddingBottom: 14, gap: 8 }, chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface }, chipActive: { backgroundColor: colors.primary, borderColor: colors.primary }, chipText: { color: colors.textSecondary, fontWeight: '800' }, chipTextActive: { color: '#fff' },
  categoriesRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  catItem: { alignItems: 'center' },
  catCircle: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#f8f9fb', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  catCircleActive: { backgroundColor: '#ffefd5', borderColor: '#ff7a00', borderWidth: 2 },
  catImage: { width: 44, height: 44, borderRadius: 22, resizeMode: 'contain' },
  catText: { fontSize: 11, fontWeight: '600', color: '#475569', marginTop: 6 },
  catTextActive: { fontWeight: '800', color: '#ff7a00' },
  filterRow: { paddingHorizontal: 16, paddingBottom: 14, gap: 8 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff' },
  filterBtnText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  fruitsPromo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7ed', borderRadius: 24, borderWidth: 1.5, borderColor: '#fed7aa', padding: 20, marginHorizontal: 16, marginBottom: 20, height: 140, justifyContent: 'space-between', overflow: 'hidden' },
  fruitsPromoTitle: { fontSize: 18, fontWeight: '900', color: '#9a3412', lineHeight: 22 },
  fruitsPromoSubtitle: { fontSize: 12, color: '#c2410c', marginTop: 4, marginBottom: 14, fontWeight: '600' },
  shopNowBtn: { backgroundColor: '#ff7a00', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start' },
  shopNowBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  fruitsPromoImage: { width: 100, height: 100, borderRadius: 12, resizeMode: 'contain' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, paddingBottom: 24, justifyContent: 'space-between' }, billCard: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 16, marginTop: 8, marginBottom: 10 }, billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 }, billLabel: { color: colors.textSecondary, fontWeight: '700' }, billValue: { color: colors.text, fontWeight: '800' }, billDivider: { height: 1, backgroundColor: colors.border, marginVertical: 8 }, bold: { fontWeight: '900', color: colors.text, fontSize: 17 },
  checkoutAmount: { backgroundColor: colors.surfaceSoft, borderRadius: 24, padding: 20, alignItems: 'center', marginBottom: 16 }, checkoutAmountText: { color: colors.primary, fontSize: 36, fontWeight: '900' }, shopHero: { width: '100%', height: 190, borderRadius: 28, marginBottom: 16, backgroundColor: colors.border }, productHero: { width: '100%', height: 260, borderRadius: 28, marginBottom: 18, backgroundColor: colors.border },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }, detailPrice: { color: colors.primary, fontSize: 28, fontWeight: '900' }, mrpText: { color: colors.muted, fontSize: 16, fontWeight: '800', textDecorationLine: 'line-through' }, offerPill: { color: colors.success, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, overflow: 'hidden', fontWeight: '900' },
  paymentCard: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14 }, inputLabel: { color: colors.text, fontSize: 13, fontWeight: '900', marginBottom: 8 }, amountInput: { height: 58, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: '#f8fafc', paddingHorizontal: 16, color: colors.text, fontSize: 24, fontWeight: '900', marginBottom: 12 },
  qrCard: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: 22, alignItems: 'center', marginBottom: 16 }, qrGlyph: { color: colors.primary, fontSize: 92, fontWeight: '900', lineHeight: 100 }, refText: { color: colors.textSecondary, fontWeight: '800', textAlign: 'center' },
  orderDetailCard: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14 }, statusLarge: { color: colors.primary, fontSize: 24, fontWeight: '900', marginBottom: 8 }, detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 10 }, detailKey: { color: colors.textSecondary, fontWeight: '800', textTransform: 'capitalize' }, detailValue: { color: colors.text, fontWeight: '900', flex: 1, textAlign: 'right' },
  timelineCard: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14 }, timelineRow: { flexDirection: 'row', gap: 12, marginBottom: 14 }, timelineDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.border, marginTop: 2 }, timelineDotActive: { backgroundColor: colors.primary }, timelineTitle: { color: colors.text, fontWeight: '900', fontSize: 15 },
  addressCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginBottom: 10 }, addressCardSelected: { borderColor: colors.primary, backgroundColor: '#fff7ed' }, paymentChoices: { flexDirection: 'row', gap: 10, marginBottom: 12 }, paymentChoice: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, alignItems: 'center', backgroundColor: colors.surface }, errorText: { color: colors.danger, fontWeight: '700', marginVertical: 10 },
  shopHeroContainer: { width: '100%', height: 220, position: 'relative', backgroundColor: colors.border },
  shopHeroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  shopRatingOverlay: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' },
  shopRatingText: { color: '#fbbf24', fontSize: 12, fontWeight: '800' },
  shopReviewsText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  shopInfoCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: -20, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  shopDetailName: { fontSize: 24, fontWeight: '900', color: colors.text },
  shopDetailCategory: { fontSize: 14, color: colors.primary, fontWeight: '700', marginTop: 4 },
  shopDetailAddress: { fontSize: 12, color: colors.textSecondary, marginTop: 6, lineHeight: 18 },
  deliveryStatusRow: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 14 },
  deliveryBadge: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16 },
  deliveryBadgeAvailable: { backgroundColor: '#f0fdf4' },
  deliveryBadgeUnavailable: { backgroundColor: '#fff7ed' },
  deliveryBadgeTitle: { fontSize: 13, fontWeight: '800', color: '#15803d' },
  deliveryBadgeSubtitle: { fontSize: 11, color: '#166534', marginTop: 2, fontWeight: '600' },
  contactActionsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  contactActionButton: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 14, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  payMerchantButton: { backgroundColor: colors.primary },
  contactActionText: { fontSize: 12, fontWeight: '800', color: '#475569', marginTop: 2 },
  catalogHeadingTitle: { fontSize: 18, fontWeight: '900', color: colors.text, marginVertical: 14 },
  floatingCheckoutBar: { position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: colors.primary, borderRadius: 20, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, zIndex: 999 },
  checkoutCartBadge: { backgroundColor: '#fff', borderRadius: 10, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  checkoutCartBadgeText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  checkoutCartLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700' },
  checkoutCartPrice: { color: '#fff', fontSize: 14, fontWeight: '900', marginTop: 1 },
  checkoutBarActionText: { color: '#fff', fontSize: 13, fontWeight: '900', marginRight: 4 },
  tabs: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 16, padding: 4, marginHorizontal: 16, marginBottom: 14 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontWeight: '800' },
  tabTextActive: { color: '#fff' }
});
