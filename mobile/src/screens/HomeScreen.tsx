import React, { useState, useEffect } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { useLocationStore } from '../store/locationStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { products } from '../constants/mockData';
import { getCurrentNativeLocation, getLocationFromPincode } from '../services/locationService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const homeCategories = [
  ['Mobiles', 'phone-portrait-outline', 'Delivery'], ['Fashion', 'shirt-outline', 'Delivery'], ['Daily Needs', 'basket-outline', 'Delivery'],
  ['Electronics', 'laptop-outline', 'Delivery'], ['Home', 'home-outline', 'Delivery'], ['Beauty', 'sparkles-outline', 'Delivery'],
  ['Kids & Toys', 'game-controller-outline', 'Delivery'], ['More', 'grid-outline', 'TriZone'],
] as const;
const homeStores = [
  { id: 'hs1', name: 'Fresh Mart', category: 'Daily needs', area: 'Near you', icon: 'basket-outline' },
  { id: 'hs2', name: 'Style Street', category: 'Fashion', area: 'Near you', icon: 'shirt-outline' },
  { id: 'hs3', name: 'Digital World', category: 'Electronics', area: 'Near you', icon: 'phone-portrait-outline' },
] as const;

export function ConsumerHomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'ConsumerHome'>) {
  const { location, saveLocation, hydrate: hydrateLocation } = useLocationStore();
  const { cart, hydrate: hydrateCart } = useCartStore();
  const { user, logout } = useAuthStore();
  
  // UI states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pincodeModalOpen, setPincodeModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [locating, setLocating] = useState(false);
  
  // Hydrate stores on mount
  useEffect(() => {
    hydrateLocation();
    hydrateCart();
  }, []);

  const cartCount = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const displayPincode = location.pincode || '585103';
  const displayArea = location.area || 'Borabai Nagar';
  const displayCity = location.city || 'Kalaburagi';
  const displayName = user?.fullName || user?.full_name || 'Baburaj';
  const displayPhone = user?.mobile || '+91 8095918105';

  const handleUpdatePincode = async () => {
    if (pincodeInput.length !== 6 || isNaN(Number(pincodeInput))) {
      Alert.alert('Invalid PIN code', 'Please enter a valid 6-digit PIN code.');
      return;
    }
    setLocating(true);
    try { await saveLocation(await getLocationFromPincode(pincodeInput)); setPincodeModalOpen(false); }
    catch (error) { Alert.alert('Location unavailable', error instanceof Error ? error.message : 'Unable to find this PIN code.'); }
    finally { setLocating(false); }
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try { await saveLocation(await getCurrentNativeLocation()); setPincodeModalOpen(false); }
    catch (error) { Alert.alert('Location unavailable', error instanceof Error ? error.message : 'Unable to read your location.'); }
    finally { setLocating(false); }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: colors.primary, flex: 0 }} />
      <ScrollView style={styles.scrollStyle} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        
        {/* Curved Orange Header Section */}
        <View style={styles.headerBanner}>
          <View style={styles.headerTopRow}>
            {/* User Profile Avatar with Camera Icon */}
            <Pressable onPress={() => setDrawerOpen(true)} style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={24} color={colors.primary} />
              </View>
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={10} color="#fff" />
              </View>
            </Pressable>

            {/* Greeting & Wallet Balance */}
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingKicker}>GOOD AFTERNOON</Text>
              <Text style={styles.greetingName}>{displayName}</Text>
            </View>

            <View style={styles.walletBadge}>
              <Ionicons name="wallet-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.walletBadgeText}>₹ 1,828.34</Text>
            </View>

            {/* Header Icons */}
            <View style={styles.headerIconsRow}>
              <Pressable style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={22} color="#fff" />
              </Pressable>
              <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Society')}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
              </Pressable>
              <Pressable style={styles.iconButton} onPress={() => navigation.navigate('ConsumerScanner')}>
                <Ionicons name="scan-outline" size={22} color="#fff" />
              </Pressable>
              <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Cart')}>
                <View>
                  <Ionicons name="bag-handle-outline" size={22} color="#fff" />
                  {cartCount > 0 && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{cartCount}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
          </View>

          {/* Delivery Location Section */}
          <Pressable onPress={() => setPincodeModalOpen(true)} style={styles.deliveryRow}>
            <Ionicons name="location-outline" size={14} color="#ffd9cc" />
            <Text style={styles.deliveryLabel}>DELIVER TO </Text>
            <Text style={styles.deliveryValue}>{displayArea}, {displayCity}</Text>
            <Ionicons name="chevron-down" size={14} color="#fff" style={{ marginLeft: 4 }} />
          </Pressable>

          {/* Search bar & Join Prime button */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color={colors.muted} style={{ marginRight: 6 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search services, product..."
                placeholderTextColor={colors.muted}
              />
              <Ionicons name="qr-code-outline" size={18} color={colors.muted} style={{ marginRight: 8 }} />
              <Ionicons name="mic-outline" size={18} color={colors.muted} />
            </View>

            <Pressable style={styles.joinPrimeButton} onPress={() => navigation.navigate('Society')}>
              <Ionicons name="ribbon-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.joinPrimeText}>Join Prime</Text>
            </Pressable>
          </View>
        </View>

        {/* 6 Circular Services Grid */}
        <View style={styles.servicesGrid}>
          <Pressable style={styles.serviceItem} onPress={() => navigation.navigate('TriPay')}>
            <View style={styles.serviceCircle}>
              <Text style={styles.serviceIconRupee}>₹</Text>
            </View>
            <Text style={styles.serviceLabel}>Tri Pay</Text>
          </Pressable>

          <Pressable style={styles.serviceItem} onPress={() => navigation.navigate('TriZone')}>
            <View style={styles.serviceCircle}>
              <Ionicons name="grid-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.serviceLabel}>Tri Zone</Text>
          </Pressable>

          <Pressable style={styles.serviceItem} onPress={() => navigation.navigate('TriEat')}>
            <View style={styles.serviceCircle}>
              <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.serviceLabel}>Tri Eat</Text>
          </Pressable>

          <Pressable style={styles.serviceItem} onPress={() => navigation.navigate('TriPickDrop')}>
            <View style={styles.serviceCircle}>
              <Ionicons name="bicycle-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.serviceLabel}>Tri Drop</Text>
          </Pressable>

          <Pressable style={styles.serviceItem} onPress={() => navigation.navigate('TriTrip')}>
            <View style={styles.serviceCircle}>
              <Ionicons name="car-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.serviceLabel}>Travel</Text>
          </Pressable>

          <Pressable style={styles.serviceItem} onPress={() => navigation.navigate('NearbyStores')}>
            <View style={styles.serviceCircle}>
              <Ionicons name="storefront-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.serviceLabel}>Nearby</Text>
          </Pressable>
        </View>

        {/* Explore Near Me Section */}
        <Pressable style={styles.exploreNearMeCard} onPress={() => navigation.navigate('NearMe')}>
          <View style={styles.exploreCircleIcon}>
            <Ionicons name="compass-outline" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.exploreTitle}>Explore Near Me</Text>
            <Text style={styles.exploreSubtitle}>Find hotels, restaurants, shopping and services around you</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>

        {/* Live Deals Section */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Live deals for you</Text>
            <Text style={styles.sectionSubtitle}>Fresh drops, bank offers and Prime perks</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Delivery')}>
            <Text style={styles.viewAllText}>View all</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealsList}>
          {/* Card 1 */}
          <View style={[styles.dealCard, { backgroundColor: '#ffe6cc' }]}>
            <View style={styles.liveTag}><Text style={styles.liveTagText}>● LIVE NOW</Text></View>
            <Text style={styles.dealCountdown}>Ends in 02:18:44</Text>
            <Text style={styles.dealMainTitle}>Mega Mobile Rush</Text>
            <Text style={styles.dealSubText}>Up to 85% off</Text>
          </View>

          {/* Card 2 */}
          <View style={[styles.dealCard, { backgroundColor: '#f5ccff' }]}>
            <View style={styles.liveTag}><Text style={styles.liveTagText}>● LIVE NOW</Text></View>
            <Text style={styles.dealCountdown}>Trending</Text>
            <Text style={styles.dealMainTitle}>Fashion Drop</Text>
            <Text style={styles.dealSubText}>Min 50% off</Text>
          </View>

          {/* Card 3 */}
          <View style={[styles.dealCard, { backgroundColor: '#ccf2ff' }]}>
            <View style={styles.liveTag}><Text style={styles.liveTagText}>● LIVE NOW</Text></View>
            <Text style={styles.dealCountdown}>Ends Tonight</Text>
            <Text style={styles.dealMainTitle}>Smart Gadgets</Text>
            <Text style={styles.dealSubText}>Extra ₹1,500 off</Text>
          </View>
        </ScrollView>

        <HomeSection title="Gift Cards" subtitle="Shop, gift and earn rewards" action="View all" onAction={() => navigation.navigate('GiftCards')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSection}>
            {['All Gift Cards', 'Brand Gift Cards', 'Tri Vouchers', 'Rewards'].map((label, index) => <Pressable key={label} style={[styles.miniFeatureCard, { backgroundColor: ['#fff7ed', '#eff6ff', '#fdf4ff', '#ecfdf5'][index] }]} onPress={() => navigation.navigate('GiftCards')}><Ionicons name={index === 3 ? 'trophy-outline' : 'gift-outline'} size={26} color={colors.primary} /><Text style={styles.miniFeatureTitle}>{label}</Text></Pressable>)}
          </ScrollView>
        </HomeSection>

        <HomeSection title="TriAdz Arena" subtitle="Fresh ads, brand deals and sponsored offers" action="Explore" onAction={() => navigation.navigate('Ads')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSection}>
            {[['Watch & Earn', 'Earn points for every ad', '#172554'], ['Brand Rush', 'Limited-time sponsored offers', '#4c1d95'], ['Cashback Days', 'Extra rewards on purchases', '#064e3b']].map(([title, copy, color]) => <Pressable key={title} style={[styles.adArenaCard, { backgroundColor: color }]} onPress={() => navigation.navigate('Ads')}><Text style={styles.adArenaTag}>SPONSORED</Text><Text style={styles.adArenaTitle}>{title}</Text><Text style={styles.adArenaCopy}>{copy}</Text></Pressable>)}
          </ScrollView>
        </HomeSection>

        <HomeSection title="All Categories">
          <View style={styles.categoryGrid}>{homeCategories.map(([label, icon, route]) => <Pressable key={label} style={styles.categoryItem} onPress={() => navigation.navigate(route)}><View style={styles.categoryIcon}><Ionicons name={icon} size={23} color={colors.primary} /></View><Text style={styles.categoryLabel}>{label}</Text></Pressable>)}</View>
        </HomeSection>

        <View style={styles.cashbackBanner}><View style={{ flex: 1 }}><Text style={styles.cashbackEyebrow}>TRIKONEKT CASHBACK</Text><Text style={styles.cashbackTitle}>Shop more. Earn more.</Text><Text style={styles.cashbackCopy}>Unlock rewards across online and nearby shopping.</Text></View><Ionicons name="wallet-outline" size={54} color="#fff" /></View>

        <View style={styles.actionBannerWrap}>
          <Pressable style={styles.actionBanner} onPress={() => navigation.navigate('Society')}><View style={styles.actionIcon}><Ionicons name="people-outline" size={23} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.actionTitle}>For Better Society</Text><Text style={styles.actionCopy}>Join our community initiatives</Text></View><Text style={styles.actionCta}>Join</Text></Pressable>
          <Pressable style={styles.actionBanner} onPress={() => navigation.navigate('BusinessRegistration')}><View style={styles.actionIcon}><Ionicons name="storefront-outline" size={23} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.actionTitle}>List Your Business</Text><Text style={styles.actionCopy}>Grow with Trikonekt today</Text></View><Text style={styles.actionCta}>List Now</Text></Pressable>
        </View>

        <HomeSection title="Most visited products" subtitle="Trending choices based on daily visits" action="View all" onAction={() => navigation.navigate('Delivery')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSection}>{products.map(product => <HomeProduct key={`mv-${product.id}`} product={product} onPress={() => navigation.navigate('ProductDetails', { id: String(product.id) })} />)}</ScrollView>
        </HomeSection>

        <HomeSection title="Clothing Deals for You" subtitle="Compact deals from your catalogue">
          <View style={styles.compactProductGrid}>{products.map(product => <HomeProduct key={`cl-${product.id}`} product={product} compact onPress={() => navigation.navigate('ProductDetails', { id: String(product.id) })} />)}</View>
        </HomeSection>

        <HomeSection title="Nearby Stores" subtitle="Top verified stores near you" action="View all" onAction={() => navigation.navigate('NearbyStores')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSection}>{homeStores.map(store => <Pressable key={store.id} style={styles.homeStoreCard} onPress={() => navigation.navigate('NearbyStores')}><View style={styles.storeIcon}><Ionicons name={store.icon} size={30} color={colors.primary} /></View><Text style={styles.homeStoreTitle}>{store.name}</Text><Text style={styles.homeStoreCopy}>{store.category}</Text><Text style={styles.homeStoreArea}>{store.area}</Text></Pressable>)}</ScrollView>
        </HomeSection>

        <HomeSection title="Personalized Deals for You">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSection}>{products.slice().reverse().map(product => <HomeProduct key={`p-${product.id}`} product={product} badge="Best match" onPress={() => navigation.navigate('ProductDetails', { id: String(product.id) })} />)}</ScrollView>
        </HomeSection>

      </ScrollView>

      {/* Pincode Input Modal */}
      <Modal animationType="fade" transparent={true} visible={pincodeModalOpen} onRequestClose={() => setPincodeModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPincodeModalOpen(false)}>
          <View style={styles.pincodeModalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Deliver to PIN Code</Text>
            <Pressable style={[styles.modalButton, styles.modalButtonSave]} onPress={handleUseCurrentLocation} disabled={locating}><Text style={styles.modalButtonTextSave}>{locating ? 'Locating...' : 'Use current location'}</Text></Pressable>
            <TextInput
              style={styles.pincodeTextInput}
              placeholder="Enter 6-digit PIN code"
              placeholderTextColor={colors.muted}
              value={pincodeInput}
              onChangeText={setPincodeInput}
              keyboardType="number-pad"
              maxLength={6}
            />
            <View style={styles.modalButtonRow}>
              <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setPincodeModalOpen(false)}>
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.modalButtonSave]} onPress={handleUpdatePincode}>
                <Text style={styles.modalButtonTextSave}>{locating ? 'Saving...' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Slide-in Profile Drawer Modal */}
      <Modal animationType="slide" transparent={true} visible={drawerOpen} onRequestClose={() => setDrawerOpen(false)}>
        <View style={styles.drawerBackdrop}>
          <Pressable style={styles.drawerDismissArea} onPress={() => setDrawerOpen(false)} />
          <View style={styles.drawerContent}>
            
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerHeaderText}>Consumer Account</Text>
              <Pressable onPress={() => setDrawerOpen(false)} style={styles.closeDrawerButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            {/* Profile Orange Card */}
            <View style={styles.profileOrangeCard}>
              <View style={styles.profileAvatarRow}>
                <View style={styles.drawerAvatarCircle}>
                  <Ionicons name="person" size={32} color={colors.primary} />
                  <View style={styles.drawerCameraBadge}>
                    <Ionicons name="camera" size={10} color="#fff" />
                  </View>
                </View>
                <View style={styles.drawerProfileInfo}>
                  <Text style={styles.drawerProfileName}>{displayName}</Text>
                  <Text style={styles.drawerProfileRole}>Prime Consumer Member</Text>
                  <View style={styles.kycBadge}>
                    <Ionicons name="warning" size={12} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.kycBadgeText}>KYC Unverified</Text>
                  </View>
                </View>
              </View>
              <Pressable onPress={() => { setDrawerOpen(false); navigation.navigate('Profile'); }} style={styles.editProfileButton}>
                <Text style={styles.editProfileText}>Edit Account / Settings →</Text>
              </Pressable>
            </View>

            {/* Key Metrics Cards Row */}
            <View style={styles.metricsRow}>
              <View style={styles.metricItemBox}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <Text style={styles.metricValue}>{displayPincode}</Text>
                <Text style={styles.metricLabel}>Pin Code</Text>
              </View>
              <View style={styles.metricItemBox}>
                <Ionicons name="wallet-outline" size={20} color={colors.primary} />
                <Text style={styles.metricValue}>Rs. 1,828.34</Text>
                <Text style={styles.metricLabel}>Wallet</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.drawerSectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <Pressable style={styles.quickActionCard} onPress={() => { setDrawerOpen(false); navigation.navigate('MyOrders'); }}>
                <Ionicons name="bag-handle-outline" size={22} color={colors.primary} />
                <Text style={styles.quickActionTitle}>My Orders</Text>
                <Text style={styles.quickActionSubtitle}>Track purchases</Text>
              </Pressable>
              
              <Pressable style={styles.quickActionCard} onPress={() => { setDrawerOpen(false); navigation.navigate('ConsumerKYC'); }}>
                <Ionicons name="person-outline" size={22} color={colors.primary} />
                <Text style={styles.quickActionTitle}>KYC Verify</Text>
                <Text style={styles.quickActionSubtitle}>Aadhaar & Payout</Text>
              </Pressable>
              <Pressable style={styles.quickActionCard} onPress={() => { setDrawerOpen(false); navigation.navigate('GiftCards'); }}>
                <Ionicons name="gift-outline" size={22} color={colors.primary} />
                <Text style={styles.quickActionTitle}>Gift Cards</Text>
                <Text style={styles.quickActionSubtitle}>Shop with Hubble</Text>
              </Pressable>
            </View>

            {/* Account & Support Info */}
            <Text style={styles.drawerSectionTitle}>Account & Support</Text>
            
            <View style={styles.supportInfoItem}>
              <Ionicons name="call-outline" size={18} color={colors.primary} style={styles.supportIcon} />
              <View>
                <Text style={styles.supportLabel}>Phone</Text>
                <Text style={styles.supportValue}>{displayPhone}</Text>
              </View>
            </View>

            <View style={styles.supportInfoItem}>
              <Ionicons name="location-outline" size={18} color={colors.primary} style={styles.supportIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.supportLabel}>Location</Text>
                <Text style={styles.supportValue}>{displayCity}, {location.state || 'Karnataka'}, India</Text>
              </View>
            </View>

            {/* Logout Button */}
            <View style={styles.logoutButtonContainer}>
              <Pressable
                style={styles.logoutButton}
                onPress={async () => {
                  setDrawerOpen(false);
                  await logout();
                  navigation.replace('Login');
                }}
              >
                <Ionicons name="log-out-outline" size={18} color={colors.danger} style={{ marginRight: 6 }} />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>

      {/* Custom Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        <Pressable style={styles.tabItem}>
          <Ionicons name="home" size={22} color={colors.primary} />
          <Text style={[styles.tabLabel, { color: colors.primary }]}>Home</Text>
        </Pressable>

        <Pressable style={styles.tabItem} onPress={() => navigation.navigate('TriZone')}>
          <Ionicons name="grid-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.tabLabel}>Tri Zone</Text>
        </Pressable>

        {/* Floating Scanner Button */}
        <Pressable style={styles.floatingScanner} onPress={() => navigation.navigate('ConsumerScanner')}>
          <View style={styles.scannerCircle}>
            <Ionicons name="scan-outline" size={28} color="#fff" />
          </View>
        </Pressable>

        <Pressable style={styles.tabItem} onPress={() => navigation.navigate('Delivery')}>
          <Ionicons name="globe-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.tabLabel}>Online</Text>
        </Pressable>

        <Pressable style={styles.tabItem} onPress={() => navigation.navigate('NearbyStores')}>
          <Ionicons name="location-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.tabLabel}>Nearby</Text>
        </Pressable>
      </View>

    </View>
  );
}

