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

export async function shareExport(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      dialogTitle: 'Export your data',
    });
  }
}

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
  // Preserve subscription state — it reflects an external IAP purchase
  // that the user would have to manually restore otherwise.
}
