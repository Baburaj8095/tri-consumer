import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useLocationStore } from '../store/locationStore';

export const useInitialHydration = () => {
  const hydrateAuth = useAuthStore(state => state.hydrate);
  const hydrateCart = useCartStore(state => state.hydrate);
  const hydrateLocation = useLocationStore(state => state.hydrate);

  useEffect(() => {
    void Promise.all([hydrateAuth(), hydrateCart(), hydrateLocation()]);
  }, [hydrateAuth, hydrateCart, hydrateLocation]);
};