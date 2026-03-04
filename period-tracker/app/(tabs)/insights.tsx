import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useCycleStore, useUserStore } from '@/src/stores';
import { CONDITIONS_BY_ID } from '@/src/constants/conditions';
import { usePrediction, useCyclePhase } from '@/src/hooks';
import { standardDeviation } from '@/src/engine/prediction-engine';
import { PhaseCard } from '@/src/components/common/PhaseCard';
import { PredictionCard } from '@/src/components/common/PredictionCard';
import { YearInPixels } from '@/src/components/calendar/YearInPixels';
import { ScreenWithFlowers } from '@/src/components/decorations/ScreenWithFlowers';
import { CornerFlowers } from '@/src/components/decorations/CornerFlowers';
import { useBarInsets } from '@/src/hooks/useBarInsets';
import { useTheme } from '@/src/theme';
import type { ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

type ViewMode = 'insights' | 'yearly';

export default function InsightsScreen() {
  const { colors } = useTheme();
  const barInsets = useBarInsets();
  const cycles = useCycleStore((s) => s.cycles);
  const profile = useUserStore((s) => s.profile);
  const prediction = usePrediction();
  const phase = useCyclePhase();
  const [viewMode, setViewMode] = useState<ViewMode>('insights');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const styles = useMemo(() => createStyles(colors), [colors]);

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

  const handlePrevYear = useCallback(() => {
    setCurrentYear((y) => y - 1);
  }, []);

  const handleNextYear = useCallback(() => {
    setCurrentYear((y) => y + 1);
  }, []);

  return (
    <ScreenWithFlowers backgroundColor={colors.background}>
    <View style={[styles.outerContainer, { paddingTop: barInsets.top }]}>
      <CornerFlowers />
      {/* Pill toggle */}
      <View style={styles.pillWrapper}>
        <View style={styles.pillContainer}>
          <TouchableOpacity
            style={[styles.pill, viewMode === 'insights' && styles.pillActive]}
            onPress={() => setViewMode('insights')}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, viewMode === 'insights' && styles.pillTextActive]}>
              Insights
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, viewMode === 'yearly' && styles.pillActive]}
            onPress={() => setViewMode('yearly')}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, viewMode === 'yearly' && styles.pillTextActive]}>
              Year in Pixels
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'insights' ? (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {/* Phase card */}
          <PhaseCard phase={phase} />

          {/* Next period prediction */}
          <PredictionCard prediction={prediction} />

          {/* Cycle statistics */}
          {stats ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Cycle Statistics</Text>
              <View style={styles.statsGrid}>
                <StatItem label="Cycles tracked" value={`${stats.count}`} colors={colors} />
                <StatItem label="Average length" value={`${stats.avg} days`} colors={colors} />
                <StatItem label="Shortest" value={`${stats.shortest} days`} colors={colors} />
                <StatItem label="Longest" value={`${stats.longest} days`} colors={colors} />
                <StatItem
                  label="Regularity"
                  value={stats.stddev <= 3 ? 'Regular' : stats.stddev <= 5 ? 'Somewhat regular' : 'Irregular'}
                  colors={colors}
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
      ) : (
        <View style={styles.yearContainer}>
          {/* Year navigation */}
          <View style={styles.nav}>
            <TouchableOpacity onPress={handlePrevYear} style={styles.navButton}>
              <Text style={styles.navText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.navTitle}>{currentYear}</Text>
            <TouchableOpacity onPress={handleNextYear} style={styles.navButton}>
              <Text style={styles.navText}>›</Text>
            </TouchableOpacity>
          </View>

          <YearInPixels year={currentYear} onSelectMonth={() => {}} />
        </View>
      )}
    </View>
    </ScreenWithFlowers>
  );
}

function StatItem({ label, value, colors }: { label: string; value: string; colors: ThemeColors }) {
  return (
    <View style={statStyles.statItem}>
      <Text style={[statStyles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[statStyles.statLabel, { color: colors.textTertiary }]}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  statItem: {
    minWidth: '40%',
  },
  statValue: {
    fontSize: fs(20),
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: fs(13),
    marginTop: s(2),
  },
});

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    outerContainer: {
      flex: 1,
    },
    pillWrapper: {
      paddingHorizontal: s(16),
      paddingTop: s(8),
      paddingBottom: s(12),
    },
    pillContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceTertiary,
      borderRadius: s(22),
      padding: s(3),
    },
    pill: {
      flex: 1,
      paddingVertical: s(9),
      alignItems: 'center',
      borderRadius: s(20),
    },
    pillActive: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: s(2) },
      shadowOpacity: 0.25,
      shadowRadius: s(4),
      elevation: 2,
    },
    pillText: {
      fontSize: fs(14),
      fontWeight: '600',
      color: colors.textTertiary,
    },
    pillTextActive: {
      color: colors.onPrimary,
      fontWeight: '700',
    },
    container: {
      flex: 1,
    },
    content: {
      padding: s(16),
      paddingTop: 0,
      paddingBottom: s(80),
    },
    yearContainer: {
      flex: 1,
      padding: s(16),
      paddingTop: 0,
    },
    nav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: s(12),
    },
    navButton: {
      padding: s(12),
      minWidth: s(44),
      minHeight: s(44),
      justifyContent: 'center',
      alignItems: 'center',
    },
    navText: {
      fontSize: fs(28),
      color: colors.primary,
      fontWeight: '300',
      lineHeight: fs(32),
    },
    navTitle: {
      fontSize: fs(18),
      fontWeight: '700',
      color: colors.text,
      letterSpacing: fs(0.3),
    },
    card: {
      backgroundColor: colors.surface,
      padding: s(20),
      borderRadius: s(14),
      marginBottom: s(12),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(1) },
      shadowOpacity: 0.05,
      shadowRadius: s(4),
      elevation: 1,
    },
    cardTitle: {
      fontSize: fs(16),
      fontWeight: '600',
      color: colors.text,
      marginBottom: s(12),
    },
    emptyText: {
      fontSize: fs(14),
      color: colors.textMuted,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(16),
    },
    conditionItem: {
      marginBottom: s(12),
      paddingBottom: s(12),
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    conditionLabel: {
      fontSize: fs(15),
      fontWeight: '600',
      color: colors.text,
      marginBottom: s(4),
    },
    conditionInsight: {
      fontSize: fs(14),
      color: colors.textSecondary,
      lineHeight: fs(20),
    },
    predictionInfo: {
      fontSize: fs(14),
      color: colors.textSecondary,
      lineHeight: fs(20),
    },
    irregularNote: {
      fontSize: fs(13),
      color: colors.textTertiary,
      fontStyle: 'italic',
      marginTop: s(8),
    },
  });
