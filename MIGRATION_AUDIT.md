# React Web to React Native Migration Audit

Audit date: 2026-07-03  
Web source: `frontend/`  
Mobile target: `mobile/`

## Remediation progress after audit

Following scope confirmation, admin and administrative KYC are an approved **web-only exclusion**. Consumer-mobile remediation has started and the following audit gaps are now implemented in source:

* Auth hydration now gates and selects the authenticated/guest navigator.
* Cart now loads and creates delivery addresses, validates automatically, offers ONLINE/COD, creates orders, and clears only after order creation.
* Online order payment URLs use native `Linking`; manual UPI can launch an installed UPI app.
* Tracking fetches live order details and refreshes every 15 seconds instead of displaying fixed completion.
* Cancellation now requires destructive confirmation.
* Native location permission, current-location reverse geocoding, and PIN geocoding use `expo-location`.
* QR scanning uses `expo-camera` with permission handling and secure-link validation.
* Hubble gift cards have a native WebView screen using the signed iframe URL.
  The WebView now follows Hubble's React Native guide: `wrap-plt=rn`, `app_ready`/`close`/`error` events, controlled navigation, external payment schemes, Android back handling, disabled cache, and iOS/Android UPI declarations.
* Profile saves synchronize the persisted/in-memory authenticated user.
* Expo camera, location, notifications, and WebView packages plus platform permission descriptions are configured.
* `mobile/assets/logo.png` is now used by the native splash, hydration/loading screen, Login, and Register.
* DigiLocker mobile initiation now requests an RN callback, returns through `trikonekt://kyc`, and refreshes KYC status when the screen regains focus.
* OTP country parsing now preserves supported `+91`, `+44`, and `+1` country codes.
* Product/Online, Nearby Stores, and Near Me now use normalized live API responses only, with explicit loading, error, retry, empty states, server-side search/category parameters, live categories, and sponsored stores. Mock product fallback was removed from these flows.
* Home is intentionally allowed to retain mock merchandising content for this release, but its native section hierarchy now mirrors the web Amazon-style dashboard: services, Explore Near Me, live deals, Gift Cards, TriAdz, categories, cashback, community/business banners, visited/clothing/personalized products, nearby stores, and persistent bottom navigation.
* TriZone remains an approved mock/presentational module for this release.

The detailed sections below preserve the original audit baseline. Remaining backend-dependent work includes real business-lead submission, password-reset completion, KYC bank/nominee APIs, notification device-token registration/inbox APIs, and real service APIs for the web application's own mock-only Tri Trip/Pick Drop/Inventory experiences.

## Executive verdict

The React web app has **not been fully migrated** to React Native.

The mobile repository is a compilable Expo/TypeScript shell with a credible port of authentication, registration, profile editing, basic catalog browsing, cart persistence, and the first step of manual store payments. It also reproduces many web layouts with native components. However, several screen names only provide visual parity, and the most revenue-critical delivery checkout path is broken at the business-process level: the mobile Cart screen does not load or create delivery addresses, does not create an order, does not offer COD/online order payment selection, and routes directly into the unrelated offline merchant-payment flow.

The repository's own `mobile/MIGRATION.md` accurately describes its initial scope as services, stores, navigation, and placeholders, and lists native UI conversion, GPS, camera scanning, gift cards, payment redirects, and validation as remaining work. Some UI has since been expanded, but those integrations remain incomplete.

### Overall status

| Area | Status | Business assessment |
|---|---|---|
| Username/password login | Migrated | API and session storage are ported. |
| OTP login | Migrated with caveats | API flow exists; country-code handling is effectively India-only. |
| Registration/onboarding | Mostly migrated | Sponsor, OTP, pincode, validation, and register API exist; gender and full address are not submitted, matching a web limitation. |
| Session bootstrap/protection | Partial | Async hydration exists, but navigation always starts at Login and screens are not guarded. |
| Home/dashboard | Partial/changed | Native dashboard exists but much content, wallet data, location, and deals are hard-coded. |
| Catalog/delivery browsing | Partial | Product API is called; filters and response handling differ; mock products silently replace failures. |
| Nearby stores | Partial | Merchant API is called; categories and sponsored-shop API integrations are omitted. |
| Product/shop details | Partial | Basic catalog views exist; shop metadata, nearby-delivery mode, cross-store confirmation, variants, and recommendations are incomplete. |
| Cart persistence/quantity CRUD | Migrated with regression | AsyncStorage/Zustand port works, but silently discards the prior shop's cart. |
| Address CRUD | Missing from UI | Service methods exist but no mobile screen calls them. |
| Order creation | Missing from UI | `cartService.createOrder` exists but is never called. |
| Online payment/COD | Missing | No order-payment selection, redirect, SDK, WebView, or `Linking` implementation. |
| Manual store payment | Partial | Initiation API exists; merchant lookup, UPI deep link, confirmation polling, and verification are absent. |
| Orders/history | Partial | Fetch and cancel APIs exist, but parsing, filtering, refresh, confirmation, payment actions, and error states are reduced. |
| Order tracking | Missing (static UI only) | Timeline is hard-coded and never fetches order state. |
| Profile | Mostly migrated | GET/PUT exist; store/session profile is not refreshed after save and validation is weaker. |
| Consumer KYC | Partial | DigiLocker status/start exists; bank save and nominees are fake/absent. |
| Scanner | Missing | Camera package and scanning are absent; users manually paste a result. |
| Location/GPS | Partial | Persistence and Mapbox helpers are ported; native permission/GPS acquisition and manual search UI are absent. PIN entry assigns fixed Kalaburagi coordinates. |
| Gift cards/Hubble | Missing from UI | API wrapper exists, but no WebView/SDK/screen uses it. |
| Notifications | Missing | Home shows an inert notification icon; no notification screen, permission, token, or API exists. |
| Settings | Missing as a distinct feature | Neither a settings route nor native settings module is present; only profile editing/logout exists. |
| Business registration | Migrated as mock | It faithfully ports the web's fake timeout/autodetected user behavior, not a real backend integration. |
| Ads/rewards | Changed/partial | Local points UI is ported, with fewer ads; no persistence or server crediting exists in either app. |
| Tri Pay / Trip / Pick Drop / Inventory | Visual-only or mock | Most actions display static values or alerts and do not execute business operations. |
| Admin/KYC administration | Missing by declared scope | Large web admin modules were intentionally skipped. |
| Error handling | Partial | Formatters/interceptors exist, but most screen fetches swallow errors and dedicated error/loading screens are unused. |

