import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Shop } from '../../types/domain';
import { products as mockProducts } from '../../constants/mockData';
import {
  IProductRepository,
  IMerchantRepository,
  IBannerRepository,
  ICategoryRepository,
} from './RepositoryContracts';

// TTL Definitions
const PRODUCTS_TTL = 10 * 60 * 1000;      // 10 minutes
const MERCHANTS_TTL = 5 * 60 * 1000;      // 5 minutes
const BANNERS_TTL = 30 * 60 * 1000;       // 30 minutes
const CATEGORIES_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Storage Keys
const KEY_PRODUCTS = 'tri_cache_products';
const KEY_PRODUCTS_TIME = 'tri_cache_products_time';
const KEY_MERCHANTS = 'tri_cache_merchants';
const KEY_MERCHANTS_TIME = 'tri_cache_merchants_time';
const KEY_BANNERS = 'tri_cache_banners';
const KEY_BANNERS_TIME = 'tri_cache_banners_time';
const KEY_CATEGORIES = 'tri_cache_categories';
const KEY_CATEGORIES_TIME = 'tri_cache_categories_time';

export class ProductRepository implements IProductRepository {
  async getProducts(forceRefresh = false): Promise<Product[]> {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(KEY_PRODUCTS);
        const time = await AsyncStorage.getItem(KEY_PRODUCTS_TIME);
        if (cached && time && Date.now() - parseInt(time, 10) < PRODUCTS_TTL) {
          return JSON.parse(cached);
        }
      }
      
      const items: Product[] = mockProducts.map(p => ({
        id: String(p.id),
        title: p.name,
        price: parseFloat(p.newPrice.replace(/[^0-9.]/g, '')),
        mrp: parseFloat(p.oldPrice.replace(/[^0-9.]/g, '')),
        image: p.image,
        shop_id: 'shop-1',
        shop_name: 'Fresh Mart',
      }));

      await AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(items));
      await AsyncStorage.setItem(KEY_PRODUCTS_TIME, String(Date.now()));
      return items;
    } catch (e) {
      console.warn('Failed to load products from cache:', e);
      return [];
    }
  }

  async clearCache(): Promise<void> {
    await AsyncStorage.removeItem(KEY_PRODUCTS);
    await AsyncStorage.removeItem(KEY_PRODUCTS_TIME);
  }
}

export class MerchantRepository implements IMerchantRepository {
  async getMerchants(forceRefresh = false): Promise<Shop[]> {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(KEY_MERCHANTS);
        const time = await AsyncStorage.getItem(KEY_MERCHANTS_TIME);
        if (cached && time && Date.now() - parseInt(time, 10) < MERCHANTS_TTL) {
          return JSON.parse(cached);
        }
      }

      const items: Shop[] = [
        { id: '39', shop_id: '39', shop_name: 'Poornima Store', category_name: 'Health & Medical', city: 'Kalaburagi', shop_image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80', distance_km: 0.0 },
        { id: '40', shop_id: '40', shop_name: 'Kanta medical', category_name: 'Health & Medical', city: 'Kalaburagi', shop_image: 'https://images.unsplash.com/photo-1607619056574-7b8f304b3b8a?auto=format&fit=crop&w=300&q=80', distance_km: 3.2 },
      ];

      await AsyncStorage.setItem(KEY_MERCHANTS, JSON.stringify(items));
      await AsyncStorage.setItem(KEY_MERCHANTS_TIME, String(Date.now()));
      return items;
    } catch (e) {
      console.warn('Failed to load merchants from cache:', e);
      return [];
    }
  }

  async clearCache(): Promise<void> {
    await AsyncStorage.removeItem(KEY_MERCHANTS);
    await AsyncStorage.removeItem(KEY_MERCHANTS_TIME);
  }
}

export class BannerRepository implements IBannerRepository {
  async getBanners(forceRefresh = false): Promise<any[]> {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(KEY_BANNERS);
        const time = await AsyncStorage.getItem(KEY_BANNERS_TIME);
        if (cached && time && Date.now() - parseInt(time, 10) < BANNERS_TTL) {
          return JSON.parse(cached);
        }
      }

      const items = [
        { id: 'b1', title: 'For Better Society', sub: 'Join our community initiatives', icon: 'people-outline', route: 'Society', cta: 'Join' },
        { id: 'b2', title: 'List Your Business', sub: 'Grow with Trikonekt today', icon: 'storefront-outline', route: 'BusinessRegistration', cta: 'List Now' },
      ];

      await AsyncStorage.setItem(KEY_BANNERS, JSON.stringify(items));
      await AsyncStorage.setItem(KEY_BANNERS_TIME, String(Date.now()));
      return items;
    } catch (e) {
      console.warn('Failed to load banners from cache:', e);
      return [];
    }
  }

  async clearCache(): Promise<void> {
    await AsyncStorage.removeItem(KEY_BANNERS);
    await AsyncStorage.removeItem(KEY_BANNERS_TIME);
  }
}

export class CategoryRepository implements ICategoryRepository {
  async getCategories(forceRefresh = false): Promise<any[]> {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(KEY_CATEGORIES);
        const time = await AsyncStorage.getItem(KEY_CATEGORIES_TIME);
        if (cached && time && Date.now() - parseInt(time, 10) < CATEGORIES_TTL) {
          return JSON.parse(cached);
        }
      }

      const items = [
        { name: 'Daily Needs', icon: 'basket-outline' },
        { name: 'Mobiles', icon: 'phone-portrait-outline' },
        { name: 'Fashion', icon: 'shirt-outline' },
        { name: 'Furniture', icon: 'home-outline' },
        { name: 'Beauty', icon: 'sparkles-outline' },
      ];

      await AsyncStorage.setItem(KEY_CATEGORIES, JSON.stringify(items));
      await AsyncStorage.setItem(KEY_CATEGORIES_TIME, String(Date.now()));
      return items;
    } catch (e) {
      console.warn('Failed to load categories from cache:', e);
      return [];
    }
  }

  async clearCache(): Promise<void> {
    await AsyncStorage.removeItem(KEY_CATEGORIES);
    await AsyncStorage.removeItem(KEY_CATEGORIES_TIME);
  }
}
