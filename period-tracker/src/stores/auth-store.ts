import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../storage';

interface AuthState {
  isLocked: boolean;
  lastActiveAt: string | null;
  pinHash: string | null; // stored via keychain in production, here for quick access
  biometricEnabled: boolean;

  // Actions
  lock: () => void;
  unlock: () => void;
  setLastActive: () => void;
  setPinHash: (hash: string | null) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  clearAll: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLocked: false,
      lastActiveAt: null,
      pinHash: null,
      biometricEnabled: false,

      lock: () => set({ isLocked: true }),
      unlock: () =>
        set({ isLocked: false, lastActiveAt: new Date().toISOString() }),
      setLastActive: () =>
        set({ lastActiveAt: new Date().toISOString() }),
      setPinHash: (hash) => set({ pinHash: hash }),
      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
      clearAll: () =>
        set({
          isLocked: false,
          lastActiveAt: null,
          pinHash: null,
          biometricEnabled: false,
        }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