## Critical findings, prioritized

1. **Delivery orders cannot be placed on mobile.** Web `CartPage.handleProceedCheckout` posts the selected address, items, channel, coordinates, and payment mode to `/api/orders`, then redirects to online payment or tracking. Mobile `CartScreen` only calculates a client-side total and navigates to `SecureCheckout`; `cartService.createOrder` is dead integration code.
2. **Mobile checkout changes the transaction type.** `SecureCheckoutScreen.pay` calls `/captain/offline-payments`, which creates a store-payment record, not the delivery order created by the web Cart flow. This can lose fulfillment, address, inventory validation, order items, and delivery state.
3. **UPI is not launched.** Web constructs `upi://pay?...` and assigns `window.location.href`. Mobile displays instructions and immediately allows “I have paid”; it does not call `Linking.openURL`, render a QR, poll status, or verify payment.
4. **Tracking is fabricated.** Mobile always marks the first three of six steps complete, independent of order data. A user can see misleading fulfillment state.
5. **Authentication state does not drive navigation.** `useInitialHydration` loads the token, but `AppNavigator` has `initialRouteName="Login"` unconditionally. Conversely, protected screens do not redirect unauthenticated users. A valid returning user must log in again, while stack navigation may expose protected shells.
6. **The cart silently drops products when adding from another store.** Web asks for confirmation before clearing. Mobile `cartStore.addProduct` replaces `items` whenever `shopId` changes, without warning.
7. **Location is not real.** No `expo-location` dependency exists. Home accepts any six-digit PIN but stores fixed Borabai Nagar/Kalaburagi coordinates, so nearby inventory and delivery eligibility can be wrong.
8. **KYC bank and nominee operations are not migrated.** Mobile “Save Bank Details” only changes local UI text and tabs; nominees are always an empty-state card.
9. **API failures frequently masquerade as empty or mock data.** Delivery falls back to consumer mock products; nearby stores/orders become empty; order tracking stays static. This hides production incidents and makes parity testing unreliable.
10. **Several displayed financial values are hard-coded.** Home wallet, Tri Pay balance, rewards, inventory sales, and profile fallbacks can show another person's sample data (`Baburaj`, phone, fixed location) when live user data is absent.

## Feature-by-feature evidence

### 1. Authentication and session lifecycle

* **Web source:** `frontend/src/pages/login-registration/LoginForm.jsx` — `handleLoginSubmit`, `handleSendOtp`, `handleOtpSubmit`; `frontend/src/services/authStorage.js` — `storeAuth`, `getAccessToken`, `tryTokenRefresh`, `clearAuth`.
* **Mobile equivalent:** `mobile/src/screens/AuthScreens.tsx` — `LoginScreen.login`, `sendOtp`, `verifyOtp`; `mobile/src/services/authService.ts`; `mobile/src/services/authStorage.ts`; `mobile/src/store/authStore.ts`; `mobile/src/api/client.ts`.
* **Migration status:** **Partial / changed**.
* **Business purpose:** Authenticate consumers by password or OTP, persist access/refresh tokens, and recover expired sessions.
* **Functionality:** Both implementations call `/api/auth/login`, `/api/auth/send-otp`, `/api/auth/verify-otp`, and `/api/auth/refresh`. Mobile correctly replaces `localStorage` with AsyncStorage and centralizes authorization/401 retry in Axios interceptors. Login uses `navigation.replace('ConsumerHome')`, preventing a normal back-navigation to Login.
* **Differences:** Mobile's `rememberMe` is cosmetic because sessions are always persisted. Its SMS splitter always returns `+91`, even when the UI cycles through `+1` and `+44`. The web has the same splitter defect. Mobile hydrates auth asynchronously but never selects the initial stack based on `token`/`hydrated`. Web routes are also not globally protected, though individual data screens often redirect when no token exists.
* **Risk / impact:** Returning users see Login; invalid/expired sessions can remain in in-memory Zustand after an interceptor only clears AsyncStorage; non-Indian OTP delivery is incorrect; protected native shells may be reachable without a valid session.
* **Recommendation:** Render a splash while hydration runs, then choose authenticated vs unauthenticated navigators; have the 401 interceptor call a store-level logout/navigation reset; either support arbitrary country codes correctly or remove unsupported choices; define remember-me semantics.

