import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = PropsWithChildren<{ title: string; subtitle?: string }>;

export function InfoCard({ title, subtitle, children }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  title: { fontSize: 16, fontWeight: '900', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});