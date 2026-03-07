import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../storage';
import type { SubscriptionStatus } from '../models';

interface SubscriptionState {
  subscription: SubscriptionStatus;
  hasPurchasedApp: boolean;

  // Actions
  setSubscription: (status: Partial<SubscriptionStatus>) => void;
  setPurchasedApp: (purchased: boolean) => void;
  clearAll: () => void;
}

const defaultSubscription: SubscriptionStatus = {
  tier: 'base',
  isActive: false,
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: { ...defaultSubscription },
      hasPurchasedApp: false,

      setSubscription: (status) =>
        set((state) => ({
          subscription: { ...state.subscription, ...status },
        })),

      setPurchasedApp: (purchased) => set({ hasPurchasedApp: purchased }),

      clearAll: () =>
        set({
          subscription: { ...defaultSubscription },
          hasPurchasedApp: false,
        }),
    }),
    {
      name: 'subscription-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

// Reactive selectors — use these in components instead of store methods
// so that React re-renders when the underlying state changes.
export const selectIsPremiumPlus = (s: SubscriptionState) =>
  s.subscription.tier === 'premium_plus' && s.subscription.isActive;

export const selectShouldShowAds = (s: SubscriptionState) =>
  !s.hasPurchasedApp && !(s.subscription.tier === 'premium_plus' && s.subscription.isActive);
