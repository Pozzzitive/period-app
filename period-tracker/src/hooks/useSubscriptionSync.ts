import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useSubscriptionStore, selectIsPremiumPlus } from '../stores/subscription-store';
import { restorePurchases, isSubscriptionId, getPeriodFromProductId, PRODUCT_IDS } from '../services/iap';
import { addMonths, addYears } from 'date-fns';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Periodically re-validates the subscription status against the platform store.
 * Runs once per day when the app comes to the foreground.
 * Detects externally cancelled or expired subscriptions.
 */
export function useSubscriptionSync() {
  const isPremium = useSubscriptionStore(selectIsPremiumPlus);
  const setSubscription = useSubscriptionStore((s) => s.setSubscription);
  const setPurchasedApp = useSubscriptionStore((s) => s.setPurchasedApp);
  const lastCheckRef = useRef(Date.now()); // Initialise to now — skip the first foreground event

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (state) => {
      if (state !== 'active') return;

      // Only check once per day to avoid excessive store queries
      const now = Date.now();
      if (now - lastCheckRef.current < ONE_DAY_MS) return;
      lastCheckRef.current = now;

      try {
        const purchases = await restorePurchases();
        let hasBase = false;
        let hasSubscription = false;

        for (const purchase of purchases) {
          if (purchase.productId === PRODUCT_IDS.BASE_APP) {
            hasBase = true;
          } else if (isSubscriptionId(purchase.productId)) {
            hasSubscription = true;
            const period = getPeriodFromProductId(purchase.productId);
            const purchaseDate = purchase.transactionDate
              ? new Date(Number(purchase.transactionDate))
              : new Date();
            const expiresAt = period === 'yearly'
              ? addYears(purchaseDate, 1).toISOString()
              : addMonths(purchaseDate, 1).toISOString();
            setSubscription({
              tier: 'premium_plus',
              isActive: true,
              period: period ?? 'monthly',
              purchasedAt: purchaseDate.toISOString(),
              expiresAt,
              productId: purchase.productId,
            });
          }
        }

        // If user had a subscription but it's no longer in available purchases, deactivate
        if (isPremium && !hasSubscription) {
          setSubscription({ isActive: false });
        }

        // Sync base app purchase state
        if (hasBase) {
          setPurchasedApp(true);
        }
      } catch {
        // Silently fail — will retry next foreground
      }
    });

    return () => subscription.remove();
  }, [isPremium, setSubscription, setPurchasedApp]);
}
