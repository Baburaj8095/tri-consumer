import React from 'react';
import { View, TextInput, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';

interface StickySearchProps {
  query: string;
  onChangeQuery: (text: string) => void;
  onScanPress: () => void;
  onMicPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const StickySearch: React.FC<StickySearchProps> = ({
  query,
  onChangeQuery,
  onScanPress,
  onMicPress,
  style,
}) => {
  return (
    <View style={[styles.searchContainer, style]}>
      <Ionicons name="search-outline" size={18} color={colors.slate400} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search services, products & stores..."
        placeholderTextColor={colors.slate400}
        value={query}
        onChangeText={onChangeQuery}
        accessibilityRole="search"
        accessibilityLabel="Search products and stores"
      />
      <Ionicons
        name="qr-code-outline"
        size={18}
        color={colors.slate500}
        style={styles.actionIcon}
        onPress={onScanPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Scan QR Code"
      />
      <Ionicons
        name="mic-outline"
        size={18}
        color={colors.slate500}
        style={styles.actionIcon}
        onPress={onMicPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Search by Voice"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.round,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    ...shadows.sm,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.slate800,
    fontWeight: '600',
    paddingVertical: 0, // Avoid vertical offset in Android
  },
  actionIcon: {
    marginLeft: 12,
  },
});
