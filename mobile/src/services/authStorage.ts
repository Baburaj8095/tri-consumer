import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { env } from '../constants/env';
import { AuthPayload, AuthUser } from '../types/domain';

const KEYS = {
  token: 'triConsumerToken',
  access: 'triConsumerAccess',
  refresh: 'triConsumerRefresh',
  user: 'triConsumerUser',
};

export async function storeAuth(data: AuthPayload): Promise<string> {
  const auth = data?.data || data || {};
  const token = auth.access || auth.token || '';
  const pairs: [string, string][] = [];
  if (token) pairs.push([KEYS.token, token], [KEYS.access, token]);
  if (auth.refresh) pairs.push([KEYS.refresh, auth.refresh]);
  if (auth.user) pairs.push([KEYS.user, JSON.stringify(auth.user)]);
  await Promise.all(pairs.map(([key, value]) => AsyncStorage.setItem(key, value)));
  return token;
}

export async function getAccessToken(): Promise<string> {
  return (await AsyncStorage.getItem(KEYS.access)) || (await AsyncStorage.getItem(KEYS.token)) || '';
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(KEYS.user);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export async function clearAuth(): Promise<void> {
  await Promise.all(Object.values(KEYS).map(key => AsyncStorage.removeItem(key)));
}

export async function tryTokenRefresh(): Promise<boolean> {
  const refreshToken = await AsyncStorage.getItem(KEYS.refresh);
  if (!refreshToken) return false;
  try {
    const res = await axios.post(`${env.apiBaseUrl}/api/auth/refresh`, { refresh: refreshToken });
    const authData = res.data?.data || res.data;
    if (authData?.access || authData?.token) {
      await storeAuth(res.data);
      return true;
    }
  } catch (_) {
    await clearAuth();
  }
  return false;
}