### 2. Forgot/reset password

* **Web source:** `LoginForm.jsx`, views `forgot-password`, `forgot-password-otp`, `reset-password`.
* **Mobile equivalent:** `AuthScreens.tsx`, `LoginScreen.sendOtp`, `verifyOtp`, `reset`.
* **Migration status:** **Changed, but incomplete in both**.
* **Business purpose:** Recover account access.
* **Functionality:** Mobile improves the web by sending a `FORGOT_PASSWORD` OTP and validating new-password length/match.
* **Differences:** Neither app calls a password-reset API. Web advances without sending/verifying a forgot-password OTP and shows an “Updated” alert; mobile verifies the OTP but still only shows a success alert and changes local view state.
* **Risk / impact:** Users are told a password was changed when the server password is unchanged—a severe trust and support issue.
* **Recommendation:** Add the backend reset endpoint with an OTP verification token, disable success messaging until it returns successfully, and add integration tests.

### 3. Registration/onboarding

* **Web source:** `frontend/src/pages/login-registration/RegisterForm.jsx` — sponsor debounce, pincode debounce, `validateStep`, `handleSendOtp`, `handleVerifyOtp`, `handleSubmit`.
* **Mobile equivalent:** `mobile/src/screens/AuthScreens.tsx` — `RegisterScreen`, effects at the sponsor/pincode code path, `validate`, `sendRegOtp`, `verifyRegOtp`, `submit`; `authService`.
* **Migration status:** **Mostly migrated**.
* **Business purpose:** Sponsor-linked consumer acquisition with mobile verification and address enrichment.
* **Functionality:** Three steps, sponsor validation, registration OTP, pincode lookup, email/password/terms validation, registration POST, session storage, and return to login are present in both.
* **Differences:** URL query sponsor IDs become typed navigation params; there is no demonstrated deep-link configuration to populate them. Country selection is a tap-cycle rather than a picker. Address fields look editable but use no-op handlers. Both collect gender, village, taluk, and country but omit them from the registration payload. Mobile stores the returned session and then navigates to Login, which is internally inconsistent.
* **Risk / impact:** Referral links may not work; users may believe address/gender data was submitted when it was discarded; token state may say authenticated while Login is displayed.
* **Recommendation:** Add Expo deep linking for sponsor URLs, submit the full backend-supported schema, render lookup fields as explicitly read-only, and either enter the authenticated app after registration or do not store a session.

### 4. Home/dashboard, header, and account drawer

* **Web source:** `frontend/src/pages/consumer-ecommerce/pages/App.jsx`; `components/Header.jsx`; `AdsCarousel`, `CashbackAds`, `GiftCardsSection`, `ShortcutGridSection`, `BottomNav`.
* **Mobile equivalent:** `mobile/src/screens/HomeScreen.tsx`; `CommerceCards.tsx`; native bottom action bar and profile drawer embedded in the screen.
* **Migration status:** **Partial / materially changed**.
* **Business purpose:** Primary discovery, navigation, wallet/account summary, cart visibility, promotions, and nearby merchant entry.
* **Functionality:** Mobile offers service tiles, near-me, delivery, nearby stores, deal cards, cart count, profile drawer, profile/KYC/orders links, and logout.
* **Differences:** Web fetches B2C merchants and profile details; mobile Home does neither. It uses fallback identity (`Baburaj`, a sample phone), static wallet/deals, static greeting, and mock products. Its notification icon has no `onPress`. The avatar camera badge has no camera/gallery behavior, while web stores a chosen profile image. Web gift-card and ad sections have no home equivalent. Mobile duplicates location/cart hydration already invoked in `AppNavigator`.
* **Risk / impact:** Stale or wrong personal/financial data can be displayed; promotions and merchants are not personalized; notifications and avatar affordances are misleading.
* **Recommendation:** Load profile/dashboard data through stores, remove person-specific fallbacks, wire only functional actions, port dynamic merchant/ad/gift-card modules, and centralize hydration once.

### 5. Location and nearby discovery

* **Web source:** `context/LocationContext.jsx`; `LocationPickerModal.jsx`; `LocationSelectorModal.jsx`; `NearbyStoresPage.jsx`; `NearMePage.jsx`.
* **Mobile equivalent:** `services/locationService.ts`; `store/locationStore.ts`; Home PIN modal; `NearbyStoresScreen`; `NearMeScreen`.
* **Migration status:** **Partial**.
* **Business purpose:** Persist a consumer location, discover nearby stores/products, and provide coordinates for delivery validation.
* **Functionality:** Haversine distance, Mapbox reverse geocode/search helpers, current/recent location persistence, merchant fetch by coordinates, and product search UI exist.
* **Differences:** Mobile has no `expo-location`, permission request, GPS acquisition, first-login choice, Mapbox config fetch, location-search UI, request cancellation/cache, or fallback suggestions. `env.mapboxApiKey` is empty. Home PIN save assigns fixed Kalaburagi coordinates to every PIN. Nearby mobile omits category fetch/filtering and sponsored-shop fetch/impression behavior. `NearMeScreen` ignores location and filters product titles for words such as “Hotels”.
* **Risk / impact:** Incorrect nearby results, pricing, distance, deliverability, and taxes; empty manual search; privacy/permission flow absent.
* **Recommendation:** Add `expo-location`, platform permission strings, backend-delivered Mapbox config, pincode geocoding, cancellable autocomplete, and explicit permission-denied states. Pass accurate coordinates into cart/order data.

