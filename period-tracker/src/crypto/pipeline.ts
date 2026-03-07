/**
 * Encryption pipeline for local backup.
 *
 * Phase 1: Serializes data as JSON. Full encryption pipeline (Protobuf + zstd + AES-256-GCM)
 * will be integrated in Phase 3 when native crypto modules are added.
 */

import { Paths, File, Directory } from 'expo-file-system';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export interface BackupMetadata {
  version: number;
  timestamp: string;
  appVersion: string;
  serialization: 'json';
  compression: 'none';
  encryption: 'none';
  originalSizeBytes: number;
  backupSizeBytes: number;
}

const BACKUP_DIR_NAME = 'backups';
const BACKUP_FILE_NAME = 'local-backup.json';
const METADATA_FILE_NAME = 'meta.json';

function getBackupDir(): Directory {
  // Use cache directory to avoid iCloud backup of unencrypted health data.
  // Paths.cache is excluded from iCloud/iTunes backups by default.
  return new Directory(Paths.cache, BACKUP_DIR_NAME);
}

/**
 * Create a local backup of all app data.
 */
export function createLocalBackup(data: Record<string, unknown>): BackupMetadata {
  const dir = getBackupDir();
  if (!dir.exists) {
    dir.create();
  }

  const json = JSON.stringify(data);
  // Use TextEncoder to get actual byte length (not UTF-16 code units)
  const originalSize = new TextEncoder().encode(json).byteLength;

  const backupFile = new File(dir, BACKUP_FILE_NAME);
  backupFile.write(json);

  const metadata: BackupMetadata = {
    version: 1,
    timestamp: new Date().toISOString(),
    appVersion: APP_VERSION,
    serialization: 'json',
    compression: 'none',
    encryption: 'none',
    originalSizeBytes: originalSize,
    backupSizeBytes: originalSize,
  };

  const metaFile = new File(dir, METADATA_FILE_NAME);
  metaFile.write(JSON.stringify(metadata, null, 2));

  return metadata;
}

/**
 * Restore from a local backup.
 */
export function restoreLocalBackup(): Record<string, unknown> | null {
  try {
    const backupFile = new File(getBackupDir(), BACKUP_FILE_NAME);
    if (!backupFile.exists) return null;

    const json = backupFile.textSync();
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Check if a local backup exists.
 */
export function hasLocalBackup(): boolean {
  const backupFile = new File(getBackupDir(), BACKUP_FILE_NAME);
  return backupFile.exists;
}

/**
 * Delete the local backup.
 */
export function deleteLocalBackup(): void {
  const dir = getBackupDir();
  if (dir.exists) {
    dir.delete();
  }
}
