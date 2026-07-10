import React from 'react';
import { View, Text, Pressable, Image, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SectionRegistry } from '../registry/SectionRegistry';
import { SectionTitle } from '../components/SectionTitle';
import { ProductCard } from '../components/ProductCard';
import { StoreCard } from '../components/StoreCard';
import { CategoryCard } from '../components/CategoryCard';
import {
  ProductCardSkeleton,
  StoreCardSkeleton,
  CategoryCardSkeleton,
  Skeleton,
} from '../components/Skeletons';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { iconSizes } from '../../theme/iconSizes';
import { AnalyticsService } from '../services/AnalyticsService';

// 1. SERVICES SECTION (Returns null because it is handled inside AppHeader)
const ServicesSection = () => null;

// 2. EXPLORE NEAR ME SECTION (OYO Inspired)
const ExploreNearMe = ({ coordinator }: any) => {
  const handlePress = () => {
    AnalyticsService.trackServiceClick('Explore Near Me');
    coordinator.goToService('NearMe');
  };

  return (
    <Pressable
      style={styles.exploreCard}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Explore Near Me: Find hotels, restaurants, shopping, and services around you"
    >
      <View style={styles.exploreIconBg}>
        <Ionicons name="compass-outline" size={24} color={colors.primary} />
      </View>
      <View style={styles.exploreTextContainer}>
        <Text style={styles.exploreTitle}>Explore Near Me</Text>
        <Text style={styles.exploreSubtitle}>
          Find hotels, restaurants, shopping and services around you
        </Text>
      </View>
      <View style={styles.exploreCta}>
        <Text style={styles.exploreCtaText}>Go</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.primary} />
      </View>
    </Pressable>
  );
};

