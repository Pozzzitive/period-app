import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text, View, Alert, Modal, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addMonths, subMonths, differenceInDays, parseISO, subDays } from 'date-fns';
import { s, fs } from '@/src/utils/scale';
import { useMissingPeriod, useCyclePhase } from '@/src/hooks';
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
import type { ThemeColors } from '@/src/theme';

export default function TodayScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
  const showFertility = fertilityEnabled && !profile.isTeenager;
  const typicalPeriodLength = profile.typicalPeriodLength;
  const typicalCycleLength = profile.typicalCycleLength;

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [predictionCount, setPredictionCount] = useState(3);
  const [showPredictedPhases, setShowPredictedPhases] = useState(true);
  const predictedPeriods = useMultiplePredictions(predictionCount);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetDate, setSheetDate] = useState('');

  const today = todayString();
  const barInsets = useBarInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Check if there's an ongoing period (no end date)
  const ongoingPeriod = periods.find((p) => !p.endDate);

  const handleOpenPeriodModal = useCallback(() => {
    setPeriodDate(new Date());
    setShowPeriodModal(true);
  }, []);

  const handleEndPeriod = useCallback(() => {
    if (!ongoingPeriod) return;

    const daysSoFar = differenceInDays(parseISO(today), parseISO(ongoingPeriod.startDate)) + 1;

    if (daysSoFar < typicalPeriodLength) {
      Alert.alert(
        'End period early?',
        `Your period has been ${daysSoFar} ${daysSoFar === 1 ? 'day' : 'days'} so far, but your typical length is ${typicalPeriodLength} days. Are you sure it ended?`,
        [
          { text: 'Not yet', style: 'cancel' },
          {
            text: 'Yes, it ended',
            onPress: () => endPeriod(ongoingPeriod.id, today),
          },
        ]
      );
    } else {
      endPeriod(ongoingPeriod.id, today);
    }
  }, [ongoingPeriod, today, endPeriod, typicalPeriodLength]);

  const handleConfirmPeriod = useCallback(() => {
    const dateStr = format(periodDate, 'yyyy-MM-dd');

    // Check for overlap with existing periods
    const overlapping = periods.find((p) => {
      const start = parseISO(p.startDate);
      const end = p.endDate ? parseISO(p.endDate) : start;
      return periodDate >= start && periodDate <= end;
    });

    if (overlapping) {
      Alert.alert(
        'Date overlap',
        `This date falls within an existing period (${formatDate(overlapping.startDate, 'MMM d')}${overlapping.endDate ? ` - ${formatDate(overlapping.endDate, 'MMM d')}` : ''}). Please choose a different date.`
      );
      return;
    }

    addPeriod(dateStr);
    setShowPeriodModal(false);
  }, [periodDate, periods, addPeriod]);

  const handleDeletePeriod = useCallback((period: typeof periods[0]) => {
    const label = period.endDate
      ? `${formatDate(period.startDate, 'MMM d')} - ${formatDate(period.endDate, 'MMM d')}`
      : `Started ${formatDate(period.startDate, 'MMM d')} (ongoing)`;

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

  // Calendar handlers
  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((m) => subMonths(m, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((m) => addMonths(m, 1));
  }, []);

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
    <ScrollView style={styles.scrollView} contentContainerStyle={[styles.content, { paddingTop: barInsets.top + s(4), paddingBottom: barInsets.bottom + s(32) }]}>
      <FlowerBackground />
      {/* Missing period prompt */}
      {showMissing && !dismissedMissing && (
        <MissingPeriodPrompt onDismiss={() => setDismissedMissing(true)} />
      )}

      {/* Cycle ring */}
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

      {/* Month navigation */}
      <View style={styles.calendarNav}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem color={colors.phases.menstruation.lightColor} label="Period" />
        <LegendItem color={colors.phases.follicular.lightColor} label="Follicular" />
        <LegendItem color={colors.phases.ovulation.lightColor} label="Ovulation" />
        <LegendItem color={colors.phases.luteal.lightColor} label="Luteal" />
        <LegendItem color={colors.phases.premenstrual.lightColor} label="PMS" />
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

      {/* Prediction controls */}
      <View style={styles.stepperRow}>
        <Text style={styles.stepperLabel}>Predicted periods</Text>
        <View style={styles.stepperControls}>
          <TouchableOpacity
            style={[styles.stepperButton, predictionCount <= 0 && styles.stepperButtonDisabled]}
            onPress={() => setPredictionCount((c) => Math.max(0, c - 1))}
            disabled={predictionCount <= 0}
            activeOpacity={0.6}
          >
            <Text style={[styles.stepperButtonText, predictionCount <= 0 && styles.stepperButtonTextDisabled]}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{predictionCount}</Text>
          <TouchableOpacity
            style={[styles.stepperButton, predictionCount >= 5 && styles.stepperButtonDisabled]}
            onPress={() => setPredictionCount((c) => Math.min(5, c + 1))}
            disabled={predictionCount >= 5}
            activeOpacity={0.6}
          >
            <Text style={[styles.stepperButtonText, predictionCount >= 5 && styles.stepperButtonTextDisabled]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      {predictionCount > 0 && (
        <View style={styles.toggleRow}>
          <Text style={styles.stepperLabel}>Show predicted phases</Text>
          <Switch
            value={showPredictedPhases}
            onValueChange={setShowPredictedPhases}
            trackColor={{ false: colors.surfaceTertiary, true: colors.primary + '66' }}
            thumbColor={showPredictedPhases ? colors.primary : colors.textMuted}
          />
        </View>
      )}

      {/* Calendar grid */}
      <CalendarGrid
        month={currentMonth}
        onSelectDay={handleSelectDay}
        selectedDate={selectedDate}
        predictedPeriods={predictedPeriods}
        showPredictedPhases={showPredictedPhases && predictionCount > 0}
      />

      {/* Today's date */}
      <Text style={styles.dateText}>{formatDate(today, 'EEEE, MMMM d, yyyy')}</Text>

      {/* Period history bottom sheet */}
      <Modal
        visible={showHistory}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.historyBackdrop}
            activeOpacity={1}
            onPress={() => setShowHistory(false)}
          />
          <View style={styles.historySheet}>
            <View style={styles.historyHandle} />
            <Text style={styles.historySheetTitle}>Period History</Text>
            <ScrollView style={styles.historyList} bounces={false}>
              {[...periods].reverse().map((period) => {
                const isOngoing = !period.endDate;
                const duration = period.endDate
                  ? differenceInDays(parseISO(period.endDate), parseISO(period.startDate)) + 1
                  : null;

                return (
                  <View key={period.id} style={styles.historyRow}>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyDates}>
                        {formatDate(period.startDate, 'MMM d, yyyy')}
                        {period.endDate
                          ? ` - ${formatDate(period.endDate, 'MMM d, yyyy')}`
                          : ''}
                      </Text>
                      <Text style={styles.historyMeta}>
                        {isOngoing ? 'Ongoing' : `${duration} ${duration === 1 ? 'day' : 'days'}`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeletePeriod(period)}
                      hitSlop={{ top: s(8), bottom: s(8), left: s(8), right: s(8) }}
                    >
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.historyCloseBtn}
              onPress={() => setShowHistory(false)}
            >
              <Text style={styles.historyCloseText}>Close</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Log period</Text>
            <Text style={styles.modalSubtitle}>
              Select the date your period started
            </Text>
            <View style={styles.datePickerInline}>
              <DateTimePicker
                value={periodDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                maximumDate={new Date()}
                minimumDate={subDays(new Date(), 90)}
                onChange={(_event, date) => {
                  if (date) setPeriodDate(date);
                }}
                themeVariant={colors.background === '#000000' || colors.background.startsWith('#1') ? 'dark' : 'light'}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowPeriodModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmPeriod}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
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
    <View style={legendStyles.legendItem}>
      <View
        style={[
          legendStyles.legendDot,
          {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: color,
          },
        ]}
      />
      <Text style={[legendStyles.legendText, { color: colors.textTertiary }]}>Predicted</Text>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={legendStyles.legendItem}>
      <View style={[legendStyles.legendDot, { backgroundColor: color }]} />
      <Text style={[legendStyles.legendText, { color: colors.textTertiary }]}>{label}</Text>
    </View>
  );
}

const legendStyles = StyleSheet.create({
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(5),
  },
  legendDot: {
    width: s(10),
    height: s(10),
    borderRadius: s(5),
  },
  legendText: {
    fontSize: fs(11),
    fontWeight: '500',
  },
});

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: s(16),
    },
    calendarNav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: s(12),
    },
    navButton: {
      padding: s(12),
      minWidth: Math.max(44, s(44)),
      minHeight: Math.max(44, s(44)),
      justifyContent: 'center',
      alignItems: 'center',
    },
    navText: {
      fontSize: fs(28),
      color: colors.primary,
      fontWeight: '300',
      lineHeight: fs(32),
    },
    navTitle: {
      fontSize: fs(18),
      fontWeight: '700',
      color: colors.text,
      letterSpacing: fs(0.3),
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(14),
      marginBottom: s(14),
      justifyContent: 'center',
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: s(8),
      paddingHorizontal: s(4),
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: s(12),
      paddingHorizontal: s(4),
    },
    stepperLabel: {
      fontSize: fs(14),
      fontWeight: '500',
      color: colors.textSecondary,
    },
    stepperControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
    },
    stepperButton: {
      width: s(32),
      height: s(32),
      borderRadius: s(16),
      backgroundColor: colors.surfaceTertiary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepperButtonDisabled: {
      opacity: 0.35,
    },
    stepperButtonText: {
      fontSize: fs(18),
      fontWeight: '600',
      color: colors.primary,
      lineHeight: fs(20),
    },
    stepperButtonTextDisabled: {
      color: colors.textDisabled,
    },
    stepperValue: {
      fontSize: fs(15),
      fontWeight: '600',
      color: colors.text,
      minWidth: s(16),
      textAlign: 'center',
    },
    historyBackdrop: {
      flex: 1,
    },
    historySheet: {
      backgroundColor: colors.sheetBackground,
      borderTopLeftRadius: s(20),
      borderTopRightRadius: s(20),
      padding: s(24),
      paddingBottom: s(40),
      maxHeight: '70%',
    },
    historyHandle: {
      width: s(36),
      height: s(4),
      borderRadius: 2,
      backgroundColor: colors.surfaceTertiary,
      alignSelf: 'center',
      marginBottom: s(16),
    },
    historySheetTitle: {
      fontSize: fs(20),
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: s(16),
    },
    historyList: {
      marginBottom: s(16),
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: s(10),
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    historyInfo: {
      flex: 1,
    },
    historyDates: {
      fontSize: fs(14),
      fontWeight: '500',
      color: colors.text,
    },
    historyMeta: {
      fontSize: fs(12),
      color: colors.textTertiary,
      marginTop: s(2),
    },
    deleteBtn: {
      paddingVertical: s(6),
      paddingHorizontal: s(12),
    },
    deleteBtnText: {
      fontSize: fs(13),
      color: colors.destructive,
      fontWeight: '500',
    },
    historyCloseBtn: {
      backgroundColor: colors.surfaceSecondary,
      paddingVertical: s(14),
      borderRadius: s(12),
      alignItems: 'center',
    },
    historyCloseText: {
      fontSize: fs(16),
      fontWeight: '600',
      color: colors.text,
    },
    dateText: {
      textAlign: 'center',
      fontSize: fs(14),
      color: colors.textMuted,
      marginTop: s(8),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.backdrop,
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: colors.sheetBackground,
      borderTopLeftRadius: s(20),
      borderTopRightRadius: s(20),
      padding: s(24),
      paddingBottom: s(40),
    },
    modalTitle: {
      fontSize: fs(20),
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    modalSubtitle: {
      fontSize: fs(14),
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: s(4),
      marginBottom: s(16),
    },
    datePickerInline: {
      alignItems: 'center',
      marginBottom: s(16),
    },
    modalButtons: {
      flexDirection: 'row',
      gap: s(12),
    },
    modalCancelBtn: {
      flex: 1,
      backgroundColor: colors.surfaceSecondary,
      paddingVertical: s(14),
      borderRadius: s(12),
      alignItems: 'center',
    },
    modalCancelText: {
      fontSize: fs(16),
      fontWeight: '600',
      color: colors.text,
    },
    modalConfirmBtn: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: s(14),
      borderRadius: s(12),
      alignItems: 'center',
    },
    modalConfirmText: {
      fontSize: fs(16),
      fontWeight: '600',
      color: colors.onPrimary,
    },
  });
