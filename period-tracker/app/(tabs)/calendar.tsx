import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { format, addMonths, subMonths } from 'date-fns';
import { CalendarGrid } from '@/src/components/calendar/CalendarGrid';
import { YearInPixels } from '@/src/components/calendar/YearInPixels';
import { DaySummarySheet } from '@/src/components/calendar/DaySummarySheet';
import { useMultiplePredictions } from '@/src/hooks/useMultiplePredictions';
import { useSettingsStore, useUserStore } from '@/src/stores';
import { useTheme } from '@/src/theme';
import type { ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

type ViewMode = 'monthly' | 'yearly';

export default function CalendarScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const fertilityEnabled = useSettingsStore((s) => s.settings.fertilityTrackingEnabled);
  const isTeenager = useUserStore((s) => s.profile.isTeenager);
  const showFertility = fertilityEnabled && !isTeenager;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [predictionCount, setPredictionCount] = useState(3);
  const [showPredictedPhases, setShowPredictedPhases] = useState(true);
  const predictedPeriods = useMultiplePredictions(viewMode === 'monthly' ? predictionCount : 0);

  // Bottom sheet state
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetDate, setSheetDate] = useState('');

  const styles = useMemo(() => createStyles(colors), [colors]);

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

  const handleSelectMonth = useCallback((month: Date) => {
    setCurrentMonth(month);
    setViewMode('monthly');
  }, []);

  return (
    <View style={styles.container}>
      {/* View mode pill toggle */}
      <View style={styles.pillContainer}>
        <TouchableOpacity
          style={[styles.pill, viewMode === 'monthly' && styles.pillActive]}
          onPress={() => setViewMode('monthly')}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, viewMode === 'monthly' && styles.pillTextActive]}>
            Monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pill, viewMode === 'yearly' && styles.pillActive]}
          onPress={() => setViewMode('yearly')}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, viewMode === 'yearly' && styles.pillTextActive]}>
            Yearly
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      {viewMode === 'monthly' ? (
        <View style={styles.nav}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <Text style={styles.navText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <Text style={styles.navText}>›</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.nav}>
          <TouchableOpacity onPress={handlePrevYear} style={styles.navButton}>
            <Text style={styles.navText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>{currentYear}</Text>
          <TouchableOpacity onPress={handleNextYear} style={styles.navButton}>
            <Text style={styles.navText}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem color={colors.phases.menstruation.color} label="Period" />
        <LegendItem color={colors.phases.follicular.color} label="Follicular" />
        <LegendItem color={colors.phases.ovulation.color} label="Ovulation" />
        <LegendItem color={colors.phases.luteal.color} label="Luteal" />
        <LegendItem color={colors.phases.premenstrual.color} label="PMS" />
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
        </>
      )}

      {/* Content */}
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

      {/* Day summary bottom sheet */}
      <DaySummarySheet
        visible={sheetVisible}
        date={sheetDate}
        onClose={handleSheetClose}
        onEdit={handleSheetEdit}
        predictedPeriods={predictedPeriods}
        showPredictedPhases={showPredictedPhases && predictionCount > 0}
      />
    </View>
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
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: s(16),
    },
    pillContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceTertiary,
      borderRadius: s(22),
      padding: s(3),
      marginBottom: s(20),
    },
    pill: {
      flex: 1,
      paddingVertical: s(9),
      alignItems: 'center',
      borderRadius: s(20),
    },
    pillActive: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: s(2) },
      shadowOpacity: 0.25,
      shadowRadius: s(4),
      elevation: 2,
    },
    pillText: {
      fontSize: fs(14),
      fontWeight: '600',
      color: colors.textTertiary,
    },
    pillTextActive: {
      color: colors.onPrimary,
      fontWeight: '700',
    },
    nav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: s(12),
    },
    navButton: {
      padding: s(12),
      minWidth: s(44),
      minHeight: s(44),
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
  });
