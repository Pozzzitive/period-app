import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { PredictionResult } from '../../models';
import { formatDate } from '../../utils/dates';
import { differenceInDays, parseISO } from 'date-fns';

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

      <View style={[styles.confidenceBadge, styles[`confidence_${prediction.confidence}`]]}>
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  daysText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    marginTop: 8,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  confidenceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  confidence_learning: {
    backgroundColor: '#FFF3E0',
  },
  confidence_low: {
    backgroundColor: '#FFEBEE',
  },
  confidence_medium: {
    backgroundColor: '#E3F2FD',
  },
  confidence_high: {
    backgroundColor: '#E8F5E9',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  irregularNote: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
