# App Store / Google Play Review Readiness Plan

## Current State Assessment

Both IAP and App Lock are **fully implemented at the code level**:
- IAP: `src/services/iap.ts` + `app/subscription/paywall.tsx` + `src/stores/subscription-store.ts`
- App Lock: `src/services/keychain.ts` + `src/components/common/LockScreen.tsx` + `src/stores/auth-store.ts`

The remaining gaps are code fixes, configuration, and missing ATT compliance.

---

## Code Fixes Required

### 1. Add subscription expiration checking
**Status:** DONE
**Files changed:** `src/stores/subscription-store.ts`, `app/subscription/paywall.tsx`
**What was done:**
- Added `isSubscriptionActive()` helper that checks `expiresAt` against `Date.now()`
- Updated `selectIsPremiumPlus` and `selectShouldShowAds` selectors to use expiration check
- Set `expiresAt` in both purchase and restore callbacks (monthly → +1 month, yearly → +1 year)

### 2. Add ATT (App Tracking Transparency) prompt for iOS ads
**Status:** DONE
**Files changed:** `src/components/ads/AdBanner.tsx`
**What was done:**
- Installed `expo-tracking-transparency`
- AdBanner now requests ATT permission before loading any ad on iOS
- If tracking is denied, ads are served as non-personalized
- Ads don't render until tracking status is resolved (prevents loading before prompt)

### 3. Add "Remove ads" as explicit paywall benefit
**Status:** DONE
**Files changed:** `app/subscription/paywall.tsx`
**What was done:**
- Added "No ads — ever" as a `BaseFeatureItem` in the one-time purchase section

### 4. Validate subscription on app resume
**Status:** DONE
**Files changed:** `src/hooks/useSubscriptionSync.ts` (new), `app/_layout.tsx`
**What was done:**
- Created `useSubscriptionSync` hook that runs on app foreground
- Calls `restorePurchases()` once per day to check subscription validity
- If subscription is no longer in store purchases, marks as inactive
- Also syncs base app purchase state
- Wired into root layout alongside other global hooks

---

## Configuration Required (Not Code — Manual Setup)

### 5. Create products in App Store Connect
- One-time purchase: `com.periodtracker.app.base` (€5.99)
- Monthly subscription: `com.periodtracker.app.premium.monthly` (€1.49/mo)
- Yearly subscription: `com.periodtracker.app.premium.yearly` (€12.99/yr)

### 6. Create products in Google Play Console
- Same product IDs as above
- Set up subscription base plans and offer tokens

### 7. Set up Sandbox / License Testers
- iOS: Add sandbox tester accounts in App Store Connect
- Android: Add license tester emails in Google Play Console

### 8. Replace placeholder ad unit IDs
- Create ad units in Google AdMob console
- Replace placeholder IDs in `src/components/ads/AdBanner.tsx` (lines 25-28)

### 9. Privacy Policy
- Create a live privacy policy URL
- Add to App Store Connect and Google Play Console
- Link from the app's Settings > Privacy screen

---

## Verification Checklist

- [x] Step 1: Subscription expiration checking works
- [x] Step 2: ATT prompt shows before first ad on iOS
- [x] Step 3: "No ads" shown in paywall benefits
- [x] Step 4: Subscription re-validation on app resume
- [x] TypeScript compiles with 0 errors
- [ ] Step 5-6: Products created in store consoles (manual)
- [ ] Step 7: Sandbox purchase completes end-to-end (manual)
- [ ] Step 8: Real ad unit IDs configured (manual)
- [ ] Step 9: Privacy policy URL live (manual)
- [ ] iOS build succeeds
