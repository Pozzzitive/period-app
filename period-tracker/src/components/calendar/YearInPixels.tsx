import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
import { s, SCREEN_W } from '../../utils/scale';

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

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
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

  // Build month data — getColorForDate inlined to avoid stale closure
  const monthRows = useMemo(() => {
    const getColor = (dateStr: string): string => {
      if (periodDates.has(dateStr)) return colors.phases.menstruation.color;

      for (const cycle of cycles) {
        if (dateStr < cycle.startDate) continue;
        const cycleLength = cycle.cycleLength ?? profile.typicalCycleLength;
        const phase = calculatePhase(dateStr, cycle.startDate, cycleLength, cycle.periodLength);
        if (phase) return colors.phases[phase.phase].lightColor;
      }
      return noDataColor;
    };

    return MONTH_LABELS.map((label, monthIndex) => {
      const monthDate = new Date(year, monthIndex, 1);
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const days: Array<{ dateStr: string; color: string; isToday: boolean }> = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, monthIndex, d);
        const dateStr = format(date, 'yyyy-MM-dd');
        days.push({
          dateStr,
          color: getColor(dateStr),
          isToday: dateStr === todayStr,
        });
      }

      return { label, monthDate, days };
    });
  }, [year, periodDates, cycles, profile.typicalCycleLength, colors, noDataColor, todayStr]);

  return (
    <View className="gap-1">
      {monthRows.map((row) => (
        <View key={row.label} className="flex-row items-center">
          <TouchableOpacity
            style={{ width: LABEL_WIDTH }}
            onPress={() => onSelectMonth(row.monthDate)}
            activeOpacity={0.6}
          >
            <Text className="text-[11px] font-semibold" style={{ color: colors.primary }}>{row.label}</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: PIXEL_GAP, flexWrap: 'nowrap' }}>
            {row.days.map((day) => (
              <View
                key={day.dateStr}
                style={[
                  {
                    width: PIXEL_SIZE,
                    height: PIXEL_SIZE,
                    borderRadius: 2,
                    backgroundColor: day.color,
                  },
                  day.isToday && {
                    borderWidth: 1,
                    borderColor: colors.text,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