### 6. Delivery catalog and product discovery

* **Web source:** `DeliveryPage.jsx` — `fetchProducts`, `addToCart`; `ProductDetailsPage.jsx`; `NearMePage.jsx`; cards/templates under `components/` and `components/ui/`.
* **Mobile equivalent:** `CommerceScreens.tsx` — `DeliveryScreen`, `ProductDetailsScreen`; `ServicePlaceholders.tsx` — `NearMeScreen`; `CommerceCards.tsx`; `catalogService.ts`.
* **Migration status:** **Partial**.
* **Business purpose:** Browse/search/filter purchasable inventory and add products to a persistent cart.
* **Functionality:** Mobile fetches online products, filters them locally, shows native cards/details, and persists adds.
* **Differences:** Web sends category/search parameters to the backend; mobile downloads at most 100 and performs simplistic title matching. On API failure mobile silently displays unrelated mock products. Product detail re-downloads the full list rather than using a detail endpoint/navigation cache. Web has richer images, recommendations, buy-now, cart badge, loading/error handling, and cross-store confirmation.
* **Risk / impact:** Incomplete search results, wrong category behavior, stale inventory/prices, and mock products appearing purchasable in production.
* **Recommendation:** Preserve server-side query semantics and pagination; use product detail endpoint/cache; separate demo fixtures from production fallback; port loading/error/stock/variant logic; add telemetry.

### 7. Shop details and nearby-delivery mode

* **Web source:** `ShopDetailsPage.jsx` — shop/details requests, `handleAddToCart`, `handleUpdateQty`; route state/query supports nearby mode and coordinates.
* **Mobile equivalent:** `ShopDetailsScreen`; `catalogService.getShopDetails`, `getNearbyShopDetails`, `getShopProducts`, `getNearbyShopDeliveryProducts`; navigation type includes `mode`, `lat`, `lng`.
* **Migration status:** **Partial; service surface is ahead of UI**.
* **Business purpose:** Present merchant identity and the correct catalog for standard or nearby delivery.
* **Functionality:** Mobile calls only `getShopProducts`, renders a generic image/title, and adds items with shop metadata.
* **Differences:** It never calls the shop-detail methods, never reads `mode/lat/lng`, and never selects the nearby delivery-products endpoint. Web shows actual shop metadata and confirms before replacing another store's cart.
* **Risk / impact:** Wrong catalog/channel, missing delivery coordinates, generic merchant identity, silent cart loss.
* **Recommendation:** Branch on navigation mode, fetch both shop and appropriate catalog, set `orderChannel`/coordinates, and require confirmation before cart replacement.

### 8. Cart item CRUD and persistence

* **Web source:** `CartPage.jsx`, `DeliveryPage.addToCart`, `ShopDetailsPage.handleAddToCart`, `ProductDetailsPage.handleAddToCart`; `localStorage` key `tri_consumer_cart`.
* **Mobile equivalent:** `store/cartStore.ts`; `CartScreen`; `CartLineItem`.
* **Migration status:** **Core CRUD migrated; rules and totals changed**.
* **Business purpose:** Maintain one merchant cart, change quantities, remove items, and calculate checkout totals.
* **Functionality:** AsyncStorage persistence, add/increment/decrement/remove-by-zero, clear, count, and a bill summary work.
* **Differences:** Cross-store replacement is silent. Mobile computes fixed `45` delivery and `5%` tax locally before backend validation; web uses backend validation results and delivery address. Mobile has no explicit remove button, stock constraints, validation display, or disabled empty checkout.
* **Risk / impact:** Lost cart items and totals that disagree with server prices/fees; empty/invalid carts can enter checkout.
* **Recommendation:** Make backend validation authoritative, show item-level errors/totals, confirm merchant changes, and gate checkout on a valid nonempty cart.

### 9. Delivery addresses and order creation

* **Web source:** `CartPage.fetchAddresses`, `handleAddNewAddress`, `runValidation`, `handleProceedCheckout`.
* **Mobile equivalent:** `cartService.getAddresses`, `createAddress`, `validateCart`, `createOrder`; no equivalent mobile UI/workflow.
* **Migration status:** **Missing from the working mobile path**.
* **Business purpose:** Select/create fulfillment destination, validate eligibility/pricing, create a delivery order, and choose ONLINE or COD.
* **Functionality:** Mobile service signatures reproduce endpoints/payloads, but only `validateCart` is called manually to dump JSON in an Alert. `getAddresses`, `createAddress`, and `createOrder` have no callers.
* **Differences:** Mobile Checkout navigates directly to a store manual-payment record instead of creating an order. It does not clear the cart after successful order creation because order creation never happens.
* **Risk / impact:** Complete blocker for revenue and delivery fulfillment; a payment may be recorded without an order/address/items.
* **Recommendation:** Treat this as P0. Port address list/form/default selection, automatic validation, ONLINE/COD selection, `createOrder`, cart clearing only on success, payment redirect/native handoff, and tracking navigation.

### 10. Store payment, UPI, and online payment

