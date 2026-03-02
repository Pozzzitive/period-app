import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../storage';
import type { UserProfile } from '../models';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '../constants/phases';

interface UserState {
  profile: UserProfile;

  // Actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  addHealthCondition: (conditionId: string) => void;
  removeHealthCondition: (conditionId: string) => void;
  clearAll: () => void;
}

const defaultProfile: UserProfile = {
  isTeenager: false,
  typicalCycleLength: DEFAULT_CYCLE_LENGTH,
  typicalPeriodLength: DEFAULT_PERIOD_LENGTH,
  healthConditions: [],
  onboardingCompleted: false,
  createdAt: new Date().toISOString(),
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: { ...defaultProfile },

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      completeOnboarding: () =>
        set((state) => ({
          profile: {
            ...state.profile,
            onboardingCompleted: true,
            onboardingCompletedAt: new Date().toISOString(),
          },
        })),

      addHealthCondition: (conditionId) =>
        set((state) => ({
          profile: {
            ...state.profile,
            healthConditions: state.profile.healthConditions.includes(conditionId)
              ? state.profile.healthConditions
              : [...state.profile.healthConditions, conditionId],
          },
        })),

      removeHealthCondition: (conditionId) =>
        set((state) => ({
          profile: {
            ...state.profile,
            healthConditions: state.profile.healthConditions.filter(
              (id) => id !== conditionId
            ),
          },
        })),

      clearAll: () => set({ profile: { ...defaultProfile, createdAt: new Date().toISOString() } }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
