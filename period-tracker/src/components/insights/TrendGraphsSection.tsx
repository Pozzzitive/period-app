import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useSubscriptionStore, selectIsPremiumPlus } from '@/src/stores/subscription-store';
import { AnimatedPillToggle } from '@/src/components/common/AnimatedPillToggle';
import { PremiumBlurOverlay } from '@/src/components/common/PremiumBlurOverlay';
import { BarChart } from '@/src/components/charts/BarChart';
import { LineChart } from '@/src/components/charts/LineChart';
import { useTrendData } from '@/src/hooks/useTrendData';
import { useTheme } from '@/src/theme';

type RangeStr = '3' | '6' | '12';

const RANGE_OPTIONS: { value: RangeStr; label: string }[] = [
  { value: '3', label: 'Last 3' },
  { value: '6', label: 'Last 6' },
  { value: '12', label: 'Last 12' },
];

// Sample data shown behind blur for non-premium users
const SAMPLE_CYCLE_DATA = [
  { label: 'C1', value: 28 },
  { label: 'C2', value: 30 },
  { label: 'C3', value: 27 },
  { label: 'C4', value: 29 },
  { label: 'C5', value: 28 },
  { label: 'C6', value: 31 },
];

const SAMPLE_PERIOD_DATA = [
  { label: 'C1', value: 5 },
  { label: 'C2', value: 4 },
  { label: 'C3', value: 5 },
  { label: 'C4', value: 6 },
  { label: 'C5', value: 5 },
  { label: 'C6', value: 4 },
];

export function TrendGraphsSection() {
  const { colors } = useTheme();
  const isPremium = useSubscriptionStore(selectIsPremiumPlus);
  const [range, setRange] = useState<RangeStr>('6');
  const { cycleLengths, periodLengths, avgCycleLength, avgPeriodLength } = useTrendData(Number(range));

  if (!isPremium) {
    return (
      <PremiumBlurOverlay>
        <View className="mb-3 opacity-100">
          <View
            className="p-4 rounded-[14px] mb-3"
            style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
          >
            <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>Cycle Length</Text>
            <BarChart data={SAMPLE_CYCLE_DATA} averageLine={29} unit="d" />
          </View>

          <View
            className="p-4 rounded-[14px] mb-3"
            style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
          >
            <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>Period Length</Text>
            <LineChart data={SAMPLE_PERIOD_DATA} unit="d" />
          </View>
        </View>
      </PremiumBlurOverlay>
    );
  }

  return (
    <>
      <View className="mb-3">
        <AnimatedPillToggle
          options={RANGE_OPTIONS}
          selected={range}
          onSelect={setRange}
        />
      </View>

      {cycleLengths.length > 0 ? (
        <>
          <View
            className="p-4 rounded-[14px] mb-3"
            style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
          >
            <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>Cycle Length</Text>
            <BarChart data={cycleLengths} averageLine={avgCycleLength} unit="d" />
          </View>

          <View
            className="p-4 rounded-[14px] mb-3"
            style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
          >
            <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>Period Length</Text>
            <LineChart data={periodLengths} unit="d" />
          </View>
        </>
      ) : (
        <View
          className="p-5 rounded-[14px] mb-3"
          style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
        >
          <Text className="text-base font-semibold mb-1" style={{ color: colors.text }}>Trend Graphs</Text>
          <Text className="text-sm" style={{ color: colors.textMuted }}>
            Complete at least one full cycle to see trend graphs.
          </Text>
        </View>
      )}
    </>
  );
}
