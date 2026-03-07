import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { useAuthStore } from '@/src/stores';
import { verifyPin, authenticateWithBiometrics, getBiometricType } from '@/src/services/keychain';

export function LockScreen() {
  const { colors } = useTheme();
  const unlock = useAuthStore((s) => s.unlock);
  const biometricEnabled = useAuthStore((s) => s.biometricEnabled);
  const failedAttempts = useAuthStore((s) => s.failedAttempts);
  const lockedUntil = useAuthStore((s) => s.lockedUntil);
  const recordFailedAttempt = useAuthStore((s) => s.recordFailedAttempt);
  const resetAttempts = useAuthStore((s) => s.resetAttempts);
  const [pin, setPin] = useState('');
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockedUntil) { setLockoutRemaining(0); return; }
    const update = () => {
      const remaining = Math.max(0, Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000));
      setLockoutRemaining(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  useEffect(() => {
    getBiometricType().then(setBiometricType);
  }, []);

  const handleBiometric = useCallback(async () => {
    const success = await authenticateWithBiometrics();
    if (success) {
      resetAttempts();
      unlock();
    }
  }, [unlock, resetAttempts]);

  // Try biometric auth on mount if enabled
  useEffect(() => {
    if (biometricEnabled && biometricType) {
      handleBiometric();
    }
  }, [biometricEnabled, biometricType, handleBiometric]);

  const isLockedOut = lockoutRemaining > 0;

  const handlePinSubmit = async () => {
    if (pin.length < 4 || isLockedOut) return;

    const valid = await verifyPin(pin);
    if (valid) {
      setPin('');
      resetAttempts();
      unlock();
    } else {
      setPin('');
      recordFailedAttempt();
    }
  };

  const biometricIcon = biometricType === 'FaceID' ? 'scan-outline' : 'finger-print-outline';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
    <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: colors.background }}>
      <Ionicons name="lock-closed" size={48} color={colors.primary} />
      <Text className="text-2xl font-bold mt-4 mb-1" style={{ color: colors.text }}>App Locked</Text>
      <Text className="text-base text-center mb-8" style={{ color: colors.textSecondary }}>
        Enter your PIN to unlock
      </Text>

      <TextInput
        style={{
          width: '100%',
          backgroundColor: colors.surface,
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 12,
          fontSize: 20,
          textAlign: 'center',
          letterSpacing: 12,
          color: colors.text,
          marginBottom: 16,
        }}
        placeholder="• • • •"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        secureTextEntry
        value={pin}
        onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 6))}
        maxLength={6}
        onSubmitEditing={handlePinSubmit}
        autoFocus={!biometricEnabled}
      />

      {isLockedOut && (
        <Text className="text-sm mb-3" style={{ color: colors.destructive }}>
          Too many attempts. Try again in {lockoutRemaining}s.
        </Text>
      )}
      {!isLockedOut && failedAttempts > 0 && (
        <Text className="text-sm mb-3" style={{ color: colors.destructive }}>Incorrect PIN. Please try again.</Text>
      )}

      <TouchableOpacity
        className="w-full py-4 rounded-xl items-center mb-4"
        style={{ backgroundColor: colors.primary }}
        onPress={handlePinSubmit}
      >
        <Text className="text-base font-semibold" style={{ color: colors.onPrimary }}>Unlock</Text>
      </TouchableOpacity>

      {biometricEnabled && biometricType && (
        <TouchableOpacity
          className="flex-row items-center gap-2 py-3"
          onPress={handleBiometric}
        >
          <Ionicons name={biometricIcon} size={22} color={colors.primary} />
          <Text className="font-medium text-base" style={{ color: colors.primary }}>Use {biometricType}</Text>
        </TouchableOpacity>
      )}
    </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
