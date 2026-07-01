export const citySuggestions = ['Bengaluru', 'Mysuru', 'Mumbai', 'Pune', 'Chennai', 'Coimbatore', 'Hyderabad', 'Mangaluru'];

export const consumerProfile = {
  name: 'Trikonekt',
  idNumber: 'TRK-2026-1048',
  pinCode: '560038',
  phone: '+91 9999999999',
  city: 'Indiranagar, Bengaluru',
  membership: 'Prime Consumer Member',
  walletBalance: 'Rs. 2,450',
};

export const quickServices = [
  { label: 'Tri Pay', route: 'TriPay' },
  { label: 'Tri Zone', route: 'TriZone' },
  { label: 'Tri Eat', route: 'TriEat' },
  { label: 'Tri Drop', route: 'TriPickDrop' },
  { label: 'Tri Trip', route: 'TriTrip' },
  { label: 'Nearby Stores', route: 'NearbyStores' },
] as const;

export const products = [
  { id: 1, name: 'Urban Smart Watch', oldPrice: 'Rs. 4,999', newPrice: 'Rs. 2,499', discount: '50% OFF', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Cotton Streetwear Jacket', oldPrice: 'Rs. 3,299', newPrice: 'Rs. 1,849', discount: '44% OFF', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Compact Lounge Chair', oldPrice: 'Rs. 8,999', newPrice: 'Rs. 5,399', discount: '40% OFF', image: 'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Everyday Sneaker Pair', oldPrice: 'Rs. 2,799', newPrice: 'Rs. 1,599', discount: '43% OFF', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' },
];

export const remainingUiTodos = [
  'Convert MUI/CSS product cards into React Native FlatList/Card components.',
  'Replace react-icons with vector icons compatible with Expo, such as @expo/vector-icons.',
  'Replace browser location prompts with expo-location permission flow if GPS is required.',
  'Replace payment redirects/window.location with Linking or native payment SDK integrations.',
];