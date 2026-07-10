import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './navigation/AppNavigator';
import { GlobalToast } from './components/GlobalToast';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer linking={{ prefixes: ['trikonekt://'], config: { screens: { ConsumerKYC: 'kyc' } } }}>
        <AppNavigator />
      </NavigationContainer>
      <GlobalToast />
    </SafeAreaProvider>
  );
}
