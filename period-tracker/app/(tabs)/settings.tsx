import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettingsStore, useUserStore, useCustomSymptomStore } from '@/src/stores';
import { TeenagerGate } from '@/src/components/common/TeenagerGate';
import { PremiumGate } from '@/src/components/common/PremiumGate';
import { ThemePicker } from '@/src/components/settings/ThemePicker';
import { ScreenWithFlowers } from '@/src/components/decorations/ScreenWithFlowers';
import { CornerFlowers } from '@/src/components/decorations/CornerFlowers';
import { useBarInsets } from '@/src/hooks/useBarInsets';
import { useScrollToTopOnFocus } from '@/src/hooks';
import { useTheme } from '@/src/theme';

const DARK_MODE_DESC: Record<string, string> = {
  system: 'Follow system setting',
  light: 'Always light',
  dark: 'Always dark',
};

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const barInsets = useBarInsets();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const profile = useUserStore((s) => s.profile);
  const customSymptomCount = useCustomSymptomStore((s) => s.customSymptoms.length);
  const scrollRef = useScrollToTopOnFocus();

  const cycleDarkMode = () => {
    const next = settings.theme === 'system' ? 'light' : settings.theme === 'light' ? 'dark' : 'system';
    updateSettings({ theme: next });
  };

  return (
    <ScreenWithFlowers backgroundColor={colors.background}>
    <ScrollView ref={scrollRef} className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: barInsets.top + 16, paddingBottom: barInsets.bottom + 32 }}>
      <CornerFlowers />
      <Text className="text-2xl font-bold mb-5" style={{ color: colors.text }}>Settings</Text>

      {/* Appearance */}
      <SectionHeader label="Appearance" color={colors.textTertiary} />

      <SettingRow
        label="Dark mode"
        description={DARK_MODE_DESC[settings.theme] ?? 'Follow system setting'}
        onPress={cycleDarkMode}
        right={
          <View className="flex-row items-center gap-2">
            <Text className="text-[13px] font-medium capitalize" style={{ color: colors.primary }}>{settings.theme}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
          </View>
        }
      />

      <SettingRow
        label="Flower decorations"
        description={settings.showFlowerDecorations ? 'Themed flowers on every screen' : 'Off'}
        right={
          <Switch
            value={settings.showFlowerDecorations}
            onValueChange={(val) => updateSettings({ showFlowerDecorations: val })}
            trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
            thumbColor={settings.showFlowerDecorations ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'}
          />
        }
      />

      {/* Themes */}
      <SectionHeader label="Themes" color={colors.textTertiary} />

      <View className="rounded-xl p-3 mb-1.5" style={{ backgroundColor: colors.surface }}>
        <ThemePicker />
      </View>

      {/* Profile */}
      <SectionHeader label="Profile" color={colors.textTertiary} />

      <SettingRow
        label="Age"
        description={
          profile.birthYear
            ? `Born ${profile.birthYear} (${new Date().getFullYear() - profile.birthYear} years old)`
            : 'Not set — tap to add your birth year'
        }
        onPress={() => router.push('/settings/age')}
        showArrow
      />

      {/* Cycle & Tracking */}
      <SectionHeader label="Cycle & Tracking" color={colors.textTertiary} />

      <TeenagerGate>
        <SettingRow
          label="Fertility tracking"
          description="Show fertility window on calendar"
          right={
            <Switch
              value={settings.fertilityTrackingEnabled}
              onValueChange={(val) => updateSettings({ fertilityTrackingEnabled: val })}
              trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
              thumbColor={settings.fertilityTrackingEnabled ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'}
            />
          }
        />
      </TeenagerGate>

      <PremiumGate>
        <SettingRow
          label="Custom symptom tags"
          description={
            customSymptomCount > 0
              ? `${customSymptomCount} custom symptom(s)`
              : 'Create your own symptoms to track'
          }
          onPress={() => router.push('/settings/custom-symptoms')}
          showArrow
        />
      </PremiumGate>

      <SettingRow
        label="Health conditions"
        description={
          profile.healthConditions.length > 0
            ? `${profile.healthConditions.length} condition(s) tagged`
            : 'Tag conditions that affect your cycle'
        }
        onPress={() => router.push('/settings/health-conditions')}
        showArrow
      />

      <SettingRow
        label="Teenager mode"
        description={profile.isTeenager ? 'Active — age-appropriate content enabled' : 'Off — show all features'}
        onPress={() => router.push('/settings/teenager-mode')}
        showArrow
      />

      {/* Notifications */}
      <SectionHeader label="Notifications" color={colors.textTertiary} />
      <SettingRow
        label="Notification preferences"
        description="Manage your notification settings"
        onPress={() => router.push('/settings/notifications')}
        showArrow
      />

      {/* Security */}
      <SectionHeader label="Security" color={colors.textTertiary} />
      <SettingRow
        label="App lock"
        description={settings.appLock.enabled ? 'Enabled' : 'Off'}
        onPress={() => router.push('/settings/app-lock')}
        showArrow
      />

      {/* Partner Sharing */}
      <TeenagerGate>
        <SectionHeader label="Sharing" color={colors.textTertiary} />
        <SettingRow
          label="Partner sharing"
          description="Share cycle summary with a partner"
          right={
            <Switch
              value={settings.partnerSharingEnabled}
              onValueChange={(val) => updateSettings({ partnerSharingEnabled: val })}
              trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
              thumbColor={settings.partnerSharingEnabled ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'}
            />
          }
        />
      </TeenagerGate>

      {/* Premium */}
      <SectionHeader label="Premium" color={colors.textTertiary} />
      <SettingRow
        label="Premium Plus"
        description="Unlock advanced insights and features"
        onPress={() => router.push('/subscription/paywall')}
        showArrow
      />

      <PremiumGate>
        <SettingRow
          label="Home screen widget"
          description="Long-press your home screen to add the cycle widget"
          right={<Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />}
        />
      </PremiumGate>

      {/* Data & Privacy */}
      <SectionHeader label="Data & Privacy" color={colors.textTertiary} />
      <SettingRow
        label="Data management"
        description="Export or delete your data"
        onPress={() => router.push('/settings/data-management')}
        showArrow
      />
      <SettingRow
        label="Privacy policy"
        description="How your data is handled"
        onPress={() => router.push('/settings/privacy')}
        showArrow
      />
    </ScrollView>
    </ScreenWithFlowers>
  );
}

function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <Text className="text-[13px] font-semibold uppercase tracking-widest mt-5 mb-2 pl-1" style={{ color }}>{label}</Text>
  );
}

interface SettingRowProps {
  label: string;
  description: string;
  right?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
}

function SettingRow({ label, description, right, onPress, showArrow }: SettingRowProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      className="flex-row items-center p-4 rounded-xl mb-1.5"
      style={{ backgroundColor: colors.surface }}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View className="flex-1">
        <Text className="text-base font-medium" style={{ color: colors.text }}>{label}</Text>
        <Text className="text-[13px] mt-0.5" style={{ color: colors.textTertiary }}>{description}</Text>
      </View>
      {right}
      {showArrow && <Text className="text-[22px] ml-2" style={{ color: colors.textDisabled }}>›</Text>}
    </TouchableOpacity>
  );
}
