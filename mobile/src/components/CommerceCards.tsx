import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { CartItem, Product, Shop } from '../types/domain';

const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

export function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? <Pressable onPress={onAction}><Text style={styles.sectionAction}>{actionLabel}</Text></Pressable> : null}
    </View>
  );
}

export function ServiceTile({ title, subtitle, onPress }: { title: string; subtitle?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.serviceTile, pressed && styles.pressed]}>
      <View style={styles.serviceIcon}><Text style={styles.serviceIconText}>{title.slice(0, 2).toUpperCase()}</Text></View>
      <Text style={styles.serviceTitle}>{title}</Text>
      {subtitle ? <Text style={styles.serviceSubtitle}>{subtitle}</Text> : null}
    </Pressable>
  );
}

export function ProductCard({ product, onPress, onAdd }: { product: Product; onPress: () => void; onAdd: () => void }) {
  const title = product.title || product.name || 'Product';
  const price = Number(product.price || 0);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.productCard, pressed && styles.pressed]}>
      <Image source={{ uri: product.image || product.image_url || fallbackImage }} style={styles.productImage} />
      <View style={styles.productBody}>
        <Text numberOfLines={2} style={styles.productTitle}>{title}</Text>
        <Text style={styles.productMeta}>{product.shop_name || 'Tri Consumer Store'}</Text>
        <View style={styles.productBottomRow}>
          <Text style={styles.productPrice}>₹{price.toFixed(0)}</Text>
          <Pressable onPress={onAdd} style={styles.addButton}><Text style={styles.addButtonText}>ADD</Text></Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export function StoreCard({ store, onPress }: { store: Shop; onPress: () => void }) {
  const name = store.shop_name || store.business_name || store.full_name || 'B2C Merchant';
  const location = store.city || store.address || 'Local Area';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.storeCard, pressed && styles.pressed]}>
      <Image source={{ uri: store.shop_image || fallbackImage }} style={styles.storeImage} />
      <View style={styles.storeBody}>
        <View style={styles.storeTopRow}>
          <Text numberOfLines={1} style={styles.storeTitle}>{name}</Text>
          <Text style={styles.rating}>4.5 ★</Text>
        </View>
        <Text numberOfLines={1} style={styles.storeMeta}>{store.category_name || store.category || 'Retail Store'}</Text>
        <Text numberOfLines={1} style={styles.storeLocation}>{location}</Text>
        <View style={styles.storeFooter}>
          <Text style={styles.openBadge}>Open now</Text>
          <Text style={styles.distanceText}>{store.distance_km != null ? `${store.distance_km} km` : 'Nearby'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function CartLineItem({ item, onIncrement, onDecrement }: { item: CartItem; onIncrement: () => void; onDecrement: () => void }) {
  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image || fallbackImage }} style={styles.cartImage} />
      <View style={styles.cartBody}>
        <Text numberOfLines={2} style={styles.cartTitle}>{item.title}</Text>
        <Text style={styles.cartPrice}>₹{item.price.toFixed(0)}</Text>
        <View style={styles.qtyRow}>
          <Pressable onPress={onDecrement} style={styles.qtyButton}><Text style={styles.qtyText}>−</Text></Pressable>
          <Text style={styles.qtyValue}>{item.quantity}</Text>
          <Pressable onPress={onIncrement} style={styles.qtyButton}><Text style={styles.qtyText}>+</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

export function OrderCard({ title, subtitle, status, onPress }: { title: string; subtitle: string; status?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.orderCard, pressed && styles.pressed]}>
      <View>
        <Text style={styles.orderTitle}>{title}</Text>
        <Text style={styles.orderSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.statusPill}>{status || 'Pending'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 6 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  sectionAction: { color: colors.primary, fontWeight: '900', fontSize: 13 },
  serviceTile: { width: '31.5%', minHeight: 112, backgroundColor: colors.surface, borderRadius: 20, padding: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  serviceIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  serviceIconText: { color: colors.primary, fontWeight: '900', fontSize: 13 },
  serviceTitle: { color: colors.text, fontWeight: '900', fontSize: 13 },
  serviceSubtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  productCard: { width: 172, backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginRight: 14 },
  productImage: { width: '100%', height: 124, backgroundColor: colors.border },
  productBody: { padding: 12 },
  productTitle: { color: colors.text, fontWeight: '900', minHeight: 38, lineHeight: 19 },
  productMeta: { color: colors.muted, fontSize: 11, marginTop: 4 },
  productBottomRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productPrice: { color: colors.text, fontWeight: '900', fontSize: 16 },
  addButton: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  addButtonText: { color: '#fff', fontWeight: '900', fontSize: 11 },
  storeCard: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 14 },
  storeImage: { width: '100%', height: 144, backgroundColor: colors.border },
  storeBody: { padding: 14 },
  storeTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  storeTitle: { flex: 1, color: colors.text, fontWeight: '900', fontSize: 17 },
  rating: { color: colors.success, fontWeight: '900' },
  storeMeta: { color: colors.textSecondary, marginTop: 4, fontWeight: '700' },
  storeLocation: { color: colors.muted, marginTop: 4 },
  storeFooter: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  openBadge: { color: colors.success, fontWeight: '900', backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  distanceText: { color: colors.textSecondary, fontWeight: '800' },
  cartItem: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 10, marginBottom: 12 },
  cartImage: { width: 86, height: 86, borderRadius: 14, backgroundColor: colors.border },
  cartBody: { flex: 1, marginLeft: 12 },
  cartTitle: { color: colors.text, fontWeight: '900', lineHeight: 19 },
  cartPrice: { color: colors.primary, fontWeight: '900', marginTop: 5 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 9, borderWidth: 1, borderColor: colors.border, borderRadius: 999, overflow: 'hidden' },
  qtyButton: { width: 34, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSoft },
  qtyText: { color: colors.primary, fontWeight: '900', fontSize: 18 },
  qtyValue: { width: 34, textAlign: 'center', color: colors.text, fontWeight: '900' },
  orderCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  orderTitle: { color: colors.text, fontWeight: '900' },
  orderSubtitle: { color: colors.textSecondary, marginTop: 4, fontSize: 12 },
  statusPill: { color: colors.primary, backgroundColor: colors.surfaceSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontWeight: '900', overflow: 'hidden' },
});