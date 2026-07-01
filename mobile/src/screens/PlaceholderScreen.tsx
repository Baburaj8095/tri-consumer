import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { BaseScreen } from '../components/BaseScreen';
import { InfoCard } from '../components/InfoCard';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export type PlaceholderProps = {
  title: string;
  webRoute: string;
  summary: string;
  integrationPoints?: string[];
  todos?: string[];
};

export function PlaceholderScreen({ title, webRoute, summary, integrationPoints = [], todos = [] }: PlaceholderProps) {
  const navigation = useNavigation<Navigation>();
  return (
    <BaseScreen title={title} subtitle={summary}>
      <InfoCard title="Web reference route" subtitle={webRoute} />
      <InfoCard title="API / business integration points">
        {integrationPoints.length ? integrationPoints.map(item => <Text key={item} style={styles.item}>• {item}</Text>) : <Text style={styles.item}>• No direct API in current placeholder.</Text>}
      </InfoCard>
      <InfoCard title="Manual React Native conversion TODOs">
        {todos.map(item => <Text key={item} style={styles.todo}>TODO: {item}</Text>)}
        <Text style={styles.todo}>TODO: Convert web-specific layout/CSS into native View/Text/FlatList components.</Text>
      </InfoCard>
      <View style={styles.actions}>
        <AppButton label="Back" variant="secondary" onPress={() => navigation.goBack()} />
        <AppButton label="Home" onPress={() => navigation.navigate('ConsumerHome')} />
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  item: { color: colors.textSecondary, lineHeight: 22, marginTop: 4 },
  todo: { color: colors.warning, lineHeight: 22, marginTop: 4, fontWeight: '700' },
  actions: { marginTop: 6 },
});