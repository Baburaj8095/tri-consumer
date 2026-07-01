import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartStateShape, Product } from '../types/domain';

const CART_KEY = 'tri_consumer_cart';
const emptyCart: CartStateShape = { shopId: null, shopName: '', items: [] };

type CartStore = {
  cart: CartStateShape;
  hydrate: () => Promise<void>;
  addProduct: (product: Product, options?: Partial<CartStateShape>) => Promise<void>;
  updateQty: (productId: string | number, delta: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

const persist = async (cart: CartStateShape) => AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));

export const useCartStore = create<CartStore>((set, get) => ({
  cart: emptyCart,
  hydrate: async () => {
    const raw = await AsyncStorage.getItem(CART_KEY);
    set({ cart: raw ? (JSON.parse(raw) as CartStateShape) : emptyCart });
  },
  addProduct: async (product, options) => {
    const current = get().cart;
    const shopId = options?.shopId ?? product.shop_id ?? current.shopId;
    const shopName = options?.shopName ?? product.shop_name ?? current.shopName ?? 'Online Shop';
    const sameShop = !current.shopId || String(current.shopId) === String(shopId);
    const items = sameShop ? [...current.items] : [];
    const existing = items.find(item => item.productId === product.id);
    if (existing) existing.quantity += 1;
    else items.push({ productId: product.id, title: product.title || product.name || 'Product', price: Number(product.price || 0), mrp: product.mrp, image: product.image || product.image_url, quantity: 1 });
    const nextCart: CartStateShape = { ...current, ...options, shopId, shopName, items };
    await persist(nextCart);
    set({ cart: nextCart });
  },
  updateQty: async (productId, delta) => {
    const nextCart = { ...get().cart, items: get().cart.items.map(item => item.productId === productId ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0) };
    await persist(nextCart);
    set({ cart: nextCart });
  },
  clearCart: async () => {
    await AsyncStorage.removeItem(CART_KEY);
    set({ cart: emptyCart });
  },
}));