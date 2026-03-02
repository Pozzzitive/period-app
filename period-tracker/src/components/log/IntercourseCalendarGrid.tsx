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
} from 'date-fns';
import { useLogStore } from '../../stores';
import { useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
import type { IntercourseEntry } from '../../models';
import { s, fs } from '@/src/utils/scale';

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
  const today = new Date();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [month]);

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
          const entries = logs[dateStr]?.intercourse;
          const hasEntries = entries && entries.length > 0;

          let heartColor: string | undefined;
          if (hasEntries) {
            heartColor = getHeartColor(entries, colors);
          }

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dayCell,
                hasEntries && isCurrentMonth && styles.dayCellLogged,
                isToday && isCurrentMonth && styles.todayCell,
              ]}
              onPress={() => onSelectDay(dateStr)}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  styles.dayText,
                  !isCurrentMonth && styles.dayTextOutside,
                  isToday && styles.dayTextToday,
                ]}
              >
                {format(day, 'd')}
              </Text>
              {hasEntries && isCurrentMonth && (
                <View style={styles.heartRow}>
                  <Text style={[styles.heart, { color: heartColor }]}>♥</Text>
                  {entries.length > 1 && (
                    <Text style={styles.countBadge}>{entries.length}</Text>
                  )}
                </View>
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
      marginBottom: s(6),
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
      textTransform: 'uppercase',
      letterSpacing: fs(0.3),
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
      borderRadius: s(10),
    },
    todayCell: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    dayCellLogged: {
      backgroundColor: colors.primaryMuted,
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
    heartRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(1),
    },
    heart: {
      fontSize: fs(11),
      marginTop: s(2),
    },
    countBadge: {
      fontSize: fs(8),
      fontWeight: '700',
      color: colors.primary,
      marginTop: s(2),
    },
  });
