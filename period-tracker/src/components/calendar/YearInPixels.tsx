import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  format,
  parseISO,
  addDays,
  isSameDay,
  eachDayOfInterval,
} from 'date-fns';
import { useCycleStore, useUserStore } from '../../stores';
import { calculatePhase } from '../../engine';
import { useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
import { s, fs, SCREEN_W } from '../../utils/scale';

interface YearInPixelsProps {
  year: number;
  onSelectMonth: (month: Date) => void;
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const LABEL_WIDTH = s(36);
const AVAILABLE = SCREEN_W - s(16) * 2 - LABEL_WIDTH;
const PIXEL_GAP = Math.max(1, s(2));
const PIXEL_SIZE = Math.floor((AVAILABLE - 30 * PIXEL_GAP) / 31);

export function YearInPixels({ year, onSelectMonth }: YearInPixelsProps) {
  const { colors } = useTheme();
  const periods = useCycleStore((s) => s.periods);
  const cycles = useCycleStore((s) => s.cycles);
  const profile = useUserStore((s) => s.profile);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const today = new Date();
  const noDataColor = colors.surfaceTertiary;

  // Build period dates set (same logic as CalendarGrid)
  const periodDates = useMemo(() => {
    const dates = new Set<string>();
    for (const period of periods) {
      const start = parseISO(period.startDate);
      const end = period.endDate
        ? parseISO(period.endDate)
        : addDays(start, profile.typicalPeriodLength - 1);
      const days = eachDayOfInterval({ start, end });
      for (const day of days) {
        dates.add(format(day, 'yyyy-MM-dd'));
      }
    }
    return dates;
  }, [periods, profile.typicalPeriodLength]);

  // Get phase color for a date
  const getColorForDate = (dateStr: string): string => {
    if (periodDates.has(dateStr)) return colors.phases.menstruation.color;

    for (const cycle of cycles) {
      const cycleLength = cycle.cycleLength ?? profile.typicalCycleLength;
      const phase = calculatePhase(dateStr, cycle.startDate, cycleLength, cycle.periodLength);
      if (phase) return colors.phases[phase.phase].lightColor;
    }
    return noDataColor;
  };

  // Build month data
  const monthRows = useMemo(() => {
    return MONTH_LABELS.map((label, monthIndex) => {
      const monthDate = new Date(year, monthIndex, 1);
      // new Date(year, month+1, 0) gives last day of month — handles leap years
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const days: Array<{ dateStr: string; color: string; isToday: boolean }> = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, monthIndex, d);
        const dateStr = format(date, 'yyyy-MM-dd');
        days.push({
          dateStr,
          color: getColorForDate(dateStr),
          isToday: isSameDay(date, today),
        });
      }

      return { label, monthDate, days };
    });
  }, [year, periodDates, cycles, profile.typicalCycleLength, colors]);

  return (
    <View style={styles.container}>
      {monthRows.map((row) => (
        <View key={row.label} style={styles.monthRow}>
          <TouchableOpacity
            style={styles.labelContainer}
            onPress={() => onSelectMonth(row.monthDate)}
            activeOpacity={0.6}
          >
            <Text style={styles.monthLabel}>{row.label}</Text>
          </TouchableOpacity>
          <View style={styles.pixelRow}>
            {row.days.map((day) => (
              <View
                key={day.dateStr}
                style={[
                  styles.pixel,
                  { backgroundColor: day.color },
                  day.isToday && styles.todayPixel,
                ]}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      gap: s(4),
    },
    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    labelContainer: {
      width: LABEL_WIDTH,
    },
    monthLabel: {
      fontSize: fs(11),
      fontWeight: '600',
      color: colors.primary,
    },
    pixelRow: {
      flexDirection: 'row',
      gap: PIXEL_GAP,
      flexWrap: 'nowrap',
    },
    pixel: {
      width: PIXEL_SIZE,
      height: PIXEL_SIZE,
      borderRadius: 2,
    },
    todayPixel: {
      borderWidth: 1,
      borderColor: colors.text,
    },
  });
