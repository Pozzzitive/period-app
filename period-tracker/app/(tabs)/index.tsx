import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCyclePhase, usePrediction, useMissingPeriod } from '@/src/hooks';
import { PhaseCard } from '@/src/components/common/PhaseCard';
import { PredictionCard } from '@/src/components/common/PredictionCard';
import { MissingPeriodPrompt } from '@/src/components/common/MissingPeriodPrompt';
import { useCycleStore } from '@/src/stores';
import { todayString, formatDate } from '@/src/utils/dates';

export default function TodayScreen() {
  const router = useRouter();
  const phase = useCyclePhase();
  const prediction = usePrediction();
  const { shouldShow: showMissing } = useMissingPeriod();
  const [dismissedMissing, setDismissedMissing] = useState(false);
  const periods = useCycleStore((s) => s.periods);
  const addPeriod = useCycleStore((s) => s.addPeriod);
  const endPeriod = useCycleStore((s) => s.endPeriod);

  const today = todayString();

  // Check if there's an ongoing period (no end date)
  const ongoingPeriod = periods.find((p) => !p.endDate);

  const handleLogPeriodStart = useCallback(() => {
    addPeriod(today);
  }, [today, addPeriod]);

  const handleEndPeriod = useCallback(() => {
    if (ongoingPeriod) {
      endPeriod(ongoingPeriod.id, today);
    }
  }, [ongoingPeriod, today, endPeriod]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Missing period prompt */}
      {showMissing && !dismissedMissing && (
        <MissingPeriodPrompt onDismiss={() => setDismissedMissing(true)} />
      )}

      {/* Phase card */}
      <PhaseCard phase={phase} />

      {/* Quick actions */}
      <View style={styles.actions}>
        {ongoingPeriod ? (
          <TouchableOpacity style={styles.actionButton} onPress={handleEndPeriod}>
            <Text style={styles.actionEmoji}>✅</Text>
            <Text style={styles.actionText}>Period ended</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.actionButton, styles.actionPrimary]} onPress={handleLogPeriodStart}>
            <Text style={styles.actionEmoji}>🩸</Text>
            <Text style={[styles.actionText, styles.actionTextPrimary]}>Log period</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/day/${today}`)}
        >
          <Text style={styles.actionEmoji}>✏️</Text>
          <Text style={styles.actionText}>Log today</Text>
        </TouchableOpacity>
      </View>

      {/* Prediction card */}
      <PredictionCard prediction={prediction} />

      {/* Today's date */}
      <Text style={styles.dateText}>{formatDate(today, 'EEEE, MMMM d, yyyy')}</Text>
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
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionPrimary: {
    backgroundColor: '#E74C3C',
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionTextPrimary: {
    color: '#FFF',
  },
  dateText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
