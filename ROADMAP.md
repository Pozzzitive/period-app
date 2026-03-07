# App Store & Play Store Submission Roadmap

## Current Status
- Phase 1 Steps 1-10, 12-14, 16-17: Implemented
- 71 tests passing (prediction engine + analytics)
- TypeScript compiles with 0 errors
- iOS build succeeds and launches on simulator

---

## Done (Code)

### In-App Purchases (`react-native-iap`)
- [x] Install `react-native-iap` v14
- [x] Create IAP service (`src/services/iap.ts`) — handles both iOS App Store and Google Play Billing
- [x] Wire paywall buttons to real purchase flows
- [x] Handle purchase listeners with `finishTransaction`

### App Lock & Biometrics (`react-native-keychain`)
- [x] Install `react-native-keychain` — works on both iOS Keychain and Android Keystore
- [x] Create keychain service (`src/services/keychain.ts`) — PIN hashed with SHA-256
- [x] Wire FaceID/TouchID/Fingerprint via biometric access control
- [x] Create lock screen + integrate in root layout with AppState timeout

### iOS Permissions
- [x] App-specific permission descriptions (camera, photos, FaceID)
- [x] Removed unused microphone permission
- [x] Added `buildNumber` to app.json

### EAS Build Config
- [x] Created `eas.json` with development, preview, production profiles (iOS + Android)

### Store Hydration
- [x] Not needed — MMKV is synchronous, splash screen held during font load

### Android Permissions & Config
- [x] Add `com.android.vending.BILLING` permission to AndroidManifest.xml
- [x] Add `android.permission.POST_NOTIFICATIONS` for Android 13+
- [x] Verify `targetSdkVersion` ≥ 34 — Expo SDK 55 defaults to 36 ✓
- [x] Removed unused `RECORD_AUDIO` permission

### Android Release Signing (code part)
- [x] Update `build.gradle` signing config — reads from gradle properties (env vars or EAS secrets)

### IAP Correctness Fixes
- [x] Google Play subscription `offerToken` — extract from fetched products, pass in `subscriptionOffers`
- [x] Localized prices — paywall now shows `displayPrice` from store for all 3 products (base, monthly, yearly)
- [x] Platform-aware legal disclaimer — shows "App Store" on iOS, "Google Play" on Android

### Privacy Policy
- [x] Created `privacy-policy.html` — self-contained, dark/light mode, GDPR-compliant, covers local-only storage, AdMob, children's privacy, data rights

---

## Remaining (Before Submission)

### Privacy Policy Hosting
- [ ] Fill in `[Your Name / Company]` and `[your-email@example.com]` placeholders in `privacy-policy.html`
- [ ] Host at a public URL (e.g. GitHub Pages: create repo, push as `index.html`, enable Pages)
- [ ] Add URL to both App Store Connect and Play Console

### Android Release Signing (manual steps)
- [ ] Generate release keystore (`keytool -genkey ...`) — do this before first production build
- [ ] Store keystore credentials in EAS secrets (`RELEASE_STORE_FILE`, `RELEASE_STORE_PASSWORD`, `RELEASE_KEY_ALIAS`, `RELEASE_KEY_PASSWORD`)

### AdMob
- [ ] Replace placeholder App IDs in `app.json` with real AdMob IDs (both iOS and Android)

### Apple (App Store)
**Effort:** ~2-3 hours of form-filling, spread across a few days

- [ ] Apple Developer account — $99/year
- [ ] Create App ID in developer portal
- [ ] Create app in App Store Connect
- [ ] Configure 3 IAP products: base app (€5.99), monthly sub (€1.49), yearly sub (€12.99)
- [ ] Prepare screenshots — 6.7" iPhone, 6.1" iPhone, iPad (can use simulator)
- [ ] Write description, subtitle, keywords, choose category (Health & Fitness)
- [ ] Complete age rating questionnaire
- [ ] Set pricing & availability
- [ ] Configure Apple signing for EAS builds
- [ ] First `eas build --platform ios` test
- [ ] Test IAP with sandbox account
- [ ] Submit for review (~1-3 days)

### Google (Play Store)
**Effort:** ~2-3 hours of form-filling

- [ ] Google Play Developer account — $25 one-time
- [ ] Create app in Play Console
- [ ] Configure 3 IAP products (same SKUs as iOS)
- [ ] Complete **Data Safety Form** — declare: health data collected, stored locally, encrypted, not shared
- [ ] Complete **IARC content rating** questionnaire
- [ ] Prepare screenshots — phone + 7" tablet + 10" tablet
- [ ] Feature graphic (1024x500 banner image)
- [ ] Write description, short description, choose category (Health & Fitness)
- [ ] Set content rating, target audience, pricing
- [ ] Upload signed AAB (Android App Bundle)
- [ ] First `eas build --platform android` test
- [ ] Test IAP with Google Play sandbox (license testers)
- [ ] Submit for review (~1-7 days, often faster than Apple)

---

## What's Left (Timeline)

| Step | What | Time | Status |
|------|------|------|--------|
| 1 | ~~Android code fixes (permissions, signing, eas.json)~~ | ~~30 min~~ | Done |
| 2 | ~~Privacy policy document~~ | ~~30 min~~ | Done — needs hosting |
| 3 | Fill placeholders in privacy policy + host on GitHub Pages | 15 min | **TODO** |
| 4 | Generate Android release keystore + store in EAS secrets | 10 min | **TODO** |
| 5 | Replace placeholder AdMob IDs in `app.json` | 5 min | **TODO** |
| 6 | Apple Developer + Play Console accounts | 1 hour (+ waiting for Apple approval) | **TODO** |
| 7 | App Store Connect setup (screenshots, description, IAP products) | 2-3 hours | **TODO** |
| 8 | Play Console setup (screenshots, data safety, IAP products) | 2-3 hours | **TODO** |
| 9 | First builds via EAS (iOS + Android) | 30 min (+ build queue time) | **TODO** |
| 10 | Sandbox testing IAP on both platforms | 1-2 hours | **TODO** |
| 11 | Submit to both stores | 15 min | **TODO** |
| 12 | Review period | 1-7 days | **TODO** |

**All coding is done.** Remaining work is config, accounts, and store form-filling.

---

## Nice to Have (Post-Launch)

### Crash Reporting
- [ ] Add Sentry or Firebase Crashlytics
- [ ] Custom error boundary with friendly UI

### Analytics (Privacy-Respecting)
- [ ] Basic usage analytics (screens viewed, not health data)
- [ ] Opt-in only, clearly disclosed

### App Store Optimization
- [ ] Localize app name and description
- [ ] A/B test screenshots
- [ ] Respond to reviews

---

## Phase 2 Features (After Launch)
See `01-app-workflow.md` for full spec:
- Pattern insights & trend graphs
- Custom symptom tags
- Partner sharing
- Home screen widget
- PDF export enhancements
- Health conditions insights

## Phase 3: Cloud (Last)
See `03-data-management.md`:
- Firebase auth
- Encrypted cloud backup/restore
- Cross-device sync
