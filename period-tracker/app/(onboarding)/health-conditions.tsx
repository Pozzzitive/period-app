import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/src/stores';
import { HEALTH_CONDITIONS } from '@/src/constants/conditions';
import { useTheme } from '@/src/theme';
import { OnboardingProgress } from '@/src/components/common/OnboardingProgress';

export default function HealthConditionsScreen() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const addCondition = useUserStore((s) => s.addHealthCondition);
  const removeCondition = useUserStore((s) => s.removeHealthCondition);
  const { colors } = useTheme();

  const toggleCondition = (id: string) => {
    if (profile.healthConditions.includes(id)) {
      removeCondition(id);
    } else {
      addCondition(id);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
      <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <OnboardingProgress step={2} />
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>Health Conditions</Text>
        <Text style={{ fontSize: 15, color: colors.textSecondary, marginBottom: 24 }}>
          Do you have any diagnosed conditions that affect your cycle? This helps
          us show relevant insights. You can change this anytime in settings.
        </Text>

        {HEALTH_CONDITIONS.map((condition) => {
          const selected = profile.healthConditions.includes(condition.id);
          return (
            <TouchableOpacity
              key={condition.id}
              style={{
                backgroundColor: selected ? colors.primaryMuted : colors.surface,
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: 2,
                borderColor: selected ? colors.primary : colors.border,
              }}
              onPress={() => toggleCondition(condition.id)}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', flex: 1, color: selected ? colors.primary : colors.text }}>
                  {condition.label}
                </Text>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 12,
                    backgroundColor: selected ? colors.primary : 'transparent',
                    borderColor: selected ? colors.primary : colors.textDisabled,
                  }}
                >
                  {selected && <Ionicons name="checkmark" size={16} color={colors.onPrimary} />}
                </View>
              </View>
              <Text style={{ fontSize: 13, color: colors.textTertiary, lineHeight: 18 }}>{condition.description}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <TouchableOpacity
          style={{ flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.primary }}
          onPress={() => {
            profile.healthConditions.forEach(removeCondition);
            router.push('/(onboarding)/notifications-setup');
          }}
        >
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '600' }}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 2, backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
          onPress={() => router.push('/(onboarding)/notifications-setup')}
        >
          <Text style={{ color: colors.onPrimary, fontSize: 18, fontWeight: '600' }}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
