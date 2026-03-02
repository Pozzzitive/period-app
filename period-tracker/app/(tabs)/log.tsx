import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { todayString } from '@/src/utils/dates';
import { useLogStore, useCycleStore } from '@/src/stores';
import { SYMPTOMS_BY_ID } from '@/src/constants/symptoms';
import { MOODS_BY_ID } from '@/src/constants/moods';

export default function LogScreen() {
  const router = useRouter();
  const today = todayString();
  const log = useLogStore((s) => s.logs[today]);
  const addPeriod = useCycleStore((s) => s.addPeriod);
  const periods = useCycleStore((s) => s.periods);

  const ongoingPeriod = periods.find((p) => !p.endDate);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Today's Log</Text>
      <Text style={styles.subtitle}>Quick log for today, or tap for details</Text>

      {/* Period status */}
      <TouchableOpacity
        style={[styles.card, ongoingPeriod && styles.cardActive]}
        onPress={() => {
          if (!ongoingPeriod) {
            addPeriod(today);
          }
          router.push(`/day/${today}`);
        }}
      >
        <Text style={styles.cardEmoji}>🩸</Text>
        <Text style={styles.cardTitle}>
          {ongoingPeriod ? 'Period is active' : 'Start period'}
        </Text>
        <Text style={styles.cardDesc}>
          {ongoingPeriod
            ? `Started ${ongoingPeriod.startDate}`
            : 'Tap to log the start of your period'}
        </Text>
      </TouchableOpacity>

      {/* Quick log buttons */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/day/${today}`)}
      >
        <Text style={styles.cardEmoji}>📝</Text>
        <Text style={styles.cardTitle}>Log symptoms & mood</Text>
        <Text style={styles.cardDesc}>
          {log?.symptoms.length
            ? `${log.symptoms.length} symptoms logged`
            : 'No symptoms logged yet today'}
        </Text>
      </TouchableOpacity>

      {/* Today's summary if anything logged */}
      {log && (log.symptoms.length > 0 || log.moods.length > 0 || log.flow) && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today so far</Text>

          {log.flow && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Flow:</Text>
              <Text style={styles.summaryValue}>{log.flow}</Text>
            </View>
          )}

          {log.symptoms.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Symptoms:</Text>
              <Text style={styles.summaryValue}>
                {log.symptoms.map((s) => SYMPTOMS_BY_ID[s.symptomId]?.label ?? s.symptomId).join(', ')}
              </Text>
            </View>
          )}

          {log.moods.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mood:</Text>
              <Text style={styles.summaryValue}>
                {log.moods.map((m) => MOODS_BY_ID[m]?.label ?? m).join(', ')}
              </Text>
            </View>
          )}

          {log.notes && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Notes:</Text>
              <Text style={styles.summaryValue}>{log.notes}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardActive: {
    backgroundColor: '#FADBD8',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#888',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 14,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
    width: 80,
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});
