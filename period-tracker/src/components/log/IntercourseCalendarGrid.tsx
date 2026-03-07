import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
  isWithinInterval,
} from 'date-fns';
import { useLogStore, useCycleStore, useUserStore, useSettingsStore } from '../../stores';
import { calculateFertilityWindow } from '../../engine';
import { MIN_CYCLE_LENGTH } from '../../constants/phases';
import { useTheme } from '../../theme';
import type { IntercourseEntry } from '../../models';

interface IntercourseCalendarGridProps {
  month: Date;
  onSelectDay: (date: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getHeartColor(entries: IntercourseEntry[], colors: { success: string; destructive: string; textMuted: string; primaryLight: string }): string {
  const hasProtected = entries.some((e) => e.protected === true);
  const hasUnprotected = entries.some((e) => e.protected === false);

  if (hasProtected && hasUnprotected) return colors.primaryLight; // mixed
  if (hasProtected) return colors.success;
  if (hasUnprotected) return colors.destructive;
  return colors.textMuted; // all unspecified
}

export function IntercourseCalendarGrid({ month, onSelectDay }: IntercourseCalendarGridProps) {
  const { colors } = useTheme();
  const logs = useLogStore((s) => s.logs);
  const cycles = useCycleStore((s) => s.cycles);
  const profile = useUserStore((s) => s.profile);
  const fertilityEnabled = useSettingsStore((s) => s.settings.fertilityTrackingEnabled);
  const today = new Date();

  const fertilityDates = useMemo(() => {
    if (!fertilityEnabled || profile.isTeenager || cycles.length === 0) return new Map<string, 'high' | 'peak'>();
    const map = new Map<string, 'high' | 'peak'>();
    for (const cycle of cycles) {
      const len = cycle.cycleLength ?? profile.typicalCycleLength;
      if (len < MIN_CYCLE_LENGTH) continue;
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
        } else if (!map.has(key)) {
          map.set(key, 'high');
        }
      }
    }
    return map;
  }, [cycles, profile.typicalCycleLength, profile.isTeenager, fertilityEnabled]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [month]);

  return (
    <View>
      {/* Weekday headers */}
      <View className="flex-row mb-1.5">
        {WEEKDAYS.map((day) => (
          <View key={day} style={{ width: '14.2857%', alignItems: 'center', paddingVertical: 8 }}>
            <Text className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View className="flex-row flex-wrap">
        {calendarDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, today);
          const entries = logs[dateStr]?.intercourse;
          const hasEntries = entries && entries.length > 0;
          const fertility = fertilityDates.get(dateStr);

          let heartColor: string | undefined;
          if (hasEntries) {
            heartColor = getHeartColor(entries, colors);
          }

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                { width: '14.2857%', height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
                hasEntries && isCurrentMonth && { backgroundColor: colors.primaryMuted },
                !hasEntries && fertility === 'peak' && isCurrentMonth && { backgroundColor: colors.success + '18' },
                !hasEntries && fertility === 'high' && isCurrentMonth && { backgroundColor: colors.successLight + '30' },
                isToday && isCurrentMonth && { borderWidth: 2, borderColor: colors.primary },
              ]}
              onPress={() => onSelectDay(dateStr)}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  { fontSize: 15, color: colors.text },
                  !isCurrentMonth ? { color: colors.textDisabled } : undefined,
                  isToday ? { fontWeight: 'bold', color: colors.primary } : undefined,
                ]}
              >
                {format(day, 'd')}
              </Text>
              {hasEntries && isCurrentMonth ? (
                <View className="flex-row items-center gap-[1px]">
                  <Text style={{ fontSize: 11, marginTop: 2, color: heartColor }}>♥</Text>
                  {entries.length > 1 && (
                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.primary, marginTop: 2 }}>
                      {entries.length}
                    </Text>
                  )}
                </View>
              ) : fertility && isCurrentMonth ? (
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: fertility === 'peak' ? colors.success : colors.successLight, marginTop: 2 }} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
