import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  parseISO,
  addDays,
  isWithinInterval,
} from 'date-fns';
import { useCycleStore, useUserStore, useSettingsStore } from '../../stores';
import { calculatePhase } from '../../engine';
import { calculateFertilityWindow } from '../../engine';
import { PHASES } from '../../constants/phases';
import type { CyclePhase } from '../../constants/phases';

interface CalendarGridProps {
  month: Date;
  onSelectDay: (date: string) => void;
  selectedDate?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({ month, onSelectDay, selectedDate }: CalendarGridProps) {
  const periods = useCycleStore((s) => s.periods);
  const cycles = useCycleStore((s) => s.cycles);
  const profile = useUserStore((s) => s.profile);
  const fertilityEnabled = useSettingsStore((s) => s.settings.fertilityTrackingEnabled);

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

  const getPhaseForDate = (dateStr: string): CyclePhase | null => {
    if (periodDates.has(dateStr)) return 'menstruation';

    for (const cycle of cycles) {
      const cycleLength = cycle.cycleLength ?? profile.typicalCycleLength;
      const phase = calculatePhase(dateStr, cycle.startDate, cycleLength, cycle.periodLength);
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
          const phase = isCurrentMonth ? getPhaseForDate(dateStr) : null;
          const fertility = fertilityDates.get(dateStr);

          const phaseColor = phase ? PHASES[phase].lightColor : undefined;

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dayCell,
                phaseColor ? { backgroundColor: phaseColor } : undefined,
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
                ]}
              >
                {format(day, 'd')}
              </Text>
              {isPeriod && <View style={styles.periodDot} />}
              {fertility === 'peak' && !isPeriod && (
                <View style={[styles.fertilityDot, styles.peakDot]} />
              )}
              {fertility === 'high' && !isPeriod && (
                <View style={[styles.fertilityDot, styles.highDot]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  daySelected: {
    borderWidth: 2,
    borderColor: '#E74C3C',
  },
  dayText: {
    fontSize: 15,
    color: '#333',
  },
  dayTextOutside: {
    color: '#CCC',
  },
  dayTextToday: {
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  dayTextPeriod: {
    fontWeight: 'bold',
    color: '#C0392B',
  },
  periodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E74C3C',
    marginTop: 2,
  },
  fertilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  peakDot: {
    backgroundColor: '#2ECC71',
  },
  highDot: {
    backgroundColor: '#82E0AA',
  },
});
