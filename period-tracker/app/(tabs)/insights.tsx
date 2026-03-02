import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { useCycleStore, useUserStore } from '@/src/stores';
import { PHASES } from '@/src/constants/phases';
import { CONDITIONS_BY_ID } from '@/src/constants/conditions';
import { usePrediction, useCyclePhase } from '@/src/hooks';
import { standardDeviation } from '@/src/engine/prediction-engine';

export default function InsightsScreen() {
  const cycles = useCycleStore((s) => s.cycles);
  const profile = useUserStore((s) => s.profile);
  const prediction = usePrediction();
  const phase = useCyclePhase();

  const completedCycles = cycles.filter((c) => c.cycleLength != null);
  const cycleLengths = completedCycles.map((c) => c.cycleLength!);

  const stats = useMemo(() => {
    if (cycleLengths.length === 0) return null;
    const avg = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
    const shortest = Math.min(...cycleLengths);
    const longest = Math.max(...cycleLengths);
    const stddev = standardDeviation(cycleLengths);
    return { avg, shortest, longest, stddev, count: cycleLengths.length };
  }, [cycleLengths]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Insights</Text>

      {/* Cycle statistics */}
      {stats ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cycle Statistics</Text>
          <View style={styles.statsGrid}>
            <StatItem label="Cycles tracked" value={`${stats.count}`} />
            <StatItem label="Average length" value={`${stats.avg} days`} />
            <StatItem label="Shortest" value={`${stats.shortest} days`} />
            <StatItem label="Longest" value={`${stats.longest} days`} />
            <StatItem
              label="Regularity"
              value={stats.stddev <= 3 ? 'Regular' : stats.stddev <= 5 ? 'Somewhat regular' : 'Irregular'}
            />
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cycle Statistics</Text>
          <Text style={styles.emptyText}>
            Complete at least one full cycle to see statistics here.
          </Text>
        </View>
      )}

      {/* Current phase info */}
      {phase && (
        <View style={[styles.card, { backgroundColor: PHASES[phase.phase].lightColor }]}>
          <Text style={styles.cardTitle}>Current Phase</Text>
          <Text style={styles.phaseLabel}>{PHASES[phase.phase].label}</Text>
          <Text style={styles.phaseDesc}>{PHASES[phase.phase].description}</Text>
          <Text style={styles.phaseTip}>{PHASES[phase.phase].tips}</Text>
        </View>
      )}

      {/* Health condition insights */}
      {profile.healthConditions.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Conditions</Text>
          {profile.healthConditions.map((condId) => {
            const condition = CONDITIONS_BY_ID[condId];
            if (!condition) return null;
            return (
              <View key={condId} style={styles.conditionItem}>
                <Text style={styles.conditionLabel}>{condition.label}</Text>
                <Text style={styles.conditionInsight}>{condition.insight}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Prediction confidence */}
      {prediction && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Prediction Quality</Text>
          <Text style={styles.predictionInfo}>
            {prediction.confidence === 'learning'
              ? 'We\'re still learning your pattern. Log more periods for better predictions.'
              : prediction.confidence === 'low'
              ? 'Predictions are approximate. Your cycles show some variation.'
              : prediction.confidence === 'medium'
              ? 'Predictions are getting more accurate as we learn your pattern.'
              : 'Your cycles are very consistent. Predictions should be accurate.'}
          </Text>
          {prediction.isIrregular && (
            <Text style={styles.irregularNote}>
              Your cycles show significant variation (±{prediction.windowDays} days). This is
              common and doesn't necessarily indicate a problem.
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    minWidth: '40%',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  phaseLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  phaseDesc: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 8,
  },
  phaseTip: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  conditionItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  conditionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  conditionInsight: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  predictionInfo: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  irregularNote: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
