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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('show_toast', (message: string) => {
      setToastMessage(message);
      fadeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.delay(1800),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => setToastMessage(null));
    });
    return () => sub.remove();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Content style={styles.content} contentContainerStyle={scroll ? styles.contentContainer : undefined}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </Content>
      {toastMessage ? (
        <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 16 },
  contentContainer: { paddingVertical: 20 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 18, lineHeight: 20 },
  toastContainer: {
    position: 'absolute',
    bottom: 34,
    left: 24,
    right: 24,
    backgroundColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99999,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
});