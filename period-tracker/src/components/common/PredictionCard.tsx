import React from 'react';
import { View, Text } from 'react-native';
import type { PredictionResult } from '../../models';
import { formatDate } from '../../utils/dates';
import { differenceInDays, parseISO } from 'date-fns';
import { useTheme } from '../../theme';

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

  if (!prediction) {
    return (
      <View className="p-5 rounded-2xl mb-4" style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
        <Text className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: colors.textTertiary }}>Next Period</Text>
        <Text className="text-[15px] mt-2" style={{ color: colors.textMuted }}>
          Log your first period to see predictions here.
        </Text>
      </View>
    );
  }

  const today = new Date();
  const nextStart = parseISO(prediction.nextPeriodStart);
  const daysUntil = differenceInDays(nextStart, today);

  const absDays = Math.abs(daysUntil);
  const daysText =
    daysUntil === 0
      ? 'Today'
      : daysUntil === 1
      ? 'Tomorrow'
      : daysUntil > 0
      ? `In ${daysUntil} days`
      : absDays <= 14
      ? `${absDays} ${absDays === 1 ? 'day' : 'days'} past expected date`
      : 'Expected date has passed';

  const confidenceColorMap = {
    learning: colors.confidenceLearning,
    low: colors.confidenceLow,
    medium: colors.confidenceMedium,
    high: colors.confidenceHigh,
  };

  return (
    <View className="p-5 rounded-2xl mb-4" style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
      <Text className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: colors.textTertiary }}>Next Period</Text>
      <Text className="text-[28px] font-bold mb-1" style={{ color: colors.primary }}>{daysText}</Text>
      <Text className="text-base mb-4" style={{ color: colors.textSecondary }}>
        {formatDate(prediction.nextPeriodStart, 'EEEE, MMM d')}
      </Text>

      <View className="pt-3 gap-2" style={{ borderTopWidth: 1, borderTopColor: colors.borderLight }}>
        <View className="flex-row justify-between">
          <Text className="text-sm" style={{ color: colors.textTertiary }}>Cycle length</Text>
          <Text className="text-sm font-semibold" style={{ color: colors.text }}>{prediction.predictedCycleLength} days</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm" style={{ color: colors.textTertiary }}>Period length</Text>
          <Text className="text-sm font-semibold" style={{ color: colors.text }}>{prediction.predictedPeriodLength} days</Text>
        </View>
      </View>

      <View className="self-start px-2.5 py-1 rounded-xl mt-3" style={{ backgroundColor: confidenceColorMap[prediction.confidence] }}>
        <Text className="text-[12px] font-medium" style={{ color: colors.textSecondary }}>
          {CONFIDENCE_LABELS[prediction.confidence]}
        </Text>
      </View>

      {prediction.isIrregular && prediction.windowDays && (
        <Text className="text-[13px] italic mt-2" style={{ color: colors.textTertiary }}>
          Your cycles vary, so the prediction has a ±{prediction.windowDays} day window.
        </Text>
      )}
    </View>
  );
}
