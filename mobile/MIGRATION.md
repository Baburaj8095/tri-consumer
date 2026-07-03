# Tri Consumer Mobile Migration

## Summary

Created a new Expo React Native TypeScript application in `mobile/` using the existing React web app only as a reference. The implementation focuses on platform-independent services, API integration points, state stores, navigation, theme primitives, and React Native screen placeholders.

The existing `frontend/` React web application was not modified.

## Files copied/adapted

- `frontend/src/utils/errorFormatter.js` -> `mobile/src/utils/errorFormatter.ts`
- `frontend/src/utils/logger.js` -> `mobile/src/utils/logger.ts`
- `frontend/src/utils/retry.js` -> `mobile/src/utils/retry.ts`
- `frontend/src/utils/urlEncode.js` -> `mobile/src/utils/urlEncode.ts`
- `frontend/src/services/dltValidator.js` -> `mobile/src/services/dltValidator.ts`
- `frontend/src/services/otpGenerator.js` -> `mobile/src/services/otpGenerator.ts`
- `frontend/src/services/smsService.js` -> `mobile/src/services/smsService.ts`
- `frontend/src/services/authStorage.js` -> `mobile/src/services/authStorage.ts` using AsyncStorage instead of browser localStorage
- `frontend/src/pages/consumer-ecommerce/context/LocationContext.jsx` business logic -> `mobile/src/services/locationService.ts` and `mobile/src/store/locationStore.ts`
- Data-only pieces from `frontend/src/pages/consumer-ecommerce/services/mockData.js` -> `mobile/src/constants/mockData.ts`

## Files skipped

- CSS files such as `consumerEcommerce.css` and `loginRegistration.css`
- MUI/Emotion web UI components
- `react-router-dom` route components
- Browser APIs: `window`, `document`, `navigator.geolocation`, direct `localStorage`, DOM refs/selectors
- HTML element JSX and DOM-specific markup
- `react-icons` UI usage
- Admin web pages unless a future mobile-admin scope is requested

## Libraries replaced

- `react-router-dom` -> `@react-navigation/native` and `@react-navigation/native-stack`
- `localStorage` -> `@react-native-async-storage/async-storage`
- Web/MUI/CSS layout -> React Native `View`, `Text`, `Pressable`, `FlatList`, `StyleSheet`
- CRA/web runtime -> Expo runtime
- Browser alerts/confirms/navigation redirects -> React Native `Alert`, React Navigation, future `Linking` or native SDKs

## Mobile dependencies

- Expo TypeScript template
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `react-native-screens`
- `react-native-safe-area-context`
- `react-native-gesture-handler`
- `axios`
- `@react-native-async-storage/async-storage`
- `zustand`

React Query was not added because the web project does not currently use it.

## Screen placeholders created

- Login
- Register
- ConsumerHome
- Delivery
- NearbyStores
- NearMe
- Ads
- Society
- BusinessRegistration
- ConsumerScanner
- Cart
- TriPay
- TriEat
- TriTrip
- TriPickDrop
- TriZone
- TriInventoryBilling
- Profile
- ConsumerKYC
- ShopDetails
- ProductDetails
- StorePayment
- SecureCheckout
- UpiPayment
- MyOrders
- Orders
- OrderDetails
- TrackOrder

Each placeholder preserves screen names, navigation flow, API integration points, and TODO comments for manual React Native UI conversion.

## Remaining migration tasks

1. Convert web pages to complete native UI using `View`, `Text`, `FlatList`, `Pressable`, native modals, and StyleSheet.
2. Replace `react-icons` with Expo-compatible icons such as `@expo/vector-icons`.
3. Add `expo-location` for native permission/current-location support.
4. Add `expo-camera` or another scanner package for `ConsumerScanner`.
5. Hubble gift cards now use the documented React Native WebView integration with a server-issued SSO URL, SDK action events, controlled external navigation, native back handling, and UPI scheme support.
6. Replace web payment redirects with `Linking`, native SDKs, or a WebView flow.
7. Add full form validation and native UX for OTP, registration, KYC, address, checkout, and profile editing.
8. Add unit tests for services and stores.
9. Configure deployed/local API URLs in `mobile/src/constants/env.ts`.

## Local testing without Android Studio/Xcode

Use Expo Go:

```cmd
cd mobile
npm start
```

Then scan the QR code with Expo Go on your phone.

## TypeScript validation

```cmd
cd mobile
npm run typecheck
```

## Cloud/native build options

For APK/IPA without local Android Studio/Xcode, use:

- EAS Build
- GitHub Actions Android/macOS runners
- Bitrise
- Codemagic
- Appetize.io after APK/IPA is produced

Recommended Expo cloud build flow:

```cmd
cd mobile
npx eas-cli build:configure
npx eas-cli build --platform android
npx eas-cli build --platform ios
```

## Notes

- Mobile API base URLs are in `mobile/src/constants/env.ts`.
- Android emulator local backend URLs should use `10.0.2.2` instead of `localhost`.
- The accidental root dependency install was cleaned up; mobile dependencies live under `mobile/`.
## Production native UI progress

- Added reusable native commerce components in `src/components/CommerceCards.tsx`.
- Upgraded Home to a native dashboard with hero banner, service tiles, shortcuts and horizontal deal cards.
- Upgraded Delivery to native search, category chips and product cards.
- Upgraded Nearby Stores to native search and store cards.
- Upgraded Cart to native line items, quantity controls and bill summary.
- Upgraded Secure Checkout, Shop Details, Product Details and My Orders to stronger native shells.
- TypeScript validation passes after native UI upgrades.
- Home now follows the complete web/Amazon-style commerce section order while retaining approved mock merchandising content for this version.
- Online, Nearby Stores, and Near Me are live-only flows; API failures show retryable errors rather than mock inventory.
- TriZone remains intentionally mock/presentational for the current release.