* **Web source:** `StorePaymentPage.jsx`, `SecureCheckoutPage.handlePayNow`, `UpiPaymentPage.handleOpenUpiApp`, plus the online `payment_intent_url` branch in `CartPage`.
* **Mobile equivalent:** `StorePaymentScreen`, `SecureCheckoutScreen.pay`, `UpiPaymentScreen`, `paymentService.ts`.
* **Migration status:** **Partial for manual initiation; missing for actual payment**.
* **Business purpose:** Collect a store amount, create an offline/manual payment approval record, launch UPI, or complete online order payment.
* **Functionality:** Amount entry and `/captain/offline-payments` initiation are ported; `onlineOrderId` can be forwarded.
* **Differences:** Mobile does not fetch/display merchant details, choose a payment method, open a UPI app, render a merchant QR, use a native SDK/WebView, handle `payment_intent_url`, or confirm/poll transaction status. “I have paid” only navigates to history.
* **Risk / impact:** Users cannot actually pay from the app and can self-advance without proof; payment/order reconciliation is unreliable.
* **Recommendation:** Implement `Linking.canOpenURL/openURL` for a server-provided VPA/pay URI or integrate the selected PSP SDK; add callback/deep-link handling, server verification, polling, cancellation, and idempotency. Keep delivery-order payment distinct from generic store payment.

### 11. Orders, cancellation, details, and tracking

* **Web source:** `MyOrdersPage.jsx`, `OrdersPage.jsx`, `OrderDetailsPage.jsx`, `TrackOrderPage.jsx`.
* **Mobile equivalent:** `MyOrdersScreen`, `OrdersScreen`, `OrderDetailsScreen`, `TrackOrderScreen`; `orderService.ts`.
* **Migration status:** **Partial; tracking is missing**.
* **Business purpose:** Unified transaction history, status-aware actions, cancellation, payment continuation, detail inspection, and delivery tracking.
* **Functionality:** Mobile fetches offline payments/orders, fetches a detail, and invokes cancel.
* **Differences:** Mobile assumes service responses are arrays even though other screens unwrap `data`; errors become empty lists. It omits tabs/categories, pending-order payment action, cancellation confirmation, reload after cancel, status-aware action gating, robust formatting, phone/tracking links, and token-expiry navigation. `TrackOrderScreen` never calls the API and hard-codes three completed steps. Web detail/tracking also has mock fallback data, which should not be mistaken for reliable production behavior.
* **Risk / impact:** Empty histories from response-shape mismatch, accidental cancellation, stale status, and false tracking information.
* **Recommendation:** Normalize API responses in services, model order/payment types, confirm and refresh cancellation, map actions by state, and drive tracking from live status/events with explicit unavailable states.

### 12. Profile/account editing

* **Web source:** `ProfilePage.jsx`; `Header.jsx` profile fetch/photo/logout behavior.
* **Mobile equivalent:** `ProfileScreen`; `profileService.ts`; `authStore.logout`; Home drawer.
* **Migration status:** **Mostly migrated**.
* **Business purpose:** Maintain consumer identity/contact/address and terminate the session.
* **Functionality:** Mobile fetches `/api/users/me`, updates `/api/users/profile`, validates required name/mobile, reports API errors, and clears session on explicit logout.
* **Differences:** Mobile does not update `authStore.user`/stored user after save, does not enforce pincode/email/phone formats, and lacks profile image camera/gallery/removal. A 401 clears AsyncStorage via interceptor but does not automatically route to Login.
* **Risk / impact:** Home drawer remains stale after edits; invalid data may reach the API; session expiry UX is inconsistent.
* **Recommendation:** Return/update the canonical profile in the auth store, add validation, implement `expo-image-picker` only if profile photos remain in scope, and centralize unauthorized navigation.

### 13. KYC, bank, and nominees

* **Web source:** `ConsumerKYC.jsx` — `fetchDlStatus`, `fetchLegacyKycData`, `fetchNominees`, `handleStartDigilocker`, `handleBankSubmit`.
* **Mobile equivalent:** `ConsumerKYCScreen`; `profileService.getKycStatus`, `getKycProfile`, `startKyc`.
* **Migration status:** **Partial**.
* **Business purpose:** Regulatory identity verification plus payout bank and nominee administration.
* **Functionality:** Mobile gets DigiLocker status/profile, maps status copy/colors, starts KYC, and opens the authorization URL with `Linking`.
* **Differences:** Mobile does not fetch legacy bank KYC or nominees and has no bank/nominee service methods. “Save Bank Details” is local state only. It does not handle an app deep-link return/callback or refresh status after returning. Fetch errors are swallowed.
* **Risk / impact:** Users can be falsely told bank details were saved; compliance onboarding cannot be completed; KYC status may stay stale.
* **Recommendation:** Port bank and nominee endpoints/validation, configure callback deep links, refresh on app foreground, and never show saved success without a server response.

### 14. QR scanner

* **Web source:** `ConsumerScannerPage.jsx` — `getUserMedia`, `BarcodeDetector`, stream/timer cleanup, result state.
* **Mobile equivalent:** `ConsumerScannerScreen`.
* **Migration status:** **Missing**.
* **Business purpose:** Scan merchant/payment/service QR codes.
* **Functionality:** Mobile renders a scanner-shaped panel and lets users paste arbitrary text.
* **Differences:** No camera dependency, permission, preview, barcode detection, validation, routing, or cleanup exists. The screen explicitly says the camera package is not installed.
* **Risk / impact:** Prominent scanner buttons lead to a nonfunctional core payment affordance.
* **Recommendation:** Add Expo Camera/barcode scanning, permission-denied UX, supported payload validation, one-shot/debounce behavior, and route scanned payment/deep-link data safely.

