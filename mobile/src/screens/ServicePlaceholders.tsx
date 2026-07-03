import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Platform, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { products as fallbackProducts } from '../constants/mockData';
import { ConsumerHeader } from '../components/ConsumerHeader';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../components/AppButton';
import { BaseScreen } from '../components/BaseScreen';
import { InfoCard } from '../components/InfoCard';
import { ProductCard, SectionHeader, StoreCard } from '../components/CommerceCards';
import { catalogService } from '../services/catalogService';
import { orderService } from '../services/orderService';
import { profileService } from '../services/profileService';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useLocationStore } from '../store/locationStore';
import { Product, Shop } from '../types/domain';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { formatErrorMessage } from '../utils/errorFormatter';

type Props<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
type IconName = keyof typeof Ionicons.glyphMap;

const foodStores: Shop[] = [
  { id: 'f1', shop_name: 'Spice Garden', category_name: 'Biryani • North Indian', city: 'Kalaburagi', distance_km: 1.2, shop_image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' },
  { id: 'f2', shop_name: 'Pizza Street', category_name: 'Pizza • Fast Food', city: 'Borabai Nagar', distance_km: 2.1, shop_image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
  { id: 'f3', shop_name: 'South Tiffins', category_name: 'Dosa • Thali', city: 'Kalaburagi', distance_km: 2.8, shop_image: 'https://images.unsplash.com/photo-1630409351217-bc4fa6422075?auto=format&fit=crop&w=800&q=80' },
];

function Header({ title, subtitle, icon, onBack }: { title: string; subtitle?: string; icon: IconName; onBack?: () => void }) {
  return <View style={styles.header}><Pressable onPress={onBack} style={styles.round}><Ionicons name="chevron-back" size={22} color={colors.text} /></Pressable><View style={{ flex: 1 }}><Text style={styles.headerTitle}>{title}</Text>{subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}</View><View style={styles.round}><Ionicons name={icon} size={21} color={colors.primary} /></View></View>;
}

function Tile({ label, icon, onPress, active }: { label: string; icon: IconName; onPress?: () => void; active?: boolean }) {
  return <Pressable onPress={onPress} style={[styles.tile, active && styles.tileActive]}><View style={styles.tileIcon}><Ionicons name={icon} size={22} color={colors.primary} /></View><Text style={[styles.tileText, active && { color: '#fff' }]}>{label}</Text></Pressable>;
}

function FormCard({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return <View style={styles.formCard}><Text style={styles.formTitle}>{title}</Text>{children}</View>;
}

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry }: { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string; keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad'; secureTextEntry?: boolean }) {
  return <View><Text style={styles.inputLabel}>{label}</Text><TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} keyboardType={keyboardType} secureTextEntry={secureTextEntry} /></View>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const selectableLocations = [
  { name: 'Bangalore', icon: 'business' as IconName },
  { name: 'Kalaburagi', icon: 'account-balance' as IconName },
  { name: 'Hyderabad', icon: 'trail-sign-outline' as IconName },
  { name: 'Mysore', icon: 'ribbon-outline' as IconName },
  { name: 'Mumbai', icon: 'business' as IconName },
  { name: 'Delhi', icon: 'flag-outline' as IconName },
];

const popularAreasByCity: Record<string, Array<{ name: string; dist: string; image: string }>> = {
  bangalore: [
    { name: 'Brigade Road', dist: '3.3 km away', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=280&q=80' },
    { name: 'MG Road', dist: '3.1 km away', image: 'https://images.unsplash.com/photo-1566793474285-2decf0fc182a?auto=format&fit=crop&w=280&q=80' },
    { name: 'Indiranagar', dist: '4.2 km away', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=280&q=80' },
    { name: 'Koramangala', dist: '4.8 km away', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=280&q=80' },
  ],
  kalaburagi: [
    { name: 'Borabai Nagar', dist: '1.2 km away', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=280&q=80' },
    { name: 'MSK Mill Road', dist: '2.5 km away', image: 'https://images.unsplash.com/photo-1566793474285-2decf0fc182a?auto=format&fit=crop&w=280&q=80' },
    { name: 'Station Road', dist: '1.8 km away', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=280&q=80' },
    { name: 'Super Market', dist: '2.1 km away', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=280&q=80' },
  ],
  hyderabad: [
    { name: 'Gachibowli', dist: '2.9 km away', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=280&q=80' },
    { name: 'Banjara Hills', dist: '4.1 km away', image: 'https://images.unsplash.com/photo-1566793474285-2decf0fc182a?auto=format&fit=crop&w=280&q=80' },
    { name: 'Jubilee Hills', dist: '3.6 km away', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=280&q=80' },
    { name: 'Madhapur', dist: '4.5 km away', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=280&q=80' },
  ],
  mysore: [
    { name: 'Gokulam', dist: '1.5 km away', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=280&q=80' },
    { name: 'Vijayanagar', dist: '2.8 km away', image: 'https://images.unsplash.com/photo-1566793474285-2decf0fc182a?auto=format&fit=crop&w=280&q=80' },
    { name: 'Kuvempunagar', dist: '3.2 km away', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=280&q=80' },
    { name: 'Devaraja Mohalla', dist: '0.8 km away', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=280&q=80' },
  ],
};

const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

export function NearMeScreen({ navigation }: Props<'NearMe'>) {
  const { location, saveLocation } = useLocationStore();
  const addProduct = useCartStore(s => s.addProduct);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelMode, setChannelMode] = useState<'ONLINE' | 'TRIZONE'>('ONLINE');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fallbackNearMeProducts = useMemo(() => {
    return fallbackProducts.map((p, idx) => ({
      id: p.id,
      name: p.name,
      title: p.name,
      price: Number(p.newPrice.replace(/[^0-9]/g, '')),
      mrp: Number(p.oldPrice.replace(/[^0-9]/g, '')),
      image: p.image,
      shop_name: p.id % 2 === 0 ? 'Cloud Kitchen' : 'Tech World',
      tri_app_id: p.id % 2 === 0 ? p.id : undefined,
      tri_app_slug: p.id % 2 === 0 ? 'hotel' : undefined,
      tri_app_name: p.id % 2 === 0 ? 'Hotels' : undefined
    }));
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await catalogService.getOnlineProducts({
        limit: 100,
        ...(location.city ? { city: location.city } : {})
      });
      setProducts(data && data.length ? data : fallbackNearMeProducts);
    } catch (e) {
      setProducts(fallbackNearMeProducts);
      console.log('Failed fetching products in NearMeScreen, using fallback mock.');
    } finally {
      setLoading(false);
    }
  }, [location.city, fallbackNearMeProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  const activeCategories = useMemo(() => {
    if (channelMode === 'ONLINE') {
      return [
        { name: 'All', icon: 'grid-outline' as IconName, bg: '#FFEFE0', color: '#FF7A00' },
        { name: 'Electronics', icon: 'phone-portrait-outline' as IconName, bg: '#E0F2FE', color: '#0284C7' },
        { name: 'Fashion', icon: 'shirt-outline' as IconName, bg: '#FCE4EC', color: '#DB2777' },
        { name: 'Groceries', icon: 'basket-outline' as IconName, bg: '#E8F5E9', color: '#16A34A' },
        { name: 'Health', icon: 'medkit-outline' as IconName, bg: '#FFEBEE', color: '#DC2626' },
      ];
    } else {
      return [
        { name: 'All', icon: 'grid-outline' as IconName, bg: '#FFEFE0', color: '#FF7A00' },
        { name: 'Hotels', icon: 'bed-outline' as IconName, bg: '#E0F2FE', color: '#0284C7' },
        { name: 'EV Vehicles', icon: 'flash-outline' as IconName, bg: '#E8F5E9', color: '#16A34A' },
        { name: 'Travel', icon: 'airplane-outline' as IconName, bg: '#F3E8FF', color: '#7C3AED' },
        { name: 'Food & Dine', icon: 'restaurant-outline' as IconName, bg: '#FFEBEE', color: '#DC2626' },
      ];
    }
  }, [channelMode]);

  const visibleProducts = useMemo(() => {
    return products.filter(prod => {
      const isTriAppProd = (prod as any).productId != null || (prod as any).tri_app_id != null || (prod as any).tri_app_slug != null;
      if (channelMode === 'ONLINE') {
        if (isTriAppProd) return false;
      } else {
        if (!isTriAppProd) return false;
      }

      // Filter by Category
      if (selectedCategory && selectedCategory.name !== 'All') {
        const prodCat = (prod.title || prod.name || '').toLowerCase();
        const chosenCat = selectedCategory.name.toLowerCase();
        if (channelMode === 'TRIZONE') {
          const appSlug = String((prod as any).tri_app_slug || '').toLowerCase();
          const appName = String((prod as any).tri_app_name || '').toLowerCase();
          if (!appSlug.includes(chosenCat) && !appName.includes(chosenCat) && !chosenCat.includes(appSlug) && !chosenCat.includes(appName)) return false;
        } else {
          const categoryCheck = chosenCat === 'groceries' ? 'grocery' : chosenCat;
          if (!prodCat.includes(categoryCheck)) return false;
        }
      }

      // Filter by Search Query
      if (searchTerm.trim() !== '') {
        const queryText = searchTerm.toLowerCase();
        const matchTitle = (prod.title || prod.name || '').toLowerCase().includes(queryText);
        const matchShop = (prod.shop_name || '').toLowerCase().includes(queryText);
        if (!matchTitle && !matchShop) return false;
      }
      return true;
    });
  }, [products, channelMode, selectedCategory, searchTerm]);

  const popularAreas = useMemo(() => {
    const cityKey = (location.city || 'Bangalore').toLowerCase();
    return popularAreasByCity[cityKey] || popularAreasByCity['bangalore'];
  }, [location.city]);

  if (selectedCategory) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <ConsumerHeader navigation={navigation} mode="compact" showBack={true} />
        <View style={styles.categoryHeaderRow}>
          <Pressable style={styles.backCategoryBtn} onPress={() => setSelectedCategory(null)}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
            <Text style={styles.categoryTitle}>{selectedCategory.name}</Text>
          </Pressable>
          <Text style={styles.categorySubTitle}>Explore in {location.city || 'Kalaburagi'}</Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : visibleProducts.length === 0 ? (
            <InfoCard title="No products found" subtitle={`No listings under ${selectedCategory.name} category.`} />
          ) : (
            <View style={{ gap: 12, marginTop: 14 }}>
              {visibleProducts.map(prod => (
                <Pressable key={prod.id} style={styles.listCardItem} onPress={() => navigation.navigate('ProductDetails', { id: String(prod.id) })}>
                  <Image source={{ uri: prod.image || prod.image_url || fallbackImage }} style={styles.listCardImage} />
                  <View style={styles.listCardContent}>
                    <View>
                      <Text style={styles.listCardTitle} numberOfLines={2}>{prod.title || prod.name}</Text>
                      <Text style={styles.listCardShop} numberOfLines={1}>Sold by: {prod.shop_name || 'Tri Store'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.listCardPrice}>₹{prod.price}</Text>
                      {channelMode === 'TRIZONE' ? (
                        <Pressable style={styles.bookNowBtn} onPress={() => navigation.navigate('ProductDetails', { id: String(prod.id) })}>
                          <Text style={styles.bookNowBtnText}>Book Now</Text>
                        </Pressable>
                      ) : (
                        <Text style={{ fontSize: 10, color: '#22c55e', fontWeight: '800' }}>Free delivery</Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
        <Pressable style={styles.mapFloatBtnNearMe} onPress={() => navigation.navigate('NearbyStores')}>
          <Ionicons name="map" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.mapFloatBtnTextNearMe}>Map View</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fb' }}>
      <ConsumerHeader
        navigation={navigation}
        mode="compact"
        showBack={true}
        title="Nearby Marketplace"
        subtitle="Everything around you"
        onSearch={setSearchTerm}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Tab Switcher Overlay */}
        <View style={styles.tabSwitcherNearMe}>
          <Pressable 
            style={[styles.tabSwitchBtnNearMe, channelMode === 'ONLINE' && styles.tabSwitchBtnActiveNearMe]} 
            onPress={() => { setChannelMode('ONLINE'); setSelectedCategory(null); setSearchTerm(''); }}
          >
            <Ionicons name="basket" size={15} color={channelMode === 'ONLINE' ? '#ff7a00' : '#64748b'} />
            <Text style={[styles.tabSwitchTextNearMe, channelMode === 'ONLINE' && styles.tabSwitchTextActiveNearMe]}>Online Shop</Text>
          </Pressable>
          <Pressable 
            style={[styles.tabSwitchBtnNearMe, channelMode === 'TRIZONE' && styles.tabSwitchBtnActiveNearMe]} 
            onPress={() => { setChannelMode('TRIZONE'); setSelectedCategory(null); setSearchTerm(''); }}
          >
            <Ionicons name="grid" size={15} color={channelMode === 'TRIZONE' ? '#ff7a00' : '#64748b'} />
            <Text style={[styles.tabSwitchTextNearMe, channelMode === 'TRIZONE' && styles.tabSwitchTextActiveNearMe]}>Tri Zone</Text>
          </Pressable>
        </View>

        {/* Select Location Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionHeaderTitleNearMe}>SELECT LOCATION</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.citiesRowNearMe}>
            {selectableLocations.map((loc) => {
              const isSelected = loc.name.toLowerCase() === (location.city || '').toLowerCase();
              return (
                <Pressable 
                  key={loc.name} 
                  style={[styles.cityCardNearMe, isSelected && styles.cityCardActiveNearMe]} 
                  onPress={() => saveLocation({ ...location, city: loc.name, area: 'Indiranagar' })}
                >
                  <Ionicons name={loc.icon} size={24} color={isSelected ? '#FF7A00' : '#94A3B8'} style={{ marginBottom: 6 }} />
                  {isSelected ? (
                    <View style={styles.activeCityBadgeNearMe}>
                      <Text style={styles.activeCityBadgeTextNearMe}>{loc.name}</Text>
                    </View>
                  ) : (
                    <Text style={styles.inactiveCityTextNearMe}>{loc.name}</Text>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Quick Categories Section */}
        <View style={{ marginBottom: 24 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRowNearMe}>
            {activeCategories.map((c) => (
              <Pressable key={c.name} style={styles.catItemNearMe} onPress={() => setSelectedCategory(c)}>
                <View style={[styles.catCircleNearMe, { backgroundColor: c.bg }]}>
                  <Ionicons name={c.icon} size={22} color={c.color} />
                </View>
                <Text style={[styles.catTextNearMe, c.name === 'All' && { color: '#FF7A00' }]}>{c.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Popular in City Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={styles.sectionHeaderRowNearMe}>
            <Text style={styles.sectionHeaderTitleNearMe}>POPULAR IN {location.city || 'Kalaburagi'}</Text>
            <Text style={styles.viewAllTextNearMe}>View all</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRowNearMe}>
            {popularAreas.map((area) => (
              <View key={area.name} style={styles.popularAreaCardNearMe}>
                <Image source={{ uri: area.image }} style={styles.popularAreaImgNearMe} />
                <Text style={styles.popularAreaTitleNearMe} numberOfLines={1}>{area.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Ionicons name="location-outline" size={12} color="#64748b" />
                  <Text style={styles.popularAreaDistNearMe}>{area.dist}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={styles.sectionHeaderRowNearMe}>
            <Text style={styles.sectionHeaderTitleNearMe}>
              {channelMode === 'ONLINE' ? 'Featured Online Products' : 'Featured Tri Zone Stays'}
            </Text>
            <Text style={styles.viewAllTextNearMe} onPress={() => setSelectedCategory({ name: 'All' })}>View all</Text>
          </View>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : visibleProducts.length === 0 ? (
            <Text style={styles.noListingsTextNearMe}>No listings available in {location.city || 'Kalaburagi'}</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {visibleProducts.slice(0, 10).map((prod) => (
                <ProductCard 
                  key={String(prod.id)} 
                  product={prod} 
                  onPress={() => navigation.navigate('ProductDetails', { id: String(prod.id) })} 
                  onAdd={() => void addProduct(prod)} 
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Promo Coupon Card */}
        <View style={styles.promoCouponCardNearMe}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.promoIconBgNearMe}>
              <Ionicons name="pricetag" size={18} color="#FF7A00" />
            </View>
            <View>
              <Text style={styles.promoCouponTitleNearMe}>Flat 20% OFF</Text>
              <Text style={styles.promoCouponSubtitleNearMe}>Use code: TRIKONEKT20</Text>
            </View>
          </View>
          <Pressable style={styles.shopNowCouponBtnNearMe} onPress={() => Alert.alert('Promo applied', 'Flat 20% off applied!')}>
            <Text style={styles.shopNowCouponBtnTextNearMe}>Shop Now</Text>
          </Pressable>
        </View>

      </ScrollView>

      {/* Floating Map View Button */}
      <Pressable style={styles.mapFloatBtnNearMe} onPress={() => navigation.navigate('NearbyStores')}>
        <Ionicons name="map" size={16} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.mapFloatBtnTextNearMe}>Map View</Text>
      </Pressable>

    </View>
  );
}

export function AdsScreen({ navigation }: Props<'Ads'>) {
  const ads = [
    { id: 1, brand: 'Nike', title: 'Latest Collection', points: 50, duration: '30s', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=240&q=80' },
    { id: 2, brand: 'Starbucks', title: 'Coffee Rewards', points: 40, duration: '25s', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=240&q=80' },
    { id: 3, brand: 'Amazon Prime', title: 'Prime Benefits', points: 60, duration: '40s', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=240&q=80' },
    { id: 4, brand: 'Netflix', title: 'Stream Unlimited', points: 45, duration: '35s', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=240&q=80' },
  ];
  const [selected, setSelected] = useState<typeof ads[number] | null>(null);
  const [points, setPoints] = useState(0);
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container}><View style={styles.adsTop}><Pressable onPress={() => navigation.navigate('ConsumerHome')} style={styles.round}><Ionicons name="arrow-back" size={20} color={colors.text} /></Pressable><Text style={styles.smallTitle}>Watch & Earn Ads</Text><View style={styles.points}><Text style={styles.mini}>Points</Text><Text style={styles.pointValue}>{points}</Text></View></View>{selected ? <View style={styles.player}><Image source={{ uri: selected.image }} style={styles.playerImg} /><Text style={styles.big}>{selected.brand}</Text><Text style={styles.sub}>{selected.title}</Text><Text style={styles.sub}>Duration: {selected.duration}</Text><View style={styles.progress}><View style={styles.progressFill} /></View><Text style={styles.reward}>+{selected.points} Points</Text><AppButton label="Ad Completed" onPress={() => { setPoints(p => p + selected.points); setSelected(null); }} /></View> : ads.map(ad => <View key={ad.id} style={styles.adCard}><Image source={{ uri: ad.image }} style={styles.adImg} /><View style={{ flex: 1 }}><Text style={styles.orange}>{ad.brand}</Text><Text style={styles.cardTitle}>{ad.title}</Text><View style={styles.between}><Text style={styles.mini}>{ad.duration}</Text><Text style={styles.orange}>+{ad.points} pts</Text></View></View><Pressable onPress={() => setSelected(ad)} style={styles.play}><Ionicons name="play" size={16} color="#fff" /></Pressable></View>)}</ScrollView></BaseScreen>;
}

export function SocietyScreen({ navigation }: Props<'Society'>) {
  const features: Array<{ title: string; subtitle: string; desc: string; icon: IconName; color: string; url?: string }> = [
    { title: 'Meeting', subtitle: 'Community Call', desc: 'Join weekly discussions & town halls', icon: 'people', color: '#6366F1' },
    { title: 'Training', subtitle: 'Skills & Resources', desc: 'Skill development programs & guides', icon: 'school', color: '#06B6D4' },
    { title: 'Career Guidance', subtitle: 'Mentorship & Support', desc: 'Connect with career mentors & advisors', icon: 'compass', color: '#10B981' },
    { title: 'Events', subtitle: 'Upcoming Drives', desc: 'Explore social drives & gatherings', icon: 'calendar', color: '#F43F5E' },
    { title: 'Helpdesk', subtitle: 'Support Center', desc: '24/7 volunteer & administrative support', icon: 'help-buoy', color: '#F59E0B' },
    { title: 'YouTube', subtitle: 'Watch Initiatives', desc: 'Subscribe to our informative videos', icon: 'logo-youtube', color: '#EF4444', url: 'https://youtube.com' },
    { title: 'WhatsApp', subtitle: 'Connect Instantly', desc: 'Join the instant chat community group', icon: 'logo-whatsapp', color: '#22C55E', url: 'https://whatsapp.com' },
    { title: 'Instagram', subtitle: 'Daily Updates', desc: 'Follow our photo stories & updates', icon: 'logo-instagram', color: '#D946EF', url: 'https://instagram.com' },
    { title: 'Facebook', subtitle: 'Community Page', desc: 'Like our page and share initiatives', icon: 'logo-facebook', color: '#1877F2', url: 'https://facebook.com' },
    { title: 'Telegram', subtitle: 'Broadcast Channel', desc: 'Get fast broadcasts & text notices', icon: 'paper-plane', color: '#3B82F6', url: 'https://telegram.org' },
  ];
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container}><Header title="For Better Society" subtitle="Make an impact today" icon="heart" onBack={() => navigation.navigate('ConsumerHome')} /><View style={styles.hero}><Text style={styles.heroTag}>Community Hub</Text><Text style={styles.heroTitle}>Together We Build a Better World</Text><Text style={styles.heroSub}>Participate in local initiatives, mentorship, training modules, and social platforms.</Text></View>{features.map(f => <Pressable key={f.title} style={styles.listCard} onPress={() => f.url ? void Linking.openURL(f.url) : Alert.alert(f.title, 'Opening community feature...')}><View style={[styles.colIcon, { backgroundColor: `${f.color}14` }]}><Ionicons name={f.icon} size={24} color={f.color} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{f.title}</Text><Text style={styles.cardSub}>{f.subtitle}</Text><Text style={styles.cardDesc}>{f.desc}</Text></View></Pressable>)}</ScrollView></BaseScreen>;
}

export function BusinessRegistrationScreen({ navigation }: Props<'BusinessRegistration'>) {
  const [mobile, setMobile] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ mobile?: string; category?: string }>({});
  const auto = mobile.length === 10 ? { name: 'Baburaj', pinCode: '560103', city: 'Bangalore' } : null;
  const submit = () => { const next: typeof errors = {}; if (mobile.length < 10) next.mobile = 'Please enter a valid 10-digit mobile number'; if (!category.trim()) next.category = 'Please specify your business category'; if (Object.keys(next).length) { setErrors(next); return; } setLoading(true); setTimeout(() => { setLoading(false); setSuccess(true); }, 900); };
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container}><Header title="List Your Business" subtitle="Onboarding Dashboard" icon="storefront" onBack={() => navigation.navigate('ConsumerHome')} />{success ? <View style={styles.success}><Ionicons name="checkmark-circle" size={64} color={colors.success} /><Text style={styles.big}>Registration Successful!</Text><Text style={styles.sub}>Your business registration request has been submitted to our team.</Text><View style={styles.details}><DetailRow label="Owner Name" value={auto?.name || 'Baburaj'} /><DetailRow label="Mobile Number" value={`+91 ${mobile}`} /><DetailRow label="Business Type" value={category} /><DetailRow label="Service City" value={`${auto?.city || 'Bangalore'} (${auto?.pinCode || '560103'})`} /></View><InfoCard title="What's Next?" subtitle="An Admin will call you to complete document verification and activate your storefront." /><AppButton label="Done" onPress={() => navigation.navigate('ConsumerHome')} /></View> : <><View style={styles.businessHero}><Ionicons name="storefront" size={54} color={colors.primary} /><Text style={styles.big}>List Your Business</Text><Text style={styles.sub}>Reach nearby customers and grow your business with Trikonekt platform</Text></View><FormCard title="1. Contact Verification"><Field label="Enter Mobile Number" value={mobile} onChangeText={v => { setMobile(v.replace(/[^0-9]/g, '').slice(0, 10)); setErrors({}); }} placeholder="9886178729" keyboardType="phone-pad" />{errors.mobile ? <Text style={styles.err}>{errors.mobile}</Text> : null}</FormCard>{auto ? <FormCard title="2. Business Owner Profile"><Text style={styles.badge}>Auto Detected</Text><Readonly label="Full Name" value={auto.name} icon="person" /><View style={styles.row}><Readonly label="PIN Code" value={auto.pinCode} icon="location" /><Readonly label="Location/City" value={auto.city} icon="business" /></View></FormCard> : null}<FormCard title="3. Business Category"><Field label="Type Your Business" value={category} onChangeText={setCategory} placeholder="e.g. Plumber, Grocery, Restaurant" />{errors.category ? <Text style={styles.err}>{errors.category}</Text> : null}</FormCard><AppButton label={loading ? 'Submitting Application...' : 'Submit'} onPress={submit} /></>}</ScrollView></BaseScreen>;
}

export function ConsumerScannerScreen({ navigation }: Props<'ConsumerScanner'>) {
  const [scanResult, setScanResult] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  if (!permission) return <BaseScreen title="Scanner"><InfoCard title="Checking camera permission" subtitle="Please wait..." /></BaseScreen>;
  if (!permission.granted) return <BaseScreen title="Camera permission required" subtitle="Camera access is used only while scanning a QR code."><AppButton label="Allow camera" onPress={() => void requestPermission()} /><AppButton label="Back" variant="secondary" onPress={() => navigation.goBack()} /></BaseScreen>;
  return <SafeAreaView style={styles.scanSafe}><View style={{ flex: 1, padding: 16 }}>{!scanResult ? <CameraView style={{ flex: 1, minHeight: 420, borderRadius: 28, overflow: 'hidden', marginBottom: 16 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => setScanResult(data)}><View style={[styles.scanFrame, { flex: 1, height: undefined, backgroundColor: 'rgba(0,0,0,0.18)', borderWidth: 3, borderColor: '#fff' }]}><Ionicons name="qr-code-outline" size={84} color="rgba(255,255,255,0.9)" /><Text style={styles.scanText}>Align QR code inside the frame</Text></View></CameraView> : <View style={[styles.whiteCard, { marginBottom: 16 }]}><Text style={styles.cardTitle}>QR code scanned</Text><InfoCard title="Scanned Result" subtitle={scanResult} /><AppButton label="Open secure link" onPress={async () => { if (/^https:\/\//i.test(scanResult) && await Linking.canOpenURL(scanResult)) await Linking.openURL(scanResult); else Alert.alert('Unsupported QR code', 'Only secure HTTPS links can be opened.'); }} /><AppButton label="Scan again" variant="secondary" onPress={() => setScanResult('')} /></View>}<AppButton label="Back to Dashboard" variant="secondary" onPress={() => navigation.navigate('ConsumerHome')} /></View></SafeAreaView>;
}

export function TriPayScreen() {
  const quick: Array<[string, IconName]> = [['Tri Pay UPI', 'cash'], ['Balance', 'wallet'], ['Pay Later', 'card'], ['Saved Cards', 'card-outline'], ['Vouchers', 'ticket']];
  const sections: Array<[string, Array<[string, IconName]>]> = [
    ['Money Transfer', [['Scan Any QR', 'scan'], ['Send Money', 'send'], ['Self Transfer', 'qr-code'], ['Add to Wallet', 'wallet']]],
    ['Earn Rewards Every Time You Pay', [['Mobile Recharge', 'phone-portrait'], ['Pay Bills', 'receipt'], ['Travel', 'airplane'], ['Gift Cards', 'gift']]],
    ['Recharge & Bill Payments', [['Mobile Recharge', 'phone-portrait'], ['Electricity', 'bulb'], ['DTH Recharge', 'tv'], ['Landline', 'call'], ['More', 'apps']]],
    ['Travel', [['Flights', 'airplane'], ['Trains', 'train'], ['Hotels', 'bed'], ['Bus', 'bus'], ['More', 'apps']]],
  ];
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container}><View style={styles.balance}><View><Text style={styles.balanceLabel}>Tri Pay Balance</Text><Text style={styles.balanceAmount}>Rs. 2,450.00</Text><Text style={styles.balanceLink}>View Details</Text></View><View><Text style={styles.addMoney}>+ Add Money</Text><Text style={styles.cashback}>Flat Rs.50 Cashback</Text></View></View><SectionHeader title="Quick Actions" /><View style={styles.wrap}>{quick.map(([label, icon]) => <Tile key={label} label={label} icon={icon} />)}</View><SectionHeader title="Your Rewards" actionLabel="View all" /><View style={styles.row}>{[['Cashback Earned', 'Rs. 0', 'gift'], ['Offers Collected', '0', 'ticket'], ['Scratch Cards', '0', 'shield-checkmark']].map(([l, v, i]) => <View key={l} style={styles.rewardCard}><Ionicons name={i as IconName} size={22} color={colors.primary} /><Text style={styles.cardSub}>{l}</Text><Text style={styles.cardTitle}>{v}</Text></View>)}</View>{sections.map(([title, items]) => <View key={title}><SectionHeader title={title} actionLabel="View all" /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hrow}>{items.map(([label, icon]) => <Tile key={label} label={label} icon={icon} />)}</ScrollView></View>)}<View style={styles.scanPay}><View style={{ flex: 1 }}><SectionHeader title="Gift Cards & Vouchers" /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hrow}>{[['All Gift Cards', 'gift'], ['Brand Gift Cards', 'ticket'], ['Tri Vouchers', 'receipt'], ['More', 'apps']].map(([label, icon]) => <Tile key={label} label={label} icon={icon as IconName} />)}</ScrollView></View><View style={styles.scanBtn}><Text style={styles.scanBtnText}>Scan & Pay</Text><Text style={styles.heroSub}>Any QR</Text><Ionicons name="qr-code" size={34} color="#fff" /></View></View></ScrollView></BaseScreen>;
}

export function TriEatScreen({ navigation }: Props<'TriEat'>) {
  const [active, setActive] = useState('All');
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container}><Search placeholder="Search for 'Biryani'" /><Chips items={['All', 'Cuisines', 'Rating 4.0+', 'Offers', 'Pure Veg']} active={active} onChange={setActive} /><SectionHeader title="What's on your mind?" /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hrow}>{['Biryani', 'Pizza', 'Burger', 'Thali', 'Dosa', 'Cake'].map(c => <View key={c} style={styles.foodCat}><Text style={styles.emoji}>🥘</Text><Text style={styles.tileText}>{c}</Text></View>)}</ScrollView><SectionHeader title="Restaurants to explore" />{foodStores.map(store => <StoreCard key={String(store.id)} store={store} onPress={() => navigation.navigate('ShopDetails', { id: String(store.id) })} />)}</ScrollView></BaseScreen>;
}

export function TriTripScreen() {
  const [bookingType, setBookingType] = useState('flights');
  const tabs: Array<[string, string, IconName]> = [['flights', 'Flights', 'airplane'], ['hotels', 'Hotels', 'bed'], ['cabs', 'Cabs', 'car'], ['trains', 'Trains', 'train']];
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container}><View style={styles.wrap}>{tabs.map(([id, label, icon]) => <Pressable key={id} onPress={() => setBookingType(id)} style={[styles.tripTab, bookingType === id && styles.tripActive]}><Ionicons name={icon} size={21} color={bookingType === id ? '#fff' : colors.primary} /><Text style={[styles.tripText, bookingType === id && { color: '#fff' }]}>{label}</Text></Pressable>)}</View><View style={styles.formCard}><View style={styles.between}><TripField label="From" value="Bengaluru (BLR)" /><Text style={styles.swap}>⇄</Text><TripField label="To" value="Mumbai (BOM)" /></View><View style={styles.line} /><View style={styles.between}><TripField label="Departure" value="24 Oct' 2026" /><TripField label="Travellers" value="1 Adult, Economy" /></View><AppButton label={`Search ${bookingType}`} onPress={() => Alert.alert('Search', `Searching ${bookingType}`)} /></View><SectionHeader title="Popular Getaways" />{[{ city: 'Goa', price: '₹4,500', img: '🏝️' }, { city: 'Coorg', price: '₹3,200', img: '⛰️' }, { city: 'Hampi', price: '₹2,800', img: '🗿' }].map(g => <View key={g.city} style={styles.listCard}><Text style={styles.emoji}>{g.img}</Text><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{g.city}</Text><Text style={styles.cardSub}>Starting at {g.price}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></View>)}</ScrollView></BaseScreen>;
}

export function TriPickDropScreen() {
  const [vehicle, setVehicle] = useState('bike');
  const vehicles: Array<[string, string, IconName, string]> = [['bike', 'Two Wheeler', 'bicycle', 'Up to 20 kg'], ['3w', 'Three Wheeler', 'car-sport', 'Up to 500 kg'], ['truck', 'Tata Ace', 'car', 'Up to 750 kg']];
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container}><View style={styles.locationCard}><View style={styles.route}><Ionicons name="radio-button-on" size={18} color={colors.success} /><View style={styles.vline} /><Ionicons name="location" size={20} color={colors.primary} /></View><View style={{ flex: 1 }}><Field label="Pickup Location" value="Indiranagar, Bengaluru" onChangeText={() => undefined} /><Field label="Drop Location" value="" onChangeText={() => undefined} placeholder="Enter destination address" /></View></View><SectionHeader title="Select Vehicle" />{vehicles.map(([id, label, icon, cap]) => <Pressable key={id} onPress={() => setVehicle(id)} style={[styles.vehicle, vehicle === id && styles.vehicleActive]}><View style={styles.tileIcon}><Ionicons name={icon} size={23} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{label}</Text><Text style={styles.cardSub}>{cap}</Text></View><Ionicons name={vehicle === id ? 'radio-button-on' : 'radio-button-off'} size={22} color={vehicle === id ? colors.primary : colors.muted} /></Pressable>)}<View style={styles.formCard}><Text style={styles.cardSub}>Estimated Fare</Text><Text style={styles.estimate}>₹149 - ₹199</Text><Text style={styles.cardDesc}>Inclusive of all taxes and toll charges</Text><AppButton label={`Book ${vehicle.toUpperCase()}`} onPress={() => Alert.alert('Booking', `Booking ${vehicle.toUpperCase()}`)} /></View></ScrollView></BaseScreen>;
}

export function TriZoneScreen({ navigation }: Props<'TriZone'>) {
  const go = (name: keyof RootStackParamList) => navigation.navigate(name as never);
  const recently: Array<[string, IconName, keyof RootStackParamList]> = [['Tri Pay', 'wallet', 'TriPay'], ['Tri Delivery', 'cube', 'Delivery'], ['Hotels', 'bed', 'TriTrip'], ['Restaurants', 'restaurant', 'TriEat'], ['Finance', 'cash', 'TriPay']];
  const picks: Array<[string, string, IconName, keyof RootStackParamList]> = [['Tri Pay', 'Secure payments', 'wallet', 'TriPay'], ['Tri Services', 'Local services', 'build', 'NearMe'], ['Daily Needs', 'Essentials', 'basket', 'Delivery'], ['Finance', 'Business & pay', 'cash', 'TriPay'], ['Community', 'Society forums', 'heart', 'Society'], ['Tri Delivery', 'Fast delivery', 'cube', 'Delivery'], ['Tri Eat', 'Order food', 'restaurant', 'TriEat'], ['Tri Travel', 'Book tickets', 'airplane', 'TriTrip'], ['Tri Health', 'Health services', 'medkit', 'NearMe'], ['Tri Education', 'Learn & grow', 'school', 'Society'], ['Government', 'Govt. services', 'business', 'NearMe'], ['More Services', 'Explore more', 'ellipsis-horizontal', 'NearMe']];
  return (
    <View style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <ConsumerHeader navigation={navigation} mode="compact" showBack={true} />
      <ScrollView contentContainerStyle={[styles.container, { paddingHorizontal: 16 }]} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Recently Used" actionLabel="View all" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hrow}>
          {recently.map(([label, icon, route]) => <Tile key={label} label={label} icon={icon} onPress={() => go(route)} />)}
        </ScrollView>
        <SectionHeader title="Top Picks" />
        <View style={styles.pickGrid}>
          {picks.map(([title, desc, icon, route]) => (
            <Pressable key={title} style={styles.pick} onPress={() => go(route)}>
              <Ionicons name={icon} size={23} color={colors.primary} />
              <Text style={styles.pickTitle}>{title}</Text>
              <Text style={styles.pickDesc}>{desc}</Text>
            </Pressable>
          ))}
        </View>
        <View style={[styles.promo, { padding: 18, alignItems: 'center' }]}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.promoText}>Get up to <Text style={styles.orange}>25% OFF</Text></Text>
            <Text style={[styles.cardSub, { marginBottom: 12 }]}>on selected services</Text>
            <Pressable style={styles.promoBtnWrapper} onPress={() => Alert.alert('Offers', 'Explore custom services offers!')}>
              <Text style={styles.promoBtn}>Explore Offers</Text>
            </Pressable>
          </View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=150&q=80' }} 
            style={{ width: 90, height: 90, borderRadius: 12 }} 
          />
        </View>
        <SectionHeader title="Popular Services" actionLabel="View all" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hrow}>
          {[{ name: 'Hotels', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=280&q=80' }, { name: 'Salons', img: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=280&q=80' }, { name: 'Restaurants', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=280&q=80' }, { name: 'Travel', img: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=280&q=80' }].map(s => (
            <View key={s.name} style={styles.popular}>
              <Image source={{ uri: s.img }} style={styles.popularImg} />
              <Text style={styles.cardTitle}>{s.name}</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

export const TriInventoryBillingScreen = () => <BaseScreen title="Inventory & Billing" subtitle="Business tools for product catalog, billing, GST invoices and stock insights."><View style={styles.balance}><View><Text style={styles.balanceLabel}>Today’s Sales</Text><Text style={styles.balanceAmount}>Rs. 18,430</Text><Text style={styles.balanceLink}>12 invoices generated</Text></View><Ionicons name="analytics" size={48} color="#fff" /></View>{[['Products', '1,248', 'cube'], ['Low Stock', '18', 'warning'], ['Pending Bills', '7', 'receipt'], ['Customers', '342', 'people']].map(([label, value, icon]) => <View key={label} style={styles.metric}><Ionicons name={icon as IconName} size={22} color={colors.primary} /><View><Text style={styles.cardTitle}>{value}</Text><Text style={styles.cardSub}>{label}</Text></View></View>)}<InfoCard title="Native business handoff" subtitle="This mirrors the web inventory-billing entry point and is ready for a dedicated merchant-native module." /></BaseScreen>;

export function ProfileScreen({ navigation }: Props<'Profile'>) {
  const [loading, setLoading] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', address: '', pinCode: '', district: '', state: '' });
  useEffect(() => { setLoading(true); void profileService.getProfile().then(res => { const d = res?.data || res || {}; setForm({ fullName: d.fullName || d.full_name || '', email: d.email || '', mobile: d.mobile || d.phone || '', address: d.address || '', pinCode: d.pinCode || d.pincode || '', district: d.district || d.city || '', state: d.state || '' }); }).catch(e => setError(formatErrorMessage(e))).finally(() => setLoading(false)); }, []);
  const updateUser = useAuthStore(s => s.updateUser); const save = async () => { if (!form.fullName || !form.mobile) { setError('Full Name and Mobile Number are required'); return; } setSaving(true); try { const result = await profileService.updateProfile(form); await updateUser(result?.data || result || form); Alert.alert('Success', 'Profile details updated successfully!'); } catch (e) { setError(formatErrorMessage(e)); } finally { setSaving(false); } };
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container}><Header title="Edit Profile" icon="person" onBack={() => navigation.goBack()} />{loading ? <InfoCard title="Loading profile" subtitle="Please wait..." /> : <FormCard title="Personal Details">{error ? <Text style={styles.err}>{error}</Text> : null}<Field label="Full Name" value={form.fullName} onChangeText={fullName => setForm(p => ({ ...p, fullName }))} /><Field label="Email" value={form.email} onChangeText={email => setForm(p => ({ ...p, email }))} keyboardType="email-address" /><Field label="Mobile Number" value={form.mobile} onChangeText={mobile => setForm(p => ({ ...p, mobile }))} keyboardType="phone-pad" /><Field label="Address" value={form.address} onChangeText={address => setForm(p => ({ ...p, address }))} /><Field label="PIN Code" value={form.pinCode} onChangeText={pinCode => setForm(p => ({ ...p, pinCode }))} keyboardType="number-pad" /><Field label="District / City" value={form.district} onChangeText={district => setForm(p => ({ ...p, district }))} /><Field label="State" value={form.state} onChangeText={state => setForm(p => ({ ...p, state }))} /><AppButton label={saving ? 'Saving...' : 'Save Changes'} onPress={save} /></FormCard>}</ScrollView></BaseScreen>;
}

export function ConsumerKYCScreen({ navigation }: Props<'ConsumerKYC'>) {
  const [tab, setTab] = useState(0); const [status, setStatus] = useState('NOT_STARTED'); const [profile, setProfile] = useState<Record<string, unknown> | null>(null); const [bank, setBank] = useState({ bankName: '', accountNumber: '', ifscCode: '' }); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const refreshKyc = useCallback(async () => { try { const res = await profileService.getKycStatus(); const s = res?.data?.status || res?.status || 'NOT_STARTED'; setStatus(s); if (['PENDING', 'VERIFIED', 'REJECTED'].includes(s)) { const p = await profileService.getKycProfile(); setProfile(p?.data || p); } setError(''); } catch (e) { setError(formatErrorMessage(e)); } }, []);
  useFocusEffect(useCallback(() => { void refreshKyc(); }, [refreshKyc]));
  const cfg = kycCfg(status, profile); const start = async () => { setSaving(true); try { const res = await profileService.startKyc(); const url = res?.data?.authorization_url || res?.authorization_url; if (url) await Linking.openURL(url); else setError('Failed to generate DigiLocker verification link.'); } catch (e) { setError(formatErrorMessage(e)); } finally { setSaving(false); } };
  return <BaseScreen scroll={false}><ScrollView contentContainerStyle={styles.container}><Header title="Consumer KYC" subtitle="Aadhaar, bank and nominee details" icon="shield-checkmark" onBack={() => navigation.goBack()} /><View style={[styles.kycStatus, { borderLeftColor: cfg.color }]}><Ionicons name={cfg.icon} size={30} color={cfg.color} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{cfg.label}</Text><Text style={styles.cardDesc}>{cfg.desc}</Text></View></View>{message ? <Text style={styles.ok}>{message}</Text> : null}{error ? <Text style={styles.err}>{error}</Text> : null}<View style={styles.tabs}>{['Identity', 'Bank', 'Nominees'].map((t, i) => <Pressable key={t} onPress={() => setTab(i)} style={[styles.tab, tab === i && styles.tabActive]}><Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t}</Text></Pressable>)}</View>{tab === 0 ? <FormCard title="DigiLocker Aadhaar Verification"><Text style={styles.cardDesc}>Verify your identity using DigiLocker to secure your account and unlock wallet withdrawals.</Text>{profile ? <View style={styles.details}>{Object.entries(profile).slice(0, 5).map(([k, v]) => <DetailRow key={k} label={k.replace(/_/g, ' ')} value={String(v ?? '-')} />)}</View> : null}<AppButton label={saving ? 'Starting...' : 'Start DigiLocker KYC'} onPress={start} /></FormCard> : null}{tab === 1 ? <FormCard title="Bank Details"><Field label="Bank Name" value={bank.bankName} onChangeText={bankName => setBank(p => ({ ...p, bankName }))} /><Field label="Account Number" value={bank.accountNumber} onChangeText={accountNumber => setBank(p => ({ ...p, accountNumber }))} keyboardType="number-pad" /><Field label="IFSC Code" value={bank.ifscCode} onChangeText={ifscCode => setBank(p => ({ ...p, ifscCode: ifscCode.toUpperCase() }))} /><AppButton label="Save Bank Details" onPress={() => { setMessage('Bank details saved successfully!'); setTab(2); }} /></FormCard> : null}{tab === 2 ? <InfoCard title="No nominees added" subtitle="Nominee records from the web flow will appear here." /> : null}</ScrollView></BaseScreen>;
}

function Search({ value, onChangeText, placeholder }: { value?: string; onChangeText?: (v: string) => void; placeholder: string }) { return <View style={styles.search}><Ionicons name="search" size={18} color={colors.muted} /><TextInput style={styles.searchInput} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} /></View>; }
function Chips({ items, active, onChange }: { items: string[]; active: string; onChange: (v: string) => void }) { return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hrow}>{items.map(item => <Pressable key={item} onPress={() => onChange(item)} style={[styles.chip, active === item && styles.chipActive]}><Text style={[styles.chipText, active === item && styles.chipTextActive]}>{item === 'Offers' ? '🏷️ ' : ''}{item}</Text></Pressable>)}</ScrollView>; }
function Readonly({ label, value, icon }: { label: string; value: string; icon: IconName }) { return <View style={{ flex: 1 }}><Text style={styles.inputLabel}>{label}</Text><View style={styles.readonly}><Ionicons name={icon} size={17} color={colors.muted} /><Text style={styles.readonlyText}>{value}</Text></View></View>; }
function TripField({ label, value }: { label: string; value: string }) { return <View style={{ flex: 1 }}><Text style={styles.inputLabel}>{label}</Text><Text style={styles.tripVal}>{value}</Text></View>; }
function kycCfg(status: string, profile: Record<string, unknown> | null): { label: string; desc: string; color: string; icon: IconName } { const rejected = `Verification rejected. Remarks: ${String(profile?.remarks || 'Please re-verify.')}`; const map: Record<string, { label: string; desc: string; color: string; icon: IconName }> = { NOT_STARTED: { label: 'Aadhaar Identity Unverified', color: colors.danger, icon: 'close-circle', desc: 'Please verify your identity using DigiLocker to secure your account and unlock wallet withdrawals.' }, IN_PROGRESS: { label: 'Verification In Progress', color: '#f59e0b', icon: 'time', desc: 'You have started the DigiLocker verification flow. Please complete authentication.' }, PENDING: { label: 'Pending Admin Approval', color: '#f59e0b', icon: 'hourglass', desc: 'Aadhaar details retrieved successfully. Admin approval is pending.' }, VERIFIED: { label: 'Identity Verified', color: colors.success, icon: 'checkmark-circle', desc: 'Congratulations! Your identity is verified. Wallet withdrawals and limits are unlocked.' }, REJECTED: { label: 'Verification Rejected', color: colors.danger, icon: 'close-circle', desc: rejected } }; return map[status] || map.NOT_STARTED; }

const styles = StyleSheet.create({
  container: { paddingVertical: 16, paddingBottom: 38 }, title: { color: colors.text, fontSize: 28, fontWeight: '900', marginBottom: 6 }, smallTitle: { color: colors.text, fontSize: 20, fontWeight: '900', flex: 1 }, sub: { color: colors.textSecondary, lineHeight: 20, marginBottom: 14 }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }, headerTitle: { color: colors.text, fontWeight: '900', fontSize: 19 }, headerSub: { color: colors.textSecondary, fontWeight: '600', marginTop: 2, fontSize: 12 }, round: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, marginBottom: 12 }, searchInput: { flex: 1, height: 48, color: colors.text, fontWeight: '700' }, hrow: { gap: 10, paddingBottom: 14 }, chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface }, chipActive: { backgroundColor: colors.primary, borderColor: colors.primary }, chipText: { color: colors.textSecondary, fontWeight: '800' }, chipTextActive: { color: '#fff' }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, adsTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 }, points: { backgroundColor: colors.surfaceSoft, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' }, mini: { color: colors.muted, fontSize: 12, fontWeight: '800' }, pointValue: { color: colors.primary, fontSize: 18, fontWeight: '900' }, player: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border }, playerImg: { width: 110, height: 110, borderRadius: 55, marginBottom: 14 }, big: { color: colors.text, fontWeight: '900', fontSize: 23, marginTop: 8 }, progress: { width: '100%', height: 8, backgroundColor: colors.border, borderRadius: 99, overflow: 'hidden', marginVertical: 18 }, progressFill: { width: '78%', height: '100%', backgroundColor: colors.primary }, reward: { color: colors.primary, fontSize: 18, fontWeight: '900', marginBottom: 10 }, adCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 10, marginBottom: 12 }, adImg: { width: 72, height: 72, borderRadius: 14 }, orange: { color: colors.primary, fontWeight: '900' }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, play: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, hero: { backgroundColor: colors.primary, borderRadius: 28, padding: 22, marginBottom: 16 }, heroTag: { color: '#fff', fontSize: 12, fontWeight: '900', opacity: 0.9 }, heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 8 }, heroSub: { color: 'rgba(255,255,255,0.85)', lineHeight: 20, marginTop: 6 }, listCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 14, marginBottom: 12 }, colIcon: { width: 48, height: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, cardTitle: { color: colors.text, fontWeight: '900', fontSize: 15 }, cardSub: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginTop: 3 }, cardDesc: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }, businessHero: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 14 }, formCard: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14 }, formTitle: { color: colors.text, fontWeight: '900', fontSize: 17, marginBottom: 12 }, inputLabel: { color: colors.text, fontSize: 12, fontWeight: '900', marginBottom: 7, marginTop: 8 }, input: { minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: '#f8fafc', paddingHorizontal: 14, color: colors.text, fontWeight: '700', marginBottom: 8 }, err: { color: colors.danger, fontWeight: '700', marginTop: 6, marginBottom: 4 }, ok: { color: colors.success, fontWeight: '800', marginBottom: 10 }, badge: { color: colors.primary, fontWeight: '900', alignSelf: 'flex-start', backgroundColor: colors.surfaceSoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, marginBottom: 8 }, row: { flexDirection: 'row', gap: 10 }, readonly: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: '#f1f5f9', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }, readonlyText: { color: colors.textSecondary, fontWeight: '800' }, success: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border }, details: { width: '100%', backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 12, marginVertical: 12 }, detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 7 }, detailLabel: { color: colors.textSecondary, fontWeight: '700', textTransform: 'capitalize' }, detailValue: { color: colors.text, fontWeight: '900', flex: 1, textAlign: 'right' }, scanSafe: { flex: 1, backgroundColor: '#08111f' }, scanContainer: { padding: 16, paddingBottom: 36 }, scanFrame: { height: 430, borderRadius: 28, backgroundColor: '#000', borderWidth: 12, borderColor: '#111c2f', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }, scanText: { color: '#fff', fontWeight: '800', marginTop: 18 }, whiteCard: { backgroundColor: '#fff', borderRadius: 22, padding: 16 }, balance: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 26, padding: 20, marginBottom: 18 }, balanceLabel: { color: 'rgba(255,255,255,0.78)', fontWeight: '800' }, balanceAmount: { color: '#fff', fontSize: 30, fontWeight: '900', marginVertical: 6 }, balanceLink: { color: '#fff', fontWeight: '900' }, addMoney: { color: colors.primary, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, fontWeight: '900' }, cashback: { color: '#fff', fontSize: 12, fontWeight: '800', marginTop: 10 }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }, tile: { width: 96, minHeight: 92, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 10 }, tileActive: { backgroundColor: colors.primary, borderColor: colors.primary }, tileIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSoft, marginBottom: 8 }, tileText: { color: colors.text, fontWeight: '800', textAlign: 'center', fontSize: 11 }, rewardCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 12 }, scanPay: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 14, marginTop: 8 }, scanBtn: { width: 104, backgroundColor: colors.primary, borderRadius: 20, alignItems: 'center', justifyContent: 'center', padding: 12 }, scanBtnText: { color: '#fff', fontWeight: '900' }, foodCat: { alignItems: 'center', width: 78 }, emoji: { fontSize: 34 }, tripTab: { flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, alignItems: 'center', gap: 6 }, tripActive: { backgroundColor: colors.primary, borderColor: colors.primary }, tripText: { color: colors.text, fontWeight: '900' }, swap: { color: colors.primary, fontSize: 24, fontWeight: '900' }, line: { height: 1, backgroundColor: colors.border, marginVertical: 14 }, tripVal: { color: colors.text, fontWeight: '900', fontSize: 15 }, locationCard: { flexDirection: 'row', gap: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 14, marginBottom: 18 }, route: { alignItems: 'center', paddingTop: 34 }, vline: { width: 2, height: 64, backgroundColor: colors.border, marginVertical: 6 }, vehicle: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, marginBottom: 12 }, vehicleActive: { borderColor: colors.primary, backgroundColor: colors.surfaceSoft }, estimate: { color: colors.primary, fontSize: 28, fontWeight: '900', marginVertical: 6 }, pickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', paddingBottom: 12 }, pick: { width: '31%', minHeight: 100, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 8, marginBottom: 6 }, pickTitle: { color: colors.text, fontSize: 10, fontWeight: '900', textAlign: 'center', marginTop: 7 }, pickDesc: { color: colors.muted, fontSize: 8, fontWeight: '700', textAlign: 'center', marginTop: 2 }, promo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7ed', borderRadius: 24, borderWidth: 1, borderColor: '#ffedd5', padding: 18, marginVertical: 20 }, promoText: { color: colors.text, fontSize: 16, fontWeight: '800' }, promoBtn: { color: '#fff', backgroundColor: colors.primary, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, overflow: 'hidden', marginTop: 12, fontWeight: '900' }, promoBtnWrapper: { alignSelf: 'flex-start' }, popular: { width: 134, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 8 }, popularImg: { width: '100%', height: 82, borderRadius: 14, marginBottom: 8 }, metric: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, marginBottom: 12 }, kycStatus: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 5, padding: 14, marginBottom: 14 }, tabs: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 16, padding: 4, marginBottom: 14 }, tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 }, tabActive: { backgroundColor: colors.primary }, tabText: { color: colors.textSecondary, fontWeight: '900' }, tabTextActive: { color: '#fff' }, orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, marginBottom: 12 }, status: { color: colors.primary, backgroundColor: colors.surfaceSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontWeight: '900', overflow: 'hidden' },
  headerBannerNearMe: {
    backgroundColor: '#ff7a00',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6
  },
  headerTopRowNearMe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: Platform.OS === 'ios' ? 0 : 8
  },
  backButtonNearMe: {
    paddingRight: 4
  },
  headerTitleNearMe: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 22
  },
  headerSubNearMe: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginTop: 2
  },
  locationPillNearMe: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 4
  },
  locationPillTextNearMe: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1e293b',
    maxWidth: 70
  },
  bellButtonNearMe: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchBarContainerNearMe: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  searchBarInputNearMe: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600'
  },
  tabSwitcherNearMe: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 12,
    marginBottom: 24,
    marginHorizontal: 16,
    shadowColor: 'rgba(0,0,0,0.03)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1
  },
  tabSwitchBtnNearMe: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6
  },
  tabSwitchBtnActiveNearMe: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  tabSwitchTextNearMe: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b'
  },
  tabSwitchTextActiveNearMe: {
    color: '#ff7a00'
  },
  sectionHeaderTitleNearMe: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 16,
    marginBottom: 12
  },
  citiesRowNearMe: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4
  },
  cityCardNearMe: {
    flexDirection: 'column',
    alignItems: 'center',
    width: 85,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    shadowColor: 'rgba(0,0,0,0.02)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1
  },
  cityCardActiveNearMe: {
    borderColor: '#ff7a00',
    shadowColor: 'rgba(255, 122, 0, 0.08)',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3
  },
  activeCityBadgeNearMe: {
    backgroundColor: '#ff7a00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  activeCityBadgeTextNearMe: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff'
  },
  inactiveCityTextNearMe: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b'
  },
  categoriesRowNearMe: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 4
  },
  catItemNearMe: {
    alignItems: 'center',
    width: 68
  },
  catCircleNearMe: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.03)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 8
  },
  catTextNearMe: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center'
  },
  sectionHeaderRowNearMe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  viewAllTextNearMe: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ff7a00',
    marginRight: 16
  },
  popularRowNearMe: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4
  },
  popularAreaCardNearMe: {
    width: 130,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 8,
    shadowColor: 'rgba(0,0,0,0.02)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1
  },
  popularAreaImgNearMe: {
    width: '100%',
    height: 80,
    borderRadius: 14,
    marginBottom: 8
  },
  popularAreaTitleNearMe: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
    paddingHorizontal: 2
  },
  popularAreaDistNearMe: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b'
  },
  noListingsTextNearMe: {
    fontSize: 12,
    color: '#64748b',
    paddingVertical: 14,
    textAlign: 'center'
  },
  promoCouponCardNearMe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff9f5',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#ff9e44',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10
  },
  promoIconBgNearMe: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffefe0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  promoCouponTitleNearMe: {
    fontSize: 14,
    fontWeight: '800',
    color: '#c05600'
  },
  promoCouponSubtitleNearMe: {
    fontSize: 10,
    color: '#e06a00',
    fontWeight: '600',
    marginTop: 2
  },
  shopNowCouponBtnNearMe: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ffb080',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  shopNowCouponBtnTextNearMe: {
    color: '#ff7a00',
    fontSize: 11,
    fontWeight: '800'
  },
  mapFloatBtnNearMe: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5
  },
  mapFloatBtnTextNearMe: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800'
  },
  modalBackdropNearMe: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pincodeModalContentNearMe: {
    backgroundColor: '#fff',
    width: SCREEN_WIDTH * 0.85,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10
  },
  modalTitleNearMe: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 16
  },
  pincodeTextInputNearMe: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: '#f8fafc',
    marginBottom: 20
  },
  modalButtonRowNearMe: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  modalButtonNearMe: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 99
  },
  modalButtonCancelNearMe: {
    backgroundColor: '#f1f5f9'
  },
  modalButtonSaveNearMe: {
    backgroundColor: colors.primary
  },
  modalButtonTextCancelNearMe: {
    color: colors.textSecondary,
    fontWeight: '800',
    fontSize: 14
  },
  modalButtonTextSaveNearMe: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14
  },
  categoryHeaderRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  backCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text
  },
  categorySubTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700'
  },
  listCardItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    height: 120
  },
  listCardImage: {
    width: 120,
    height: 120,
    resizeMode: 'cover'
  },
  listCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between'
  },
  listCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b'
  },
  listCardShop: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4
  },
  listCardPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ff7a00'
  },
  bookNowBtn: {
    backgroundColor: '#ff7a00',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  bookNowBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800'
  },
});
