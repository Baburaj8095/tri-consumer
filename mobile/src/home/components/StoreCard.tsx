import React, { useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Shop } from '../../types/domain';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';
import { Skeleton } from './Skeletons';

interface StoreCardProps {
  store: Shop;
  onPress: () => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onPress }) => {
  const [imageLoading, setImageLoading] = useState(true);

  const name = store.shop_name || store.business_name || store.full_name || 'B2C Merchant';
  const location = store.city || store.address || 'Local Area';
  const category = store.category_name || store.category || 'Retail Store';
  const distance = store.distance_km != null ? `${store.distance_km} KM Away` : 'Nearby Stores';
  const ratingText = '4.5';

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, category ${category}, distance ${distance}, rating ${ratingText}`}
    >
      <View style={styles.imageContainer}>
        {imageLoading && <Skeleton width="100%" height={110} style={styles.absolutePlaceholder} />}
        <Image
          source={store.shop_image ? { uri: store.shop_image } : require('../../../assets/fallback_img.png')}
          style={styles.image}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
        <View style={styles.distBadge}>
          <Text style={styles.distText}>{distance}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color="#fff" style={{ marginRight: 2 }} />
            <Text style={styles.ratingText}>{ratingText}</Text>
          </View>
        </View>

        <Text style={styles.category} numberOfLines={1}>
          {category}
        </Text>

        <View style={styles.statusRow}>
          <View style={styles.dot} />
          <Text style={styles.statusText}>Open now</Text>
          <Text style={styles.location}> • {location}</Text>
        </View>

        <View style={styles.cashbackBadge}>
          <Text style={styles.cashbackText}>5% Cashback</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.slate200,
    overflow: 'hidden',
    marginRight: 12,
    ...shadows.sm,
  },
  imageContainer: {
    width: '100%',
    height: 110,
    position: 'relative',
    backgroundColor: colors.slate100,
  },
  absolutePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  distBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  distText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  body: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.slate800,
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  ratingText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  category: {
    fontSize: 10,
    color: colors.slate500,
    marginTop: 4,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.round,
    backgroundColor: colors.success,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
  location: {
    fontSize: 10,
    color: colors.slate400,
  },
  cashbackBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brandOrangeLight,
    borderWidth: 1,
    borderColor: colors.brandOrangeMedium,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginTop: 8,
  },
  cashbackText: {
    color: colors.primaryDark,
    fontSize: 9,
    fontWeight: '800',
  },
});
