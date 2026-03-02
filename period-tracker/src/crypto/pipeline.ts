/**
 * Encryption pipeline for local backup.
 *
 * Phase 1: Serializes data as JSON. Full encryption pipeline (Protobuf + zstd + AES-256-GCM)
 * will be integrated in Phase 3 when native crypto modules are added.
 */

import { Paths, File, Directory } from 'expo-file-system';

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
  return new Directory(Paths.document, BACKUP_DIR_NAME);
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
  const originalSize = json.length;

  const backupFile = new File(dir, BACKUP_FILE_NAME);
  backupFile.write(json);

  const metadata: BackupMetadata = {
    version: 1,
    timestamp: new Date().toISOString(),
    appVersion: '1.0.0',
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
