import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, isSameDay } from 'date-fns';
import { useLogStore } from '../../stores';
import { useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
import { s, fs, SCREEN_W } from '@/src/utils/scale';

interface IntercourseYearInPixelsProps {
  year: number;
  onSelectMonth: (month: Date) => void;
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const LABEL_WIDTH = s(38);
const AVAILABLE = SCREEN_W - s(16) * 2 - LABEL_WIDTH;
const PIXEL_GAP = Math.max(1, s(2));
const PIXEL_SIZE = Math.floor((AVAILABLE - 30 * PIXEL_GAP) / 31);

export function IntercourseYearInPixels({ year, onSelectMonth }: IntercourseYearInPixelsProps) {
  const { colors } = useTheme();
  const logs = useLogStore((s) => s.logs);
  const today = new Date();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const noDataColor = colors.surfaceTertiary;
  const protectedColor = colors.success;
  const unprotectedColor = colors.destructive;
  const unspecifiedColor = colors.textMuted;

  const monthRows = useMemo(() => {
    return MONTH_LABELS.map((label, monthIndex) => {
      const monthDate = new Date(year, monthIndex, 1);
      // new Date(year, month+1, 0) gives last day of month — handles leap years
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const days: Array<{ dateStr: string; color: string; isToday: boolean }> = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, monthIndex, d);
        const dateStr = format(date, 'yyyy-MM-dd');
        const entries = logs[dateStr]?.intercourse;
        let color = noDataColor;

        if (entries && entries.length > 0) {
          const hasProtected = entries.some((e) => e.protected === true);
          const hasUnprotected = entries.some((e) => e.protected === false);
          if (hasProtected && !hasUnprotected) color = protectedColor;
          else if (hasUnprotected && !hasProtected) color = unprotectedColor;
          else if (hasProtected && hasUnprotected) color = unspecifiedColor; // mixed
          else color = unspecifiedColor;
        }

        days.push({
          dateStr,
          color,
          isToday: isSameDay(date, today),
        });
      }

      return { label, monthDate, days };
    });
  }, [year, logs, colors]);

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

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: protectedColor }]} />
          <Text style={styles.legendText}>Protected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: unprotectedColor }]} />
          <Text style={styles.legendText}>Unprotected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: unspecifiedColor }]} />
          <Text style={styles.legendText}>Unspecified</Text>
        </View>
      </View>
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
      fontWeight: '700',
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
      borderRadius: 2.5,
    },
    todayPixel: {
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: s(20),
      marginTop: s(20),
      paddingTop: s(16),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.borderSubtle,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
    },
    legendDot: {
      width: s(10),
      height: s(10),
      borderRadius: 2.5,
    },
    legendText: {
      fontSize: fs(11),
      color: colors.textTertiary,
      fontWeight: '500',
    },
  });
