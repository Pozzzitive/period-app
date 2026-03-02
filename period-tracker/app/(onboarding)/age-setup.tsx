import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/src/stores';

export default function AgeSetupScreen() {
  const router = useRouter();
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [birthYear, setBirthYear] = useState('');

  const currentYear = new Date().getFullYear();
  const age = birthYear ? currentYear - parseInt(birthYear, 10) : null;
  const isTeenager = age !== null && age >= 9 && age < 18;
  const isValidAge = age !== null && age >= 9 && age <= 100;

  const handleNext = () => {
    if (birthYear && isValidAge) {
      updateProfile({
        birthYear: parseInt(birthYear, 10),
        isTeenager,
      });
    }
    router.push('/(onboarding)/health-conditions');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Age</Text>
        <Text style={styles.subtitle}>
          This helps us tailor the experience. Younger users get age-appropriate content.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Birth year (optional)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="e.g. 2005"
            placeholderTextColor="#999"
            value={birthYear}
            onChangeText={(text) => setBirthYear(text.replace(/[^0-9]/g, '').slice(0, 4))}
            maxLength={4}
          />
        </View>

        {isTeenager && (
          <View style={styles.infoBox}>
            <Text style={styles.infoEmoji}>🌱</Text>
            <Text style={styles.infoText}>
              We'll enable teenager mode with age-appropriate content. Some features
              like intercourse logging and fertility tracking will be hidden.
            </Text>
          </View>
        )}

        {birthYear.length === 4 && !isValidAge && (
          <Text style={styles.errorText}>
            Please enter a valid birth year.
          </Text>
        )}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/(onboarding)/health-conditions')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !isValidAge && birthYear.length > 0 && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={birthYear.length > 0 && !isValidAge}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
    padding: 24,
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 18,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoEmoji: {
    fontSize: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    marginTop: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  skipText: {
    color: '#E74C3C',
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    flex: 2,
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
