import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore, useAuthStore } from '@/src/stores';
import { useTheme } from '@/src/theme';
import type { ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

export default function AppLockSettingsScreen() {
  const appLock = useSettingsStore((s) => s.settings.appLock);
  const updateAppLock = useSettingsStore((s) => s.updateAppLock);
  const setPinHash = useAuthStore((s) => s.setPinHash);
  const setBiometricEnabled = useAuthStore((s) => s.setBiometricEnabled);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleEnableToggle = (enabled: boolean) => {
    if (enabled) {
      setShowPinSetup(true);
    } else {
      updateAppLock({ enabled: false });
      setPinHash(null);
      setBiometricEnabled(false);
    }
  };

  const handleSetPin = () => {
    if (pin.length < 4 || pin.length > 6) {
      Alert.alert('Invalid PIN', 'PIN must be 4-6 digits.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('PINs don\'t match', 'Please make sure both PINs match.');
      return;
    }
    // In production, hash the PIN via react-native-keychain
    setPinHash(pin);
    updateAppLock({ enabled: true, method: 'both' });
    setBiometricEnabled(true);
    setShowPinSetup(false);
    setPin('');
    setConfirmPin('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.info}>
        Protect your app with biometrics and/or a PIN code. The lock screen
        appears when opening the app or returning from background.
      </Text>

      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>Enable app lock</Text>
        </View>
        <Switch
          value={appLock.enabled}
          onValueChange={handleEnableToggle}
          trackColor={{ true: colors.switchActive }}
        />
      </View>

      {showPinSetup && (
        <View style={styles.pinSetup}>
          <Text style={styles.pinTitle}>Set a PIN code</Text>
          <TextInput
            style={styles.pinInput}
            placeholder="Enter PIN (4-6 digits)"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            secureTextEntry
            value={pin}
            onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 6))}
            maxLength={6}
          />
          <TextInput
            style={styles.pinInput}
            placeholder="Confirm PIN"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            secureTextEntry
            value={confirmPin}
            onChangeText={(text) => setConfirmPin(text.replace(/[^0-9]/g, '').slice(0, 6))}
            maxLength={6}
          />
          <TouchableOpacity style={styles.button} onPress={handleSetPin}>
            <Text style={styles.buttonText}>Set PIN</Text>
          </TouchableOpacity>
        </View>
      )}

      {appLock.enabled && (
        <>
          <Text style={styles.sectionTitle}>Auto-lock timeout</Text>
          {([1, 5, 15] as const).map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[styles.row, appLock.timeoutMinutes === minutes && styles.rowActive]}
              onPress={() => updateAppLock({ timeoutMinutes: minutes })}
            >
              <Text style={styles.rowLabel}>
                {minutes} minute{minutes > 1 ? 's' : ''}
              </Text>
              {appLock.timeoutMinutes === minutes && (
                <Ionicons name="checkmark" size={s(18)} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: s(16),
    paddingBottom: s(32),
  },
  info: {
    fontSize: fs(14),
    color: colors.textSecondary,
    backgroundColor: colors.infoLight,
    padding: s(14),
    borderRadius: s(10),
    marginBottom: s(16),
    lineHeight: fs(20),
  },
  sectionTitle: {
    fontSize: fs(13),
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: fs(1),
    marginTop: s(20),
    marginBottom: s(8),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: s(16),
    borderRadius: s(12),
    marginBottom: s(6),
  },
  rowActive: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: fs(16),
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  pinSetup: {
    backgroundColor: colors.surface,
    padding: s(20),
    borderRadius: s(12),
    marginTop: s(12),
    gap: s(12),
  },
  pinTitle: {
    fontSize: fs(17),
    fontWeight: '600',
    color: colors.text,
  },
  pinInput: {
    backgroundColor: colors.surfaceTertiary,
    paddingVertical: s(14),
    paddingHorizontal: s(16),
    borderRadius: s(10),
    fontSize: fs(18),
    textAlign: 'center',
    letterSpacing: fs(8),
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: s(14),
    borderRadius: s(10),
    alignItems: 'center',
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: fs(16),
    fontWeight: '600',
  },
});