// 3. LIVE DEALS SECTION
const LiveDeals = ({ content, coordinator }: any) => {
  const data = [
    { key: 'd1', bg: '#02524b', title: 'Home Upgrade Fest', label: 'Prime early access', discount: '40-70% OFF', extra: 'Combo price crash', status: 'HOT', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80', bullets: ['• 5% cashback unlocked', '• HDFC no-cost EMI', '• Prime doorstep setup'], btn: 'SHOP SETS' },
    { key: 'd2', bg: '#1e3a8a', title: 'Grocery Saver', label: 'Fresh drops', discount: 'Daily deals', extra: 'Flat 30% OFF', status: '', img: 'https://images.unsplash.com/photo-1543083505-590d222c2a2f?auto=format&fit=crop&w=300&q=80', bullets: ['• Rs. 99 Tri Coins cashback', '• UPI bonus offer', '• Prime 20-min slots'], btn: 'FILL BASKET' },
    { key: 'd3', bg: '#581c87', title: 'Style Carnival', label: 'Trending', discount: 'Min 50% OFF', extra: 'Buy 1 Get 1', status: '', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80', bullets: ['• Extra ₹500 coupon code', '• Free 2-day shipping', '• No-question returns'], btn: 'SHOP STYLE' }
  ];

  const flatListRef = React.useRef<FlatList>(null);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (data.length <= 1) return;
    const timer = setInterval(() => {
      const nextIndex = (index + 1) % data.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setIndex(nextIndex);
    }, 4000);
    return () => clearInterval(timer);
  }, [index, data.length]);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const itemWidth = 266; // 250 card width + 16 spacing
    const calculatedIndex = Math.round(contentOffset / itemWidth);
    if (calculatedIndex !== index && calculatedIndex >= 0 && calculatedIndex < data.length) {
      setIndex(calculatedIndex);
    }
  };

  return (
    <View style={styles.dealContainer}>
      <SectionTitle
        title="Live deals for you"
        subtitle="Fresh drops, bank offers and Prime perks"
        onAction={() => coordinator.goToService('Delivery')}
      />
      <FlatList
        ref={flatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dealsList}
        data={data}
        keyExtractor={item => item.key}
        onMomentumScrollEnd={handleScroll}
        getItemLayout={(data, idx) => ({
          length: 266,
          offset: 266 * idx,
          index: idx,
        })}
        renderItem={({ item }) => (
          <Pressable 
            style={[styles.dealCard, { backgroundColor: item.bg }]}
            onPress={() => {
              AnalyticsService.trackBannerClick(item.title);
              coordinator.goToService('Delivery');
            }}
          >
            <View style={styles.dealCardTop}>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>● LIVE NOW</Text>
              </View>
              {item.label ? (
                <View style={styles.dealTag}>
                  <Text style={styles.dealTagText}>{item.label}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.dealTitle}>{item.title}</Text>
            
            <View style={styles.dealImgWrap}>
              <Image source={{ uri: item.img }} style={styles.dealImg} />
            </View>

            <View style={styles.discountRow}>
              <View style={[styles.discountPill, styles.discountPillActive]}>
                <Text style={styles.discountPillText}>{item.discount}</Text>
              </View>
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>{item.extra}</Text>
              </View>
            </View>

            <Pressable style={styles.dealBtn} onPress={() => coordinator.goToService('Delivery')}>
              <Text style={styles.dealBtnText}>{item.btn}</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
};

// 4. GIFT CARDS SECTION
const GiftCards = ({ coordinator }: any) => {
  const data = [
    { name: 'Trikonekt Gift Card', bg: '#fff7ed', icon: 'gift', iconColor: colors.primaryDark },
    { name: 'Reliance', bg: '#eff6ff', icon: 'card', iconColor: '#2563eb' },
    { name: 'Amazon', bg: '#fef3c7', icon: 'logo-amazon', iconColor: '#d97706' },
    { name: 'JIO', bg: '#e0f2fe', icon: 'wifi', iconColor: '#0284c7' },
    { name: 'Jio Allstar', bg: '#fdf4ff', icon: 'star', iconColor: '#c084fc' }
  ];

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.giftCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.giftTitle}>Gift cards</Text>
          <Text style={styles.giftSubtitle}>Simple treats and partner rewards</Text>
        </View>
        <Pressable 
          style={styles.watchBtn} 
          onPress={() => Alert.alert('Watch Guide', 'Launching Gift Cards video guide...')}
          hitSlop={spacing.sm}
        >
          <Ionicons name="play-circle-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
          <Text style={styles.watchBtnText}>Watch</Text>
        </Pressable>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.giftScroll}
        data={data}
        keyExtractor={item => item.name}
        renderItem={({ item }) => (
          <Pressable 
            style={[styles.giftCard, { backgroundColor: item.bg }]}
            onPress={() => coordinator.goToGiftCards()}
          >
            <View style={styles.giftIconBg}>
              <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
            </View>
            <Text style={styles.giftCardName} numberOfLines={2}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

// 5. TRIADZ SECTION
const TriAdz = ({ coordinator }: any) => {
  const data = [
    { key: 'ad1', bg: '#4a044e', title: 'Brand Gift Adz', label: 'Hot Brand Offer', discount: 'Flat 40% OFF', extra: 'Free gift vouchers', status: 'HOT', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80', btn: 'GRAB NOW' },
    { key: 'ad2', bg: '#064e3b', title: 'Weekly Shopping', label: 'Trending', discount: 'Min 60% OFF', extra: 'Combo deals', status: '', img: 'https://images.unsplash.com/photo-1543083505-590d222c2a2f?auto=format&fit=crop&w=300&q=80', btn: 'SHOP NOW' }
  ];

  const flatListRef = React.useRef<FlatList>(null);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (data.length <= 1) return;
    const timer = setInterval(() => {
      const nextIndex = (index + 1) % data.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setIndex(nextIndex);
    }, 4000);
    return () => clearInterval(timer);
  }, [index, data.length]);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const itemWidth = 266; // 250 card width + 16 spacing
    const calculatedIndex = Math.round(contentOffset / itemWidth);
    if (calculatedIndex !== index && calculatedIndex >= 0 && calculatedIndex < data.length) {
      setIndex(calculatedIndex);
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <SectionTitle
        title="TriAdz Arena"
        subtitle="Fresh ads, brand deals and sponsored offers"
        onAction={() => coordinator.goToService('Ads')}
      />
      <FlatList
        ref={flatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dealsList}
        data={data}
        keyExtractor={item => item.key}
        onMomentumScrollEnd={handleScroll}
        getItemLayout={(data, idx) => ({
          length: 266,
          offset: 266 * idx,
          index: idx,
        })}
        renderItem={({ item }) => (
          <Pressable 
            style={[styles.dealCard, { backgroundColor: item.bg }]}
            onPress={() => coordinator.goToService('Ads')}
          >
            <View style={styles.dealCardTop}>
              <View style={[styles.liveBadge, { backgroundColor: '#f43f5e' }]}>
                <Text style={styles.liveBadgeText}>● SPONSORED</Text>
              </View>
              {item.label ? (
                <View style={styles.dealTag}>
                  <Text style={styles.dealTagText}>{item.label}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.dealTitle}>{item.title}</Text>
            
            <View style={styles.dealImgWrap}>
              <Image source={{ uri: item.img }} style={styles.dealImg} />
            </View>

            <View style={styles.discountRow}>
              <View style={[styles.discountPill, styles.discountPillActive]}>
                <Text style={styles.discountPillText}>{item.discount}</Text>
              </View>
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>{item.extra}</Text>
              </View>
            </View>

            <Pressable style={styles.dealBtn} onPress={() => coordinator.goToService('Ads')}>
              <Text style={styles.dealBtnText}>{item.btn}</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
};

// 6. FEATURES GRID SECTION (2x2)
const Features = ({ coordinator }: any) => {
  const data = [
    { title: 'Trizone Shopping', sub: 'Member-only finds', icon: 'grid-outline', route: 'TriZone' },
    { title: 'Delivery Tracking', sub: 'Follow your order', icon: 'airplane-outline', route: 'Delivery' },
    { title: 'Online Shopping', sub: 'Premium picks', icon: 'globe-outline', route: 'Delivery' },
    { title: 'Private Delivery Tracking', sub: 'Secure tracking', icon: 'shield-checkmark-outline', route: 'Delivery' }
  ];

  return (
    <View style={styles.gridContainer}>
      {data.map((item) => (
        <Pressable 
          key={item.title} 
          style={styles.gridCard} 
          onPress={() => coordinator.goToService(item.route)}
        >
          <View style={styles.gridIconBg}>
            <Ionicons name={item.icon as any} size={20} color={colors.primary} />
          </View>
          <Text style={styles.gridTitle}>{item.title}</Text>
          <Text style={styles.gridSub}>{item.sub}</Text>
        </Pressable>
      ))}
    </View>
  );
};

// 7. CATEGORIES SECTION
const Categories = ({ content, coordinator }: any) => {
  return (
    <View style={styles.sectionContainer}>
      <SectionTitle title="All Categories" />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
        data={content.categories}
        keyExtractor={item => item.name}
        renderItem={({ item }) => (
          <CategoryCard
            name={item.name}
            icon={item.icon}
            onPress={() => coordinator.goToService('Delivery')}
          />
        )}
      />
    </View>
  );
};

// 8. CASHBACK SECTION
const Cashback = ({ coordinator }: any) => {
  const data = [
    { title: 'Get 20% Cashback on electronics', percent: '10% CB', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80' },
    { title: 'Get 20% Cashback on beauty', percent: '20% CB', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=300&q=80' },
    { title: 'Get 15% Cashback on footwear', percent: '15% CB', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' }
  ];

  const flatListRef = React.useRef<FlatList>(null);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (data.length <= 1) return;
    const timer = setInterval(() => {
      const nextIndex = (index + 1) % data.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setIndex(nextIndex);
    }, 4000);
    return () => clearInterval(timer);
  }, [index, data.length]);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const itemWidth = 202; // 190 card width + 12 spacing
    const calculatedIndex = Math.round(contentOffset / itemWidth);
    if (calculatedIndex !== index && calculatedIndex >= 0 && calculatedIndex < data.length) {
      setIndex(calculatedIndex);
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <SectionTitle
        title="Cashback ads"
        subtitle="Warm offers from featured brands"
      />
      <FlatList
        ref={flatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dealsList}
        data={data}
        keyExtractor={(item, idx) => String(idx)}
        onMomentumScrollEnd={handleScroll}
        getItemLayout={(data, idx) => ({
          length: 202,
          offset: 202 * idx,
          index: idx,
        })}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.cashbackCard}
            onPress={() => coordinator.goToService('Ads')}
          >
            <Image source={{ uri: item.img }} style={styles.cashbackImg} />
            <View style={styles.cashbackBadge}>
              <Text style={styles.cashbackPercentText}>{item.percent}</Text>
            </View>
            <View style={styles.cashbackTextContainer}>
              <Text style={styles.cashbackCardTitle} numberOfLines={2}>{item.title}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
};

// 9. BANNERS SECTION
const Banners = ({ content, coordinator }: any) => {
  return (
    <View style={styles.bannersWrap}>
      {content.banners.map((item: any) => (
        <Pressable 
          key={item.id} 
          style={styles.bannerRow} 
          onPress={() => coordinator.goToService(item.route)}
        >
          <View style={styles.bannerIconBg}>
            <Ionicons name={item.icon as any} size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{item.title}</Text>
            <Text style={styles.bannerSubtitle}>{item.sub}</Text>
          </View>
          <Text style={styles.bannerCta}>{item.cta}</Text>
        </Pressable>
      ))}
    </View>
  );
};

// 10. VISITED PRODUCTS SECTION
const Visited = ({ content, coordinator }: any) => {
  return (
    <View style={styles.sectionContainer}>
      <SectionTitle
        title="Most visited products"
        subtitle="Trending choices based on daily visits"
        onAction={() => coordinator.goToService('Delivery')}
      />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
        data={content.products.slice(0, 3)}
        keyExtractor={item => `vis-${item.id}`}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => coordinator.goToProduct(item.id)}
          />
        )}
      />
    </View>
  );
};

// 11. CLOTHING DEALS SECTION
const Clothing = ({ content, coordinator }: any) => {
  return (
    <View style={styles.sectionContainer}>
      <SectionTitle
        title="Clothing Deals for You"
        subtitle="More compact deals from your catalogue"
      />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
        data={content.products}
        keyExtractor={item => `clot-${item.id}`}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => coordinator.goToProduct(item.id)}
          />
        )}
      />
    </View>
  );
};

// 12. NEARBY STORES SECTION
const Nearby = ({ content, coordinator }: any) => {
  return (
    <View style={styles.sectionContainer}>
      <SectionTitle
        title="Nearby Stores"
        subtitle="Top verified stores near you"
        onAction={() => coordinator.goToService('NearbyStores')}
      />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
        data={content.merchants}
        keyExtractor={item => `near-${item.id}`}
        renderItem={({ item }) => (
          <StoreCard
            store={item}
            onPress={() => coordinator.goToShop(item.id, 'nearby-delivery')}
          />
        )}
      />
    </View>
  );
};

// 13. PERSONALIZED DEALS SECTION
const Personalized = ({ content, coordinator }: any) => {
  const data = [
    { name: 'Noise Cancelling Headphones', match: '98% Match', discount: '40% OFF', price: 'Rs. 5,999', oldPrice: 'Rs. 9,999', bg: '#fef08a', img: 'https://images.unsplash.com/photo-15057404209288-5e560c06d30e?auto=format&fit=crop&w=300&q=80' },
    { name: 'Mechanical Gaming Keyboard', match: '95% Match', discount: '40% OFF', price: 'Rs. 3,899', oldPrice: 'Rs. 6,499', bg: '#e0f2fe', img: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=300&q=80' }
  ];

  return (
    <View style={[styles.sectionContainer, { marginBottom: 20 }]}>
      <SectionTitle
        title="Personalized Deals for You"
        subtitle="Tailored choices based on matches"
      />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
        data={data}
        keyExtractor={item => item.name}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.personalCard}
            onPress={() => coordinator.goToService('Delivery')}
          >
            <View style={[styles.personalImgBg, { backgroundColor: item.bg }]}>
              <Image source={{ uri: item.img }} style={styles.personalImg} />
              <View style={styles.personalMatchBadge}>
                <Text style={styles.personalMatchText}>{item.match}</Text>
              </View>
              <View style={styles.personalDiscountBadge}>
                <Text style={styles.personalDiscountText}>{item.discount}</Text>
              </View>
            </View>
            <View style={styles.personalBody}>
              <Text style={styles.personalName} numberOfLines={2}>{item.name}</Text>
              <View style={styles.personalPriceRow}>
                <Text style={styles.personalPrice}>{item.price}</Text>
                <Text style={styles.personalOldPrice}>{item.oldPrice}</Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
};

// ==========================================
// REGISTRATION INITIALIZATION
// ==========================================

SectionRegistry.registerSection('services', {
  component: ServicesSection,
});

SectionRegistry.registerSection('explore', {
  component: ExploreNearMe,
  skeleton: () => <Skeleton height={74} borderRadius={radius.lg} style={{ marginHorizontal: 16, marginVertical: 12 }} />,
});

SectionRegistry.registerSection('deals', {
  component: LiveDeals,
  skeleton: () => (
    <View>
      <Skeleton width="50%" height={16} style={{ marginHorizontal: 16, marginVertical: 12 }} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dealsList}
        data={[1, 2]}
        renderItem={() => <ProductCardSkeleton />}
      />
    </View>
  ),
});

SectionRegistry.registerSection('giftCards', {
  component: GiftCards,
});

SectionRegistry.registerSection('adz', {
  component: TriAdz,
});

SectionRegistry.registerSection('features', {
  component: Features,
});

SectionRegistry.registerSection('categories', {
  component: Categories,
  skeleton: () => (
    <View>
      <Skeleton width="40%" height={16} style={{ marginHorizontal: 16, marginVertical: 12 }} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
        data={[1, 2, 3, 4]}
        renderItem={() => <CategoryCardSkeleton />}
      />
    </View>
  ),
});

SectionRegistry.registerSection('cashback', {
  component: Cashback,
});

SectionRegistry.registerSection('banners', {
  component: Banners,
});

SectionRegistry.registerSection('visited', {
  component: Visited,
  skeleton: () => (
    <View>
      <Skeleton width="55%" height={16} style={{ marginHorizontal: 16, marginVertical: 12 }} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
        data={[1, 2]}
        renderItem={() => <ProductCardSkeleton />}
      />
    </View>
  ),
});

SectionRegistry.registerSection('clothing', {
  component: Clothing,
});

SectionRegistry.registerSection('nearby', {
  component: Nearby,
  skeleton: () => (
    <View>
      <Skeleton width="50%" height={16} style={{ marginHorizontal: 16, marginVertical: 12 }} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
        data={[1, 2]}
        renderItem={() => <StoreCardSkeleton />}
      />
    </View>
  ),
});

SectionRegistry.registerSection('personalized', {
  component: Personalized,
});

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: spacing.sm,
  },
  
  // Explore Near Me (OYO style)
  exploreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  exploreIconBg: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.brandOrangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreTextContainer: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },
  exploreTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.slate800,
  },
  exploreSubtitle: {
    fontSize: 10,
    color: colors.slate500,
    marginTop: 2,
    lineHeight: 14,
  },
  exploreCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandOrangeLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  exploreCtaText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
    marginRight: 2,
  },

  // Deals styling
  dealContainer: {
    marginTop: spacing.xs,
  },
  dealsList: {
    paddingLeft: spacing.md,
    paddingRight: 8,
    marginBottom: spacing.md,
  },
  dealCard: {
    width: 250,
    height: 380,
    borderRadius: radius.xxl,
    padding: 16,
    marginRight: 12,
    overflow: 'hidden',
    ...shadows.md,
  },
  dealCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },
  dealTag: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  dealTagText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },
  dealTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  dealImgWrap: {
    width: '100%',
    height: 140,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  dealImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  discountPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  discountPillActive: {
    backgroundColor: colors.brandGold,
  },
  discountPillText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  dealBtn: {
    backgroundColor: '#fff',
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  dealBtnText: {
    color: colors.slate900,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Gift Cards Styling
  giftCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: 12,
  },
  giftTitle: {
    fontSize: typography.subtitle,
    fontWeight: '900',
    color: colors.slate900,
  },
  giftSubtitle: {
    fontSize: typography.caption,
    color: colors.slate500,
    marginTop: 2,
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.slate200,
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    minHeight: 32,
  },
  watchBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  giftScroll: {
    paddingHorizontal: spacing.md,
    gap: 10,
    paddingBottom: 4,
  },
  giftCard: {
    width: 102,
    padding: 12,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftIconBg: {
    width: 36,
    height: 36,
    borderRadius: radius.round,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    ...shadows.sm,
  },
  giftCardName: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.slate700,
    textAlign: 'center',
    marginTop: 2,
  },

  // Grid Features layout (2x2)
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.slate200,
    padding: 12,
    ...shadows.sm,
  },
  gridIconBg: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: colors.brandOrangeLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.slate800,
  },
  gridSub: {
    fontSize: 9.5,
    color: colors.slate500,
    marginTop: 4,
  },

  // Category Scrolling list
  categoryScroll: {
    paddingHorizontal: spacing.md,
    gap: 12,
    paddingBottom: 4,
  },

  // Cashback card
  cashbackCard: {
    width: 190,
    height: 130,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.slate200,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  cashbackImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cashbackBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  cashbackPercentText: {
    color: '#fff',
    fontSize: 8.5,
    fontWeight: '900',
  },
  cashbackTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    padding: 8,
  },
  cashbackCardTitle: {
    color: '#fff',
    fontSize: 9.5,
    fontWeight: '800',
  },

  // Banners layout list
  bannersWrap: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.sm,
    gap: 10,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.slate200,
    borderRadius: radius.xl,
    padding: 12,
  },
  bannerIconBg: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.brandOrangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.slate800,
  },
  bannerSubtitle: {
    fontSize: 10.5,
    color: colors.slate500,
    marginTop: 2,
  },
  bannerCta: {
    color: '#fff',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
  },

  // Product scrolling lists
  horizontalScroll: {
    paddingHorizontal: spacing.md,
    gap: 12,
    paddingBottom: 4,
  },

  // Personalized Match card
  personalCard: {
    width: 170,
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.slate200,
    overflow: 'hidden',
    marginRight: 12,
    ...shadows.sm,
  },
  personalImgBg: {
    width: '100%',
    height: 110,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalImg: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },
  personalMatchBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#3b82f6',
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  personalMatchText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },
  personalDiscountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.danger,
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  personalDiscountText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },
  personalBody: {
    padding: 10,
  },
  personalName: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.slate800,
    minHeight: 32,
    lineHeight: 16,
  },
  personalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  personalPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.primary,
  },
  personalOldPrice: {
    fontSize: 9.5,
    color: colors.slate400,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
});
