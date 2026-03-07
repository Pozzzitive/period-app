import React from 'react';
import { View, Text } from 'react-native';
import type { CycleAnalytics } from '@/src/engine/analytics-engine';
import { useTheme } from '@/src/theme';

interface PeriodAnalysisCardProps {
  analytics: CycleAnalytics;
}

const TREND_LABELS = {
  shorter: 'Getting shorter',
  longer: 'Getting longer',
  stable: 'Stable',
};

export function PeriodAnalysisCard({ analytics }: PeriodAnalysisCardProps) {
  const { colors } = useTheme();

  return (
    <View
      className="p-5 rounded-[14px] mb-3"
      style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
    >
      <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>Period Analysis</Text>
      <View className="flex-row flex-wrap gap-4">
        <View style={{ minWidth: '40%' }}>
          <Text className="text-xl font-bold" style={{ color: colors.primary }}>{analytics.avgPeriodLength} days</Text>
          <Text className="text-[13px] mt-0.5" style={{ color: colors.textTertiary }}>Average period</Text>
        </View>
        <View style={{ minWidth: '40%' }}>
          <Text className="text-xl font-bold" style={{ color: colors.primary }}>{analytics.shortestPeriod}-{analytics.longestPeriod} days</Text>
          <Text className="text-[13px] mt-0.5" style={{ color: colors.textTertiary }}>Range</Text>
        </View>
        <View style={{ minWidth: '40%' }}>
          <Text className="text-xl font-bold" style={{ color: colors.primary }}>{TREND_LABELS[analytics.periodLengthTrend]}</Text>
          <Text className="text-[13px] mt-0.5" style={{ color: colors.textTertiary }}>Period length trend</Text>
        </View>
        <View style={{ minWidth: '40%' }}>
          <Text className="text-xl font-bold" style={{ color: colors.primary }}>{analytics.cycleLengthVariability} days</Text>
          <Text className="text-[13px] mt-0.5" style={{ color: colors.textTertiary }}>Cycle variability</Text>
        </View>
      </View>
    </View>
  );
}
