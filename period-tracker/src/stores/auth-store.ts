import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../storage';
import { clearPin, clearBiometricCredential } from '../services/keychain';

interface AuthState {
  isLocked: boolean;
  lastActiveAt: string | null;
  hasPinSet: boolean;      // whether a PIN is stored in Keychain
  biometricEnabled: boolean;
  failedAttempts: number;
  lockedUntil: string | null;  // ISO timestamp — lockout expiry

  // Actions
  lock: () => void;
  unlock: () => void;
  setLastActive: () => void;
  setHasPinSet: (has: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  recordFailedAttempt: () => void;
  resetAttempts: () => void;
  clearAll: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLocked: false,
      lastActiveAt: null,
      hasPinSet: false,
      biometricEnabled: false,
      failedAttempts: 0,
      lockedUntil: null,

      lock: () => set({ isLocked: true }),
      unlock: () =>
        set({ isLocked: false, lastActiveAt: new Date().toISOString() }),
      setLastActive: () =>
        set({ lastActiveAt: new Date().toISOString() }),
      setHasPinSet: (has) => set({ hasPinSet: has }),
      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
      recordFailedAttempt: () =>
        set((state) => {
          const attempts = state.failedAttempts + 1;
          // Lockout: 30s after 5 failed, 60s after 8, 5min after 10+
          let lockoutSeconds = 0;
          if (attempts >= 10) lockoutSeconds = 300;
          else if (attempts >= 8) lockoutSeconds = 60;
          else if (attempts >= 5) lockoutSeconds = 30;
          return {
            failedAttempts: attempts,
            lockedUntil: lockoutSeconds > 0
              ? new Date(Date.now() + lockoutSeconds * 1000).toISOString()
              : null,
          };
        }),
      resetAttempts: () => set({ failedAttempts: 0, lockedUntil: null }),
      clearAll: () => {
        // Clear Keychain entries alongside store state
        clearPin().catch(() => {});
        clearBiometricCredential().catch(() => {});
        set({
          isLocked: false,
          lastActiveAt: null,
          hasPinSet: false,
          biometricEnabled: false,
          failedAttempts: 0,
          lockedUntil: null,
        });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
