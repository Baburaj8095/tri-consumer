import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  Dimensions,
  Alert,
  StatusBar,
  Image,
  FlatList,
  TextInput,
} from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { zIndex } from '../../theme/zIndex';
import { shadows } from '../../theme/shadows';
import { responsive } from '../../theme/responsive';
import { iconSizes } from '../../theme/iconSizes';

import { useLocationStore } from '../../store/locationStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { getCurrentNativeLocation, getLocationFromPincode } from '../../services/locationService';
import { quickServices } from '../../constants/mockData';
import { StickySearch } from './StickySearch';
import { HomeNavigationCoordinator } from '../utils/HomeNavigationCoordinator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AppHeaderProps {
  navigation: any;
  coordinator: HomeNavigationCoordinator;
  scrollY: SharedValue<number>;
  headerAnimatedStyle: any;
  greetingAnimatedStyle: any;
  deliveryAnimatedStyle: any;
  servicesAnimatedStyle: any;
  searchAnimatedStyle: any;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  navigation,
  coordinator,
  scrollY,
  headerAnimatedStyle,
  greetingAnimatedStyle,
  deliveryAnimatedStyle,
  servicesAnimatedStyle,
  searchAnimatedStyle,
}) => {
  const { location, saveLocation, hydrate: hydrateLocation } = useLocationStore();
  const { cart, hydrate: hydrateCart } = useCartStore();
  const { user, logout } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pincodeModalOpen, setPincodeModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
  const profilePic = user?.profilePic || null;

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

  const hour = new Date().getHours();
  const greetingText = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Folding Curved Banner wrapper */}
      <Animated.View style={[styles.headerBanner, headerAnimatedStyle, { paddingTop: insets.top + spacing.xs }]}>
        
        {/* Expanded Top Area (Greeting + Profile + Icons) */}
        <Animated.View style={[styles.topRow, greetingAnimatedStyle]}>
          {/* Profile Click Target with 44x44 target bounding box */}
          <Pressable
            style={styles.avatarClickArea}
            onPress={() => setDrawerOpen(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Open Account Menu"
          >
            <View style={styles.avatarCircle}>
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={iconSizes.md} color={colors.primary} />
              )}
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={6} color="#fff" />
            </View>
          </Pressable>

          {/* User Greetings */}
          <View style={styles.greetingWrapper}>
            <Text style={styles.greetingKicker}>{greetingText}</Text>
            <Text style={styles.greetingName} numberOfLines={1}>{displayName}</Text>
          </View>

          {/* Right Header Navigation Icons */}
          <View style={styles.iconsRow}>
            <Pressable style={styles.iconButton} hitSlop={spacing.xs}>
              <Ionicons name="notifications-outline" size={iconSizes.md} color="#fff" />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={() => coordinator.goToService('Society')} hitSlop={spacing.xs}>
              <Ionicons name="chatbubble-ellipses-outline" size={iconSizes.md} color="#fff" />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={() => coordinator.goToCart()} hitSlop={spacing.xs}>
              <View>
                <Ionicons name="bag-handle-outline" size={iconSizes.md} color="#fff" />
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          </View>
        </Animated.View>

        {/* Expanded Location Bar */}
        <Animated.View style={[styles.deliveryContainer, deliveryAnimatedStyle]}>
          <Pressable
            onPress={() => setPincodeModalOpen(true)}
            style={styles.deliveryRow}
            accessibilityRole="button"
            accessibilityLabel={`Deliver to ${displayArea}, Pincode ${displayPincode}`}
          >
            <Ionicons name="location-outline" size={14} color="#ffd9cc" />
            <Text style={styles.deliveryLabel}>DELIVER TO </Text>
            <Text style={styles.deliveryValue} numberOfLines={1}>{displayArea}, {displayCity}</Text>
            <Ionicons name="chevron-down" size={14} color="#fff" style={{ marginLeft: 4 }} />
          </Pressable>
        </Animated.View>

        {/* Dynamic Sticky Search Bar */}
        <Animated.View style={[styles.searchWrapper, searchAnimatedStyle]}>
          <StickySearch
            query={searchQuery}
            onChangeQuery={(text) => {
              setSearchQuery(text);
              if (navigation.setParams) {
                // Keep search query consistent if screen handles it
              }
            }}
            onScanPress={() => coordinator.goToScanner()}
            onMicPress={() => Alert.alert('Voice Search', 'Voice recognition starting...')}
          />
        </Animated.View>

        {/* Quick Services Square Cards (Folds on Scroll Phase 2) */}
        <Animated.View style={[styles.servicesWrapper, servicesAnimatedStyle]}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesScroll}
            data={quickServices}
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => {
              const isRupee = item.label === 'Tri Pay';
              const iconName =
                item.label === 'Tri Zone' ? 'grid-outline' :
                item.label === 'Tri Eat' ? 'restaurant-outline' :
                item.label === 'Tri Drop' ? 'bicycle-outline' :
                item.label === 'Tri Trip' ? 'car-outline' :
                item.label === 'Nearby Stores' ? 'storefront-outline' : 'card-outline';

              return (
                <Pressable
                  style={styles.serviceCard}
                  onPress={() => coordinator.goToService(item.route)}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <View style={styles.serviceIconBg}>
                    {isRupee ? (
                      <Text style={styles.serviceRupee}>₹</Text>
                    ) : (
                      <Ionicons name={iconName as any} size={iconSizes.lg} color={colors.primary} />
                    )}
                  </View>
                  <Text style={styles.serviceLabel}>{item.label}</Text>
                </Pressable>
              );
            }}
          />
        </Animated.View>
      </Animated.View>

      {/* Pincode Modal */}
      <Modal animationType="fade" transparent={true} visible={pincodeModalOpen} onRequestClose={() => setPincodeModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPincodeModalOpen(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Deliver to PIN Code</Text>
            
            <Pressable
              style={styles.gpsButton}
              onPress={handleUseCurrentLocation}
              disabled={locating}
              accessibilityRole="button"
              accessibilityLabel="Use GPS coordinates"
            >
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={styles.gpsButtonText}>{locating ? 'Locating...' : 'Use current location'}</Text>
            </Pressable>

            <TextInput
              style={styles.pincodeInput}
              placeholder="Enter 6-digit PIN code"
              placeholderTextColor={colors.slate400}
              value={pincodeInput}
              onChangeText={setPincodeInput}
              keyboardType="number-pad"
              maxLength={6}
              accessibilityRole="text"
            />

            <View style={styles.modalButtons}>
              <Pressable style={[styles.btn, styles.btnCancel]} onPress={() => setPincodeModalOpen(false)}>
                <Text style={styles.btnTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnSave]} onPress={handleUpdatePincode}>
                <Text style={styles.btnTextSave}>{locating ? 'Saving...' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Slide-in Account Profile Drawer */}
      <Modal animationType="slide" transparent={true} visible={drawerOpen} onRequestClose={() => setDrawerOpen(false)}>
        <View style={styles.drawerBackdrop}>
          <Pressable style={styles.drawerDismiss} onPress={() => setDrawerOpen(false)} />
          <View style={styles.drawerContent}>
            
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Consumer Account</Text>
              <Pressable
                onPress={() => setDrawerOpen(false)}
                style={styles.closeDrawer}
                hitSlop={spacing.sm}
              >
                <Ionicons name="close" size={24} color={colors.slate800} />
              </Pressable>
            </View>

            {/* Profile Premium Orange Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileRow}>
                <View style={styles.drawerAvatar}>
                  <Ionicons name="person" size={iconSizes.xl} color={colors.primary} />
                  <View style={styles.drawerAvatarCamera}>
                    <Ionicons name="camera" size={10} color="#fff" />
                  </View>
                </View>
                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>{displayName}</Text>
                  <Text style={styles.profileKicker}>Prime Consumer Member</Text>
                  <View style={styles.kycBadge}>
                    <Ionicons name="warning" size={12} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.kycText}>KYC Unverified</Text>
                  </View>
                </View>
              </View>
              <Pressable
                onPress={() => { setDrawerOpen(false); coordinator.goToProfile(); }}
                style={styles.editProfileBtn}
              >
                <Text style={styles.editProfileText}>Edit Account / Settings →</Text>
              </Pressable>
            </View>

            {/* Wallet Metrics */}
            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <Text style={styles.metricValue}>{displayPincode}</Text>
                <Text style={styles.metricLabel}>Pin Code</Text>
              </View>
              <View style={styles.metricBox}>
                <Ionicons name="wallet-outline" size={20} color={colors.primary} />
                <Text style={styles.metricValue}>Rs. 1,828.34</Text>
                <Text style={styles.metricLabel}>Wallet</Text>
              </View>
            </View>

            {/* Quick Actions List */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickGrid}>
              <Pressable style={styles.quickCard} onPress={() => { setDrawerOpen(false); coordinator.goToOrders(); }}>
                <Ionicons name="bag-handle-outline" size={22} color={colors.primary} />
                <Text style={styles.quickTitle}>My Orders</Text>
                <Text style={styles.quickSub}>Track status</Text>
              </Pressable>
              <Pressable style={styles.quickCard} onPress={() => { setDrawerOpen(false); coordinator.goToKYC(); }}>
                <Ionicons name="person-outline" size={22} color={colors.primary} />
                <Text style={styles.quickTitle}>KYC Verify</Text>
                <Text style={styles.quickSub}>Upload docs</Text>
              </Pressable>
              <Pressable style={styles.quickCard} onPress={() => { setDrawerOpen(false); coordinator.goToGiftCards(); }}>
                <Ionicons name="gift-outline" size={22} color={colors.primary} />
                <Text style={styles.quickTitle}>Gift Cards</Text>
                <Text style={styles.quickSub}>Hubble coupons</Text>
              </Pressable>
            </View>

            {/* Support Info */}
            <Text style={styles.sectionTitle}>Account & Support</Text>
            <View style={styles.supportBox}>
              <Ionicons name="call-outline" size={18} color={colors.primary} style={styles.supportIcon} />
              <View>
                <Text style={styles.supportLabel}>Phone</Text>
                <Text style={styles.supportValue}>{displayPhone}</Text>
              </View>
            </View>

            <View style={styles.supportBox}>
              <Ionicons name="location-outline" size={18} color={colors.primary} style={styles.supportIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.supportLabel}>Location</Text>
                <Text style={styles.supportValue} numberOfLines={1}>{displayCity}, India</Text>
              </View>
            </View>

            {/* Logout Trigger */}
            <View style={styles.logoutContainer}>
              <Pressable
                style={styles.logoutBtn}
                onPress={async () => {
                  setDrawerOpen(false);
                  await logout();
                  navigation.replace('Login');
                }}
              >
                <Ionicons name="log-out-outline" size={18} color={colors.danger} style={{ marginRight: 6 }} />
                <Text style={styles.logoutText}>Logout</Text>
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    zIndex: zIndex.header,
  },
  headerBanner: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    paddingHorizontal: 16,
    ...shadows.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    height: 44,
  },
  avatarClickArea: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.round,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.slate800,
    borderRadius: radius.round,
    padding: 3,
    borderWidth: 1,
    borderColor: '#fff',
  },
  greetingWrapper: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  greetingKicker: {
    fontSize: 8.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.8,
  },
  greetingName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    marginTop: 1,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: colors.danger,
    borderRadius: radius.round,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },
  deliveryContainer: {
    height: 24,
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  deliveryValue: {
    fontSize: 12.5,
    color: '#fff',
    fontWeight: '800',
    flexShrink: 1,
  },
  searchWrapper: {
    marginBottom: spacing.sm,
    zIndex: zIndex.stickySearch,
  },
  servicesWrapper: {
    height: 90,
  },
  servicesScroll: {
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  serviceCard: {
    width: 90,
    height: 80,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    marginRight: 4,
    ...shadows.sm,
  },
  serviceIconBg: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  serviceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.slate800,
    textAlign: 'center',
  },
  serviceRupee: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 16,
  },
  
  // Modals Styling
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: SCREEN_WIDTH * 0.88,
    borderRadius: radius.xxl,
    padding: 24,
    ...shadows.xl,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.slate800,
    marginBottom: 20,
    textAlign: 'center',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandOrangeLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
  },
  gpsButtonText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  pincodeInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.slate200,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
    backgroundColor: colors.slate50,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: colors.slate100,
  },
  btnSave: {
    backgroundColor: colors.primary,
  },
  btnTextCancel: {
    color: colors.slate600,
    fontWeight: '800',
    fontSize: 14,
  },
  btnTextSave: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },

  // Slide-in Drawer Modal Styling
  drawerBackdrop: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    flexDirection: 'row',
  },
  drawerDismiss: {
    flex: 1,
  },
  drawerContent: {
    width: SCREEN_WIDTH * 0.82,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingHorizontal: 18,
    ...shadows.xl,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.slate800,
  },
  closeDrawer: {
    padding: spacing.xs,
  },
  profileCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: 16,
    marginVertical: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  drawerAvatarCamera: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.slate800,
    borderRadius: radius.round,
    padding: 3,
    borderWidth: 1,
    borderColor: '#fff',
  },
  profileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#fff',
  },
  profileKicker: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    fontWeight: '600',
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.round,
    marginTop: 4,
  },
  kycText: {
    color: '#fff',
    fontSize: 8.5,
    fontWeight: '900',
  },
  editProfileBtn: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  editProfileText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: radius.lg,
    padding: 10,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate800,
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.slate400,
    marginTop: 2,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.slate800,
    marginTop: 14,
    marginBottom: 8,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: radius.lg,
    padding: 10,
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.slate800,
    marginTop: 6,
  },
  quickSub: {
    fontSize: 10,
    color: colors.slate400,
    marginTop: 2,
    fontWeight: '600',
  },
  supportBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate50,
    borderRadius: radius.lg,
    padding: 10,
    marginVertical: 4,
  },
  supportIcon: {
    marginRight: 10,
  },
  supportLabel: {
    fontSize: 10,
    color: colors.slate400,
    fontWeight: '700',
  },
  supportValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.slate800,
    marginTop: 2,
  },
  logoutContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: radius.lg,
    paddingVertical: 10,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800',
  },
});
