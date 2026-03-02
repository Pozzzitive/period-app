import React, { useState } from 'react';
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
import { useSettingsStore, useAuthStore } from '@/src/stores';

export default function AppLockSettingsScreen() {
  const appLock = useSettingsStore((s) => s.settings.appLock);
  const updateAppLock = useSettingsStore((s) => s.updateAppLock);
  const setPinHash = useAuthStore((s) => s.setPinHash);
  const setBiometricEnabled = useAuthStore((s) => s.setBiometricEnabled);

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
          trackColor={{ true: '#E74C3C' }}
        />
      </View>

      {showPinSetup && (
        <View style={styles.pinSetup}>
          <Text style={styles.pinTitle}>Set a PIN code</Text>
          <TextInput
            style={styles.pinInput}
            placeholder="Enter PIN (4-6 digits)"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            secureTextEntry
            value={pin}
            onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 6))}
            maxLength={6}
          />
          <TextInput
            style={styles.pinInput}
            placeholder="Confirm PIN"
            placeholderTextColor="#999"
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
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  info: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 6,
  },
  rowActive: {
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  pinSetup: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginTop: 12,
    gap: 12,
  },
  pinTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  pinInput: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#E74C3C',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
