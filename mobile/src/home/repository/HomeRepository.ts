import AsyncStorage from '@react-native-async-storage/async-storage';
import { ILayoutRepository } from './RepositoryContracts';
import { DEFAULT_LAYOUT } from '../constants/constants';

const LAYOUT_CACHE_KEY = 'tri_home_layout_cache';
const LAYOUT_CACHE_TIME_KEY = 'tri_home_layout_cache_time';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours

export class HomeRepository implements ILayoutRepository {
  async getLayout(forceRefresh = false): Promise<any> {
    try {
      if (!forceRefresh) {
        const cachedLayout = await AsyncStorage.getItem(LAYOUT_CACHE_KEY);
        const cachedTime = await AsyncStorage.getItem(LAYOUT_CACHE_TIME_KEY);
        
        if (cachedLayout && cachedTime) {
          const elapsed = Date.now() - parseInt(cachedTime, 10);
          if (elapsed < CACHE_TTL_MS) {
            return JSON.parse(cachedLayout);
          }
        }
      }
      
      // Simulate API fetch (In Release 1, we return default layout to load immediately)
      const freshLayout = DEFAULT_LAYOUT;
      await this.saveCache(freshLayout);
      return freshLayout;
    } catch (error) {
      console.warn('Failed to load layout from repository, falling back to default:', error);
      return DEFAULT_LAYOUT;
    }
  }

  private async saveCache(layout: any): Promise<void> {
    try {
      await AsyncStorage.setItem(LAYOUT_CACHE_KEY, JSON.stringify(layout));
      await AsyncStorage.setItem(LAYOUT_CACHE_TIME_KEY, String(Date.now()));
    } catch (e) {
      console.warn('Failed to save layout cache:', e);
    }
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LAYOUT_CACHE_KEY);
      await AsyncStorage.removeItem(LAYOUT_CACHE_TIME_KEY);
    } catch (e) {
      console.warn('Failed to clear layout cache:', e);
    }
  }
}
