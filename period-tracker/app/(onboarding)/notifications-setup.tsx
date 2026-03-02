import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '@/src/stores';
import { useTheme, type ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

export default function NotificationsSetupScreen() {
  const router = useRouter();
  const notifications = useSettingsStore((s) => s.settings.notifications);
  const updateNotifications = useSettingsStore((s) => s.updateNotifications);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const notificationOptions = [
    { key: 'periodReminder' as const, label: 'Period reminder', desc: '5 days before your predicted period', default: true },
    { key: 'periodStarting' as const, label: 'Period starting', desc: 'On the day your period is expected', default: true },
    { key: 'premenstrualPhase' as const, label: 'PMS phase', desc: 'When you enter the premenstrual phase', default: true },
    { key: 'cycleSummary' as const, label: 'Cycle summary', desc: 'Summary after your period ends', default: true },
    { key: 'dailyLogReminder' as const, label: 'Daily log reminder', desc: 'Reminder to log your symptoms', default: false },
    { key: 'pillReminder' as const, label: 'Pill reminder', desc: 'Daily medication reminder', default: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          All notifications are local — nothing is sent to any server. You can
          change these anytime in settings.
        </Text>

        {notificationOptions.map((option) => (
          <View key={option.key} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{option.label}</Text>
              <Text style={styles.rowDesc}>{option.desc}</Text>
            </View>
            <Switch
              value={notifications[option.key]}
              onValueChange={(val) => updateNotifications({ [option.key]: val })}
              trackColor={{ true: colors.switchActive }}
            />
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(onboarding)/consent')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
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
    paddingTop: s(40),
    paddingBottom: s(24),
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
    marginBottom: s(24),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: s(16),
    borderRadius: s(12),
    marginBottom: s(8),
  },
  rowText: {
    flex: 1,
    marginRight: s(12),
  },
  rowLabel: {
    fontSize: fs(16),
    fontWeight: '600',
    color: colors.text,
  },
  rowDesc: {
    fontSize: fs(13),
    color: colors.textTertiary,
    marginTop: s(2),
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: s(16),
    borderRadius: s(12),
    alignItems: 'center',
    marginBottom: s(16),
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: fs(18),
    fontWeight: '600',
  },
});
