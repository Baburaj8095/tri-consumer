import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { zIndex } from '../../theme/zIndex';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

// Import local files to trigger self-registration in SectionRegistry
import '../sections/HomeSections';

import { useHomeLayout } from '../hooks/useHomeLayout';
import { useHomeContent } from '../hooks/useHomeContent';
import { useHomeHeaderAnimation } from '../hooks/useHomeHeaderAnimation';
import { AppHeader } from '../components/AppHeader';
import { DynamicHomeRenderer } from '../renderer/DynamicHomeRenderer';
import { useHomeNavigation } from '../utils/HomeNavigationCoordinator';
import { AnalyticsService } from '../services/AnalyticsService';
import { LoadingScreen } from '../../screens/LoadingScreen';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as any;

export function ConsumerHomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'ConsumerHome'>) {
  const insets = useSafeAreaInsets();
  const coordinator = useHomeNavigation(navigation);
  
  // Compose hooks
  const { blocks, loading: layoutLoading, refreshing, refreshLayout } = useHomeLayout();
  const contentData = useHomeContent();
  const headerAnim = useHomeHeaderAnimation();

  // Track initial screen view analytics
  useEffect(() => {
    AnalyticsService.trackScreenViewed('ConsumerHome');
    AnalyticsService.trackOfflineUsage(false); // Assume online on boot
  }, []);

  const handleRefresh = async () => {
    AnalyticsService.trackCartAction('update', 'refresh', 1);
    await Promise.all([
      refreshLayout(),
      contentData.refreshContent(),
    ]);
  };

  if (layoutLoading) {
    return <LoadingScreen message="Loading premium experience..." />;
  }

  // Calculate top padding for ScrollView offset
  const contentPaddingTop = headerAnim.HEADER_MAX_HEIGHT;

  return (
    <View style={styles.container}>
      {/* Curved collapsing Reanimated 3 header */}
      <AppHeader
        navigation={navigation}
        coordinator={coordinator}
        scrollY={headerAnim.scrollY}
        headerAnimatedStyle={headerAnim.headerAnimatedStyle}
        greetingAnimatedStyle={headerAnim.greetingAnimatedStyle}
        deliveryAnimatedStyle={headerAnim.deliveryAnimatedStyle}
        servicesAnimatedStyle={headerAnim.servicesAnimatedStyle}
        searchAnimatedStyle={headerAnim.searchAnimatedStyle}
      />

      {/* Main vertical scrolling layout */}
      <AnimatedFlashList
        data={blocks}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <DynamicHomeRenderer
            blocks={[item]}
            contentData={contentData}
            navigation={navigation}
            coordinator={coordinator}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: contentPaddingTop, 
          paddingBottom: 90 + insets.bottom 
        }}
        scrollEventThrottle={16}
        onScroll={headerAnim.scrollHandler}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        estimatedItemSize={200}
      />

      {/* Custom Bottom Tab Bar Overlay */}
      <View style={[styles.bottomTabBar, { height: 60 + insets.bottom, paddingBottom: insets.bottom }]}>
        <Pressable style={styles.tabItem} accessibilityRole="tab" accessibilityState={{ selected: true }}>
          <Ionicons name="home" size={22} color={colors.primary} />
          <Text style={[styles.tabLabel, { color: colors.primary }]}>Home</Text>
        </Pressable>
        
        <Pressable 
          style={styles.tabItem} 
          onPress={() => coordinator.goToService('TriZone')}
          accessibilityRole="tab"
        >
          <Ionicons name="grid-outline" size={22} color={colors.slate500} />
          <Text style={styles.tabLabel}>Tri Zone</Text>
        </Pressable>
        
        <Pressable 
          style={styles.floatingScanner} 
          onPress={() => coordinator.goToScanner()}
          accessibilityRole="button"
          accessibilityLabel="Open Scanner"
        >
          <View style={styles.scannerCircle}>
            <Ionicons name="scan-outline" size={26} color="#fff" />
          </View>
        </Pressable>
        
        <Pressable 
          style={styles.tabItem} 
          onPress={() => coordinator.goToService('Delivery')}
          accessibilityRole="tab"
        >
          <Ionicons name="globe-outline" size={22} color={colors.slate500} />
          <Text style={styles.tabLabel}>Online</Text>
        </Pressable>
        
        <Pressable 
          style={styles.tabItem} 
          onPress={() => coordinator.goToService('NearbyStores')}
          accessibilityRole="tab"
        >
          <Ionicons name="location-outline" size={22} color={colors.slate500} />
          <Text style={styles.tabLabel}>Nearby</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1.5,
    borderTopColor: colors.slate100,
    zIndex: zIndex.bottomBar,
    paddingHorizontal: spacing.sm,
    ...shadows.lg,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    flex: 1,
    minHeight: 48, // Standard touch target height
  },
  tabLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.slate500,
    marginTop: 2,
  },
  floatingScanner: {
    width: 56,
    height: 56,
    marginTop: -28,
    zIndex: zIndex.bottomBar + 10,
  },
  scannerCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
});
