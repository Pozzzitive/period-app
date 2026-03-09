import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Constants from 'expo-constants';
import { useCycleStore } from '../stores/cycle-store';
import { useLogStore } from '../stores/log-store';
import { useUserStore } from '../stores/user-store';
import { useSettingsStore } from '../stores/settings-store';
import { useAuthStore } from '../stores/auth-store';
import { useSubscriptionStore } from '../stores/subscription-store';
import { useCustomSymptomStore } from '../stores/custom-symptom-store';
import { storage } from '../storage';
import { deleteAllPhotos } from '../utils/photos';
import { deleteLocalBackup } from '../crypto/pipeline';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export interface ExportData {
  exportDate: string;
  appVersion: string;
  profile: ReturnType<typeof useUserStore.getState>['profile'];
  periods: ReturnType<typeof useCycleStore.getState>['periods'];
  cycles: ReturnType<typeof useCycleStore.getState>['cycles'];
  logs: ReturnType<typeof useLogStore.getState>['logs'];
  settings: ReturnType<typeof useSettingsStore.getState>['settings'];
  customSymptoms: ReturnType<typeof useCustomSymptomStore.getState>['customSymptoms'];
}

export function collectExportData(): ExportData {
  return {
    exportDate: new Date().toISOString(),
    appVersion: APP_VERSION,
    profile: useUserStore.getState().profile,
    periods: useCycleStore.getState().periods,
    cycles: useCycleStore.getState().cycles,
    logs: useLogStore.getState().logs,
    settings: useSettingsStore.getState().settings,
    customSymptoms: useCustomSymptomStore.getState().customSymptoms,
  };
}

export async function exportAsJSON(): Promise<string> {
  const data = collectExportData();
  const json = JSON.stringify(data, null, 2);
  const file = new File(Paths.cache, 'period-tracker-export.json');
  await file.write(json);
  return file.uri;
}

/**
 * Restore all app data from an ExportData object.
 * Does NOT touch subscription store (IAP receipts are preserved).
 * Preserves current GDPR consent status — consent cannot be re-granted via restore (Article 7).
 */
export function restoreFromExport(data: ExportData): void {
  if (data.periods) {
    useCycleStore.getState().restoreAll(data.periods);
  }
  if (data.logs) {
    useLogStore.getState().restoreAll(data.logs);
  }
  if (data.profile) {
    useUserStore.getState().restoreAll(data.profile);
  }
  if (data.settings) {
    // Preserve current GDPR consent state — a backup must not silently re-grant consent
    const current = useSettingsStore.getState().settings;
    const restoredSettings = {
      ...data.settings,
      gdprConsentGiven: current.gdprConsentGiven,
      gdprConsentDate: current.gdprConsentDate,
      dataCategories: current.dataCategories,
    };
    useSettingsStore.getState().restoreAll(restoredSettings);
  }
  if (data.customSymptoms) {
    useCustomSymptomStore.getState().restoreAll(data.customSymptoms);
  }
}

export async function shareExport(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      dialogTitle: 'Export your data',
    });
  }
}

/** MMKV keys to clear on data deletion — store names + widget cache. */
const DELETABLE_MMKV_KEYS = [
  'cycle-store',
  'log-store',
  'user-store',
  'settings-store',
  'custom-symptom-store',
  'auth-store',
  'widget-data',
] as const;

export function deleteAllData(): void {
  deleteAllPhotos();
  deleteLocalBackup();
  useCycleStore.getState().clearAll();
  useLogStore.getState().clearAll();
  useUserStore.getState().clearAll();
  useSettingsStore.getState().clearAll();
  useCustomSymptomStore.getState().clearAll();
  // authStore.clearAll() also clears Keychain PIN + biometric entries
  useAuthStore.getState().clearAll();

  // Explicitly remove MMKV keys so no orphan data remains on device (GDPR Article 17)
  for (const key of DELETABLE_MMKV_KEYS) {
    storage.remove(key);
  }

  // Subscription store is NOT deleted — it reflects an external IAP purchase
  // managed by Apple/Google. The user is informed of this in the deletion dialog.
}
