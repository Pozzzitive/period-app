import { createMMKV } from 'react-native-mmkv';
import type { MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const storage: MMKV = createMMKV({
  id: 'period-tracker-storage',
});

/** Zustand-compatible storage adapter for MMKV */
export const zustandMMKVStorage: StateStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

const ENCRYPTION_KEY_SERVICE = 'com.periodtracker.app.mmkv-key';

/**
 * Encrypt MMKV storage at rest using a key stored in the device Keychain.
 * Call this early in app startup (e.g. root layout mount).
 *
 * On first run: generates a random key, stores it in Keychain, encrypts MMKV.
 * On subsequent runs: reads the key from Keychain and re-applies it.
 *
 * Uses recrypt() which works on an already-open MMKV instance, so the
 * synchronous createMMKV() above can remain at module scope.
 */
export async function ensureStorageEncrypted(): Promise<void> {
  try {
    const Keychain = require('react-native-keychain') as typeof import('react-native-keychain');
    const Crypto = require('expo-crypto') as typeof import('expo-crypto');

    // Try to read existing key from Keychain
    const existing = await Keychain.getGenericPassword({ service: ENCRYPTION_KEY_SERVICE });

    if (existing) {
      // Re-apply encryption key (no-op if already encrypted with same key)
      storage.recrypt(existing.password);
    } else {
      // First launch — generate a random 32-byte key
      const bytes = await Crypto.getRandomBytesAsync(32);
      const key = Array.from(bytes, (b: number) => b.toString(16).padStart(2, '0')).join('');

      // Store in Keychain before encrypting (so we never lose the key)
      await Keychain.setGenericPassword('mmkv', key, {
        service: ENCRYPTION_KEY_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });

      // Encrypt all existing data
      storage.recrypt(key);
    }
  } catch {
    // If Keychain is unavailable (e.g. Expo Go), continue unencrypted.
    // OS-level encryption still protects data on non-jailbroken devices.
  }
}
