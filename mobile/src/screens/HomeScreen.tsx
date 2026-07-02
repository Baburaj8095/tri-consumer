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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ConsumerHomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'ConsumerHome'>) {
  const { location, saveLocation, hydrate: hydrateLocation } = useLocationStore();
  const { cart, hydrate: hydrateCart } = useCartStore();
  const { user, logout } = useAuthStore();
  
  // UI states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pincodeModalOpen, setPincodeModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  
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
    await saveLocation({
      lat: 17.3297, // Kalaburagi coordinates approx
      lng: 76.8343,
      area: 'Borabai Nagar',
      city: 'Kalaburagi',
      state: 'Karnataka',
      country: 'India',
      pincode: pincodeInput,
      formattedAddress: `Borabai Nagar, Kalaburagi, Karnataka, India`,
    });
    setPincodeModalOpen(false);
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

      </ScrollView>

      {/* Pincode Input Modal */}
      <Modal animationType="fade" transparent={true} visible={pincodeModalOpen} onRequestClose={() => setPincodeModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPincodeModalOpen(false)}>
          <View style={styles.pincodeModalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Deliver to PIN Code</Text>
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
                <Text style={styles.modalButtonTextSave}>Save</Text>
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