import { RootStackParamList } from '../../types/navigation';

export function useHomeNavigation(navigation: any) {
  return {
    goToProduct: (productId: string | number) => {
      navigation.navigate('ProductDetails', { id: String(productId) });
    },
    
    goToShop: (shopId: string, mode?: 'nearby-delivery') => {
      navigation.navigate('ShopDetails', { id: String(shopId), mode });
    },

    goToService: (route: keyof RootStackParamList | string) => {
      navigation.navigate(route as any);
    },

    goToScanner: () => {
      navigation.navigate('ConsumerScanner');
    },

    goToProfile: () => {
      navigation.navigate('Profile');
    },

    goToOrders: () => {
      navigation.navigate('MyOrders');
    },

    goToKYC: () => {
      navigation.navigate('ConsumerKYC');
    },

    goToGiftCards: () => {
      navigation.navigate('GiftCards');
    },

    goToCart: () => {
      navigation.navigate('Cart');
    },

    goToDelivery: () => {
      navigation.navigate('Delivery');
    },
    
    goBack: () => {
      navigation.goBack();
    }
  };
}
export type HomeNavigationCoordinator = ReturnType<typeof useHomeNavigation>;
