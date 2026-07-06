import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = radius.sm,
  style,
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 600 }),
        withTiming(0.3, { duration: 600 })
      ),
      -1, // Infinite repeat
      true // Reverse direction
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius },
        style,
        animatedStyle,
      ]}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardSkeleton}>
      <Skeleton height={110} borderRadius={radius.md} />
      <View style={styles.contentPadding}>
        <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
        <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
        <View style={styles.row}>
          <Skeleton width="30%" height={16} />
          <Skeleton width={20} height={20} borderRadius={radius.round} />
        </View>
      </View>
    </View>
  );
};

export const StoreCardSkeleton: React.FC = () => {
  return (
    <View style={styles.storeSkeleton}>
      <Skeleton height={110} borderRadius={radius.md} />
      <View style={styles.contentPadding}>
        <View style={styles.row}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="15%" height={14} />
        </View>
        <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
        <Skeleton width="30%" height={10} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
};

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <View style={styles.categorySkeleton}>
      <Skeleton width={48} height={48} borderRadius={radius.round} />
      <Skeleton width="70%" height={10} style={{ marginTop: 8 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.slate300,
  },
  cardSkeleton: {
    width: 154,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginRight: 12,
  },
  storeSkeleton: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginRight: 12,
  },
  categorySkeleton: {
    width: 72,
    alignItems: 'center',
  },
  contentPadding: {
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
});
