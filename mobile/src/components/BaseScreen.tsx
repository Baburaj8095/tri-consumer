import React, { PropsWithChildren, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View, DeviceEventEmitter, Animated } from 'react-native';
import { colors } from '../theme/colors';

type Props = PropsWithChildren<{ title?: string; subtitle?: string; scroll?: boolean }>;

export function showToast(message: string) {
  DeviceEventEmitter.emit('show_toast', message);
}

export function BaseScreen({ title, subtitle, scroll = true, children }: Props) {
  const Content = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Content style={styles.content} contentContainerStyle={scroll ? styles.contentContainer : undefined}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </Content>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 16 },
  contentContainer: { paddingVertical: 20 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 18, lineHeight: 20 },
});