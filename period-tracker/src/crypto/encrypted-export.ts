/**
 * Encrypted export/import using AES-256-GCM via expo-crypto.
 *
 * File format (.ptbackup) — base64-encoded binary:
 * ┌──────────┬───────────┬─────────────────────────────┐
 * │ version  │   salt    │   AES-GCM sealed data       │
 * │  1 byte  │ 32 bytes  │  (12B IV + ciphertext + 16B tag) │
 * │  0x01    │  random   │  from sealed.combined()     │
 * └──────────┴───────────┴─────────────────────────────┘
 *
 * Key derivation: password + salt → SHA-256 x600000 → AES-256 key
 * Wrong password → GCM auth tag verification fails → clear error.
 */

import * as Crypto from 'expo-crypto';
import { AESEncryptionKey, aesEncryptAsync, aesDecryptAsync, AESSealedData } from 'expo-crypto';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { collectExportData, type ExportData } from '../services/data-export';

const FORMAT_VERSION = 0x01;
const SALT_BYTES = 32;
const HASH_ITERATIONS = 600_000;

/**
 * Derive an AES-256 key from password + salt using iterated SHA-256.
 * Same pattern as keychain.ts PIN hashing.
 */
async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
): Promise<AESEncryptionKey> {
  const saltHex = Array.from(salt, (b) => b.toString(16).padStart(2, '0')).join('');
  let hash = saltHex + password;
  for (let i = 0; i < HASH_ITERATIONS; i++) {
    hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, hash);
  }
  // hash is a 64-char hex string (256 bits)
  return AESEncryptionKey.import(hash, 'hex');
}

/**
 * Encrypt all app data with a user-chosen password.
 * Returns the file URI of the .ptbackup file for sharing.
 */
export async function encryptExport(password: string): Promise<string> {
  const data = collectExportData();
  const json = JSON.stringify(data);
  const plaintext = new TextEncoder().encode(json);

  // Generate random salt
  const salt = await Crypto.getRandomBytesAsync(SALT_BYTES);

  // Derive key
  const key = await deriveKeyFromPassword(password, salt);

  // Encrypt with AES-256-GCM (auto-generates 12-byte IV, 16-byte tag)
  const sealed = await aesEncryptAsync(plaintext, key);

  // Get combined IV + ciphertext + tag
  const combined = await sealed.combined() as Uint8Array;

  // Build binary: version(1) + salt(32) + combined
  const output = new Uint8Array(1 + SALT_BYTES + combined.byteLength);
  output[0] = FORMAT_VERSION;
  output.set(salt, 1);
  output.set(combined, 1 + SALT_BYTES);

  // Base64 encode
  const base64 = uint8ToBase64(output);

  // Write to cache
  const file = new File(Paths.cache, 'period-tracker-backup.ptbackup');
  await file.write(base64);
  return file.uri;
}

/**
 * Share an encrypted backup via the system share sheet.
 */
export async function shareEncryptedExport(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/octet-stream',
      dialogTitle: 'Save encrypted backup',
    });
  }
}

/**
 * Decrypt a .ptbackup file with the user's password.
 * Throws on wrong password, corrupted file, or invalid format.
 */
export async function decryptImport(uri: string, password: string): Promise<ExportData> {
  // Read file content
  const file = new File(uri);
  const base64Content = file.textSync();

  // Decode base64
  const bytes = base64ToUint8(base64Content);

  // Validate minimum size: 1 (version) + 32 (salt) + 12 (IV) + 1 (min ciphertext) + 16 (tag)
  if (bytes.byteLength < 1 + SALT_BYTES + 12 + 1 + 16) {
    throw new Error('Invalid backup file');
  }

  // Extract version
  const version = bytes[0];
  if (version !== FORMAT_VERSION) {
    throw new Error('Unsupported backup format version');
  }

  // Extract salt
  const salt = bytes.slice(1, 1 + SALT_BYTES);

  // Extract sealed data (IV + ciphertext + tag)
  const combinedData = bytes.slice(1 + SALT_BYTES);

  // Derive key
  const key = await deriveKeyFromPassword(password, salt);

  // Reconstruct sealed data
  const sealed = AESSealedData.fromCombined(combinedData, {
    ivLength: 12,
    tagLength: 16,
  });

  // Decrypt — throws if wrong password (GCM tag mismatch)
  let decrypted: Uint8Array;
  try {
    decrypted = await aesDecryptAsync(sealed, key, { output: 'bytes' });
  } catch {
    throw new Error('Incorrect password');
  }

  // Parse JSON
  let data: ExportData;
  try {
    const json = new TextDecoder().decode(decrypted);
    data = JSON.parse(json);
  } catch {
    throw new Error('Invalid backup file');
  }

  // Validate structure
  if (!data.exportDate || !data.appVersion) {
    throw new Error('Invalid backup file');
  }

  return data;
}

// ── Base64 helpers ──────────────────────────────────────

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