function HomeSection({ title, subtitle, action, onAction, children }: React.PropsWithChildren<{ title: string; subtitle?: string; action?: string; onAction?: () => void }>) {
  return <View style={styles.homeSection}><View style={styles.homeSectionHeader}><View style={{ flex: 1 }}><Text style={styles.sectionTitle}>{title}</Text>{subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}</View>{action ? <Pressable onPress={onAction}><Text style={styles.viewAllText}>{action}</Text></Pressable> : null}</View>{children}</View>;
}

function HomeProduct({ product, compact, badge, onPress }: { product: typeof products[number]; compact?: boolean; badge?: string; onPress: () => void }) {
  return <Pressable style={[styles.homeProductCard, compact && styles.homeProductCompact]} onPress={onPress}><View><Image source={{ uri: product.image }} style={[styles.homeProductImage, compact && styles.homeProductImageCompact]} />{badge ? <Text style={styles.productBadge}>{badge}</Text> : null}<Text style={styles.discountBadge}>{product.discount}</Text></View><Text style={styles.homeProductName} numberOfLines={2}>{product.name}</Text><View style={styles.homePriceRow}><Text style={styles.homeNewPrice}>{product.newPrice}</Text><Text style={styles.homeOldPrice}>{product.oldPrice}</Text></View><Text style={styles.amazonDelivery}>FREE Delivery</Text></Pressable>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  scrollStyle: { flex: 1 },
  
  // Orange curved header
  headerBanner: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: Platform.OS === 'ios' ? 0 : 8
  },
  
  // Avatar Circle
  avatarWrapper: { position: 'relative' },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  cameraBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#334155', borderRadius: 99, padding: 3, borderWidth: 1, borderColor: '#fff' },
  
  // Greeting
  greetingContainer: { flex: 1, marginLeft: 12 },
  greetingKicker: { fontSize: 10, fontWeight: '700', color: 'rgba(255, 255, 255, 0.75)', letterSpacing: 0.5 },
  greetingName: { fontSize: 17, fontWeight: '800', color: '#fff', marginTop: 1 },
  
  // Wallet
  walletBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.22)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 99 },
  walletBadgeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  
  // Header icons
  headerIconsRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  iconButton: { padding: 5, marginLeft: 4, position: 'relative' },
  badgeContainer: { position: 'absolute', right: -2, top: -2, backgroundColor: colors.danger, borderRadius: 99, width: 15, height: 15, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  
  // Delivery Row
  deliveryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  deliveryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '700' },
  deliveryValue: { fontSize: 13, color: '#fff', fontWeight: '800' },
  
  // Search row & search input
  searchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, height: 46, paddingHorizontal: 12 },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' },
  joinPrimeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', height: 46, borderRadius: 14, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ffd9cc' },
  joinPrimeText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  
  // Circular services grid
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginVertical: 20 },
  serviceItem: { width: '31%', alignItems: 'center', marginBottom: 16 },
  serviceCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  serviceIconRupee: { color: colors.primary, fontWeight: '800', fontSize: 24 },
  serviceLabel: { fontSize: 12, fontWeight: '800', color: colors.text, marginTop: 8 },
  
  // Explore Near Me banner card
  exploreNearMeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  exploreCircleIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  exploreTitle: { fontSize: 15, fontWeight: '900', color: colors.text },
  exploreSubtitle: { fontSize: 11, color: colors.textSecondary, marginTop: 2, lineHeight: 15 },
  
  // Live deals section header
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
  sectionSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  viewAllText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  
  // Deals cards list
  dealsList: { paddingLeft: 16, paddingRight: 8, marginBottom: 20 },
  dealCard: { width: 220, height: 160, borderRadius: 24, padding: 16, marginRight: 12, justifyContent: 'flex-end', position: 'relative', overflow: 'hidden' },
  liveTag: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.22)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 99 },
  liveTagText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  dealCountdown: { color: 'rgba(0,0,0,0.45)', fontSize: 11, fontWeight: '800', position: 'absolute', top: 14, right: 16 },
  dealMainTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b' },
  dealSubText: { fontSize: 13, fontWeight: '800', color: '#475569', marginTop: 2 },
  homeSection: { backgroundColor: '#fff', marginHorizontal: 10, marginBottom: 14, borderRadius: 18, paddingVertical: 16, borderWidth: 1, borderColor: '#edf0f3' },
  homeSectionHeader: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 14, marginBottom: 12 },
  horizontalSection: { paddingHorizontal: 14, gap: 12 },
  miniFeatureCard: { width: 126, minHeight: 104, borderRadius: 16, padding: 14, justifyContent: 'space-between', borderWidth: 1, borderColor: '#eef2f7' },
  miniFeatureTitle: { color: colors.text, fontWeight: '900', fontSize: 13, marginTop: 12 },
  adArenaCard: { width: 230, height: 132, borderRadius: 18, padding: 16, justifyContent: 'flex-end' },
  adArenaTag: { position: 'absolute', top: 14, left: 14, color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  adArenaTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  adArenaCopy: { color: 'rgba(255,255,255,0.76)', fontSize: 12, fontWeight: '700', marginTop: 4 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  categoryItem: { width: '25%', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 3 },
  categoryIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffedd5' },
  categoryLabel: { color: colors.text, fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 7 },
  cashbackBanner: { marginHorizontal: 10, marginBottom: 14, borderRadius: 20, padding: 18, backgroundColor: '#0f766e', flexDirection: 'row', alignItems: 'center' },
  cashbackEyebrow: { color: '#99f6e4', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 }, cashbackTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 5 }, cashbackCopy: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4, maxWidth: 240 },
  actionBannerWrap: { marginHorizontal: 10, marginBottom: 14, gap: 10 },
  actionBanner: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center' }, actionTitle: { color: colors.text, fontWeight: '900', fontSize: 15 }, actionCopy: { color: colors.textSecondary, fontSize: 12, marginTop: 3 }, actionCta: { color: colors.primary, fontWeight: '900', fontSize: 12 },
  homeProductCard: { width: 168, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', padding: 9 },
  homeProductCompact: { width: '48.4%', marginBottom: 10 }, compactProductGrid: { paddingHorizontal: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  homeProductImage: { width: '100%', height: 142, borderRadius: 10, backgroundColor: '#f3f4f6' }, homeProductImageCompact: { height: 124 },
  productBadge: { position: 'absolute', top: 7, left: 7, color: '#fff', backgroundColor: '#7c3aed', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, overflow: 'hidden', fontSize: 9, fontWeight: '900' },
  discountBadge: { position: 'absolute', bottom: 7, left: 7, color: '#fff', backgroundColor: '#dc2626', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, overflow: 'hidden', fontSize: 9, fontWeight: '900' },
  homeProductName: { color: colors.text, fontWeight: '700', fontSize: 13, lineHeight: 18, minHeight: 36, marginTop: 8 }, homePriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }, homeNewPrice: { color: colors.text, fontWeight: '900', fontSize: 15 }, homeOldPrice: { color: colors.muted, textDecorationLine: 'line-through', fontSize: 11 }, amazonDelivery: { color: '#007600', fontWeight: '800', fontSize: 10, marginTop: 5 },
  homeStoreCard: { width: 186, borderRadius: 16, padding: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' }, storeIcon: { height: 88, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }, homeStoreTitle: { color: colors.text, fontSize: 15, fontWeight: '900' }, homeStoreCopy: { color: colors.textSecondary, fontSize: 11, marginTop: 3 }, homeStoreArea: { color: colors.primary, fontSize: 10, fontWeight: '800', marginTop: 8 },
  
  // Modal Backdrop
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  pincodeModalContent: { backgroundColor: '#fff', width: SCREEN_WIDTH * 0.85, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.text, marginBottom: 16 },
  pincodeTextInput: { height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 16, fontSize: 16, fontWeight: '700', color: colors.text, backgroundColor: '#f8fafc', marginBottom: 20 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 99 },
  modalButtonCancel: { backgroundColor: '#f1f5f9' },
  modalButtonSave: { backgroundColor: colors.primary },
  modalButtonTextCancel: { color: colors.textSecondary, fontWeight: '800', fontSize: 14 },
  modalButtonTextSave: { color: '#fff', fontWeight: '800', fontSize: 14 },
  
  // Drawer sheet
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row' },
  drawerDismissArea: { flex: 1 },
  drawerContent: {
    width: SCREEN_WIDTH * 0.82,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8
  },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  drawerHeaderText: { fontSize: 19, fontWeight: '900', color: colors.text },
  closeDrawerButton: { padding: 4 },
  
  // Orange Profile Card inside Drawer
  profileOrangeCard: { backgroundColor: colors.primary, borderRadius: 24, padding: 18, marginVertical: 10 },
  profileAvatarRow: { flexDirection: 'row', alignItems: 'center' },
  drawerAvatarCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  drawerCameraBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#334155', borderRadius: 99, padding: 3, borderWidth: 1, borderColor: '#fff' },
  drawerProfileInfo: { marginLeft: 14, flex: 1 },
  drawerProfileName: { fontSize: 19, fontWeight: '900', color: '#fff' },
  drawerProfileRole: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontWeight: '600' },
  kycBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.danger, alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 99, marginTop: 6 },
  kycBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  editProfileButton: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)' },
  editProfileText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  
  // Key Metrics
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginVertical: 12 },
  metricItemBox: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, alignItems: 'center', borderStyle: 'solid' },
  metricValue: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 6 },
  metricLabel: { fontSize: 11, color: colors.muted, marginTop: 2, fontWeight: '700' },
  
  // Drawer Typography sections
  drawerSectionTitle: { fontSize: 15, fontWeight: '900', color: colors.text, marginTop: 18, marginBottom: 8 },
  
  // Quick Actions cards
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  quickActionCard: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12 },
  quickActionTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 8 },
  quickActionSubtitle: { fontSize: 11, color: colors.muted, marginTop: 2, fontWeight: '600' },
  
  // Support Info
  supportInfoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, padding: 12, marginVertical: 4 },
  supportIcon: { marginRight: 12 },
  supportLabel: { fontSize: 11, color: colors.muted, fontWeight: '700' },
  supportValue: { fontSize: 13, fontWeight: '800', color: colors.text, marginTop: 2 },
  
  // Logout Button
  logoutButtonContainer: { flex: 1, justifyContent: 'flex-end', marginBottom: Platform.OS === 'ios' ? 24 : 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.22)', borderRadius: 16, paddingVertical: 12 },
  logoutButtonText: { color: colors.danger, fontSize: 15, fontWeight: '800' },

  // Bottom navigation tab bar
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
    zIndex: 10
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', paddingVertical: 6, flex: 1 },
  tabLabel: { fontSize: 10, fontWeight: '800', color: colors.textSecondary, marginTop: 4 },
  
  // Center floating scanner
  floatingScanner: { width: 56, height: 56, marginTop: -24, zIndex: 11 },
  scannerCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 6 }
});
