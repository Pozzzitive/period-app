import React from 'react';
import { ScrollView, StyleSheet, View, Text, Switch } from 'react-native';
import { useSettingsStore } from '@/src/stores';
import { TeenagerGate } from '@/src/components/common/TeenagerGate';

export default function NotificationsSettingsScreen() {
  const notifications = useSettingsStore((s) => s.settings.notifications);
  const updateNotifications = useSettingsStore((s) => s.updateNotifications);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.info}>
        All notifications are local and processed on your device. Nothing is sent to any server.
      </Text>

      <Text style={styles.sectionTitle}>Period</Text>
      <NotifRow
        label="Period reminder"
        desc="5 days before predicted start"
        value={notifications.periodReminder}
        onChange={(val) => updateNotifications({ periodReminder: val })}
      />
      <NotifRow
        label="Period starting"
        desc="On predicted start day"
        value={notifications.periodStarting}
        onChange={(val) => updateNotifications({ periodStarting: val })}
      />
      <NotifRow
        label="Premenstrual phase"
        desc="When you enter PMS window"
        value={notifications.premenstrualPhase}
        onChange={(val) => updateNotifications({ premenstrualPhase: val })}
      />
      <NotifRow
        label="Cycle summary"
        desc="Summary after period ends"
        value={notifications.cycleSummary}
        onChange={(val) => updateNotifications({ cycleSummary: val })}
      />

      <TeenagerGate>
        <Text style={styles.sectionTitle}>Fertility</Text>
        <NotifRow
          label="Fertile window"
          desc="5 days before ovulation"
          value={notifications.fertileWindowOpen}
          onChange={(val) => updateNotifications({ fertileWindowOpen: val })}
        />
        <NotifRow
          label="Peak fertility"
          desc="Estimated ovulation day"
          value={notifications.peakFertility}
          onChange={(val) => updateNotifications({ peakFertility: val })}
        />
        <NotifRow
          label="Low fertility"
          desc="Late luteal phase"
          value={notifications.lowFertility}
          onChange={(val) => updateNotifications({ lowFertility: val })}
        />
      </TeenagerGate>

      <Text style={styles.sectionTitle}>Logging</Text>
      <NotifRow
        label="Daily log reminder"
        desc="Remind to log symptoms"
        value={notifications.dailyLogReminder}
        onChange={(val) => updateNotifications({ dailyLogReminder: val })}
      />

      <Text style={styles.sectionTitle}>Medication</Text>
      <NotifRow
        label="Pill reminder"
        desc="Daily medication reminder"
        value={notifications.pillReminder}
        onChange={(val) => updateNotifications({ pillReminder: val })}
      />
      <NotifRow
        label="Contraception reminder"
        desc="Patch, ring, or injection"
        value={notifications.contraceptionReminder}
        onChange={(val) => updateNotifications({ contraceptionReminder: val })}
      />
    </ScrollView>
  );
}

function NotifRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDesc}>{desc}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: '#E74C3C' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  info: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 6,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  rowDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
});
