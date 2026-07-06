import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';

interface CategoryCardProps {
  name: string;
  icon: string;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ name, icon, onPress }) => {
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Category ${name}`}
    >
      <View style={styles.iconBg}>
        <Ionicons name={icon as any} size={22} color={colors.primary} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 72,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.slate700,
    textAlign: 'center',
  },
});
