import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, isSameDay } from 'date-fns';
import { useLogStore } from '../../stores';
import { useTheme } from '../../theme';
import { s, SCREEN_W } from '@/src/utils/scale';

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
    <View className="gap-1">
      {monthRows.map((row) => (
        <View key={row.label} className="flex-row items-center">
          <TouchableOpacity
            style={{ width: LABEL_WIDTH }}
            onPress={() => onSelectMonth(row.monthDate)}
            activeOpacity={0.6}
          >
            <Text className="text-[11px] font-bold" style={{ color: colors.primary }}>{row.label}</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: PIXEL_GAP, flexWrap: 'nowrap' }}>
            {row.days.map((day) => (
              <View
                key={day.dateStr}
                style={[
                  {
                    width: PIXEL_SIZE,
                    height: PIXEL_SIZE,
                    borderRadius: 2.5,
                    backgroundColor: day.color,
                  },
                  day.isToday && {
                    borderWidth: 1.5,
                    borderColor: colors.primary,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      ))}

      {/* Legend */}
      <View
        className="flex-row justify-center gap-5 mt-5 pt-4"
        style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderSubtle }}
      >
        <View className="flex-row items-center gap-1.5">
          <View className="w-2.5 h-2.5 rounded-[2.5px]" style={{ backgroundColor: protectedColor }} />
          <Text className="text-[11px] font-medium" style={{ color: colors.textTertiary }}>Protected</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-2.5 h-2.5 rounded-[2.5px]" style={{ backgroundColor: unprotectedColor }} />
          <Text className="text-[11px] font-medium" style={{ color: colors.textTertiary }}>Unprotected</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-2.5 h-2.5 rounded-[2.5px]" style={{ backgroundColor: unspecifiedColor }} />
          <Text className="text-[11px] font-medium" style={{ color: colors.textTertiary }}>Unspecified</Text>
        </View>
      </View>
    </View>
  );
}
