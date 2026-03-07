import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { format, addMonths, subMonths, isSameMonth } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { CalendarGrid } from '@/src/components/calendar/CalendarGrid';
import { YearInPixels } from '@/src/components/calendar/YearInPixels';
import { DaySummarySheet } from '@/src/components/calendar/DaySummarySheet';
import { AnimatedPillToggle } from '@/src/components/common/AnimatedPillToggle';
import { AnimatedViewSwitcher } from '@/src/components/common/AnimatedViewSwitcher';
import { ScreenWithFlowers } from '@/src/components/decorations/ScreenWithFlowers';
import { FlowerBackground } from '@/src/components/decorations/FlowerBackground';
import { useBarInsets } from '@/src/hooks/useBarInsets';
import { useMultiplePredictions } from '@/src/hooks/useMultiplePredictions';
import { useSettingsStore, useUserStore } from '@/src/stores';
import { useTheme } from '@/src/theme';

type ViewMode = 'monthly' | 'yearly';

export default function CalendarScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const fertilityEnabled = useSettingsStore((s) => s.settings.fertilityTrackingEnabled);
  const predictionCount = useSettingsStore((s) => s.settings.predictionCount);
  const showPredictedPhases = useSettingsStore((s) => s.settings.showPredictedPhases);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const isTeenager = useUserStore((s) => s.profile.isTeenager);
  const showFertility = fertilityEnabled && !isTeenager;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const predictedPeriods = useMultiplePredictions(viewMode === 'monthly' ? predictionCount : 0);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetDate, setSheetDate] = useState('');

  const barInsets = useBarInsets();

  const handlePrevMonth = useCallback(() => { setCurrentMonth((m) => subMonths(m, 1)); }, []);
  const handleNextMonth = useCallback(() => { setCurrentMonth((m) => addMonths(m, 1)); }, []);
  const handlePrevYear = useCallback(() => { setCurrentYear((y) => y - 1); }, []);
  const handleNextYear = useCallback(() => { setCurrentYear((y) => y + 1); }, []);

  const handleJumpToToday = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);

  const isCurrentMonth = viewMode === 'monthly' && isSameMonth(currentMonth, new Date());
  const isCurrentYear = viewMode === 'yearly' && currentYear === new Date().getFullYear();

  const handleSelectDay = useCallback((date: string) => {
    setSelectedDate(date);
    setSheetDate(date);
    setSheetVisible(true);
  }, []);

  const handleSheetClose = useCallback(() => { setSheetVisible(false); }, []);
  const handleSheetEdit = useCallback(() => {
    setSheetVisible(false);
    router.push(`/day/${sheetDate}`);
  }, [router, sheetDate]);

  const handleSelectMonth = useCallback((month: Date) => {
    setCurrentMonth(month);
    setViewMode('monthly');
  }, []);

  return (
    <ScreenWithFlowers backgroundColor={colors.background}>
    <View className="flex-1 px-4" style={{ paddingTop: barInsets.top + 16, paddingBottom: barInsets.bottom + 16 }}>
      <FlowerBackground />
      {/* View mode pill toggle */}
      <View className="mb-5">
        <AnimatedPillToggle
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
          ]}
          selected={viewMode}
          onSelect={setViewMode}
        />
      </View>

      {/* Navigation */}
      <View className="flex-row justify-between items-center mb-3">
        <TouchableOpacity
          onPress={viewMode === 'monthly' ? handlePrevMonth : handlePrevYear}
          className="p-3 min-w-[44px] min-h-[44px] justify-center items-center"
          accessibilityLabel={viewMode === 'monthly' ? 'Previous month' : 'Previous year'}
          accessibilityRole="button"
        >
          <Text className="text-[28px] font-light leading-8" style={{ color: colors.primary }}>{'\u2039'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isCurrentMonth || isCurrentYear ? undefined : viewMode === 'monthly' ? handleJumpToToday : () => setCurrentYear(new Date().getFullYear())}
          disabled={isCurrentMonth || isCurrentYear}
          activeOpacity={0.6}
        >
          <Text className="text-lg font-bold tracking-tight" style={{ color: colors.text }}>
            {viewMode === 'monthly' ? format(currentMonth, 'MMMM yyyy') : currentYear}
          </Text>
          {!isCurrentMonth && !isCurrentYear && (
            <Text className="text-[11px] text-center" style={{ color: colors.primary }}>Tap for today</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={viewMode === 'monthly' ? handleNextMonth : handleNextYear}
          className="p-3 min-w-[44px] min-h-[44px] justify-center items-center"
          accessibilityLabel={viewMode === 'monthly' ? 'Next month' : 'Next year'}
          accessibilityRole="button"
        >
          <Text className="text-[28px] font-light leading-8" style={{ color: colors.primary }}>{'\u203A'}</Text>
        </TouchableOpacity>
      </View>

      {/* Legend — use same alpha as calendar cells so dots match cell backgrounds */}
      <View className="flex-row flex-wrap gap-3.5 mb-3.5 justify-center">
        <LegendItem color={`${colors.phases.menstruation.color}${isDark ? '99' : '55'}`} label="Period" />
        <LegendItem color={`${colors.phases.follicular.color}${isDark ? '99' : '55'}`} label="Follicular" />
        <LegendItem color={`${colors.phases.ovulation.color}${isDark ? '99' : '55'}`} label="Ovulation" />
        <LegendItem color={`${colors.phases.luteal.color}${isDark ? '99' : '55'}`} label="Luteal" />
        <LegendItem color={`${colors.phases.premenstrual.color}${isDark ? '99' : '55'}`} label="PMS" />
        {viewMode === 'monthly' && predictionCount > 0 && (
          <PredictedLegendItem color={colors.phases.menstruation.color} />
        )}
        {showFertility && (
          <>
            <LegendItem color={colors.success} label="Peak fertility" />
            <LegendItem color={colors.successLight} label="Fertile" />
          </>
        )}
      </View>

      {/* Prediction controls (monthly only) */}
      {viewMode === 'monthly' && (
        <>
          <View className="flex-row items-center justify-between mb-2 px-1">
            <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>Predicted periods</Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                className="w-11 h-11 rounded-full justify-center items-center"
                style={[{ backgroundColor: colors.surfaceTertiary }, predictionCount <= 0 ? { opacity: 0.35 } : undefined]}
                onPress={() => {
                  Haptics.selectionAsync();
                  updateSettings({ predictionCount: Math.max(0, predictionCount - 1) });
                }}
                disabled={predictionCount <= 0}
                activeOpacity={0.6}
                accessibilityLabel="Decrease prediction count"
                accessibilityRole="button"
              >
                <Text className="text-lg font-semibold leading-5" style={{ color: predictionCount <= 0 ? colors.textDisabled : colors.primary }}>−</Text>
              </TouchableOpacity>
              <Text className="text-[15px] font-semibold min-w-[16px] text-center" style={{ color: colors.text }}>{predictionCount}</Text>
              <TouchableOpacity
                className="w-11 h-11 rounded-full justify-center items-center"
                style={[{ backgroundColor: colors.surfaceTertiary }, predictionCount >= 5 ? { opacity: 0.35 } : undefined]}
                onPress={() => {
                  Haptics.selectionAsync();
                  updateSettings({ predictionCount: Math.min(5, predictionCount + 1) });
                }}
                disabled={predictionCount >= 5}
                activeOpacity={0.6}
                accessibilityLabel="Increase prediction count"
                accessibilityRole="button"
              >
                <Text className="text-lg font-semibold leading-5" style={{ color: predictionCount >= 5 ? colors.textDisabled : colors.primary }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          {predictionCount > 0 && (
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>Show predicted phases</Text>
              <Switch
                value={showPredictedPhases}
                onValueChange={(val) => updateSettings({ showPredictedPhases: val })}
                trackColor={{ false: colors.surfaceTertiary, true: colors.primary + '66' }}
                thumbColor={showPredictedPhases ? colors.primary : colors.textMuted}
                style={Platform.OS === 'android' ? { transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] } : undefined}
              />
            </View>
          )}
        </>
      )}

      {/* Content */}
      <AnimatedViewSwitcher transitionKey={viewMode}>
        {viewMode === 'monthly' ? (
          <CalendarGrid
            month={currentMonth}
            onSelectDay={handleSelectDay}
            selectedDate={selectedDate}
            predictedPeriods={predictedPeriods}
            showPredictedPhases={showPredictedPhases && predictionCount > 0}
          />
        ) : (
          <YearInPixels year={currentYear} onSelectMonth={handleSelectMonth} />
        )}
      </AnimatedViewSwitcher>

      <DaySummarySheet
        visible={sheetVisible}
        date={sheetDate}
        onClose={handleSheetClose}
        onEdit={handleSheetEdit}
        predictedPeriods={predictedPeriods}
        showPredictedPhases={showPredictedPhases && predictionCount > 0}
      />
    </View>
    </ScreenWithFlowers>
  );
}

function PredictedLegendItem({ color }: { color: string }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-[5px]">
      <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'transparent', borderWidth: 1.5, borderColor: color }} />
      <Text className="text-[11px] font-medium" style={{ color: colors.textTertiary }}>Predicted</Text>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-[5px]">
      <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-[11px] font-medium" style={{ color: colors.textTertiary }}>{label}</Text>
    </View>
  );
}
