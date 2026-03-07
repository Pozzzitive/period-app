import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/src/stores';
import { useTheme } from '@/src/theme';
import { OnboardingProgress } from '@/src/components/common/OnboardingProgress';

export default function AgeSetupScreen() {
  const router = useRouter();
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [birthYear, setBirthYear] = useState('');
  const { colors } = useTheme();

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <OnboardingProgress step={1} />
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>Your Age</Text>
        <Text style={{ fontSize: 15, color: colors.textSecondary, marginBottom: 32 }}>
          This helps us tailor the experience. Younger users get age-appropriate content.
        </Text>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Birth year (optional)</Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              fontSize: 18,
              textAlign: 'center',
              color: colors.text,
            }}
            keyboardType="number-pad"
            placeholder="e.g. 2005"
            placeholderTextColor={colors.textMuted}
            value={birthYear}
            onChangeText={(text) => setBirthYear(text.replace(/[^0-9]/g, '').slice(0, 4))}
            maxLength={4}
          />
        </View>

        {isTeenager && (
          <View style={{ backgroundColor: colors.successLight, padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <Ionicons name="leaf-outline" size={24} color={colors.success} />
            <Text style={{ flex: 1, fontSize: 14, color: colors.success, lineHeight: 20 }}>
              We'll enable teenager mode with age-appropriate content. Some features
              like intercourse logging and fertility tracking will be hidden.
            </Text>
          </View>
        )}

        {birthYear.length === 4 && !isValidAge && (
          <Text style={{ color: colors.destructive, fontSize: 14, marginTop: 8 }}>
            Please enter a valid birth year.
          </Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <TouchableOpacity
          style={{ flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.primary }}
          onPress={() => router.push('/(onboarding)/health-conditions')}
        >
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '600' }}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 2,
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            opacity: !isValidAge && birthYear.length > 0 ? 0.5 : 1,
          }}
          onPress={handleNext}
          disabled={birthYear.length > 0 && !isValidAge}
        >
          <Text style={{ color: colors.onPrimary, fontSize: 18, fontWeight: '600' }}>Continue</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
