import { create } from 'zustand';
import { AuthPayload, AuthUser } from '../types/domain';
import { clearAuth, getAccessToken, getStoredUser, storeAuth } from '../services/authStorage';

type AuthStore = {
  token: string;
  user: AuthUser | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (payload: AuthPayload) => Promise<void>;
  updateUser: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>(set => ({
  token: '',
  user: null,
  hydrated: false,
  hydrate: async () => set({ token: await getAccessToken(), user: await getStoredUser(), hydrated: true }),
  setSession: async payload => {
    const token = await storeAuth(payload);
    set({ token, user: payload.data?.user || payload.user || null });
  },
  updateUser: async user => {
    const token = await getAccessToken();
    await storeAuth({ access: token, user });
    set({ user });
  },
  logout: async () => {
    await clearAuth();
    set({ token: '', user: null });
  },
}));
