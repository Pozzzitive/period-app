import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  differenceInDays,
  format,
  isSameMonth,
  isSameDay,
  parseISO,
  addDays,
  isWithinInterval,
} from 'date-fns';
import { s, fs } from '@/src/utils/scale';
import { useCycleStore, useUserStore, useSettingsStore } from '../../stores';
import { calculatePhase, getCyclePhaseRanges } from '../../engine';
import { calculateFertilityWindow } from '../../engine';
import type { PredictedPeriod } from '../../engine';
import type { CyclePhase } from '../../constants/phases';
import { useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';

interface CalendarGridProps {
  month: Date;
  onSelectDay: (date: string) => void;
  selectedDate?: string;
  predictedPeriods?: PredictedPeriod[];
  showPredictedPhases?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({ month, onSelectDay, selectedDate, predictedPeriods, showPredictedPhases }: CalendarGridProps) {
  const { colors } = useTheme();
  const periods = useCycleStore((s) => s.periods);
  const cycles = useCycleStore((s) => s.cycles);
  const profile = useUserStore((s) => s.profile);
  const fertilityEnabled = useSettingsStore((s) => s.settings.fertilityTrackingEnabled);

  const styles = useMemo(() => createStyles(colors), [colors]);
  const today = new Date();

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [month]);

  // Build a set of period dates for quick lookup
  const periodDates = useMemo(() => {
    const dates = new Set<string>();
    for (const period of periods) {
      const start = parseISO(period.startDate);
      const end = period.endDate ? parseISO(period.endDate) : addDays(start, profile.typicalPeriodLength - 1);
      const days = eachDayOfInterval({ start, end });
      for (const day of days) {
        dates.add(format(day, 'yyyy-MM-dd'));
      }
    }
    return dates;
  }, [periods, profile.typicalPeriodLength]);

  // Build fertility dates
  const fertilityDates = useMemo(() => {
    if (!fertilityEnabled || profile.isTeenager || cycles.length === 0) return new Map<string, 'high' | 'peak'>();

    const map = new Map<string, 'high' | 'peak'>();
    for (const cycle of cycles) {
      const len = cycle.cycleLength ?? profile.typicalCycleLength;
      const window = calculateFertilityWindow(cycle.startDate, len);
      const start = parseISO(window.fertileStart);
      const end = parseISO(window.fertileEnd);
      const peakStart = parseISO(window.peakStart);
      const peakEnd = parseISO(window.peakEnd);

      const days = eachDayOfInterval({ start, end });
      for (const day of days) {
        const key = format(day, 'yyyy-MM-dd');
        if (isWithinInterval(day, { start: peakStart, end: peakEnd })) {
          map.set(key, 'peak');
        } else {
          map.set(key, 'high');
        }
      }
    }
    return map;
  }, [cycles, profile.typicalCycleLength, profile.isTeenager, fertilityEnabled]);

  // Build predicted period dates set
  const predictedPeriodDates = useMemo(() => {
    const dates = new Set<string>();
    if (!predictedPeriods) return dates;
    for (const pp of predictedPeriods) {
      const start = parseISO(pp.startDate);
      const end = parseISO(pp.endDate);
      const days = eachDayOfInterval({ start, end });
      for (const day of days) {
        dates.add(format(day, 'yyyy-MM-dd'));
      }
    }
    return dates;
  }, [predictedPeriods]);

  // Build predicted phase dates for full cycle coloring
  const predictedPhaseDates = useMemo(() => {
    const map = new Map<string, CyclePhase>();
    if (!showPredictedPhases || !predictedPeriods || predictedPeriods.length === 0) return map;

    for (const pp of predictedPeriods) {
      const ranges = getCyclePhaseRanges(pp.startDate, pp.cycleLength, pp.periodLength);
      const cycleStart = parseISO(pp.startDate);
      for (const range of ranges) {
        const start = addDays(cycleStart, range.startDay - 1);
        const end = addDays(cycleStart, range.endDay - 1);
        const days = eachDayOfInterval({ start, end });
        for (const day of days) {
          map.set(format(day, 'yyyy-MM-dd'), range.phase);
        }
      }
    }
    return map;
  }, [predictedPeriods, showPredictedPhases]);

  const getPhaseForDate = (dateStr: string): CyclePhase | null => {
    if (periodDates.has(dateStr)) return 'menstruation';

    for (const cycle of cycles) {
      // Skip completed cycles for dates past their end
      if (cycle.endDate && dateStr >= cycle.endDate) continue;
      const cycleLength = cycle.cycleLength ?? profile.typicalCycleLength;

      // For ongoing cycle, stretch phases to today when period is late
      let effectiveLength: number | undefined;
      if (!cycle.endDate) {
        const todayDay = differenceInDays(today, parseISO(cycle.startDate)) + 1;
        if (todayDay > cycleLength) effectiveLength = todayDay;
      }

      const phase = calculatePhase(dateStr, cycle.startDate, cycleLength, cycle.periodLength, effectiveLength);
      if (phase) return phase.phase;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {calendarDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate === dateStr;
          const isPeriod = periodDates.has(dateStr);
          const isPredicted = !isPeriod && predictedPeriodDates.has(dateStr);
          const phase = isCurrentMonth ? getPhaseForDate(dateStr) : null;
          const predictedPhase = !phase ? predictedPhaseDates.get(dateStr) : undefined;
          const fertility = fertilityDates.get(dateStr);

          const phaseColor = phase ? colors.phases[phase].color + '55' : undefined;
          const predictedBg = predictedPhase && !phaseColor
            ? colors.phases[predictedPhase].color + '30'
            : undefined;

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dayCell,
                phaseColor ? { backgroundColor: phaseColor } : undefined,
                predictedBg ? { backgroundColor: predictedBg } : undefined,
                isToday && isCurrentMonth && styles.todayCell,
                isSelected && styles.daySelected,
              ]}
              onPress={() => onSelectDay(dateStr)}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  styles.dayText,
                  !isCurrentMonth && styles.dayTextOutside,
                  isToday && styles.dayTextToday,
                  isPeriod && styles.dayTextPeriod,
                  isPredicted && styles.dayTextPredicted,
                ]}
              >
                {format(day, 'd')}
              </Text>
              {isPeriod && <View style={styles.periodDot} />}
              {isPredicted && <View style={styles.predictedDot} />}
              {fertility === 'peak' && !isPeriod && !isPredicted && (
                <View style={[styles.fertilityDot, styles.peakDot]} />
              )}
              {fertility === 'high' && !isPeriod && !isPredicted && (
                <View style={[styles.fertilityDot, styles.highDot]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {},
    weekdayRow: {
      flexDirection: 'row',
      marginBottom: s(4),
    },
    weekdayCell: {
      width: '14.2857%',
      alignItems: 'center',
      paddingVertical: s(8),
    },
    weekdayText: {
      fontSize: fs(12),
      fontWeight: '600',
      color: colors.textMuted,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: '14.2857%',
      height: s(56),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: s(8),
    },
    todayCell: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    daySelected: {
      borderWidth: 2,
      borderColor: colors.text,
    },
    dayText: {
      fontSize: fs(15),
      color: colors.text,
    },
    dayTextOutside: {
      color: colors.textDisabled,
    },
    dayTextToday: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    dayTextPeriod: {
      fontWeight: 'bold',
      color: colors.phases.menstruation.color,
    },
    dayTextPredicted: {
      color: colors.phases.menstruation.color,
      opacity: 0.6,
    },
    periodDot: {
      width: s(6),
      height: s(6),
      borderRadius: s(3),
      backgroundColor: colors.phases.menstruation.color,
      marginTop: s(2),
    },
    predictedDot: {
      width: s(6),
      height: s(6),
      borderRadius: s(3),
      borderWidth: 1.5,
      borderColor: colors.phases.menstruation.color,
      backgroundColor: 'transparent',
      marginTop: s(2),
    },
    fertilityDot: {
      width: s(6),
      height: s(6),
      borderRadius: s(3),
      marginTop: s(2),
    },
    peakDot: {
      backgroundColor: colors.success,
    },
    highDot: {
      backgroundColor: colors.successLight,
    },
  });
