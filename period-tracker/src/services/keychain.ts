import * as Keychain from 'react-native-keychain';
import * as Crypto from 'expo-crypto';

const SERVICE_NAME = 'com.periodtracker.app.lock';
const SALT_SERVICE = 'com.periodtracker.app.lock.salt';
const SALT_BYTES = 32;

// Number of SHA-256 iterations for PIN stretching.
// OWASP minimum for PBKDF2-SHA256 is 600k iterations.
// Each iteration crosses the JS-native bridge, so this takes ~200-500ms.
// TODO: Replace with native PBKDF2 via react-native-quick-crypto in Phase 3.
const HASH_ITERATIONS = 600_000;

// ── PIN Storage (salted + iterated SHA-256 hashed in Keychain) ────────

/**
 * Generate a cryptographically random salt.
 */
async function generateSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(SALT_BYTES);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Retrieve the stored salt, or return null if none exists.
 */
async function getSalt(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: SALT_SERVICE });
    return credentials ? credentials.password : null;
  } catch {
    return null;
  }
}

/**
 * Store a salt in the Keychain.
 */
async function storeSalt(salt: string): Promise<void> {
  await Keychain.setGenericPassword('salt', salt, { service: SALT_SERVICE });
}

/**
 * Hash a PIN with a per-user salt using iterated SHA-256.
 * Each iteration crosses the JS-native bridge, so we use HASH_ITERATIONS
 * (moderate) to balance security and responsiveness.
 */
async function hashPin(pin: string, salt: string): Promise<string> {
  let hash = salt + pin;
  for (let i = 0; i < HASH_ITERATIONS; i++) {
    hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, hash);
  }
  return hash;
}

/**
 * Save a hashed PIN to the iOS Keychain / Android Keystore.
 * Generates a unique salt on first store.
 *
 * If a PIN already exists, `oldPin` must be provided and verified first.
 * This prevents overwriting the stored PIN without authorization.
 */
export async function storePin(pin: string, oldPin?: string): Promise<boolean> {
  try {
    // If a PIN already exists, require and verify the old one before overwriting
    const existing = await Keychain.getGenericPassword({ service: SERVICE_NAME });
    if (existing) {
      if (oldPin == null) return false;
      const valid = await verifyPin(oldPin);
      if (!valid) return false;
    }

    const salt = await generateSalt();
    await storeSalt(salt);
    const hash = await hashPin(pin, salt);
    await Keychain.setGenericPassword('pin', hash, { service: SERVICE_NAME });
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify a PIN against the stored hash.
 */
export async function verifyPin(pin: string): Promise<boolean> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: SERVICE_NAME });
    if (!credentials) return false;
    const salt = await getSalt();
    if (!salt) return false;
    const hash = await hashPin(pin, salt);
    return hash === credentials.password;
  } catch {
    return false;
  }
}

/**
 * Remove the stored PIN and salt from Keychain.
 */
export async function clearPin(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE_NAME });
    await Keychain.resetGenericPassword({ service: SALT_SERVICE });
  } catch {
    // ignore
  }
}

/**
 * Check if a PIN is stored.
 */
export async function hasStoredPin(): Promise<boolean> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: SERVICE_NAME });
    return !!credentials;
  } catch {
    return false;
  }
}

// ── Biometric Authentication ────────────────────────────────

/**
 * Check what biometric types are available on the device.
 */
export async function getBiometricType(): Promise<'FaceID' | 'TouchID' | 'Biometrics' | null> {
  try {
    const type = await Keychain.getSupportedBiometryType();
    if (type === Keychain.BIOMETRY_TYPE.FACE_ID) return 'FaceID';
    if (type === Keychain.BIOMETRY_TYPE.TOUCH_ID) return 'TouchID';
    if (type === Keychain.BIOMETRY_TYPE.FINGERPRINT) return 'Biometrics';
    return null;
  } catch {
    return null;
  }
}

/**
 * Set up the biometric credential (call once when biometrics are enabled).
 * Stores a dummy value with biometric access control.
 */
export async function setupBiometricCredential(): Promise<boolean> {
  try {
    await Keychain.setGenericPassword('biometric', 'auth', {
      service: SERVICE_NAME + '.biometric',
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Prompt the user for biometric authentication.
 * Returns true if authenticated, false otherwise.
 * Requires setupBiometricCredential() to have been called first.
 */
export async function authenticateWithBiometrics(): Promise<boolean> {
  try {
    const result = await Keychain.getGenericPassword({
      service: SERVICE_NAME + '.biometric',
      authenticationPrompt: {
        title: 'Unlock Period Tracker',
        subtitle: 'Verify your identity to access the app',
        cancel: 'Use PIN',
      },
    });

    return !!result;
  } catch {
    return false;
  }
}

/**
 * Remove biometric credential from Keychain.
 */
export async function clearBiometricCredential(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE_NAME + '.biometric' });
  } catch {
    // ignore
  }
}