### 15. Ads and rewards

* **Web source:** `AdsPage.jsx`; `AdsCarousel.jsx`; `CashbackAds.jsx`.
* **Mobile equivalent:** `AdsScreen`; static deals on Home.
* **Migration status:** **Changed / partial**.
* **Business purpose:** Promotional engagement and point earning.
* **Functionality:** Selecting an ad and locally adding points is ported.
* **Differences:** Mobile has four rather than six ad fixtures, no actual timed playback enforcement, persistence, fraud protection, server crediting, banner API, or sponsored impression tracking. Web reward behavior is also only local/demo.
* **Risk / impact:** Users can repeatedly tap completion for unlimited local points; displayed rewards have no business value.
* **Recommendation:** Mark as demo or integrate an auditable ad/reward backend; require completion callbacks and persist balances server-side.

### 16. Gift cards / Hubble

* **Web source:** `GiftCardsSection.jsx`, `HubbleGiftCardModal.jsx`, `pages/.../services/hubbleService.js`; legacy `services/giftCard/*` mock provider abstraction.
* **Mobile equivalent:** `services/hubbleService.ts` only.
* **Migration status:** **Missing from the UI**.
* **Business purpose:** Open signed Hubble gift-card commerce and show user transactions.
* **Functionality:** Mobile wrappers call iframe URL and transaction endpoints.
* **Differences:** No screen imports the wrapper; no `react-native-webview`, external-browser strategy, callbacks, or transaction view exists. The legacy web gift-card provider is mock/dead relative to the active Hubble modal.
* **Risk / impact:** Gift-card revenue path is absent despite labels in Tri Pay.
* **Recommendation:** Decide WebView vs browser/SDK with security review, implement authenticated handoff/callbacks, expose transaction status, and remove or clearly segregate the obsolete mock provider.

### 17. Business registration

* **Web source:** `BusinessRegistrationPage.jsx`; `BusinessRegistrationModal.jsx`.
* **Mobile equivalent:** `BusinessRegistrationScreen`.
* **Migration status:** **Migrated as mock behavior**.
* **Business purpose:** Collect a prospective merchant lead.
* **Functionality:** Both validate mobile/category, fabricate the same Baburaj/Bangalore profile at ten digits, wait on a timer, and show success.
* **Differences:** Mobile's delay is 900 ms vs web's 1500 ms; neither posts a lead.
* **Risk / impact:** Users are promised an admin follow-up although no record is created.
* **Recommendation:** Add a real lead endpoint and consent/error/idempotency handling before presenting success.

### 18. Tri Pay, Tri Eat, Tri Trip, Tri Pick Drop, Tri Zone, Society, Inventory/Billing

* **Web source:** corresponding pages under `frontend/src/pages/consumer-ecommerce/pages/`.
* **Mobile equivalent:** corresponding exports in `ServicePlaceholders.tsx`.
* **Migration status:** **Mostly visual parity; changed/placeholder**.
* **Business purpose:** Umbrella service discovery for payments, food, travel, logistics, community, and merchant tools.
* **Functionality:** Native layouts, tabs/filters, navigation cards, and external social links broadly mirror the web demonstrations.
* **Differences:** Tri Pay values/actions are static; Tri Eat uses mock restaurants; Tri Trip fields are read-only and search is an alert; Pick Drop inputs have no-op setters and booking is an alert; Inventory numbers are static; several Society internal actions are alerts. Web implementations are also largely presentational, so visual migration does not create real business capability.
* **Risk / impact:** Users can mistake mock data and buttons for live services. Hard-coded balances/sales are especially risky.
* **Recommendation:** Feature-flag or label demos, remove fake financial/operational figures, and implement each service against an owned API before production exposure.

### 19. Notifications and settings

* **Web source:** notification icon/menu affordances in `Header.jsx`; profile/logout. No confirmed functional notifications or dedicated settings route was found.
* **Mobile equivalent:** inert notification icon in `HomeScreen.tsx`; profile/logout only.
* **Migration status:** **Missing / cannot confirm from either repo**.
* **Business purpose:** Transaction alerts, delivery/payment updates, preferences, privacy, and account controls.
* **Functionality:** No push permission/token registration, notification inbox, deep-link handling, preference API, or settings screen exists.
* **Differences:** Mobile platform requirements (APNs/FCM, Android channels, runtime permission) have not been addressed.
* **Risk / impact:** Users miss payment/order events and cannot control preferences.
* **Recommendation:** Confirm product scope. If required, add Expo Notifications/native setup, backend device-token lifecycle, channels/categories, deep links, inbox, and preference controls.

### 20. Admin and administrative KYC (approved web-only exclusion)

* **Web source:** `AdminDashboard.jsx`, `AdminKYC.jsx`, `DataTable.jsx`, plus one-off migration scripts.
* **Mobile equivalent:** none.
* **Migration status:** **Not applicable to mobile; approved web-only scope**.
* **Business purpose:** Admin login, metrics, consumer/admin CRUD, block/activation, OTP monitoring, KYC review, and Hubble administration.
* **Functionality:** The web has large working API surfaces; mobile documentation says admin pages were skipped unless mobile-admin scope is requested.
* **Differences:** No admin navigator, role gating, or screens exist.
* **Risk / impact:** None for consumer-mobile parity. Admin remains available through the existing web application.
* **Recommendation:** Keep admin web-only and regression-test it independently. Do not add admin routes, credentials, or privileges to the consumer mobile bundle.

