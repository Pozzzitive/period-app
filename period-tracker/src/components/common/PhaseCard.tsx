import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PHASES } from '../../constants/phases';
import type { PhaseInfo } from '../../models';

interface PhaseCardProps {
  phase: PhaseInfo | null;
}

export function PhaseCard({ phase }: PhaseCardProps) {
  if (!phase) {
    return (
      <View style={[styles.card, { backgroundColor: '#F5F5F5' }]}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.description}>
          Start logging your periods to see your cycle phases here.
        </Text>
      </View>
    );
  }

  const phaseInfo = PHASES[phase.phase];

  return (
    <View style={[styles.card, { backgroundColor: phaseInfo.lightColor }]}>
      <View style={styles.header}>
        <View style={[styles.phaseBadge, { backgroundColor: phaseInfo.color }]}>
          <Text style={styles.badgeText}>{phaseInfo.label}</Text>
        </View>
        <Text style={styles.dayCount}>
          Day {phase.dayInCycle} of {phase.cycleLength}
        </Text>
      </View>
      <Text style={styles.description}>{phaseInfo.description}</Text>
      <Text style={styles.tip}>{phaseInfo.tips}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  dayCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 8,
  },
  tip: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
});
