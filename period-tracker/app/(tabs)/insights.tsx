import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCycleStore, useUserStore, useSettingsStore } from '@/src/stores';
import { CONDITIONS_BY_ID } from '@/src/constants/conditions';
import { usePrediction, useCyclePhase, useScrollToTopOnFocus, useFocusKey, useSymptomPatterns } from '@/src/hooks';
import { standardDeviation } from '@/src/engine/prediction-engine';
import { MIN_CYCLE_LENGTH } from '@/src/constants/phases';
import { PhaseCard } from '@/src/components/common/PhaseCard';
import { PredictionCard } from '@/src/components/common/PredictionCard';
import { AnimatedPillToggle, usePillSwipe } from '@/src/components/common/AnimatedPillToggle';
import { AnimatedViewSwitcher } from '@/src/components/common/AnimatedViewSwitcher';
import { YearInPixels } from '@/src/components/calendar/YearInPixels';
import { SymptomPatternsSection } from '@/src/components/insights/SymptomPatternsSection';
import { TrendGraphsSection } from '@/src/components/insights/TrendGraphsSection';
import { ExtendedAnalyticsSection } from '@/src/components/insights/ExtendedAnalyticsSection';
import { ScreenWithFlowers } from '@/src/components/decorations/ScreenWithFlowers';
import { CornerFlowers } from '@/src/components/decorations/CornerFlowers';
import { useBarInsets } from '@/src/hooks/useBarInsets';

import { useTheme } from '@/src/theme';

type ViewMode = 'overview' | 'trends' | 'yearly';

const VIEW_OPTIONS = [
  { value: 'overview' as const, label: 'Overview' },
  { value: 'trends' as const, label: 'Trends' },
  { value: 'yearly' as const, label: 'Year in Pixels' },
];

