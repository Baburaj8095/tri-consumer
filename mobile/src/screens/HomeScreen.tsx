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
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { useLocationStore } from '../store/locationStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { products } from '../constants/mockData';
import { ConsumerHeader } from '../components/ConsumerHeader';

type IconName = keyof typeof Ionicons.glyphMap;

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
  const { hydrate: hydrateLocation } = useLocationStore();
  const { hydrate: hydrateCart } = useCartStore();
  
  // Hydrate stores on mount
  useEffect(() => {
    hydrateLocation();
    hydrateCart();
  }, []);

  return (
    <View style={styles.container}>
      <ConsumerHeader navigation={navigation} mode="home" />
      <ScrollView style={styles.scrollStyle} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>

        {/* Section 1: Explore Near Me Section */}
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

        {/* Section 2: Live Deals Section */}
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
          <View style={[styles.dealCard, { backgroundColor: '#02524b' }]}>
            <View style={styles.dealCardTop}>
              <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>● LIVE NOW</Text></View>
              <View style={styles.dealTag}><Text style={styles.dealTagText}>Prime early access</Text></View>
            </View>
            <Text style={styles.dealTitle}>Home Upgrade Fest</Text>
            <View style={styles.discountRow}>
              <View style={[styles.discountPill, styles.discountPillActive]}><Text style={styles.discountPillText}>40-70% OFF</Text></View>
              <View style={styles.discountPill}><Text style={styles.discountPillText}>Combo price crash</Text></View>
              <View style={[styles.discountPill, { backgroundColor: '#ef4444' }]}><Text style={styles.discountPillText}>HOT</Text></View>
            </View>
            <View style={styles.dealImgContainer}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80' }} style={styles.dealImg} />
            </View>
            <View style={styles.bulletContainer}>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• 5% cashback unlocked</Text></View>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• HDFC no-cost EMI</Text></View>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• Prime doorstep setup</Text></View>
            </View>
            <Pressable style={styles.dealBtn} onPress={() => navigation.navigate('Delivery')}>
              <Text style={styles.dealBtnText}>SHOP SETS</Text>
            </Pressable>
          </View>
          <View style={[styles.dealCard, { backgroundColor: '#1e3a8a' }]}>
            <View style={styles.dealCardTop}>
              <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>● LIVE NOW</Text></View>
              <View style={styles.dealTag}><Text style={styles.dealTagText}>Fresh drops</Text></View>
            </View>
            <Text style={styles.dealTitle}>Grocery Saver</Text>
            <View style={styles.discountRow}>
              <View style={[styles.discountPill, styles.discountPillActive]}><Text style={styles.discountPillText}>Daily deals</Text></View>
              <View style={styles.discountPill}><Text style={styles.discountPillText}>Flat 30% OFF</Text></View>
            </View>
            <View style={styles.dealImgContainer}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1543083505-590d222c2a2f?auto=format&fit=crop&w=300&q=80' }} style={styles.dealImg} />
            </View>
            <View style={styles.bulletContainer}>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• Rs. 99 Tri Coins cashback</Text></View>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• UPI bonus offer</Text></View>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• Prime 20-min slots</Text></View>
            </View>
            <Pressable style={styles.dealBtn} onPress={() => navigation.navigate('Delivery')}>
              <Text style={styles.dealBtnText}>FILL BASKET</Text>
            </Pressable>
          </View>
          <View style={[styles.dealCard, { backgroundColor: '#581c87' }]}>
            <View style={styles.dealCardTop}>
              <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>● LIVE NOW</Text></View>
              <View style={styles.dealTag}><Text style={styles.dealTagText}>Trending</Text></View>
            </View>
            <Text style={styles.dealTitle}>Style Carnival</Text>
            <View style={styles.discountRow}>
              <View style={[styles.discountPill, styles.discountPillActive]}><Text style={styles.discountPillText}>Min 50% OFF</Text></View>
              <View style={styles.discountPill}><Text style={styles.discountPillText}>Buy 1 Get 1</Text></View>
            </View>
            <View style={styles.dealImgContainer}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' }} style={styles.dealImg} />
            </View>
            <View style={styles.bulletContainer}>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• Extra ₹500 coupon code</Text></View>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• Free 2-day shipping</Text></View>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• No-question returns</Text></View>
            </View>
            <Pressable style={styles.dealBtn} onPress={() => navigation.navigate('Delivery')}>
              <Text style={styles.dealBtnText}>SHOP STYLE</Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Section 3: Gift Cards Section */}
        <View style={styles.giftCardSectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Gift cards</Text>
            <Text style={styles.sectionSubtitle}>Simple treats and partner rewards</Text>
          </View>
          <Pressable style={styles.watchBtn} onPress={() => Alert.alert('Watch', 'Opening gift cards video guide...')}>
            <Ionicons name="play-circle-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.watchBtnText}>Watch</Text>
          </Pressable>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.giftCardsScroll}>
          {[
            { name: 'Trikonekt Gift Card', bg: '#fff7ed', icon: 'gift', iconColor: '#ea580c' },
            { name: 'Reliance', bg: '#eff6ff', icon: 'card', iconColor: '#2563eb' },
            { name: 'Amazon', bg: '#fef3c7', icon: 'logo-amazon', iconColor: '#d97706' },
            { name: 'JIO', bg: '#e0f2fe', icon: 'wifi', iconColor: '#0284c7' },
            { name: 'Jio Allstar', bg: '#fdf4ff', icon: 'star', iconColor: '#c084fc' }
          ].map((g) => (
            <Pressable key={g.name} style={[styles.giftBrandCard, { backgroundColor: g.bg }]} onPress={() => navigation.navigate('GiftCards')}>
              <View style={styles.giftBrandIconBg}>
                <Ionicons name={g.icon as IconName} size={22} color={g.iconColor} />
              </View>
              <Text style={styles.giftBrandName} numberOfLines={2}>{g.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Section 4: TriAdz Arena Section */}
        <View style={styles.giftCardSectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>TriAdz Arena</Text>
            <Text style={styles.sectionSubtitle}>Fresh ads, brand deals and sponsored offers</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Ads')}>
            <Text style={styles.viewAllText}>View all</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealsList}>
          <View style={[styles.dealCard, { backgroundColor: '#4a044e' }]}>
            <View style={styles.dealCardTop}>
              <View style={[styles.liveBadge, { backgroundColor: '#f43f5e' }]}><Text style={styles.liveBadgeText}>● LIVE NOW</Text></View>
              <View style={styles.dealTag}><Text style={styles.dealTagText}>Hot Brand Offer</Text></View>
            </View>
            <Text style={styles.dealTitle}>Brand Gift Adz</Text>
            <View style={styles.discountRow}>
              <View style={[styles.discountPill, styles.discountPillActive]}><Text style={styles.discountPillText}>Flat 40% OFF</Text></View>
              <View style={styles.discountPill}><Text style={styles.discountPillText}>Free gift vouchers</Text></View>
              <View style={[styles.discountPill, { backgroundColor: '#ef4444' }]}><Text style={styles.discountPillText}>HOT</Text></View>
            </View>
            <View style={styles.dealImgContainer}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' }} style={styles.dealImg} />
            </View>
            <View style={styles.bulletContainer}>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• Rs. 500 flat cashback</Text></View>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• Verified merchant check</Text></View>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• No min purchase value</Text></View>
            </View>
            <Pressable style={styles.dealBtn} onPress={() => navigation.navigate('Ads')}>
              <Text style={styles.dealBtnText}>GRAB NOW</Text>
            </Pressable>
          </View>
          <View style={[styles.dealCard, { backgroundColor: '#064e3b' }]}>
            <View style={styles.dealCardTop}>
              <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>● LIVE NOW</Text></View>
              <View style={styles.dealTag}><Text style={styles.dealTagText}>Trending</Text></View>
            </View>
            <Text style={styles.dealTitle}>Weekly Shopping</Text>
            <View style={styles.discountRow}>
              <View style={[styles.discountPill, styles.discountPillActive]}><Text style={styles.discountPillText}>Min 60% OFF</Text></View>
              <View style={styles.discountPill}><Text style={styles.discountPillText}>Combo deals</Text></View>
            </View>
            <View style={styles.dealImgContainer}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1543083505-590d222c2a2f?auto=format&fit=crop&w=300&q=80' }} style={styles.dealImg} />
            </View>
            <View style={styles.bulletContainer}>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• Double Tri Coins active</Text></View>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• Free doorstep delivery</Text></View>
              <View style={styles.bulletPill}><Text style={styles.bulletText}>• HDFC credit card offer</Text></View>
            </View>
            <Pressable style={styles.dealBtn} onPress={() => navigation.navigate('Delivery')}>
              <Text style={styles.dealBtnText}>SHOP NOW</Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Section 5: Features 2x2 Grid Section */}
        <View style={styles.featuresGrid}>
          {[
            { title: 'Trizone Shopping', sub: 'Member-only finds', icon: 'grid-outline', route: 'TriZone' },
            { title: 'Delivery Tracking', sub: 'Follow your order', icon: 'airplane-outline', route: 'Delivery' },
            { title: 'Online Shopping', sub: 'Premium picks', icon: 'globe-outline', route: 'Delivery' },
            { title: 'Private Delivery Tracking', sub: 'Secure tracking', icon: 'shield-checkmark-outline', route: 'Delivery' }
          ].map((f) => (
            <Pressable key={f.title} style={styles.featureGridCard} onPress={() => navigation.navigate(f.route as never)}>
              <View style={styles.featureGridIconBg}>
                <Ionicons name={f.icon as IconName} size={20} color={colors.primary} />
              </View>
              <Text style={styles.featureGridTitle}>{f.title}</Text>
              <Text style={styles.featureGridSub}>{f.sub}</Text>
            </Pressable>
          ))}
        </View>

        {/* Section 6: All Categories Section */}
        <View style={styles.categorySectionHeader}>
          <Text style={styles.sectionTitle}>All Categories</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {[
            { name: 'Daily Needs', icon: 'basket-outline' },
            { name: 'Mobiles', icon: 'phone-portrait-outline' },
            { name: 'Fashion', icon: 'shirt-outline' },
            { name: 'Furniture', icon: 'home-outline' },
            { name: 'Beauty', icon: 'sparkles-outline' }
          ].map((c) => (
            <Pressable key={c.name} style={styles.categoryScrollItem} onPress={() => navigation.navigate('Delivery')}>
              <View style={styles.categoryScrollIconBg}>
                <Ionicons name={c.icon as IconName} size={22} color={colors.primary} />
              </View>
              <Text style={styles.categoryScrollLabel}>{c.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Section 7: Cashback Ads Section */}
        <View style={styles.giftCardSectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Cashback ads</Text>
            <Text style={styles.sectionSubtitle}>Warm offers from featured brands</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealsList}>
          {[
            { title: 'Get 20% Cashback on electronics', percent: '10% CB', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80' },
            { title: 'Get 20% Cashback on beauty', percent: '20% CB', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=300&q=80' },
            { title: 'Get 15% Cashback on footwear', percent: '15% CB', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' }
          ].map((ad, idx) => (
            <Pressable key={idx} style={styles.cashbackAdCard} onPress={() => navigation.navigate('Ads')}>
              <Image source={{ uri: ad.img }} style={styles.cashbackAdImg} />
              <View style={styles.cashbackAdPercentBadge}>
                <Text style={styles.cashbackAdPercentText}>{ad.percent}</Text>
              </View>
              <View style={styles.cashbackAdTextContainer}>
                <Text style={styles.cashbackAdTitle} numberOfLines={2}>{ad.title}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Section 8: Action Banners Section */}
        <View style={styles.actionBannerWrap}>
          <Pressable style={styles.actionBanner} onPress={() => navigation.navigate('Society')}>
            <View style={styles.actionIcon}>
              <Ionicons name="people-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>For Better Society</Text>
              <Text style={styles.actionCopy}>Join our community initiatives</Text>
            </View>
            <Text style={styles.actionCta}>Join</Text>
          </Pressable>
          
          <Pressable style={styles.actionBanner} onPress={() => navigation.navigate('BusinessRegistration')}>
            <View style={styles.actionIcon}>
              <Ionicons name="storefront-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>List Your Business</Text>
              <Text style={styles.actionCopy}>Grow with Trikonekt today</Text>
            </View>
            <Text style={styles.actionCta}>List Now</Text>
          </Pressable>
        </View>

        {/* Section 9: Most Visited Products Section */}
        <HomeSection title="Most visited products" subtitle="Trending choices based on daily visits" action="View all" onAction={() => navigation.navigate('Delivery')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSection}>
            {products.slice(0, 3).map(product => (
              <HomeProduct 
                key={`mv-${product.id}`} 
                product={product} 
                onPress={() => navigation.navigate('ProductDetails', { id: String(product.id) })} 
              />
            ))}
          </ScrollView>
        </HomeSection>

        {/* Section 10: Clothing Deals for You Section */}
        <HomeSection title="Clothing Deals for You" subtitle="More compact deals from your catalogue">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSection}>
            {products.map(product => (
              <HomeProduct 
                key={`cl-${product.id}`} 
                product={product} 
                onPress={() => navigation.navigate('ProductDetails', { id: String(product.id) })} 
              />
            ))}
          </ScrollView>
        </HomeSection>

        {/* Section 11: Nearby Stores Section */}
        <View style={styles.giftCardSectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Nearby Stores</Text>
            <Text style={styles.sectionSubtitle}>Top verified stores near you</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('NearbyStores')}>
            <Text style={styles.viewAllText}>View all</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSection}>
          {[
            { name: 'Poornima Store', dist: '0.0 KM Away', rate: '4.5', cat: 'Health & Medical', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80' },
            { name: 'Kanta medical', dist: '3.2 KM Away', rate: '4.2', cat: 'Health & Medical', img: 'https://images.unsplash.com/photo-1607619056574-7b8f304b3b8a?auto=format&fit=crop&w=300&q=80' }
          ].map((store, idx) => (
            <Pressable key={idx} style={styles.webStoreCard} onPress={() => navigation.navigate('ShopDetails', { id: store.name.toLowerCase().includes('poornima') ? '39' : '40', mode: 'nearby-delivery' })}>
              <Image source={{ uri: store.img }} style={styles.webStoreImg} />
              <View style={styles.webStoreDistBadge}>
                <Text style={styles.webStoreDistText}>{store.dist}</Text>
              </View>
              <View style={styles.webStoreBody}>
                <View style={styles.webStoreTitleRow}>
                  <Text style={styles.webStoreTitle} numberOfLines={1}>{store.name}</Text>
                  <View style={styles.webStoreRatingBadge}>
                    <Ionicons name="star" size={10} color="#fff" />
                    <Text style={styles.webStoreRatingText}>{store.rate}</Text>
                  </View>
                </View>
                
                <Text style={styles.webStoreCat}>{store.cat}</Text>
                
                <View style={styles.webStoreOpenRow}>
                  <View style={styles.greenDot} />
                  <Text style={styles.webStoreOpenText}>Open now</Text>
                  <Text style={styles.webStoreLoc}> • Kalaburagi</Text>
                </View>
                
                <View style={styles.webStoreCashbackBadge}>
                  <Text style={styles.webStoreCashbackText}>5% Cashback</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Section 12: Personalized Deals for You Section */}
        <View style={styles.giftCardSectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Personalized Deals for You</Text>
            <Text style={styles.sectionSubtitle}>Tailored choices based on matches</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSection}>
          {[
            { name: 'Noise Cancelling Headphones', match: '98% Match', discount: '40% OFF', price: 'Rs. 5,999', oldPrice: 'Rs. 9,999', bg: '#fef08a', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80' },
            { name: 'Mechanical Gaming Keyboard', match: '95% Match', discount: '40% OFF', price: 'Rs. 3,899', oldPrice: 'Rs. 6,499', bg: '#e0f2fe', img: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=300&q=80' }
          ].map((p, idx) => (
            <Pressable key={idx} style={styles.personalizedCard} onPress={() => navigation.navigate('Delivery')}>
              <View style={[styles.personalizedImgContainer, { backgroundColor: p.bg }]}>
                <Image source={{ uri: p.img }} style={styles.personalizedImg} />
                <View style={styles.personalizedMatchBadge}>
                  <Text style={styles.personalizedMatchText}>{p.match}</Text>
                </View>
                <View style={styles.personalizedDiscountBadge}>
                  <Text style={styles.personalizedDiscountText}>{p.discount}</Text>
                </View>
              </View>
              <View style={styles.personalizedBody}>
                <Text style={styles.personalizedTitle} numberOfLines={2}>{p.name}</Text>
                <View style={styles.homePriceRow}>
                  <Text style={styles.homeNewPrice}>{p.price}</Text>
                  <Text style={styles.homeOldPrice}>{p.oldPrice}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

      </ScrollView>

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
  return (
    <View style={styles.homeSection}>
      <View style={styles.homeSectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
        </View>
        {action ? <Pressable onPress={onAction}><Text style={styles.viewAllText}>{action}</Text></Pressable> : null}
      </View>
      {children}
    </View>
  );
}

function HomeProduct({ product, compact, badge, onPress }: { product: typeof products[number]; compact?: boolean; badge?: string; onPress: () => void }) {
  const addProduct = useCartStore(state => state.addProduct);
  
  const ratingMap: Record<number, string> = {
    1: '4.4 (1.2K)',
    2: '4.3 (897)',
    3: '4.6 (567)',
    4: '4.5 (342)',
  };
  const ratingText = ratingMap[product.id] || '4.3 (120)';

  return (
    <Pressable style={styles.homeProductCard} onPress={onPress}>
      <View style={styles.homeProductImageContainer}>
        <Image source={{ uri: product.image }} style={styles.homeProductImage} />
        <View style={styles.homeProductDiscountBadge}>
          <Text style={styles.homeProductDiscountText}>{product.discount || '40% OFF'}</Text>
        </View>
      </View>
      
      <View style={styles.homeProductBody}>
        <Text style={styles.homeProductName} numberOfLines={2}>{product.name}</Text>
        
        <View style={styles.homePriceRow}>
          <Text style={styles.homeNewPrice}>{product.newPrice}</Text>
          <Text style={styles.homeOldPrice}>{product.oldPrice}</Text>
        </View>

        <View style={styles.homeProductRatingRow}>
          <View style={styles.homeProductStars}>
            <Ionicons name="star" size={11} color="#f59e0b" style={{ marginRight: 2 }} />
            <Text style={styles.homeProductRatingText}>{ratingText}</Text>
          </View>
          
          <Pressable 
            style={styles.homeProductCartBtn} 
            onPress={() => {
              void addProduct({
                id: product.id,
                title: product.name,
                price: parseFloat(product.newPrice.replace(/[^0-9.]/g, '')),
                image: product.image
              });
              Alert.alert('Success', `${product.name} added to cart!`);
            }}
          >
            <Ionicons name="cart-outline" size={12} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  scrollStyle: { flex: 1 },
  
  // Header Styles
  exploreNearMeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 16, marginBottom: 20 },
  exploreCircleIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  exploreTitle: { fontSize: 15, fontWeight: '900', color: colors.text },
  exploreSubtitle: { fontSize: 11, color: colors.textSecondary, marginTop: 2, lineHeight: 15 },
  
  // Section Headers
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
  sectionSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  viewAllText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  
  // Deals scrolling vertical cards
  dealsList: { paddingLeft: 16, paddingRight: 8, marginBottom: 20 },
  dealCard: { width: 250, height: 440, borderRadius: 28, padding: 18, marginRight: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  dealCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#22c55e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  liveBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  dealTag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dealTagText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  dealTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 8 },
  discountRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 14 },
  discountPill: { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  discountPillActive: { backgroundColor: '#f59e0b' },
  discountPillText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  dealImgContainer: { width: '100%', height: 110, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 14, overflow: 'hidden' },
  dealImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  bulletContainer: { gap: 6, marginBottom: 16 },
  bulletPill: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 10, paddingVertical: 5, paddingHorizontal: 10 },
  bulletText: { color: '#1e293b', fontSize: 10, fontWeight: '800' },
  dealBtn: { backgroundColor: '#1e293b', borderRadius: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  dealBtnText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },

  // Gift Cards Styles
  giftCardSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },
  watchBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#fff' },
  watchBtnText: { fontSize: 11, fontWeight: '800', color: colors.primary },
  giftCardsScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  giftBrandCard: { width: 102, padding: 12, borderRadius: 18, borderWidth: 1.5, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  giftBrandIconBg: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 8, shadowColor: 'rgba(0,0,0,0.03)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 1 },
  giftBrandName: { fontSize: 10, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginTop: 2 },

  // Trizone/Delivery grid (2x2)
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, marginTop: 24, marginBottom: 12, justifyContent: 'space-between' },
  featureGridCard: { width: '48%', backgroundColor: '#fff', borderRadius: 20, borderWidth: 1.5, borderColor: '#e2e8f0', padding: 14, shadowColor: 'rgba(0,0,0,0.02)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 1 },
  featureGridIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featureGridTitle: { fontSize: 13, fontWeight: '900', color: '#1e293b' },
  featureGridSub: { fontSize: 10, color: '#64748b', marginTop: 4 },

  // All Categories Scroll styles
  categorySectionHeader: { paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },
  categoriesScroll: { paddingHorizontal: 16, gap: 14, paddingBottom: 4 },
  categoryScrollItem: { alignItems: 'center', width: 72 },
  categoryScrollIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#ff7a00', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  categoryScrollLabel: { fontSize: 10, fontWeight: '800', color: '#334155', textAlign: 'center' },

  // Cashback Ads Section
  cashbackAdCard: { width: 190, height: 130, borderRadius: 20, borderWidth: 1.5, borderColor: '#e2e8f0', overflow: 'hidden', marginRight: 14, position: 'relative' },
  cashbackAdImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  cashbackAdPercentBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#ea580c', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, zIndex: 1 },
  cashbackAdPercentText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  cashbackAdTextContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8 },
  cashbackAdTitle: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // HomeSection general styles
  homeSection: { backgroundColor: '#fff', marginHorizontal: 10, marginBottom: 14, borderRadius: 18, paddingVertical: 16, borderWidth: 1, borderColor: '#edf0f3' },
  homeSectionHeader: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 14, marginBottom: 12 },
  horizontalSection: { paddingHorizontal: 14, gap: 12 },

  // Redesigned Home Product Card
  homeProductCard: { width: 154, backgroundColor: '#fff', borderRadius: 22, borderWidth: 1.5, borderColor: '#e2e8f0', overflow: 'hidden', marginRight: 12 },
  homeProductImageContainer: { width: '100%', height: 110, position: 'relative', backgroundColor: '#f8fafc' },
  homeProductImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  homeProductDiscountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#ff7a00', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, zIndex: 1 },
  homeProductDiscountText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  homeProductBody: { padding: 10 },
  homeProductName: { fontSize: 12, fontWeight: '800', color: '#1e293b', minHeight: 32, lineHeight: 16 },
  homePriceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  homeNewPrice: { fontSize: 13, fontWeight: '900', color: '#ff7a00' },
  homeOldPrice: { fontSize: 10, color: '#64748b', textDecorationLine: 'line-through', marginLeft: 4 },
  homeProductRatingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  homeProductStars: { flexDirection: 'row', alignItems: 'center' },
  homeProductRatingText: { fontSize: 9, fontWeight: '700', color: '#64748b' },
  homeProductCartBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#ff7a00', alignItems: 'center', justifyContent: 'center' },

  // Action Banners Styles
  actionBannerWrap: { paddingHorizontal: 10, marginBottom: 14, gap: 10 },
  actionBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 20, padding: 14 },
  actionIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: 14, fontWeight: '900', color: '#1e293b' },
  actionCopy: { fontSize: 11, color: '#64748b', marginTop: 2 },
  actionCta: { color: '#fff', backgroundColor: '#ff7a00', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, fontSize: 11, fontWeight: '800', overflow: 'hidden' },

  // Nearby Web Store Card
  webStoreCard: { width: 220, backgroundColor: '#fff', borderRadius: 22, borderWidth: 1.5, borderColor: '#e2e8f0', overflow: 'hidden', marginRight: 12, position: 'relative' },
  webStoreImg: { width: '100%', height: 110, resizeMode: 'cover' },
  webStoreDistBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  webStoreDistText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  webStoreBody: { padding: 12 },
  webStoreTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  webStoreTitle: { fontSize: 13, fontWeight: '900', color: '#1e293b', flex: 1, marginRight: 8 },
  webStoreRatingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f59e0b', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6 },
  webStoreRatingText: { color: '#fff', fontSize: 9, fontWeight: '900', marginLeft: 2 },
  webStoreCat: { fontSize: 10, color: '#64748b', marginTop: 4 },
  webStoreOpenRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 4 },
  webStoreOpenText: { fontSize: 10, fontWeight: '800', color: '#10b981' },
  webStoreLoc: { fontSize: 10, color: '#64748b' },
  webStoreCashbackBadge: { alignSelf: 'flex-start', backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#ffedd5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 8 },
  webStoreCashbackText: { color: '#ea580c', fontSize: 9, fontWeight: '800' },

  // Personalized Match Card
  personalizedCard: { width: 170, backgroundColor: '#fff', borderRadius: 22, borderWidth: 1.5, borderColor: '#e2e8f0', overflow: 'hidden', marginRight: 12 },
  personalizedImgContainer: { width: '100%', height: 110, position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  personalizedImg: { width: 90, height: 90, resizeMode: 'contain' },
  personalizedMatchBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#3b82f6', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  personalizedMatchText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  personalizedDiscountBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#ef4444', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  personalizedDiscountText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  personalizedBody: { padding: 10 },
  personalizedTitle: { fontSize: 11, fontWeight: '800', color: '#1e293b', minHeight: 32, lineHeight: 16 },

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
  scannerCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 6 },
  
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

});
