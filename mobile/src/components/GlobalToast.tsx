import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, DeviceEventEmitter, Animated } from 'react-native';

export function GlobalToast() {
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

  if (!toastMessage) return null;

  return (
    <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
      <Text style={styles.toastText}>{toastMessage}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 100, // Elevated to sit comfortably above custom bottom tabs
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
