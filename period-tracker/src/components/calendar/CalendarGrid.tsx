import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
import { useCycleStore, useUserStore, useSettingsStore } from '../../stores';
import { calculatePhase, getCyclePhaseRanges } from '../../engine';
import { calculateFertilityWindow } from '../../engine';
import type { PredictedPeriod } from '../../engine';
import { MIN_CYCLE_LENGTH } from '../../constants/phases';
import type { CyclePhase } from '../../constants/phases';
import { useTheme } from '../../theme';

interface CalendarGridProps {
  month: Date;
  onSelectDay: (date: string) => void;
  selectedDate?: string;
  predictedPeriods?: PredictedPeriod[];
  showPredictedPhases?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({ month, onSelectDay, selectedDate, predictedPeriods, showPredictedPhases }: CalendarGridProps) {
  const { colors, isDark } = useTheme();
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

  const fertilityDates = useMemo(() => {
    if (!fertilityEnabled || profile.isTeenager) return new Map<string, 'high' | 'peak'>();

    const map = new Map<string, 'high' | 'peak'>();

    const addFertilityWindow = (startDate: string, cycleLength: number) => {
      const window = calculateFertilityWindow(startDate, cycleLength);
      const start = parseISO(window.fertileStart);
      const end = parseISO(window.fertileEnd);
      const peakStart = parseISO(window.peakStart);
      const peakEnd = parseISO(window.peakEnd);
      const days = eachDayOfInterval({ start, end });
      for (const day of days) {
        const key = format(day, 'yyyy-MM-dd');
        if (isWithinInterval(day, { start: peakStart, end: peakEnd })) {
          map.set(key, 'peak');
        } else if (!map.has(key)) {
          map.set(key, 'high');
        }
      }
    };

    // Fertility from actual cycles (skip implausibly short cycles)
    for (const cycle of cycles) {
      const len = cycle.cycleLength ?? profile.typicalCycleLength;
      if (len >= MIN_CYCLE_LENGTH) {
        addFertilityWindow(cycle.startDate, len);
      }
    }

    // Fertility from predicted periods
    if (predictedPeriods) {
      for (const pp of predictedPeriods) {
        addFertilityWindow(pp.startDate, pp.cycleLength);
      }
    }

    return map;
  }, [cycles, profile.typicalCycleLength, profile.isTeenager, fertilityEnabled, predictedPeriods]);

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
      if (cycle.endDate && dateStr >= cycle.endDate) continue;
      const cycleLength = cycle.cycleLength ?? profile.typicalCycleLength;

      // For the ongoing cycle, don't show phases at or past the predicted
      // period start — those dates belong to the predicted next cycle.
      // This prevents the ongoing cycle's luteal/PMS phases from extending
      // past where the prediction says the next period begins.
      if (!cycle.endDate && predictedPeriods && predictedPeriods.length > 0) {
        if (dateStr >= predictedPeriods[0].startDate) return null;
      }

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
    <View>
      {/* Weekday headers */}
      <View className="flex-row mb-1">
        {WEEKDAYS.map((day) => (
          <View key={day} style={{ width: '14.2857%', alignItems: 'center', paddingVertical: 8 }}>
            <Text className="text-[12px] font-semibold" style={{ color: colors.textMuted }}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View className="flex-row flex-wrap">
        {calendarDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate === dateStr;
          const isPeriod = periodDates.has(dateStr);
          const isPredicted = !isPeriod && predictedPeriodDates.has(dateStr);
          // When a date is a predicted period, skip actual cycle phase so predicted
          // menstruation styling shows instead of the current cycle's luteal/PMS
          const phase = isCurrentMonth && !isPredicted ? getPhaseForDate(dateStr) : null;
          const predictedPhase = !phase ? predictedPhaseDates.get(dateStr) : undefined;
          const fertility = fertilityDates.get(dateStr);

          // Append hex alpha to 7-char hex color (#RRGGBB → #RRGGBBAA)
          const phaseColor = phase
            ? `${colors.phases[phase].color}${isDark ? '99' : '55'}`
            : undefined;
          const predictedBg = predictedPhase && !phaseColor
            ? colors.phases[predictedPhase].lightColor
            : undefined;

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                { width: '14.2857%', height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
                phaseColor ? { backgroundColor: phaseColor } : undefined,
                predictedBg ? { backgroundColor: predictedBg } : undefined,
                isToday && isCurrentMonth ? { borderWidth: 2, borderColor: colors.primary } : undefined,
                isSelected ? { borderWidth: 2, borderColor: colors.text } : undefined,
              ]}
              onPress={() => onSelectDay(dateStr)}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  { fontSize: 15, color: colors.text },
                  !isCurrentMonth ? { color: colors.textDisabled } : undefined,
                  isToday ? { fontWeight: 'bold', color: colors.primary } : undefined,
                  isPeriod ? { fontWeight: 'bold', color: colors.phases.menstruation.color } : undefined,
                  isPredicted ? { color: colors.phases.menstruation.color, opacity: 0.6 } : undefined,
                ]}
              >
                {format(day, 'd')}
              </Text>
              {isPeriod && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.phases.menstruation.color, marginTop: 2 }} />}
              {isPredicted && <View style={{ width: 6, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: colors.phases.menstruation.color, backgroundColor: 'transparent', marginTop: 2 }} />}
              {fertility === 'peak' && !isPeriod && !isPredicted && (
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success, marginTop: 2 }} />
              )}
              {fertility === 'high' && !isPeriod && !isPredicted && (
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.successLight, marginTop: 2 }} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
