# Payment Setup — Period Tracker App

## Overview

All payments are handled by Apple App Store and Google Play — no custom server, no Stripe, no payment gateway needed. The stores process payments, manage subscriptions, handle refunds, and remit VAT.

## Products

| Product | Type | Price | Product ID |
|---------|------|-------|------------|
| Premium (one-time) | Non-consumable IAP | €5.99 | `com.periodtracker.premium` |
| Premium Plus (monthly) | Auto-renewable subscription | €1.49/mo | `com.periodtracker.premiumplus` |

These product IDs are referenced in `src/services/iap.ts` and must match exactly what you create in the store dashboards.

## How It Works

1. User taps "Buy" in the paywall (`app/subscription/paywall.tsx`)
2. `react-native-iap` calls the native Store API
3. The platform authenticates via the user's **Apple ID** or **Google account**
4. Apple/Google processes the payment and returns a receipt
5. The app validates the receipt and persists premium status locally in MMKV (`src/stores/subscription-store.ts`)
6. No app-level account is needed — the store receipt is the proof of purchase

## Apple App Store Setup

### 1. Developer Account
- Enroll at [developer.apple.com](https://developer.apple.com) ($99/year)

### 2. Banking & Tax (App Store Connect)
1. Log into [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Go to **Agreements, Tax, and Banking**
3. Sign the **Paid Apps** agreement
4. Add your **bank account** details
5. Complete **tax information** forms

### 3. Create IAP Products
1. In App Store Connect, go to your app → **In-App Purchases**
2. Create a **Non-Consumable** product:
   - Reference Name: `Premium`
   - Product ID: `com.periodtracker.premium`
   - Price: Tier matching €5.99
3. Create an **Auto-Renewable Subscription**:
   - Subscription Group: `Premium Plus`
   - Product ID: `com.periodtracker.premiumplus`
   - Price: Tier matching €1.49/month

### 4. Payouts
- Apple pays ~45 days after the end of each fiscal month
- Minimum threshold varies by country
- Commission: **15%** (Small Business Program, <$1M/year) or **30%**

## Google Play Setup

### 1. Developer Account
- Register at [play.google.com/console](https://play.google.com/console) ($25 one-time)

### 2. Banking & Tax (Play Console)
1. Go to **Setup → Payments profile**
2. Link or create a **Google Payments merchant account**
3. Add **bank account** details
4. Complete **tax information**

### 3. Create IAP Products
1. In Play Console, go to your app → **Monetization → Products**
2. Create an **In-app product** (one-time):
   - Product ID: `com.periodtracker.premium`
   - Price: €5.99
3. Create a **Subscription**:
   - Product ID: `com.periodtracker.premiumplus`
   - Base plan: €1.49/month

### 4. Payouts
- Google pays monthly, around the 15th, for the prior month's earnings
- Minimum threshold: $100 or equivalent
- Commission: **15%** (first $1M/year) then **30%**

## Restore Purchases

If a user reinstalls the app or switches devices, "Restore Purchases" in the paywall queries the store using their Apple ID / Google account. The store remembers what they bought — no app account needed.

## What's in the Code

| File | Purpose |
|------|---------|
| `src/services/iap.ts` | Purchase flow, receipt handling, connection to store SDK |
| `src/stores/subscription-store.ts` | Persists premium status locally (MMKV) |
| `app/subscription/paywall.tsx` | Purchase UI, plan selection, restore button |

## EU VAT

In the EU, Apple and Google collect and remit VAT on your behalf. You don't need to handle VAT yourself for IAP sales.