export default function InsightsScreen() {
  const { colors } = useTheme();
  const barInsets = useBarInsets();
  const cycles = useCycleStore((s) => s.cycles);
  const profile = useUserStore((s) => s.profile);
  const prediction = usePrediction();
  const phase = useCyclePhase();
  const symptomsConsent = useSettingsStore((s) => s.settings.dataCategories.symptoms);
  const patterns = useSymptomPatterns();
  const scrollRef = useScrollToTopOnFocus();
  const focusKey = useFocusKey();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const swipeHandlers = usePillSwipe(VIEW_OPTIONS, viewMode, setViewMode);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const stats = useMemo(() => {
    const completedCycles = cycles.filter((c) => c.cycleLength != null && c.cycleLength >= MIN_CYCLE_LENGTH);
    const lengths = completedCycles.map((c) => c.cycleLength!);
    if (lengths.length === 0) return null;
    const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
    const shortest = Math.min(...lengths);
    const longest = Math.max(...lengths);
    const stddev = standardDeviation(lengths);
    return { avg, shortest, longest, stddev, count: lengths.length };
  }, [cycles]);

  const handlePrevYear = useCallback(() => {
    setCurrentYear((y) => y - 1);
  }, []);

  const handleNextYear = useCallback(() => {
    setCurrentYear((y) => y + 1);
  }, []);

  return (
    <ScreenWithFlowers backgroundColor={colors.background}>
    <View className="flex-1" style={{ paddingTop: barInsets.top + 16 }} {...swipeHandlers}>
      <CornerFlowers />
      {/* Pill toggle */}
      <View className="px-4 mb-4">
        <AnimatedPillToggle
          options={VIEW_OPTIONS}
          selected={viewMode}
          onSelect={setViewMode}
        />
      </View>

      <AnimatedViewSwitcher transitionKey={viewMode}>
        {viewMode === 'overview' ? (
          <ScrollView ref={scrollRef} className="flex-1" contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: barInsets.bottom + 32 }}>
            {/* Phase card */}
            <Animated.View key={`phase-${focusKey}`} entering={FadeInDown.duration(400).delay(50)}>
              <PhaseCard phase={phase} />
            </Animated.View>

            {/* Next period prediction */}
            <Animated.View key={`prediction-${focusKey}`} entering={FadeInDown.duration(400).delay(150)}>
              <PredictionCard prediction={prediction} />
            </Animated.View>

            {/* Cycle statistics */}
            <Animated.View key={`stats-${focusKey}`} entering={FadeInDown.duration(400).delay(250)}>
              {stats ? (
                <View className="p-5 rounded-[14px] mb-3" style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
                  <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>Cycle Statistics</Text>
                  <View className="flex-row flex-wrap gap-4">
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
                <View className="p-5 rounded-[14px] mb-3" style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
                  <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>Cycle Statistics</Text>
                  <Text className="text-sm" style={{ color: colors.textMuted }}>
                    Complete at least one full cycle to see statistics here.
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Symptom Patterns (Premium Plus) — hidden if symptom consent withdrawn */}
            {symptomsConsent && (
            <Animated.View key={`patterns-${focusKey}`} entering={FadeInDown.duration(400).delay(300)}>
              <SymptomPatternsSection patterns={patterns} />
            </Animated.View>
            )}

            {/* Health condition insights */}
            {profile.healthConditions.length > 0 && (
              <Animated.View key={`conditions-${focusKey}`} entering={FadeInDown.duration(400).delay(350)}>
                <View className="p-5 rounded-[14px] mb-3" style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
                  <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>Your Conditions</Text>
                  {profile.healthConditions.map((condId) => {
                    const condition = CONDITIONS_BY_ID[condId];
                    if (!condition) return null;
                    return (
                      <View key={condId} className="mb-3 pb-3 border-b" style={{ borderBottomColor: colors.borderLight }}>
                        <Text className="text-[15px] font-semibold mb-1" style={{ color: colors.text }}>{condition.label}</Text>
                        <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>{condition.insight}</Text>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            )}

            {/* Prediction confidence */}
            {prediction && (
              <Animated.View key={`quality-${focusKey}`} entering={FadeInDown.duration(400).delay(350)}>
                <View className="p-5 rounded-[14px] mb-3" style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
                  <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>Prediction Quality</Text>
                  <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
                    {prediction.confidence === 'learning'
                      ? 'We\'re still learning your pattern. Log more periods for better predictions.'
                      : prediction.confidence === 'low'
                      ? 'Predictions are approximate. Your cycles show some variation.'
                      : prediction.confidence === 'medium'
                      ? 'Predictions are getting more accurate as we learn your pattern.'
                      : 'Your cycles are very consistent. Predictions should be accurate.'}
                  </Text>
                  {prediction.isIrregular && (
                    <Text className="text-[13px] italic mt-2" style={{ color: colors.textTertiary }}>
                      Your cycles show significant variation ({'\u00B1'}{prediction.windowDays} days). This is
                      common and doesn't necessarily indicate a problem.
                    </Text>
                  )}
                </View>
              </Animated.View>
            )}
          </ScrollView>
        ) : viewMode === 'trends' ? (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: barInsets.bottom + 32 }}>
            <TrendGraphsSection />
            <ExtendedAnalyticsSection />
          </ScrollView>
        ) : (
          <View className="flex-1 px-4">
            {/* Year navigation */}
            <View className="flex-row justify-between items-center mb-3">
              <TouchableOpacity onPress={handlePrevYear} className="p-3 min-w-[44px] min-h-[44px] justify-center items-center" accessibilityLabel="Previous year" accessibilityRole="button">
                <Text className="text-[28px] font-light leading-8" style={{ color: colors.primary }}>{'\u2039'}</Text>
              </TouchableOpacity>
              <Text className="text-lg font-bold tracking-tight" style={{ color: colors.text }}>{currentYear}</Text>
              <TouchableOpacity onPress={handleNextYear} className="p-3 min-w-[44px] min-h-[44px] justify-center items-center" accessibilityLabel="Next year" accessibilityRole="button">
                <Text className="text-[28px] font-light leading-8" style={{ color: colors.primary }}>{'\u203A'}</Text>
              </TouchableOpacity>
            </View>

            <YearInPixels year={currentYear} onSelectMonth={(month) => {
              setCurrentYear(month.getFullYear());
              setViewMode('trends');
            }} />
          </View>
        )}
      </AnimatedViewSwitcher>
    </View>
    </ScreenWithFlowers>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ minWidth: '40%' }}>
      <Text className="text-xl font-bold" style={{ color: colors.primary }}>{value}</Text>
      <Text className="text-[13px] mt-0.5" style={{ color: colors.textTertiary }}>{label}</Text>
    </View>
  );
}