### 21. Error, loading, and offline behavior

* **Web source:** `utils/errorFormatter.js`, `retry.js`, page-local loading/errors, auth refresh branches.
* **Mobile equivalent:** typed `errorFormatter.ts`, `retry.ts`, `logger.ts`, Axios interceptors, `ErrorScreen.tsx`, `LoadingScreen.tsx`.
* **Migration status:** **Utilities migrated; screen behavior partial**.
* **Business purpose:** Explain recoverable failures, refresh sessions, and prevent false success/empty states.
* **Functionality:** Shared utility ports are close equivalents; mobile centralizes token attachment/one retry.
* **Differences:** Dedicated Error/Loading screens are not registered or referenced. Most list screens catch errors and show empty state/mock data without distinguishing network/auth/server/no-data. Retry utility and logger have no material callers. There is no offline queue or connectivity state.
* **Risk / impact:** Outages look like no inventory/orders; debugging and support are harder; users may act on fallback data.
* **Recommendation:** Add query state models, retry actions, explicit offline/server/auth/no-data UI, error boundaries, logging/telemetry, and tests for 401 concurrency and refresh failure.

## Important module and function map

### Shared logic that was genuinely ported

| Web module | Mobile module | Purpose and assessment |
|---|---|---|
| `services/authStorage.js` | `services/authStorage.ts` | Token/user persistence and refresh; proper AsyncStorage adaptation. |
| `services/smsService.js` | `services/smsService.ts` | OTP send/verify; nearly line-for-line typed port, including India-only splitter limitation. |
| `services/otpGenerator.js` | `services/otpGenerator.ts` | Local OTP/expiry helpers; mobile login does not need local generation. |
| `services/dltValidator.js` | `services/dltValidator.ts` | DLT message construction/validation; no confirmed working screen caller in either app. |
| `utils/errorFormatter.js` | `utils/errorFormatter.ts` | Normalize Axios/backend/general errors; shortened typed port. |
| `utils/retry.js`, `logger.js`, `urlEncode.js` | typed equivalents | Infrastructure helpers; no material mobile screen use found. |
| `LocationContext` distance/geocoding/search | `locationService.ts` + `locationStore.ts` | Good separation of pure service/persistence, but native acquisition/config/UI omitted. |
| Local cart state | `cartStore.ts` | Appropriate Zustand + AsyncStorage adaptation; business confirmation rule regressed. |

### Mobile-only service abstractions

* `api/client.ts`: centralizes two Axios clients, async auth attachment, refresh, and retry. It improves duplication over web, but must synchronize store/logout state and be tested for simultaneous 401s.
* `authService.ts`: extracts login/register/sponsor/pincode/profile endpoints from page components.
* `catalogService.ts`: captures online products, merchants, categories, sponsored shops, and shop catalogs. Several methods are currently unused by screens.
* `cartService.ts`: captures address, validation, and order endpoints. Only validation is used by UI; the revenue-critical methods are dormant.
* `orderService.ts`: captures history/detail/cancel/offline payments. Response normalization is absent.
* `paymentService.ts`: only supports offline payment initiation; no actual PSP/UPI execution or verification.
* `profileService.ts`: profile and partial KYC. Missing bank/nominee endpoints.
* `hubbleService.ts`: API wrapper with explicit WebView TODO and no callers.

### UI/component architecture

* Web uses MUI, Emotion/CSS, React DOM elements, `react-icons`, BrowserRouter, browser modals/files/camera/location, and both reusable `Tri*` components and page-local UI.
* Mobile appropriately replaces these with `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`, `Modal`, StyleSheet, SafeArea, Ionicons, Native Stack, Alert, Linking, AsyncStorage, and Zustand.
* `BaseScreen`, `AppButton`, `InfoCard`, and `CommerceCards` are sensible native primitives, but large screens are compressed into single-line JSX and `ServicePlaceholders.tsx` contains many unrelated domains. This makes function-level review/testing and future ownership difficult.
* Mobile has no `FlatList`; large product/order/store lists render through `.map()` inside `ScrollView`, losing virtualization and risking memory/scroll performance.

## Dead code, placeholders, mocks, and incomplete paths

### Mobile

* `ErrorScreen.tsx`, `LoadingScreen.tsx`, and `PlaceholderScreen.tsx` are not registered/imported into the live navigator.
* `cartService.getAddresses`, `createAddress`, and `createOrder` are unused.
* Several `catalogService` methods (categories, sponsored shops, shop detail, nearby detail/catalog) are unused.
* `hubbleService` is unused and contains a WebView TODO.
* `remainingUiTodos` explicitly records location/payment conversion gaps.
* Scanner states camera is not installed.
* KYC bank save, business registration, Trip search, Pick Drop booking, Society internal actions, Tri Pay actions, and tracking are stubs/mocks.
* Home, Tri Pay, Inventory, travel, food, ads, and fallback catalog contain hard-coded/demo values.
* `rememberMe` is unused behaviorally.
* Mapbox key is empty and there is no runtime config load.

### Web

