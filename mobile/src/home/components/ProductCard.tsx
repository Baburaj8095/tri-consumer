import React, { useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { Product } from '../../types/domain';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';
import { Skeleton } from './Skeletons';
import { AnalyticsService } from '../services/AnalyticsService';
import { showToast } from '../../components/BaseScreen';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const addProduct = useCartStore(state => state.addProduct);
  const [imageLoading, setImageLoading] = useState(true);

  const title = product.title || product.name || 'Product';
  const price = product.price || 0;
  const mrp = product.mrp || price * 1.25;
  const discount = Math.round(((mrp - price) / mrp) * 100);
  const ratingText = '4.5 (1.2K)';

  const handleAddToCart = () => {
    AnalyticsService.trackCartAction('add', product.id, 1);
    void addProduct({
      id: product.id,
      title,
      price,
      image: product.image || product.image_url,
    });
    showToast(`${title} added to cart!`);
  };

  const handlePress = () => {
    AnalyticsService.trackProductClick(product.id);
    onPress();
  };

  return (
    <Pressable
      style={styles.card}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, Price ₹${price.toFixed(0)}, rating ${ratingText}`}
    >
      <View style={styles.imageContainer}>
        {imageLoading && <Skeleton width="100%" height={110} style={styles.absolutePlaceholder} />}
        <Image
          source={{ uri: product.image || product.image_url }}
          style={styles.image}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.newPrice}>₹{price.toFixed(0)}</Text>
          {mrp > price && (
            <Text style={styles.oldPrice}>₹{mrp.toFixed(0)}</Text>
          )}
        </View>

        <View style={styles.ratingRow}>
          <View style={styles.stars}>
            <Ionicons name="star" size={11} color={colors.warning} style={{ marginRight: 2 }} />
            <Text style={styles.ratingText}>{ratingText}</Text>
          </View>

          <Pressable
            style={styles.cartButton}
            onPress={handleAddToCart}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={`Add ${title} to cart`}
          >
            <Ionicons name="cart-outline" size={14} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 154,
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
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  discountText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },
  body: {
    padding: 10,
  },
  name: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.slate800,
    minHeight: 32,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  newPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
  },
  oldPrice: {
    fontSize: 10,
    color: colors.slate400,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.slate500,
  },
  cartButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
