import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useSubscriptionStore, selectIsPremiumPlus } from '@/src/stores/subscription-store';
import { AnimatedPillToggle } from '@/src/components/common/AnimatedPillToggle';
import { PremiumBlurOverlay } from '@/src/components/common/PremiumBlurOverlay';
import { PeriodAnalysisCard } from './PeriodAnalysisCard';
import { SymptomRankingCard } from './SymptomRankingCard';
import { MoodDistributionCard } from './MoodDistributionCard';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import { useTheme } from '@/src/theme';

type CycleCountStr = '3' | '6' | '12' | 'all';

const CYCLE_COUNT_OPTIONS: { value: CycleCountStr; label: string }[] = [
  { value: '3', label: 'Last 3' },
  { value: '6', label: 'Last 6' },
  { value: '12', label: 'Last 12' },
  { value: 'all', label: 'All' },
];

function toCycleCount(s: CycleCountStr): 3 | 6 | 12 | 'all' {
  if (s === 'all') return 'all';
  return Number(s) as 3 | 6 | 12;
}

// Sample data shown behind blur for non-premium users
const SAMPLE_SYMPTOMS = [
  { symptomId: 'cramps', label: 'Cramps', icon: '\u26A1', count: 18, percentage: 72 },
  { symptomId: 'bloating', label: 'Bloating', icon: '\uD83C\uDF88', count: 14, percentage: 56 },
  { symptomId: 'fatigue', label: 'Fatigue', icon: '\uD83D\uDE34', count: 12, percentage: 48 },
  { symptomId: 'headache', label: 'Headache', icon: '\uD83E\uDD15', count: 9, percentage: 36 },
  { symptomId: 'food_cravings', label: 'Food cravings', icon: '\uD83C\uDF6B', count: 8, percentage: 32 },
];

const SAMPLE_MOODS = [
  { moodId: 'happy', label: 'Happy', icon: '\uD83D\uDE0A', count: 12, percentage: 30 },
  { moodId: 'calm', label: 'Calm', icon: '\uD83D\uDE0C', count: 8, percentage: 20 },
  { moodId: 'irritable', label: 'Irritable', icon: '\uD83D\uDE24', count: 7, percentage: 18 },
  { moodId: 'anxious', label: 'Anxious', icon: '\uD83D\uDE30', count: 5, percentage: 13 },
  { moodId: 'sad', label: 'Sad', icon: '\uD83D\uDE22', count: 4, percentage: 10 },
];

export function ExtendedAnalyticsSection() {
  const { colors } = useTheme();
  const isPremium = useSubscriptionStore(selectIsPremiumPlus);
  const [cycleCount, setCycleCount] = useState<CycleCountStr>('all');
  const analytics = useAnalytics(toCycleCount(cycleCount));

  if (!isPremium) {
    return (
      <>
        {/* Period Analysis is free — same type of info as Overview stats */}
        {analytics ? (
          <PeriodAnalysisCard analytics={analytics} />
        ) : (
          <View
            className="p-5 rounded-[14px] mb-3"
            style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
          >
            <Text className="text-base font-semibold mb-1" style={{ color: colors.text }}>Period Analysis</Text>
            <Text className="text-sm" style={{ color: colors.textMuted }}>
              Complete at least one full cycle to see period analysis.
            </Text>
          </View>
        )}

        {/* Symptom rankings & mood distribution are premium */}
        <PremiumBlurOverlay>
          <View>
            <SymptomRankingCard symptoms={SAMPLE_SYMPTOMS} />
            <MoodDistributionCard moods={SAMPLE_MOODS} />
          </View>
        </PremiumBlurOverlay>
      </>
    );
  }

  return (
    <>
      <View className="mb-3">
        <AnimatedPillToggle
          options={CYCLE_COUNT_OPTIONS}
          selected={cycleCount}
          onSelect={setCycleCount}
        />
      </View>

      {analytics ? (
        <>
          <PeriodAnalysisCard analytics={analytics} />
          <SymptomRankingCard symptoms={analytics.topSymptoms} />
          <MoodDistributionCard moods={analytics.moodDistribution} />
        </>
      ) : (
        <View
          className="p-5 rounded-[14px] mb-3"
          style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
        >
          <Text className="text-base font-semibold mb-1" style={{ color: colors.text }}>Extended Analytics</Text>
          <Text className="text-sm" style={{ color: colors.textMuted }}>
            Complete at least one full cycle to see extended analytics.
          </Text>
        </View>
      )}
    </>
  );
}
