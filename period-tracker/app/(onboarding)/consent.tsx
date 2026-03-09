import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Switch, Linking, InteractionManager } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore, useUserStore } from '@/src/stores';
import { useTheme } from '@/src/theme';
import { OnboardingProgress } from '@/src/components/common/OnboardingProgress';

export default function ConsentScreen() {
  const router = useRouter();
  const setGdprConsent = useSettingsStore((s) => s.setGdprConsent);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const { colors, isDark } = useTheme();

  const [cycleData, setCycleData] = useState(true);
  const [symptoms, setSymptoms] = useState(true);
  const [intercourse, setIntercourse] = useState(true);
  const [understood, setUnderstood] = useState(false);

  const canContinue = understood && cycleData;

  const handleComplete = () => {
    updateSettings({
      dataCategories: {
        cycleData,
        symptoms,
        intercourse,
      },
    });
    setGdprConsent(true);
    // Navigate to paywall first, then mark onboarding complete after the
    // navigation animation finishes so the layout guard sees the paywall
    // segment instead of redirecting to tabs
    router.replace('/subscription/paywall?mode=onboarding');
    InteractionManager.runAfterInteractions(() => completeOnboarding());
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
      <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <OnboardingProgress step={4} />
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>Your Privacy</Text>
        <Text style={{ fontSize: 15, color: colors.textSecondary, marginBottom: 24 }}>
          We take your privacy seriously. Please review how your data is handled.
        </Text>

        <View style={{ backgroundColor: colors.infoLight, padding: 16, borderRadius: 12, marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.info, marginBottom: 8 }}>How your data is stored</Text>
          <Text style={{ fontSize: 14, color: colors.info, lineHeight: 20 }}>
            All your data stays on your device. Nothing is uploaded to any server
            unless you explicitly enable cloud backup later. We never sell your
            data, and we never will.
          </Text>
        </View>

        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Data categories</Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 16 }}>
          Choose which types of data you'd like to track. You can change this
          anytime in settings.
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 8 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Cycle tracking data</Text>
            <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>Period dates, cycle predictions, flow intensity</Text>
          </View>
          <Switch value={cycleData} onValueChange={setCycleData} trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }} thumbColor={cycleData ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'} />
        </View>
        {!cycleData && (
          <Text style={{ fontSize: 13, color: colors.destructive, marginBottom: 4, marginLeft: 4 }}>
            Required — the app cannot function without cycle data
          </Text>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 8 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Symptoms & moods</Text>
            <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>Physical symptoms, emotional state, notes</Text>
          </View>
          <Switch value={symptoms} onValueChange={setSymptoms} trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }} thumbColor={symptoms ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 8 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Intercourse logs</Text>
            <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>Intimate activity records</Text>
          </View>
          <Switch value={intercourse} onValueChange={setIntercourse} trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }} thumbColor={intercourse ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'} />
        </View>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 20, padding: 16, backgroundColor: colors.warningLight, borderRadius: 12 }}
          onPress={() => setUnderstood(!understood)}
          activeOpacity={0.7}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              borderWidth: 2,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 2,
              backgroundColor: understood ? colors.primary : 'transparent',
              borderColor: understood ? colors.primary : colors.textDisabled,
            }}
          >
            {understood && <Ionicons name="checkmark" size={16} color={colors.onPrimary} />}
          </View>
          <Text style={{ flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 }}>
            I consent to the app processing my health data (GDPR Article 9(2)(a)) stored locally on my device to provide cycle tracking, predictions, and the features I selected above. I can withdraw this consent at any time in Settings {'>'} Data Consent.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 12, alignItems: 'center' }}
          onPress={() => router.push('/settings/privacy')}
        >
          <Text style={{ fontSize: 14, color: colors.primary, textDecorationLine: 'underline' }}>
            Read our full Privacy Policy
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: 'center',
          marginBottom: 16,
          opacity: !canContinue ? 0.5 : 1,
        }}
        onPress={handleComplete}
        disabled={!canContinue}
      >
        <Text style={{ color: colors.onPrimary, fontSize: 18, fontWeight: '600' }}>Start Tracking</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
