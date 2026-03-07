import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useSettingsStore } from '@/src/stores';
import { useTheme } from '@/src/theme';
import { OnboardingProgress } from '@/src/components/common/OnboardingProgress';

export default function NotificationsSetupScreen() {
  const router = useRouter();
  const notifications = useSettingsStore((s) => s.settings.notifications);
  const updateNotifications = useSettingsStore((s) => s.updateNotifications);
  const { colors, isDark } = useTheme();

  const notificationOptions = [
    { key: 'periodReminder' as const, label: 'Period reminder', desc: '5 days before your predicted period', default: true },
    { key: 'periodStarting' as const, label: 'Period starting', desc: 'On the day your period is expected', default: true },
    { key: 'premenstrualPhase' as const, label: 'PMS phase', desc: 'When you enter the premenstrual phase', default: true },
    { key: 'cycleSummary' as const, label: 'Cycle summary', desc: 'Summary after your period ends', default: true },
    { key: 'dailyLogReminder' as const, label: 'Daily log reminder', desc: 'Reminder to log your symptoms', default: false },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
      <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <OnboardingProgress step={3} />
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>Notifications</Text>
        <Text style={{ fontSize: 15, color: colors.textSecondary, marginBottom: 24 }}>
          All notifications are local — nothing is sent to any server. You can
          change these anytime in settings.
        </Text>

        {notificationOptions.map((option) => (
          <View
            key={option.key}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 8 }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{option.label}</Text>
              <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>{option.desc}</Text>
            </View>
            <Switch
              value={notifications[option.key]}
              onValueChange={(val) => updateNotifications({ [option.key]: val })}
              trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
              thumbColor={notifications[option.key] ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'}
            />
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 }}
        onPress={async () => {
          // Request OS notification permission before proceeding
          const hasAnyEnabled = Object.values(notifications).some(Boolean);
          if (hasAnyEnabled) {
            await Notifications.requestPermissionsAsync();
          }
          router.push('/(onboarding)/consent');
        }}
      >
        <Text style={{ color: colors.onPrimary, fontSize: 18, fontWeight: '600' }}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
