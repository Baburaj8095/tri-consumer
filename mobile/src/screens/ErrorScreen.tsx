import React from 'react';
import { Text } from 'react-native';
import { AppButton } from '../components/AppButton';
import { BaseScreen } from '../components/BaseScreen';
import { colors } from '../theme/colors';

export function ErrorScreen({ title = 'Something went wrong', message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <BaseScreen title={title} subtitle={message || 'Please try again.'}>
      <Text style={{ color: colors.danger, marginBottom: 12 }}>TODO: Add branded React Native error illustration.</Text>
      {onRetry ? <AppButton label="Retry" onPress={onRetry} /> : null}
    </BaseScreen>
  );
}