* Forgot/reset password is a fake success path.
* Business registration is a timeout simulation.
* Ads points are local/demo.
* Order details/tracking include premium mock fallbacks that can mask missing data.
* Numerous service pages are presentational mocks rather than integrations.
* `services/giftCard/GiftCardService` uses `MockGiftCardProvider`; the active consumer gift-card UI instead uses Hubble service, leaving an overlapping/likely dead abstraction.
* Admin `update_*.js/.py` and `fix_css.js` are maintenance scripts, not application runtime modules.

## Platform behavior differences

| Concern | Web | Mobile status / required native behavior |
|---|---|---|
| Navigation | URL routes, params/query, browser history | Typed native stack; no deep-link config, auth split, tab navigator, or callback routes. |
| Storage | Synchronous `localStorage` | AsyncStorage + hydration; must wait before route decisions and handle parse failures. |
| Location | `navigator.geolocation` permission | Requires `expo-location`, iOS/Android permission descriptions, denied/restricted handling; absent. |
| Scanner | `getUserMedia` + BarcodeDetector | Requires camera permission/native barcode support; absent. |
| Payments | browser redirect and `upi://` assignment | Requires Linking/SDK/WebView, allow-listing, callbacks, verification; absent. |
| File/photo | file input + FileReader | Requires image picker/camera permission/upload/storage strategy; absent. |
| Notifications | no confirmed working web integration | Requires APNs/FCM/device token/channels/runtime permission; absent. |
| Layout | CSS media queries, DOM, MUI, hover | Native flex/StyleSheet/safe areas; mostly adapted, but fixed Dimensions and nonvirtualized lists need device testing. |
| Alerts/confirms | blocking browser APIs | Alert exists, but cancellation/cart replacement confirmations are missing. |
| External links | `window.open` | `Linking.openURL`; used for Society/KYC, but should validate supported URLs and handle failures. |
| Accessibility | semantic HTML/ARIA in parts | Native labels/roles/hints are largely absent on icon buttons/forms. |

## Behavior changes likely to affect users

1. Returning authenticated users start at Login rather than Home.
2. Checkout no longer creates a delivery order or captures an address.
3. Checkout total is locally fabricated from 5% tax plus a fixed fee.
4. Adding from another store silently deletes the old cart.
5. UPI no longer opens an installed payment app.
6. “I have paid” does not verify payment.
7. Tracking shows fixed progress unrelated to an order.
8. Home may show sample identity, phone, wallet, and location.
9. Any PIN is mapped to the same coordinates.
10. Nearby category and sponsored-store behavior is missing.
11. Catalog failures show mock products or empty states, not errors.
12. KYC bank save reports success without persistence; nominees are unavailable.
13. Scanner buttons lead to manual text entry instead of camera scan.
14. Profile edits do not refresh the account drawer.
15. Order cancellation lacks confirmation and does not reload details.
16. Gift cards, notification handling, avatar photo, and online payment are absent.
17. Country-code UI implies international OTP support that the splitter does not provide.

## Recommended delivery plan

### P0 — restore transactional correctness

1. Build address list/create/select in Cart.
2. Make `/api/cart/validate` authoritative and display returned totals/issues.
3. Call `/api/orders` with address, channel, coordinates, items, and payment mode.
4. Implement COD and verified online/native payment handoff; keep generic store payment separate.
5. Clear cart only after confirmed order creation.
6. Fetch live order status for details/tracking and remove fabricated completion.
7. Add auth bootstrap/protected navigator and reliable 401 logout.

### P1 — complete high-usage consumer flows

1. Native GPS/permission/manual location and pincode geocoding.
2. Correct shop/nearby catalog mode and cross-store confirmation.
3. Normalize API response shapes and explicit loading/error/empty/offline states.
4. Complete profile store synchronization and KYC bank/nominee APIs.
5. Implement camera scanner and secure QR routing.
6. Add payment/order deep links and app-resume refresh.

### P2 — scoped product parity

1. Hubble gift-card strategy and transaction UI.
2. Notifications/inbox/preferences if confirmed in scope.
3. Dynamic home/profile/wallet data and ad/sponsored inventory.
4. Replace or feature-flag mock Tri Pay/Trip/Pick Drop/Inventory services.
5. Add accessibility, FlatList virtualization, device-size tests, and automated unit/integration/E2E coverage.

## Validation performed and limitations

* Inspected both source trees, route/navigator declarations, manifests, page/screen logic, stores, service endpoint wrappers, utilities, mocks, and migration notes.
* Traced reachable source paths from `frontend/src/App.js` and `mobile/src/navigation/AppNavigator.tsx`.
* Ran `npm run typecheck` in `mobile/`; TypeScript completed successfully on 2026-07-03.
* No mobile unit/E2E test script or test files are defined, and no web/mobile feature tests were found. Therefore runtime API compatibility, backend response schemas, device permissions, and remote payment/KYC behavior cannot be confirmed from these repositories alone.
* The backend was not executed and live external endpoints were not called. Findings about API behavior are based on client code paths and payloads.
* Visual pixel parity was not device-tested; the audit focuses on functional behavior and reachable code.

## Final verdict

**No—the working React web app has not been fully migrated to React Native.** The mobile app should be classified as a **partially migrated native prototype/shell**, not a functionally equivalent production replacement. Authentication/registration and several read-oriented surfaces are meaningful ports, but revenue-critical order creation/payment, accurate tracking, native location/scanning, KYC completion, gift cards, notifications, and admin scope are missing or incomplete. Production rollout as a replacement for the web consumer flow should be blocked until the P0 items are implemented and verified end to end.
