import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, Switch, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettingsStore, useAuthStore } from '@/src/stores';
import { useTheme } from '@/src/theme';
import { storePin, clearPin, getBiometricType, setupBiometricCredential, clearBiometricCredential } from '@/src/services/keychain';

export default function AppLockSettingsScreen() {
  const appLock = useSettingsStore((s) => s.settings.appLock);
  const updateAppLock = useSettingsStore((s) => s.updateAppLock);
  const setHasPinSet = useAuthStore((s) => s.setHasPinSet);
  const biometricEnabled = useAuthStore((s) => s.biometricEnabled);
  const setBiometricEnabled = useAuthStore((s) => s.setBiometricEnabled);
  const { colors, isDark } = useTheme();

  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const confirmPinRef = useRef<TextInput>(null);

  useEffect(() => {
    getBiometricType().then(setBiometricType);
  }, []);

  const handleEnableToggle = (enabled: boolean) => {
    if (enabled) {
      setShowPinSetup(true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Disable App Lock',
        'Are you sure? Your app will no longer be protected.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              updateAppLock({ enabled: false });
              setHasPinSet(false);
              setBiometricEnabled(false);
              await clearPin();
              await clearBiometricCredential();
            },
          },
        ]
      );
    }
  };

  const handleSetPin = async () => {
    if (pin.length < 4 || pin.length > 6) {
      Alert.alert('Invalid PIN', 'PIN must be 4-6 digits.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('PINs don\'t match', 'Please make sure both PINs match.');
      return;
    }

    const stored = await storePin(pin);
    if (!stored) {
      Alert.alert('Error', 'Could not save PIN securely. Please try again.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setHasPinSet(true);
    updateAppLock({ enabled: true, method: biometricType ? 'both' : 'pin' });
    if (biometricType) {
      setBiometricEnabled(true);
      await setupBiometricCredential();
    }
    setShowPinSetup(false);
    setPin('');
    setConfirmPin('');
  };

  // Real-time PIN match feedback
  const pinMatchStatus = (() => {
    if (confirmPin.length === 0) return null;
    if (confirmPin.length < pin.length) return null;
    if (pin === confirmPin) return 'match';
    return 'mismatch';
  })();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} keyboardDismissMode="interactive">
      <Text style={{ color: colors.textSecondary, backgroundColor: colors.infoLight }} className="text-sm p-3.5 rounded-[10px] mb-4 leading-5">
        Protect your app with {biometricType ?? 'biometrics'} and/or a PIN code. Your PIN is
        stored securely in the {'\u00A0'}Keychain and never leaves your device.
      </Text>

      <View style={{ backgroundColor: colors.surface }} className="flex-row items-center p-4 rounded-xl mb-1.5">
        <View className="flex-1">
          <Text style={{ color: colors.text }} className="text-base font-medium">Enable app lock</Text>
        </View>
        <Switch
          value={appLock.enabled}
          onValueChange={handleEnableToggle}
          trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
          thumbColor={appLock.enabled ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'}
        />
      </View>

      {showPinSetup && (
        <View style={{ backgroundColor: colors.surface }} className="p-5 rounded-xl mt-3 gap-3">
          <Text style={{ color: colors.text }} className="text-[17px] font-semibold">Set a PIN code</Text>
          <TextInput
            style={{
              backgroundColor: colors.surfaceTertiary,
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 10,
              fontSize: 18,
              textAlign: 'center',
              letterSpacing: 8,
              color: colors.text,
            }}
            placeholder="Enter PIN (4-6 digits)"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            secureTextEntry
            value={pin}
            onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 6))}
            maxLength={6}
            returnKeyType="next"
            onSubmitEditing={() => confirmPinRef.current?.focus()}
          />
          <TextInput
            ref={confirmPinRef}
            style={{
              backgroundColor: colors.surfaceTertiary,
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 10,
              fontSize: 18,
              textAlign: 'center',
              letterSpacing: 8,
              color: colors.text,
              borderWidth: pinMatchStatus ? 1.5 : 0,
              borderColor: pinMatchStatus === 'match' ? colors.success : pinMatchStatus === 'mismatch' ? colors.destructive : 'transparent',
            }}
            placeholder="Confirm PIN"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            secureTextEntry
            value={confirmPin}
            onChangeText={(text) => setConfirmPin(text.replace(/[^0-9]/g, '').slice(0, 6))}
            maxLength={6}
          />
          {pinMatchStatus === 'match' && (
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text className="text-sm" style={{ color: colors.success }}>PINs match</Text>
            </View>
          )}
          {pinMatchStatus === 'mismatch' && (
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="close-circle" size={16} color={colors.destructive} />
              <Text className="text-sm" style={{ color: colors.destructive }}>PINs don't match</Text>
            </View>
          )}
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, opacity: pinMatchStatus !== 'match' ? 0.5 : 1 }}
            className="py-3.5 rounded-[10px] items-center"
            onPress={handleSetPin}
            disabled={pinMatchStatus !== 'match'}
          >
            <Text style={{ color: colors.onPrimary }} className="text-base font-semibold">Set PIN</Text>
          </TouchableOpacity>
        </View>
      )}

      {appLock.enabled && (
        <>
          {biometricType && (
            <View style={{ backgroundColor: colors.surface }} className="flex-row items-center p-4 rounded-xl mb-1.5 mt-3">
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="text-base font-medium">Use {biometricType}</Text>
                <Text style={{ color: colors.textTertiary }} className="text-[13px] mt-0.5">Unlock with biometrics instead of PIN</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={async (enabled) => {
                  if (enabled) {
                    await setupBiometricCredential();
                  } else {
                    await clearBiometricCredential();
                  }
                  setBiometricEnabled(enabled);
                }}
                trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
                thumbColor={biometricEnabled ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'}
              />
            </View>
          )}

          <Text style={{ color: colors.textTertiary }} className="text-[13px] font-semibold uppercase tracking-widest mt-5 mb-2">Auto-lock timeout</Text>
          {([1, 5, 15] as const).map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                { backgroundColor: colors.surface },
                appLock.timeoutMinutes === minutes ? { borderWidth: 1, borderColor: colors.primary } : undefined,
              ]}
              className={`flex-row items-center p-4 rounded-xl mb-1.5`}
              onPress={() => {
                Haptics.selectionAsync();
                updateAppLock({ timeoutMinutes: minutes });
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: appLock.timeoutMinutes === minutes }}
            >
              <Text style={{ color: colors.text }} className="text-base font-medium flex-1">
                {minutes} minute{minutes > 1 ? 's' : ''}
              </Text>
              {appLock.timeoutMinutes === minutes && (
                <Ionicons name="checkmark" size={18} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
