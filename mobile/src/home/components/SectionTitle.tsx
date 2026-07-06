import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  actionLabel = 'View all',
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {onAction ? (
        <Pressable onPress={onAction} style={styles.actionPressable} accessibilityRole="button" accessibilityLabel={`${actionLabel} ${title}`}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    marginBottom: 12,
    marginTop: spacing.md,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: '900',
    color: colors.slate900,
  },
  subtitle: {
    fontSize: typography.caption,
    color: colors.slate500,
    marginTop: 2,
  },
  actionPressable: {
    minHeight: 32,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
});
