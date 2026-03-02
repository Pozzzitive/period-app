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
  isPremiumPlus: () => boolean;
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

      isPremiumPlus: () => {
        const { subscription } = get();
        return subscription.tier === 'premium_plus' && subscription.isActive;
      },

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
