import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationInfo } from '../types/domain';
import { DEFAULT_LOCATION } from '../services/locationService';

const LOCATION_KEY = 'triConsumerLocation';
const RECENTS_KEY = 'triConsumerRecentLocations';

type LocationStore = {
  location: LocationInfo;
  recentLocations: LocationInfo[];
  hydrate: () => Promise<void>;
  saveLocation: (location: LocationInfo) => Promise<void>;
};

export const useLocationStore = create<LocationStore>((set, get) => ({
  location: DEFAULT_LOCATION,
  recentLocations: [],
  hydrate: async () => {
    const saved = await AsyncStorage.getItem(LOCATION_KEY);
    const recents = await AsyncStorage.getItem(RECENTS_KEY);
    set({ location: saved ? (JSON.parse(saved) as LocationInfo) : DEFAULT_LOCATION, recentLocations: recents ? (JSON.parse(recents) as LocationInfo[]) : [] });
  },
  saveLocation: async location => {
    const locWithTime = { ...location, lastUpdated: location.lastUpdated || Date.now() };
    const filtered = get().recentLocations.filter(item => item.area.toLowerCase() !== locWithTime.area.toLowerCase() || item.city.toLowerCase() !== locWithTime.city.toLowerCase());
    const recentLocations = [{ ...locWithTime, id: String(Date.now()) }, ...filtered].slice(0, 5);
    await Promise.all([
      AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(locWithTime)),
      AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(recentLocations)),
    ]);
    set({ location: locWithTime, recentLocations });
  },
}));