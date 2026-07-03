import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Platform,
  Dimensions,
  Alert,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useLocationStore } from '../store/locationStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { getCurrentNativeLocation, getLocationFromPincode } from '../services/locationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ConsumerHeaderProps {
  navigation: any;
  mode?: 'home' | 'compact';
  onSearch?: (query: string) => void;
  showBack?: boolean;
  title?: string;
  subtitle?: string;
}

export function ConsumerHeader({ 
  navigation, 
  mode = 'home', 
  onSearch, 
  showBack = false,
  title,
  subtitle
}: ConsumerHeaderProps) {
  const { location, saveLocation, hydrate: hydrateLocation } = useLocationStore();
  const { cart, hydrate: hydrateCart } = useCartStore();
  const { user, logout } = useAuthStore();

  // UI states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pincodeModalOpen, setPincodeModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    try {
      await saveLocation(await getLocationFromPincode(pincodeInput));
      setPincodeModalOpen(false);
    } catch (error) {
      Alert.alert('Location unavailable', error instanceof Error ? error.message : 'Unable to find this PIN code.');
    } finally {
      setLocating(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      await saveLocation(await getCurrentNativeLocation());
      setPincodeModalOpen(false);
    } catch (error) {
      Alert.alert('Location unavailable', error instanceof Error ? error.message : 'Unable to read your location.');
    } finally {
      setLocating(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  const hour = new Date().getHours();
  const greetingText = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  const isCompact = mode === 'compact';
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Curved Orange Header Section */}
      <View style={[styles.headerBanner, isCompact && styles.headerBannerCompact, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTopRow}>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
            {showBack && (
              <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </Pressable>
            )}

            {title ? (
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitleText} numberOfLines={1}>{title}</Text>
                {subtitle ? <Text style={styles.headerSubtitleText} numberOfLines={1}>{subtitle}</Text> : null}
              </View>
            ) : (
              <>
                {/* User Profile Avatar with Camera Icon */}
                <Pressable onPress={() => setDrawerOpen(true)} style={styles.avatarWrapper}>
                  <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.cameraBadge}>
                    <Ionicons name="camera" size={8} color="#fff" />
                  </View>
                </Pressable>

                {/* Greeting & Wallet Balance */}
                <View style={styles.greetingContainer}>
                  <Text style={styles.greetingKicker}>{greetingText}</Text>
                  <Text style={styles.greetingName} numberOfLines={1}>{displayName}</Text>
                </View>
              </>
            )}
          </View>

          {title ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable style={styles.headerLocationPill} onPress={() => setPincodeModalOpen(true)}>
                <Ionicons name="location" size={12} color={colors.primary} style={{ marginRight: 2 }} />
                <Text style={styles.headerLocationPillText} numberOfLines={1}>{displayCity}</Text>
                <Ionicons name="chevron-down" size={12} color="#475569" style={{ marginLeft: 2 }} />
              </Pressable>
              <Pressable style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={20} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <>

              {/* Header Icons */}
              <View style={styles.headerIconsRow}>
                <Pressable style={styles.iconButton}>
                  <Ionicons name="notifications-outline" size={20} color="#fff" />
                </Pressable>
                <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Society')}>
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                </Pressable>
                <Pressable style={styles.iconButton} onPress={() => navigation.navigate('ConsumerScanner')}>
                  <Ionicons name="scan-outline" size={20} color="#fff" />
                </Pressable>
                <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Cart')}>
                  <View>
                    <Ionicons name="bag-handle-outline" size={20} color="#fff" />
                    {cartCount > 0 && (
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{cartCount}</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              </View>
            </>
          )}
        </View>

        {/* Delivery Location Section */}
        {!title && (
          <Pressable onPress={() => setPincodeModalOpen(true)} style={styles.deliveryRow}>
            <Ionicons name="location-outline" size={14} color="#ffd9cc" />
            <Text style={styles.deliveryLabel}>DELIVER TO </Text>
            <Text style={styles.deliveryValue} numberOfLines={1}>{displayArea}, {displayCity}</Text>
            <Ionicons name="chevron-down" size={14} color="#fff" style={{ marginLeft: 4 }} />
          </Pressable>
        )}

        {/* Search bar & Join Prime button */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color={colors.muted} style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services, products & stores..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
            <Ionicons name="qr-code-outline" size={18} color={colors.muted} style={{ marginRight: 8 }} onPress={() => navigation.navigate('ConsumerScanner')} />
            <Ionicons name="mic-outline" size={18} color={colors.muted} />
          </View>

          {!isCompact && (
            <Pressable style={styles.joinPrimeButton} onPress={() => navigation.navigate('Society')}>
              <Ionicons name="ribbon-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.joinPrimeText}>Join Prime</Text>
            </Pressable>
          )}
        </View>

        {/* Quick Services Row (only in standard/home mode) */}
        {!isCompact && (
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
        )}
      </View>

      {/* Pincode Input Modal */}
      <Modal animationType="fade" transparent={true} visible={pincodeModalOpen} onRequestClose={() => setPincodeModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPincodeModalOpen(false)}>
          <View style={styles.pincodeModalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Deliver to PIN Code</Text>
            <Pressable style={styles.gpsButton} onPress={handleUseCurrentLocation} disabled={locating}>
              <Ionicons name="location-outline" size={18} color="#FF7A00" />
              <Text style={styles.gpsButtonText}>{locating ? 'Locating...' : 'Use current location'}</Text>
            </Pressable>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    zIndex: 100
  },
  backButton: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerBanner: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 38,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6
  },
  headerBannerCompact: {
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: Platform.OS === 'ios' ? 0 : 8
  },
  avatarWrapper: { position: 'relative' },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  cameraBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#334155', borderRadius: 99, padding: 3, borderWidth: 1, borderColor: '#fff' },
  greetingContainer: { flex: 1, marginLeft: 10 },
  greetingKicker: { fontSize: 8.5, fontWeight: '700', color: 'rgba(255, 255, 255, 0.75)', letterSpacing: 0.8 },
  greetingName: { fontSize: 14, fontWeight: '800', color: '#fff', marginTop: 1 },
  walletBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.22)', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 10, height: 32 },
  walletBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  headerIconsRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  iconButton: { padding: 4, marginLeft: 4, position: 'relative' },
  badgeContainer: { position: 'absolute', right: -2, top: -2, backgroundColor: colors.danger, borderRadius: 99, width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: 4 },
  deliveryLabel: { fontSize: 9.5, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 0.8 },
  deliveryValue: { fontSize: 12.5, color: '#fff', fontWeight: '800', flexShrink: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, height: 42, paddingHorizontal: 12, borderWidth: 1.5, borderColor: '#FF7A00' },
  searchInput: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '600' },
  joinPrimeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7ed', height: 42, borderRadius: 18, paddingHorizontal: 12, borderWidth: 1.5, borderColor: '#FF7A00', shadowColor: 'rgba(255, 122, 0, 0.1)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 1 },
  joinPrimeText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  servicesGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  serviceItem: { alignItems: 'center', width: '16.5%' },
  serviceCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  serviceIconRupee: { color: colors.primary, fontWeight: '800', fontSize: 18 },
  serviceLabel: { fontSize: 10, fontWeight: '800', color: '#ffffff', marginTop: 8, textAlign: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  pincodeModalContent: { backgroundColor: '#fff', width: SCREEN_WIDTH * 0.88, borderRadius: 28, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 20, textAlign: 'center' },
  gpsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff7ed', borderWidth: 1.5, borderColor: '#FF7A00', borderRadius: 16, paddingVertical: 14, marginBottom: 16, gap: 8 },
  gpsButtonText: { color: '#FF7A00', fontWeight: '800', fontSize: 15 },
  pincodeTextInput: { height: 54, borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 16, paddingHorizontal: 16, fontSize: 16, fontWeight: '700', color: colors.text, backgroundColor: '#f8fafc', marginBottom: 24, textAlign: 'center' },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalButton: { flex: 1, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalButtonCancel: { backgroundColor: '#f1f5f9' },
  modalButtonSave: { backgroundColor: '#FF7A00' },
  modalButtonTextCancel: { color: colors.textSecondary, fontWeight: '800', fontSize: 15 },
  modalButtonTextSave: { color: '#fff', fontWeight: '800', fontSize: 15 },
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
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginVertical: 12 },
  metricItemBox: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, alignItems: 'center', borderStyle: 'solid' },
  metricValue: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 6 },
  metricLabel: { fontSize: 11, color: colors.muted, marginTop: 2, fontWeight: '700' },
  drawerSectionTitle: { fontSize: 15, fontWeight: '900', color: colors.text, marginTop: 18, marginBottom: 8 },
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  quickActionCard: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12 },
  quickActionTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 8 },
  quickActionSubtitle: { fontSize: 11, color: colors.muted, marginTop: 2, fontWeight: '600' },
  supportInfoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, padding: 12, marginVertical: 4 },
  supportIcon: { marginRight: 12 },
  supportLabel: { fontSize: 11, color: colors.muted, fontWeight: '700' },
  supportValue: { fontSize: 13, fontWeight: '800', color: colors.text, marginTop: 2 },
  logoutButtonContainer: { flex: 1, justifyContent: 'flex-end', marginBottom: Platform.OS === 'ios' ? 24 : 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.22)', borderRadius: 16, paddingVertical: 12 },
  logoutButtonText: { color: colors.danger, fontSize: 15, fontWeight: '800' },
  headerTitleText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  headerSubtitleText: { fontSize: 11, color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 },
  headerLocationPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  headerLocationPillText: { fontSize: 11, fontWeight: '800', color: '#1e293b', maxWidth: 80 }
});
