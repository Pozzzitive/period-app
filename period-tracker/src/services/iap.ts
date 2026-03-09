import { Platform } from 'react-native';
import {
  initConnection,
  endConnection,
  fetchProducts,
  getAvailablePurchases,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  ErrorCode,
  type Purchase,
  type PurchaseError,
  type ProductOrSubscription,
} from 'react-native-iap';

// ── Product IDs (must match App Store Connect / Play Console) ──
export const PRODUCT_IDS = {
  BASE_APP: 'com.periodtracker.app.base',
};

export const SUBSCRIPTION_IDS = {
  MONTHLY: 'com.periodtracker.app.premium.monthly',
  YEARLY: 'com.periodtracker.app.premium.yearly',
};

const ALL_SKUS = [
  PRODUCT_IDS.BASE_APP,
  SUBSCRIPTION_IDS.MONTHLY,
  SUBSCRIPTION_IDS.YEARLY,
];

// ── State ───────────────────────────────────────────────────
let isConnected = false;
let isInitializing = false;
let purchaseUpdateSub: ReturnType<typeof purchaseUpdatedListener> | null = null;
let purchaseErrorSub: ReturnType<typeof purchaseErrorListener> | null = null;
let cachedProducts: ProductOrSubscription[] = [];

export type PurchaseCallback = (purchase: Purchase) => void;
export type ErrorCallback = (error: PurchaseError) => void;

// ── Init / Teardown ─────────────────────────────────────────
export async function initIAP(
  onPurchase: PurchaseCallback,
  onError: ErrorCallback,
): Promise<void> {
  // Prevent concurrent init calls
  if (isInitializing) return;

  // If already connected (e.g. by restorePurchases), just set up listeners
  if (isConnected) {
    setupListeners(onPurchase, onError);
    return;
  }

  isInitializing = true;

  try {
    await initConnection();
    isConnected = true;
    setupListeners(onPurchase, onError);
  } catch (err) {
    console.warn('IAP init failed:', err);
  } finally {
    isInitializing = false;
  }
}

function setupListeners(onPurchase: PurchaseCallback, onError: ErrorCallback): void {
  // Clean up any existing listeners before creating new ones
  purchaseUpdateSub?.remove();
  purchaseErrorSub?.remove();

  purchaseUpdateSub = purchaseUpdatedListener(async (purchase) => {
    // Grant access first, then acknowledge to store (#5)
    onPurchase(purchase);
    await finishTransaction({ purchase, isConsumable: false });
  });

  purchaseErrorSub = purchaseErrorListener((error) => {
    if (error.code !== ErrorCode.UserCancelled) {
      onError(error);
    }
  });
}

export function teardownIAP(): void {
  purchaseUpdateSub?.remove();
  purchaseErrorSub?.remove();
  purchaseUpdateSub = null;
  purchaseErrorSub = null;

  if (isConnected) {
    endConnection();
    isConnected = false;
  }
}

// ── Fetch Products ──────────────────────────────────────────
export async function loadProducts(): Promise<ProductOrSubscription[]> {
  try {
    const result = await fetchProducts({ skus: ALL_SKUS });
    cachedProducts = Array.isArray(result) ? result : [];
    return cachedProducts;
  } catch {
    return [];
  }
}

// ── Offer token extraction (required for Google Play subs) ──
function getOfferToken(sku: string): string | undefined {
  if (Platform.OS !== 'android') return undefined;

  const product = cachedProducts.find(
    (p) => ('productId' in p && p.productId === sku) || ('id' in p && p.id === sku),
  );
  if (!product) return undefined;

  // v14 exposes subscriptionOfferDetailsAndroid on fetched products
  const details = (product as unknown as Record<string, unknown>).subscriptionOfferDetailsAndroid;
  if (Array.isArray(details) && details.length > 0) {
    return details[0]?.offerToken as string | undefined;
  }
  return undefined;
}

// ── Purchase ────────────────────────────────────────────────
export async function buyBaseApp(): Promise<void> {
  await requestPurchase({
    request: {
      apple: { sku: PRODUCT_IDS.BASE_APP },
      google: { skus: [PRODUCT_IDS.BASE_APP] },
    },
    type: 'in-app',
  });
}

export async function buySubscription(
  period: 'monthly' | 'yearly',
): Promise<void> {
  const sku = period === 'monthly' ? SUBSCRIPTION_IDS.MONTHLY : SUBSCRIPTION_IDS.YEARLY;
  const offerToken = getOfferToken(sku);

  await requestPurchase({
    request: {
      apple: { sku },
      google: {
        skus: [sku],
        ...(offerToken
          ? { subscriptionOffers: [{ sku, offerToken }] }
          : {}),
      },
    },
    type: 'subs',
  });
}

// ── Restore ─────────────────────────────────────────────────
export async function restorePurchases(): Promise<Purchase[]> {
  try {
    // Ensure connection exists — may be called before the paywall
    // (e.g. from subscription sync on app foreground).
    // We establish a connection but DON'T set up purchase listeners here —
    // those are only set up by initIAP when the paywall opens.
    if (!isConnected) {
      await initConnection();
      isConnected = true;
    }
    const result = await getAvailablePurchases();
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

// ── Helpers ─────────────────────────────────────────────────
export function isSubscriptionId(productId: string): boolean {
  return productId === SUBSCRIPTION_IDS.MONTHLY || productId === SUBSCRIPTION_IDS.YEARLY;
}

export function getPeriodFromProductId(
  productId: string,
): 'monthly' | 'yearly' | null {
  if (productId === SUBSCRIPTION_IDS.MONTHLY) return 'monthly';
  if (productId === SUBSCRIPTION_IDS.YEARLY) return 'yearly';
  return null;
}
