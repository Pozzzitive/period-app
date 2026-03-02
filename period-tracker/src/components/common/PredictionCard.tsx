import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { PredictionResult } from '../../models';
import { formatDate } from '../../utils/dates';
import { differenceInDays, parseISO } from 'date-fns';
import { useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
import { s, fs } from '../../utils/scale';

interface PredictionCardProps {
  prediction: PredictionResult | null;
}

const CONFIDENCE_LABELS = {
  learning: 'Learning your pattern',
  low: 'Low confidence',
  medium: 'Medium confidence',
  high: 'High confidence',
};

export function PredictionCard({ prediction }: PredictionCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!prediction) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Next Period</Text>
        <Text style={styles.emptyText}>
          Log your first period to see predictions here.
        </Text>
      </View>
    );
  }

  const today = new Date();
  const nextStart = parseISO(prediction.nextPeriodStart);
  const daysUntil = differenceInDays(nextStart, today);

  const daysText =
    daysUntil === 0
      ? 'Today'
      : daysUntil === 1
      ? 'Tomorrow'
      : daysUntil > 0
      ? `In ${daysUntil} days`
      : `${Math.abs(daysUntil)} days ago`;

  const confidenceColorMap = {
    learning: colors.confidenceLearning,
    low: colors.confidenceLow,
    medium: colors.confidenceMedium,
    high: colors.confidenceHigh,
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Next Period</Text>
      <Text style={styles.daysText}>{daysText}</Text>
      <Text style={styles.dateText}>
        {formatDate(prediction.nextPeriodStart, 'EEEE, MMM d')}
      </Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Cycle length</Text>
          <Text style={styles.detailValue}>{prediction.predictedCycleLength} days</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Period length</Text>
          <Text style={styles.detailValue}>{prediction.predictedPeriodLength} days</Text>
        </View>
      </View>

      <View style={[styles.confidenceBadge, { backgroundColor: confidenceColorMap[prediction.confidence] }]}>
        <Text style={styles.confidenceText}>
          {CONFIDENCE_LABELS[prediction.confidence]}
        </Text>
      </View>

      {prediction.isIrregular && prediction.windowDays && (
        <Text style={styles.irregularNote}>
          Your cycles vary, so the prediction has a ±{prediction.windowDays} day window.
        </Text>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      padding: s(20),
      borderRadius: s(16),
      marginBottom: s(16),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(2) },
      shadowOpacity: 0.05,
      shadowRadius: s(8),
      elevation: 2,
    },
    title: {
      fontSize: fs(14),
      fontWeight: '600',
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: fs(1),
      marginBottom: s(8),
    },
    daysText: {
      fontSize: fs(28),
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: s(4),
    },
    dateText: {
      fontSize: fs(16),
      color: colors.textSecondary,
      marginBottom: s(16),
    },
    emptyText: {
      fontSize: fs(15),
      color: colors.textMuted,
      marginTop: s(8),
    },
    details: {
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      paddingTop: s(12),
      gap: s(8),
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    detailLabel: {
      fontSize: fs(14),
      color: colors.textTertiary,
    },
    detailValue: {
      fontSize: fs(14),
      fontWeight: '600',
      color: colors.text,
    },
    confidenceBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: s(10),
      paddingVertical: s(4),
      borderRadius: s(12),
      marginTop: s(12),
    },
    confidenceText: {
      fontSize: fs(12),
      fontWeight: '500',
      color: colors.textSecondary,
    },
    irregularNote: {
      fontSize: fs(13),
      color: colors.textTertiary,
      fontStyle: 'italic',
      marginTop: s(8),
    },
  });
