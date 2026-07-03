import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes';
import { AppButton } from '../components/AppButton';
import { fetchHubbleIframeUrl } from '../services/hubbleService';
import { RootStackParamList } from '../types/navigation';
import { formatErrorMessage } from '../utils/errorFormatter';
import logger from '../utils/logger';
import { colors } from '../theme/colors';

type HubbleMessage =
  | { type: 'action'; action: 'app_ready' | 'close' | 'error'; message?: string }
  | { type: 'analytics'; event: string; properties?: Record<string, unknown> };

export function GiftCardsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'GiftCards'>) {
  const webViewRef = useRef<WebView>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [error, setError] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  const sdkOrigin = useMemo(() => {
    try { return sourceUrl ? new URL(sourceUrl).origin : ''; } catch { return ''; }
  }, [sourceUrl]);

  const load = useCallback(async () => {
    setFetchingUrl(true); setSdkReady(false); setError(''); setSourceUrl('');
    try {
      const data = await fetchHubbleIframeUrl();
      const url = data?.iframeUrl || data?.iframe_url || '';
      if (!url || !/^https:\/\//i.test(url)) throw new Error('Gift card service returned an invalid secure URL.');
      setSourceUrl(url);
    } catch (err) { setError(formatErrorMessage(err)); }
    finally { setFetchingUrl(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) { webViewRef.current.goBack(); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [canGoBack]);

  const handleNavigation = useCallback((request: WebViewNavigation) => {
    const url = request.url;
    if (!url || url === 'about:blank' || (sdkOrigin && url.startsWith(sdkOrigin)) || url.startsWith('https://api.razorpay.com')) return true;
    void Linking.openURL(url).catch(() => setError('No application is available to open this payment link.'));
    return false;
  }, [sdkOrigin]);

  const handleEvent = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as HubbleMessage;
      if (data.type === 'action') {
        if (data.action === 'close') navigation.goBack();
        else if (data.action === 'app_ready') setSdkReady(true);
        else if (data.action === 'error') setError(data.message || 'Hubble could not load the gift card experience.');
      } else if (data.type === 'analytics') {
        logger.info('Hubble analytics event', data.event, data.properties || {});
      }
    } catch (err) {
      logger.warn('Ignored malformed Hubble WebView event', err);
    }
  }, [navigation]);

  const handleWebViewError = useCallback((event: WebViewErrorEvent) => {
    setError(event.nativeEvent.description || 'Gift card page failed to load.');
  }, []);

  if (fetchingUrl) return <LoadingState />;
  if (error || !sourceUrl) return <ErrorState message={error || 'Gift Cards are unavailable.'} onRetry={load} onBack={() => navigation.goBack()} />;

  return <SafeAreaView style={styles.safe} edges={['bottom']}>
    <WebView
      ref={webViewRef}
      source={{ uri: sourceUrl }}
      style={styles.webview}
      javaScriptEnabled
      domStorageEnabled
      startInLoadingState
      setSupportMultipleWindows
      javaScriptCanOpenWindowsAutomatically
      cacheEnabled={false}
      incognito
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      originWhitelist={['https://*', 'upi://*', 'gpay://*', 'phonepe://*', 'paytmmp://*']}
      onShouldStartLoadWithRequest={handleNavigation}
      onMessage={handleEvent}
      onNavigationStateChange={state => setCanGoBack(state.canGoBack)}
      onError={handleWebViewError}
      renderLoading={() => <LoadingState overlay />}
    />
    {!sdkReady ? <LoadingState overlay message="Preparing secure Gift Cards..." /> : null}
  </SafeAreaView>;
}

function LoadingState({ overlay = false, message = 'Loading Gift Cards...' }: { overlay?: boolean; message?: string }) {
  return <View style={[styles.center, overlay && styles.overlay]}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.text}>{message}</Text></View>;
}

function ErrorState({ message, onRetry, onBack }: { message: string; onRetry: () => void; onBack: () => void }) {
  return <View style={styles.center}><Text style={styles.error}>{message}</Text><AppButton label="Try again" onPress={onRetry} /><AppButton label="Back" variant="secondary" onPress={onBack} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.96)' },
  text: { marginTop: 12, color: colors.textSecondary, fontWeight: '700' },
  error: { color: colors.danger, textAlign: 'center', marginBottom: 16, fontWeight: '700' },
  webview: { flex: 1, backgroundColor: colors.background },
});
