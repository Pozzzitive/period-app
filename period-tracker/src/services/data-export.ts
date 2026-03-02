import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCycleStore } from '../stores/cycle-store';
import { useLogStore } from '../stores/log-store';
import { useUserStore } from '../stores/user-store';
import { useSettingsStore } from '../stores/settings-store';

export interface ExportData {
  exportDate: string;
  appVersion: string;
  profile: ReturnType<typeof useUserStore.getState>['profile'];
  periods: ReturnType<typeof useCycleStore.getState>['periods'];
  cycles: ReturnType<typeof useCycleStore.getState>['cycles'];
  logs: ReturnType<typeof useLogStore.getState>['logs'];
  settings: ReturnType<typeof useSettingsStore.getState>['settings'];
}

export function collectExportData(): ExportData {
  return {
    exportDate: new Date().toISOString(),
    appVersion: '1.0.0',
    profile: useUserStore.getState().profile,
    periods: useCycleStore.getState().periods,
    cycles: useCycleStore.getState().cycles,
    logs: useLogStore.getState().logs,
    settings: useSettingsStore.getState().settings,
  };
}

export function exportAsJSON(): string {
  const data = collectExportData();
  const json = JSON.stringify(data, null, 2);
  const file = new File(Paths.document, 'period-tracker-export.json');
  file.write(json);
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
  useCycleStore.getState().clearAll();
  useLogStore.getState().clearAll();
  useUserStore.getState().clearAll();
  useSettingsStore.getState().clearAll();
}
