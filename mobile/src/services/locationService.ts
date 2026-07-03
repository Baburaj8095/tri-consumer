import { env } from '../constants/env';
import { LocationInfo } from '../types/domain';
import * as Location from 'expo-location';

export const DEFAULT_LOCATION: LocationInfo = {
  lat: 12.9716,
  lng: 77.5946,
  area: 'Indiranagar',
  city: 'Bangalore',
  state: 'Karnataka',
  country: 'India',
  pincode: '560038',
  formattedAddress: 'Indiranagar, Bangalore, Karnataka, India',
};

export function calculateDistance(lat1?: number | null, lon1?: number | null, lat2?: number | null, lon2?: number | null) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const radiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function reverseGeocode(lat: number, lng: number, token = env.mapboxApiKey): Promise<LocationInfo> {
  if (!token) return { ...DEFAULT_LOCATION, lat, lng, lastUpdated: Date.now() };
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&country=IN&limit=1`;
  const response = await fetch(url);
  const data = await response.json();
  const feature = data?.features?.[0];
  if (!feature) return { ...DEFAULT_LOCATION, lat, lng, lastUpdated: Date.now() };
  const context: Array<{ id: string; text: string }> = feature.context || [];
  let area = feature.text || 'Selected Area';
  let city = 'Bangalore';
  let state = 'Karnataka';
  let country = 'India';
  let pincode = '';
  context.forEach(item => {
    if (item.id.startsWith('postcode')) pincode = item.text;
    else if (item.id.startsWith('place') || item.id.startsWith('district')) city = item.text;
    else if (item.id.startsWith('region')) state = item.text;
    else if (item.id.startsWith('country')) country = item.text;
    else if (item.id.startsWith('locality') || item.id.startsWith('neighborhood')) area = item.text;
  });
  return { lat, lng, area, city, state, country, pincode, formattedAddress: `${area}, ${city}`, lastUpdated: Date.now() };
}

export async function searchLocations(query: string, token = env.mapboxApiKey): Promise<LocationInfo[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3 || !token) return [];
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?access_token=${token}&country=IN&limit=5&autocomplete=true`;
  const response = await fetch(url);
  const data = await response.json();
  return (data?.features || []).map((feature: { id: string; place_name: string; text: string; center: [number, number]; context?: Array<{ id: string; text: string }> }) => {
    const context = feature.context || [];
    const city = context.find(item => item.id.startsWith('place') || item.id.startsWith('district'))?.text || feature.text;
    const pincode = context.find(item => item.id.startsWith('postcode'))?.text || '';
    return { id: feature.id, formattedAddress: feature.place_name, area: feature.text, city, pincode, lat: feature.center[1], lng: feature.center[0] };
  });
}

export async function getCurrentNativeLocation(): Promise<LocationInfo> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) throw new Error('Location permission was not granted.');
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  const { latitude: lat, longitude: lng } = position.coords;
  const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
  if (!place) return reverseGeocode(lat, lng);
  const area = place.district || place.street || place.subregion || 'Selected Area';
  const city = place.city || place.subregion || 'Selected City';
  return { lat, lng, area, city, state: place.region || '', country: place.country || 'India', pincode: place.postalCode || '', formattedAddress: [area, city, place.region, place.country].filter(Boolean).join(', '), lastUpdated: Date.now() };
}

export async function getLocationFromPincode(pincode: string): Promise<LocationInfo> {
  const matches = await Location.geocodeAsync(`${pincode}, India`);
  if (!matches.length) throw new Error('PIN code location was not found.');
  const { latitude: lat, longitude: lng } = matches[0];
  const location = await getAddressForCoordinates(lat, lng);
  return { ...location, pincode: location.pincode || pincode };
}

async function getAddressForCoordinates(lat: number, lng: number): Promise<LocationInfo> {
  const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
  if (!place) return reverseGeocode(lat, lng);
  const area = place.district || place.street || place.subregion || 'Selected Area';
  const city = place.city || place.subregion || 'Selected City';
  return { lat, lng, area, city, state: place.region || '', country: place.country || 'India', pincode: place.postalCode || '', formattedAddress: [area, city, place.region, place.country].filter(Boolean).join(', '), lastUpdated: Date.now() };
}
