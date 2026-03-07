import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { format, addMonths, subMonths } from 'date-fns';
import { todayString } from '@/src/utils/dates';
import { useFocusKey } from '@/src/hooks';
import { TeenagerGate } from '@/src/components/common/TeenagerGate';
import { AnimatedPillToggle, usePillSwipe } from '@/src/components/common/AnimatedPillToggle';
import { AnimatedViewSwitcher } from '@/src/components/common/AnimatedViewSwitcher';
import { IntercourseCalendarGrid } from '@/src/components/log/IntercourseCalendarGrid';
import { IntercourseYearInPixels } from '@/src/components/log/IntercourseYearInPixels';
import { IntercourseDetailSheet } from '@/src/components/log/IntercourseDetailSheet';
import { IntercourseAddSheet } from '@/src/components/log/IntercourseAddSheet';
import { ScreenWithFlowers } from '@/src/components/decorations/ScreenWithFlowers';
import { FlowerBackground } from '@/src/components/decorations/FlowerBackground';
import { useBarInsets } from '@/src/hooks/useBarInsets';
import { useTheme } from '@/src/theme';

type ViewMode = 'monthly' | 'yearly';

const VIEW_OPTIONS = [
  { value: 'monthly' as const, label: 'Monthly' },
  { value: 'yearly' as const, label: 'Yearly' },
];

export default function LogScreen() {
  const { colors } = useTheme();
  const barInsets = useBarInsets();
  const focusKey = useFocusKey();
  const today = todayString();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const swipeHandlers = usePillSwipe(VIEW_OPTIONS, viewMode, setViewMode);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailDate, setDetailDate] = useState(today);

  const [addVisible, setAddVisible] = useState(false);
  const [addDate, setAddDate] = useState(today);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((m) => subMonths(m, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((m) => addMonths(m, 1));
  }, []);

  const handlePrevYear = useCallback(() => {
    setCurrentYear((y) => y - 1);
  }, []);

  const handleNextYear = useCallback(() => {
    setCurrentYear((y) => y + 1);
  }, []);

  const handleSelectDay = useCallback((date: string) => {
    setDetailDate(date);
    setDetailVisible(true);
  }, []);

  const handleAddFromDetail = useCallback(() => {
    setAddDate(detailDate);
    setDetailVisible(false);
    setAddVisible(true);
  }, [detailDate]);

  const handleAddForToday = useCallback(() => {
    setAddDate(today);
    setAddVisible(true);
  }, [today]);

  const handleSelectMonth = useCallback((month: Date) => {
    setCurrentMonth(month);
    setViewMode('monthly');
  }, []);

  return (
    <ScreenWithFlowers backgroundColor={colors.background}>
    <TeenagerGate
      fallback={
        <View
          className="flex-1 px-4"
          style={{ paddingTop: barInsets.top + 16, paddingBottom: barInsets.bottom + 16 }}
        >
          <FlowerBackground />
          <View className="flex-1 justify-center items-center p-8">
            <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
            <Text className="mt-4 text-xl font-semibold mb-2" style={{ color: colors.text }}>Not available</Text>
            <Text className="text-[15px] text-center" style={{ color: colors.textTertiary }}>This section is not available in teenager mode.</Text>
          </View>
        </View>
      }
    >
      <View
        className="flex-1 px-4"
        style={{ paddingTop: barInsets.top + 16, paddingBottom: barInsets.bottom + 16 }}
        {...swipeHandlers}
      >
        <FlowerBackground />

        <Animated.View key={`content-${focusKey}`} entering={FadeInDown.duration(400).delay(50)} className="flex-1">
        <View className="mb-5">
          <AnimatedPillToggle
            options={VIEW_OPTIONS}
            selected={viewMode}
            onSelect={setViewMode}
          />
        </View>

        {viewMode === 'monthly' ? (
          <View className="flex-row justify-between items-center mb-3">
            <TouchableOpacity onPress={handlePrevMonth} className="p-3 min-w-[44px] min-h-[44px] justify-center items-center">
              <Text className="text-[28px] font-light leading-8" style={{ color: colors.primary }}>{'\u2039'}</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold tracking-tight" style={{ color: colors.text }}>{format(currentMonth, 'MMMM yyyy')}</Text>
            <TouchableOpacity onPress={handleNextMonth} className="p-3 min-w-[44px] min-h-[44px] justify-center items-center">
              <Text className="text-[28px] font-light leading-8" style={{ color: colors.primary }}>{'\u203A'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row justify-between items-center mb-3">
            <TouchableOpacity onPress={handlePrevYear} className="p-3 min-w-[44px] min-h-[44px] justify-center items-center">
              <Text className="text-[28px] font-light leading-8" style={{ color: colors.primary }}>{'\u2039'}</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold tracking-tight" style={{ color: colors.text }}>{currentYear}</Text>
            <TouchableOpacity onPress={handleNextYear} className="p-3 min-w-[44px] min-h-[44px] justify-center items-center">
              <Text className="text-[28px] font-light leading-8" style={{ color: colors.primary }}>{'\u203A'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <AnimatedViewSwitcher transitionKey={viewMode}>
          {viewMode === 'monthly' ? (
            <View style={{ paddingBottom: 80 }}>
              <IntercourseCalendarGrid month={currentMonth} onSelectDay={handleSelectDay} />
            </View>
          ) : (
            <View style={{ paddingBottom: 80 }}>
              <IntercourseYearInPixels year={currentYear} onSelectMonth={handleSelectMonth} />
            </View>
          )}
        </AnimatedViewSwitcher>
        </Animated.View>

        {/* Floating heart button to add entry for today */}
        <TouchableOpacity
          className="absolute w-14 h-14 rounded-full items-center justify-center"
          style={{
            right: 16,
            bottom: barInsets.bottom + 24,
            backgroundColor: colors.primary,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleAddForToday(); }}
          activeOpacity={0.8}
          accessibilityLabel="Add intimacy entry for today"
          accessibilityRole="button"
        >
          <Ionicons name="heart" size={26} color={colors.onPrimary} />
        </TouchableOpacity>

        <IntercourseDetailSheet
          visible={detailVisible}
          date={detailDate}
          onClose={() => setDetailVisible(false)}
          onAdd={handleAddFromDetail}
        />

        <IntercourseAddSheet
          visible={addVisible}
          date={addDate}
          onClose={() => setAddVisible(false)}
        />
      </View>
    </TeenagerGate>
    </ScreenWithFlowers>
  );
}
