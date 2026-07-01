import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { BaseScreen } from '../components/BaseScreen';
import { InfoCard } from '../components/InfoCard';
import { ProductCard, SectionHeader, ServiceTile } from '../components/CommerceCards';
import { quickServices, products } from '../constants/mockData';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

export function ConsumerHomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'ConsumerHome'>) {
  return (
    <BaseScreen scroll={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=80' }}
          imageStyle={styles.heroImage}
          style={styles.hero}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.kicker}>Tri Consumer</Text>
            <Text style={styles.heroTitle}>Shop local, pay fast, track everything.</Text>
            <Text style={styles.heroText}>Native mobile dashboard for nearby stores, delivery orders, services and rewards.</Text>
          </View>
        </ImageBackground>

        <SectionHeader title="Quick services" />
        <View style={styles.grid}>
          {quickServices.map(service => (
            <ServiceTile key={service.label} title={service.label} subtitle="Tap to open" onPress={() => navigation.navigate(service.route)} />
          ))}
        </View>

        <InfoCard title="Shopping shortcuts" subtitle="Fast access to the core ecommerce journey.">
          <AppButton label="Delivery Marketplace" onPress={() => navigation.navigate('Delivery')} />
          <AppButton label="Nearby Stores" variant="secondary" onPress={() => navigation.navigate('NearbyStores')} />
          <AppButton label="Cart" variant="secondary" onPress={() => navigation.navigate('Cart')} />
          <AppButton label="My Orders" variant="secondary" onPress={() => navigation.navigate('MyOrders')} />
        </InfoCard>

        <SectionHeader title="Live deals for you" actionLabel="View all" onAction={() => navigation.navigate('Delivery')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={{ id: product.id, name: product.name, price: Number(product.newPrice.replace(/[^0-9]/g, '')), image: product.image }}
              onPress={() => navigation.navigate('ProductDetails', { id: String(product.id) })}
              onAdd={() => navigation.navigate('Delivery')}
            />
          ))}
        </ScrollView>

        <InfoCard title="Native conversion status" subtitle="This dashboard now uses native cards, touch feedback, horizontal scrolling, and mobile-first spacing. Remaining work is detailed screen-level polish and feature completion." />
      </ScrollView>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 18, paddingBottom: 34 },
  hero: { minHeight: 230, borderRadius: 28, overflow: 'hidden', marginBottom: 22, justifyContent: 'flex-end' },
  heroImage: { borderRadius: 28 },
  heroOverlay: { flex: 1, justifyContent: 'flex-end', padding: 20, backgroundColor: 'rgba(15,23,42,0.42)' },
  kicker: { color: '#fed7aa', fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase', fontSize: 12, marginBottom: 8 },
  heroTitle: { color: '#fff', fontSize: 29, lineHeight: 35, fontWeight: '900', maxWidth: 310 },
  heroText: { color: '#ffedd5', marginTop: 10, fontWeight: '700', lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
  horizontalList: { paddingBottom: 8 },
});