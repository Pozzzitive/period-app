import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { ScrollView, FlatList, TouchableOpacity, Text, View, Alert, Modal, Platform, Switch, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { InlineDatePicker } from '@/src/components/common/InlineDatePicker';
import { format, addMonths, addDays, differenceInDays, parseISO, subDays, isSameMonth } from 'date-fns';
import * as Haptics from 'expo-haptics';

import { useMissingPeriod, useCyclePhase, useScrollToTopOnFocus, useFocusKey } from '@/src/hooks';
import { useMultiplePredictions } from '@/src/hooks/useMultiplePredictions';
import { MissingPeriodPrompt } from '@/src/components/common/MissingPeriodPrompt';
import { CycleRing } from '@/src/components/home/CycleRing';
import { CalendarGrid } from '@/src/components/calendar/CalendarGrid';
import { DaySummarySheet } from '@/src/components/calendar/DaySummarySheet';
import { ScreenWithFlowers } from '@/src/components/decorations/ScreenWithFlowers';
import { FlowerBackground } from '@/src/components/decorations/FlowerBackground';
import { useBarInsets } from '@/src/hooks/useBarInsets';
import { useCycleStore, useUserStore, useSettingsStore } from '@/src/stores';
import { todayString, formatDate } from '@/src/utils/dates';
import { useTheme } from '@/src/theme';

export default function TodayScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { shouldShow: showMissing } = useMissingPeriod();
  const phase = useCyclePhase();
  const [dismissedMissing, setDismissedMissing] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodDate, setPeriodDate] = useState(() => new Date());
  const [showHistory, setShowHistory] = useState(false);
  const periods = useCycleStore((s) => s.periods);
  const addPeriod = useCycleStore((s) => s.addPeriod);
  const endPeriod = useCycleStore((s) => s.endPeriod);
  const deletePeriod = useCycleStore((s) => s.deletePeriod);
  const profile = useUserStore((s) => s.profile);
  const fertilityEnabled = useSettingsStore((s) => s.settings.fertilityTrackingEnabled);
  const predictionCount = useSettingsStore((s) => s.settings.predictionCount);
  const showPredictedPhases = useSettingsStore((s) => s.settings.showPredictedPhases);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const scrollRef = useScrollToTopOnFocus();
  const focusKey = useFocusKey();
  const showFertility = fertilityEnabled && !profile.isTeenager;
  const typicalPeriodLength = profile.typicalPeriodLength;
  const typicalCycleLength = profile.typicalCycleLength;

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const predictedPeriods = useMultiplePredictions(predictionCount);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetDate, setSheetDate] = useState('');

  // Recalculate today when tab refocuses (handles midnight rollover)
  const [today, setToday] = useState(todayString);
  useEffect(() => { setToday(todayString()); }, [focusKey]);
  const barInsets = useBarInsets();

  // Check if there's an ongoing period (no end date)
  const ongoingPeriod = periods.find((p) => !p.endDate);

  const handleOpenPeriodModal = useCallback(() => {
    setPeriodDate(new Date());
    setShowPeriodModal(true);
  }, []);

  const handleEndPeriod = useCallback(() => {
    if (!ongoingPeriod) return;
    if (today < ongoingPeriod.startDate) return;

    const daysSoFar = differenceInDays(parseISO(today), parseISO(ongoingPeriod.startDate)) + 1;

    if (daysSoFar < typicalPeriodLength) {
      Alert.alert(
        'End period early?',
        `Your period has been ${daysSoFar} ${daysSoFar === 1 ? 'day' : 'days'} so far, but your typical length is ${typicalPeriodLength} days. Are you sure it ended?`,
        [
          { text: 'Not yet', style: 'cancel' },
          {
            text: 'Yes, it ended',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              endPeriod(ongoingPeriod.id, today);
            },
          },
        ]
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      endPeriod(ongoingPeriod.id, today);
    }
  }, [ongoingPeriod, today, endPeriod, typicalPeriodLength]);

  const handleConfirmPeriod = useCallback(() => {
    const dateStr = format(periodDate, 'yyyy-MM-dd');

    const overlapping = periods.find((p) => {
      const start = parseISO(p.startDate);
      const end = p.endDate
        ? parseISO(p.endDate)
        : addDays(start, typicalPeriodLength - 1);
      return periodDate >= start && periodDate <= end;
    });

    if (overlapping) {
      Alert.alert(
        'Date overlap',
        `This date falls within an existing period (${formatDate(overlapping.startDate, 'MMM d')}${overlapping.endDate ? ` - ${formatDate(overlapping.endDate, 'MMM d')}` : ''}). Please choose a different date.`
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addPeriod(dateStr);
    setShowPeriodModal(false);
  }, [periodDate, periods, addPeriod, typicalPeriodLength]);

  const handleDeletePeriod = useCallback((period: typeof periods[0]) => {
    const label = period.endDate
      ? `${formatDate(period.startDate, 'MMM d')} - ${formatDate(period.endDate, 'MMM d')}`
      : `Started ${formatDate(period.startDate, 'MMM d')} (ongoing)`;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete period?',
      `Remove "${label}" from your history? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePeriod(period.id),
        },
      ]
    );
  }, [deletePeriod]);

  // Calendar carousel — native FlatList paging (no JS/UI thread sync issues)
  const { width: screenWidth } = useWindowDimensions();
  const calendarWidth = screenWidth - 32;
  const MONTH_BUFFER = 24;

  const [baseMonth] = useState(() => new Date());
  const monthsData = useMemo(() =>
    Array.from({ length: MONTH_BUFFER * 2 + 1 }, (_, i) =>
      addMonths(baseMonth, i - MONTH_BUFFER)
    ), [baseMonth]);

  const INITIAL_INDEX = MONTH_BUFFER;
  const flatListRef = useRef<FlatList>(null);
  const currentIndexRef = useRef(INITIAL_INDEX);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: calendarWidth,
    offset: calendarWidth * index,
    index,
  }), [calendarWidth]);

  const onCalendarScrollEnd = useCallback((e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / calendarWidth);
    if (page >= 0 && page < monthsData.length && page !== currentIndexRef.current) {
      currentIndexRef.current = page;
      setCurrentMonth(monthsData[page]);
    }
  }, [calendarWidth, monthsData]);

  const handlePrevMonth = useCallback(() => {
    const newIndex = Math.max(0, currentIndexRef.current - 1);
    flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    currentIndexRef.current = newIndex;
    setCurrentMonth(monthsData[newIndex]);
  }, [monthsData]);

  const handleNextMonth = useCallback(() => {
    const newIndex = Math.min(monthsData.length - 1, currentIndexRef.current + 1);
    flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    currentIndexRef.current = newIndex;
    setCurrentMonth(monthsData[newIndex]);
  }, [monthsData]);

  const handleJumpToToday = useCallback(() => {
    flatListRef.current?.scrollToIndex({ index: INITIAL_INDEX, animated: true });
    currentIndexRef.current = INITIAL_INDEX;
    setCurrentMonth(monthsData[INITIAL_INDEX]);
  }, [monthsData]);

  const isCurrentMonth = isSameMonth(currentMonth, new Date());

  const handleSelectDay = useCallback((date: string) => {
    setSelectedDate(date);
    setSheetDate(date);
    setSheetVisible(true);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const handleSheetEdit = useCallback(() => {
    setSheetVisible(false);
    router.push(`/day/${sheetDate}`);
  }, [router, sheetDate]);

  return (
    <ScreenWithFlowers backgroundColor={colors.background}>
    <ScrollView ref={scrollRef} className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: barInsets.top + 12, paddingBottom: barInsets.bottom + 32 }}>
      <FlowerBackground />
      {/* Missing period prompt */}
      {showMissing && !dismissedMissing && (
        <MissingPeriodPrompt onDismiss={() => setDismissedMissing(true)} />
      )}

      {/* Cycle ring */}
      <Animated.View key={`ring-${focusKey}`} entering={FadeInDown.duration(400).delay(50)}>
      <CycleRing
        phase={phase}
        cycleLength={typicalCycleLength}
        periodLength={typicalPeriodLength}
        onLogPeriod={handleOpenPeriodModal}
        onLogToday={() => router.push(`/day/${today}`)}
        isOngoingPeriod={!!ongoingPeriod}
        onEndPeriod={handleEndPeriod}
        periodCount={periods.length}
        onHistory={() => setShowHistory(true)}
      />
      </Animated.View>

      {/* Month navigation */}
      <Animated.View key={`cal-${focusKey}`} entering={FadeInDown.duration(400).delay(150)}>
      <View className="flex-row justify-between items-center mb-3">
        <TouchableOpacity
          onPress={handlePrevMonth}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.primaryMuted + '8F' }}
          accessibilityLabel="Previous month"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={isCurrentMonth ? undefined : handleJumpToToday} disabled={isCurrentMonth} activeOpacity={0.6}>
          <Text className="text-lg font-bold tracking-tight" style={{ color: colors.text }}>{format(currentMonth, 'MMMM yyyy')}</Text>
          {!isCurrentMonth && (
            <Text className="text-[11px] text-center" style={{ color: colors.primary }}>Tap to jump to today</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNextMonth}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.primaryMuted + '8F' }}
          accessibilityLabel="Next month"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Prediction controls */}
      <View className="flex-row items-center justify-between mb-0.5 px-1">
        <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>Predicted periods</Text>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className={`w-11 h-11 rounded-full justify-center items-center ${predictionCount <= 0 ? 'opacity-35' : ''}`}
            style={{ backgroundColor: colors.surfaceTertiary }}
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
            className={`w-11 h-11 rounded-full justify-center items-center ${predictionCount >= 5 ? 'opacity-35' : ''}`}
            style={{ backgroundColor: colors.surfaceTertiary }}
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
        <View className="flex-row items-center justify-between mb-1 px-1">
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

      {/* Legend */}
      <View className="flex-row flex-wrap gap-3.5 mb-3.5 mt-2 justify-center">
        <LegendItem color={`${colors.phases.menstruation.color}${isDark ? '99' : '55'}`} label="Period" />
        <LegendItem color={`${colors.phases.follicular.color}${isDark ? '99' : '55'}`} label="Follicular" />
        <LegendItem color={`${colors.phases.ovulation.color}${isDark ? '99' : '55'}`} label="Ovulation" />
        <LegendItem color={`${colors.phases.luteal.color}${isDark ? '99' : '55'}`} label="Luteal" />
        <LegendItem color={`${colors.phases.premenstrual.color}${isDark ? '99' : '55'}`} label="PMS" />
        {predictionCount > 0 && (
          <PredictedLegendItem color={colors.phases.menstruation.color} />
        )}
        {showFertility && (
          <>
            <LegendItem color={colors.success} label="Peak fertility" />
            <LegendItem color={colors.successLight} label="Fertile" />
          </>
        )}
      </View>

      {/* Calendar grid — carousel */}
      <FlatList
        ref={flatListRef}
        data={monthsData}
        renderItem={({ item }) => (
          <View style={{ width: calendarWidth }}>
            <CalendarGrid
              month={item}
              onSelectDay={handleSelectDay}
              selectedDate={selectedDate}
              predictedPeriods={predictedPeriods}
              showPredictedPhases={showPredictedPhases && predictionCount > 0}
            />
          </View>
        )}
        keyExtractor={(item) => format(item, 'yyyy-MM')}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        initialScrollIndex={INITIAL_INDEX}
        onMomentumScrollEnd={onCalendarScrollEnd}
        windowSize={5}
        initialNumToRender={3}
        maxToRenderPerBatch={2}
        removeClippedSubviews={Platform.OS === 'android'}
        style={{ width: calendarWidth }}
      />

      </Animated.View>

      {/* Today's date */}
      <Text className="text-center text-sm mt-2" style={{ color: colors.textMuted }}>{formatDate(today, 'EEEE, MMMM d, yyyy')}</Text>

      {/* Period history bottom sheet */}
      <Modal
        visible={showHistory}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHistory(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: colors.backdrop }}>
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowHistory(false)}
            accessibilityLabel="Close history"
          />
          <View className="rounded-t-[20px] p-6 pb-10" style={{ backgroundColor: colors.sheetBackground, maxHeight: '70%' }}>
            <View className="w-9 h-1 rounded-sm self-center mb-4" style={{ backgroundColor: colors.surfaceTertiary }} />
            <Text className="text-xl font-bold text-center mb-4" style={{ color: colors.text }}>Period History</Text>
            <ScrollView className="mb-4" bounces={false} style={{ flexShrink: 1 }}>
              {periods.length === 0 ? (
                <View className="py-10 items-center gap-2">
                  <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
                  <Text className="text-base" style={{ color: colors.textMuted }}>No period history yet</Text>
                  <Text className="text-[13px] text-center" style={{ color: colors.textTertiary }}>
                    Tap "Log period" to add your first entry
                  </Text>
                </View>
              ) : (
                [...periods].reverse().map((period) => {
                  const isOngoing = !period.endDate;
                  const duration = period.endDate
                    ? differenceInDays(parseISO(period.endDate), parseISO(period.startDate)) + 1
                    : null;

                  return (
                    <View key={period.id} className="flex-row items-center justify-between py-2.5 border-t" style={{ borderTopColor: colors.borderLight }}>
                      <View className="flex-1">
                        <Text className="text-sm font-medium" style={{ color: colors.text }}>
                          {formatDate(period.startDate, 'MMM d, yyyy')}
                          {period.endDate
                            ? ` - ${formatDate(period.endDate, 'MMM d, yyyy')}`
                            : ''}
                        </Text>
                        <Text className="text-[12px] mt-0.5" style={{ color: colors.textTertiary }}>
                          {isOngoing ? 'Ongoing' : `${duration} ${duration === 1 ? 'day' : 'days'}`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        className="py-1.5 px-3"
                        onPress={() => handleDeletePeriod(period)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={`Delete period starting ${formatDate(period.startDate, 'MMM d')}`}
                        accessibilityRole="button"
                      >
                        <Text className="text-[13px] font-medium" style={{ color: colors.destructive }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
            <TouchableOpacity
              className="py-3.5 rounded-xl items-center"
              style={{ backgroundColor: colors.surfaceSecondary }}
              onPress={() => setShowHistory(false)}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Text className="text-base font-semibold" style={{ color: colors.text }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Log period date picker modal */}
      <Modal
        visible={showPeriodModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPeriodModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: colors.backdrop }}>
          <View className="rounded-t-[20px] p-6 pb-10" style={{ backgroundColor: colors.sheetBackground }}>
            <Text className="text-xl font-bold text-center" style={{ color: colors.text }}>Log period</Text>
            <Text className="text-sm text-center mt-1 mb-4" style={{ color: colors.textSecondary }}>
              Select the date your period started
            </Text>
            <View className="items-center mb-4" style={{ width: '100%' }}>
              <InlineDatePicker
                value={periodDate}
                onChange={setPeriodDate}
                maximumDate={new Date()}
                minimumDate={subDays(new Date(), 90)}
              />
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3.5 rounded-xl items-center"
                style={{ backgroundColor: colors.surfaceSecondary }}
                onPress={() => setShowPeriodModal(false)}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
              >
                <Text className="text-base font-semibold" style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3.5 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
                onPress={handleConfirmPeriod}
                accessibilityLabel="Confirm period"
                accessibilityRole="button"
              >
                <Text className="text-base font-semibold" style={{ color: colors.onPrimary }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Day summary bottom sheet */}
      <DaySummarySheet
        visible={sheetVisible}
        date={sheetDate}
        onClose={handleSheetClose}
        onEdit={handleSheetEdit}
        predictedPeriods={predictedPeriods}
        showPredictedPhases={showPredictedPhases && predictionCount > 0}
      />
    </ScrollView>
    </ScreenWithFlowers>
  );
}

function PredictedLegendItem({ color }: { color: string }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-[5px]">
      <View
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: 'transparent', borderWidth: 1.5, borderColor: color }}
      />
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
