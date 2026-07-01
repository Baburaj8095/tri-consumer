import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

type Props = { label: string; onPress: () => void; variant?: 'primary' | 'secondary' };

export function AppButton({ label, onPress, variant = 'primary' }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable onPress={onPress} style={[styles.button, isPrimary ? styles.primary : styles.secondary]}>
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', marginVertical: 6 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  label: { fontWeight: '800', fontSize: 15 },
  primaryLabel: { color: '#fff' },
  secondaryLabel: { color: colors.text },
});