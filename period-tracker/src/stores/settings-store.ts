import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../storage';
import { generateId } from '../utils/ids';
import type { AppSettings, MedicationReminder } from '../models';

interface SettingsState {
  settings: AppSettings;

  // Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateNotifications: (updates: Partial<AppSettings['notifications']>) => void;
  updateAppLock: (updates: Partial<AppSettings['appLock']>) => void;
  setGdprConsent: (consent: boolean) => void;
  addMedication: (name: string, time: string) => void;
  updateMedication: (id: string, updates: Partial<Omit<MedicationReminder, 'id'>>) => void;
  deleteMedication: (id: string) => void;
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
    cycleNotificationTime: '09:00',
    medications: [],
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
  predictionCount: 3,
  showPredictedPhases: true,
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

      addMedication: (name, time) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              medications: [
                ...state.settings.notifications.medications,
                { id: generateId(), name, time, enabled: true },
              ],
            },
          },
        })),

      updateMedication: (id, updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              medications: state.settings.notifications.medications.map((med) =>
                med.id === id ? { ...med, ...updates } : med
              ),
            },
          },
        })),

      deleteMedication: (id) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              medications: state.settings.notifications.medications.filter(
                (med) => med.id !== id
              ),
            },
          },
        })),

      clearAll: () => set({ settings: { ...defaultSettings } }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as { settings: AppSettings & Record<string, unknown> };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const notifs = state.settings.notifications as any;
        const presetMap: Record<string, string> = { morning: '09:00', noon: '13:00', evening: '20:00' };

        if (version === 0 || version === undefined) {
          // Migrate pillReminder → medications array
          const medications: MedicationReminder[] = [];
          if (notifs.pillReminder) {
            medications.push({
              id: 'migrated-pill',
              name: 'Pill',
              time: (notifs.pillReminderTime as string) ?? '09:00',
              enabled: true,
            });
          }
          delete notifs.pillReminder;
          delete notifs.pillReminderTime;
          notifs.medications = medications;
          notifs.contraceptionReminderTime = notifs.contraceptionReminderTime ?? undefined;
        }

        // v0→2 and v1→2: convert preset names to HH:mm for all time fields
        if ((version ?? 0) < 2) {
          const raw = notifs.cycleNotificationTime as string | undefined;
          notifs.cycleNotificationTime = (raw && presetMap[raw]) ?? raw ?? '09:00';

          const dailyRaw = notifs.dailyLogReminderTime as string | undefined;
          notifs.dailyLogReminderTime = (dailyRaw && presetMap[dailyRaw]) ?? dailyRaw ?? '21:00';

          const contraRaw = notifs.contraceptionReminderTime as string | undefined;
          notifs.contraceptionReminderTime = (contraRaw && presetMap[contraRaw]) ?? contraRaw ?? '09:00';
        }

        return state;
      },
    }
  )
);
