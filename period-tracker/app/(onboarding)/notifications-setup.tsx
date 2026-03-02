import React from 'react';
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

export default function NotificationsSetupScreen() {
  const router = useRouter();
  const notifications = useSettingsStore((s) => s.settings.notifications);
  const updateNotifications = useSettingsStore((s) => s.updateNotifications);

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
              trackColor={{ true: '#E74C3C' }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
    padding: 24,
  },
  content: {
    paddingTop: 40,
    paddingBottom: 24,
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
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  rowDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
