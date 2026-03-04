import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../storage';
import type { AppSettings } from '../models';

interface SettingsState {
  settings: AppSettings;

  // Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateNotifications: (updates: Partial<AppSettings['notifications']>) => void;
  updateAppLock: (updates: Partial<AppSettings['appLock']>) => void;
  setGdprConsent: (consent: boolean) => void;
  clearAll: () => void;
}

const defaultSettings: AppSettings = {
  notifications: {
    periodReminder: true,
    periodStarting: true,
    premenstrualPhase: true,
    fertileWindowOpen: false,
    peakFertility: false,
    lowFertility: false,
    fertilityIntent: 'none',
    dailyLogReminder: false,
    cycleSummary: true,
    pillReminder: false,
    contraceptionReminder: false,
  },
  appLock: {
    enabled: false,
    method: 'biometric',
    timeoutMinutes: 5,
  },
  fertilityTrackingEnabled: false,
  partnerSharingEnabled: false,
  showFlowerDecorations: true,
  theme: 'system',
  colorTheme: 'roseGarden' as const,
  gdprConsentGiven: false,
  dataCategories: {
    cycleData: true,
    symptoms: true,
    intercourse: true,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: { ...defaultSettings },

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      updateNotifications: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, ...updates },
          },
        })),

      updateAppLock: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            appLock: { ...state.settings.appLock, ...updates },
          },
        })),

      setGdprConsent: (consent) =>
        set((state) => ({
          settings: {
            ...state.settings,
            gdprConsentGiven: consent,
            gdprConsentDate: consent ? new Date().toISOString() : undefined,
          },
        })),

      clearAll: () => set({ settings: { ...defaultSettings } }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
