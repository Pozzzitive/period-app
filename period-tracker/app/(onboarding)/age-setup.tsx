import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/src/stores';
import { useTheme, type ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

export default function AgeSetupScreen() {
  const router = useRouter();
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [birthYear, setBirthYear] = useState('');
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
            placeholderTextColor={colors.textMuted}
            value={birthYear}
            onChangeText={(text) => setBirthYear(text.replace(/[^0-9]/g, '').slice(0, 4))}
            maxLength={4}
          />
        </View>

        {isTeenager && (
          <View style={styles.infoBox}>
            <Ionicons name="leaf-outline" size={s(24)} color={colors.success} />
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

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: s(24),
  },
  content: {
    flex: 1,
    paddingTop: s(40),
  },
  title: {
    fontSize: fs(28),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: s(8),
  },
  subtitle: {
    fontSize: fs(15),
    color: colors.textSecondary,
    marginBottom: s(32),
  },
  inputContainer: {
    marginBottom: s(20),
  },
  label: {
    fontSize: fs(17),
    fontWeight: '600',
    color: colors.text,
    marginBottom: s(8),
  },
  input: {
    backgroundColor: colors.surface,
    paddingVertical: s(14),
    paddingHorizontal: s(16),
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fs(18),
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: colors.successLight,
    padding: s(16),
    borderRadius: s(12),
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(12),
  },
  infoText: {
    flex: 1,
    fontSize: fs(14),
    color: colors.success,
    lineHeight: fs(20),
  },
  errorText: {
    color: colors.primary,
    fontSize: fs(14),
    marginTop: s(8),
  },
  buttons: {
    flexDirection: 'row',
    gap: s(12),
    marginBottom: s(16),
  },
  skipButton: {
    flex: 1,
    paddingVertical: s(16),
    borderRadius: s(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  skipText: {
    color: colors.primary,
    fontSize: fs(18),
    fontWeight: '600',
  },
  button: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: s(16),
    borderRadius: s(12),
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: fs(18),
    fontWeight: '600',
  },
});
