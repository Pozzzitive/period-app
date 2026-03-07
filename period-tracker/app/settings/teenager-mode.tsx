import React from 'react';
import { ScrollView, View, Text, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/src/stores';
import { useSettingsStore } from '@/src/stores';
import { useTheme } from '@/src/theme';

export default function TeenagerModeScreen() {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const { colors, isDark } = useTheme();

  const currentYear = new Date().getFullYear();
  const age = profile.birthYear ? currentYear - profile.birthYear : null;
  const isUnder16 = age !== null && age < 16;

  const handleToggle = (enabled: boolean) => {
    if (isUnder16 && !enabled) return; // Cannot disable for under 16
    updateProfile({ isTeenager: enabled });
    if (enabled) {
      updateSettings({ fertilityTrackingEnabled: false, partnerSharingEnabled: false });
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View style={{ backgroundColor: colors.successLight }} className="p-4 rounded-xl flex-row items-start gap-3 mb-5">
        <Ionicons name="leaf-outline" size={24} color={colors.success} />
        <Text style={{ color: colors.success }} className="flex-1 text-sm leading-5">
          Teenager mode provides an age-appropriate experience with educational
          content about your cycle.
        </Text>
      </View>

      {isUnder16 && (
        <View style={{ backgroundColor: colors.warningLight }} className="p-4 rounded-xl flex-row items-start gap-3 mb-5">
          <Ionicons name="shield-checkmark-outline" size={24} color={colors.warning} />
          <Text style={{ color: colors.warning }} className="flex-1 text-sm leading-5">
            Teenager mode is enforced for users under 16 and cannot be turned off.
          </Text>
        </View>
      )}

      <View style={{ backgroundColor: colors.surface }} className="flex-row items-center p-4 rounded-xl mb-5">
        <View className="flex-1">
          <Text style={{ color: colors.text }} className="text-base font-medium">Teenager mode</Text>
          <Text style={{ color: colors.textTertiary }} className="text-[13px] mt-0.5">
            {isUnder16 ? 'Enforced for your age group' : 'Enable age-appropriate content'}
          </Text>
        </View>
        <Switch
          value={profile.isTeenager}
          onValueChange={handleToggle}
          disabled={isUnder16}
          trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
          thumbColor={profile.isTeenager ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'}
        />
      </View>

      <Text style={{ color: colors.text }} className="text-base font-semibold mb-3">When enabled:</Text>
      <View className="gap-2">
        <FeatureItem text="Intimacy tab is hidden" />
        <FeatureItem text="Fertility/ovulation tracking is hidden" />
        <FeatureItem text="Focus on period education" />
        <FeatureItem text="Age-appropriate language" />
        <FeatureItem text="Premium Plus photo features are disabled" />
      </View>
    </ScrollView>
  );
}

function FeatureItem({ text }: { text: string }) {
  const { colors } = useTheme();

  return (
    <View className="flex-row gap-2">
      <Text style={{ color: colors.textTertiary }} className="text-sm">•</Text>
      <Text style={{ color: colors.textSecondary }} className="text-sm">{text}</Text>
    </View>
  );
}
