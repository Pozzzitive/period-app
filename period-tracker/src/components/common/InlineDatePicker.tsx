import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isBefore,
  isAfter,
  startOfDay,
} from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/theme';

interface InlineDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * Cross-platform inline date picker.
 * - iOS: renders the native DateTimePicker with display="inline"
 * - Android: renders a custom themed calendar grid
 */
export function InlineDatePicker({ value, onChange, minimumDate, maximumDate }: InlineDatePickerProps) {
  const { colors, isDark } = useTheme();

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="inline"
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        onChange={(_, date) => { if (date) onChange(date); }}
        themeVariant={isDark ? 'dark' : 'light'}
      />
    );
  }

  return (
    <AndroidCalendarPicker
      value={value}
      onChange={onChange}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
    />
  );
}

function AndroidCalendarPicker({ value, onChange, minimumDate, maximumDate }: InlineDatePickerProps) {
  const { colors } = useTheme();
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(value));

  const canGoPrev = !minimumDate || !isBefore(startOfMonth(viewMonth), startOfMonth(minimumDate));
  const canGoNext = !maximumDate || !isAfter(startOfMonth(addMonths(viewMonth, 1)), startOfMonth(maximumDate));

  const goToPrev = useCallback(() => {
    if (canGoPrev) {
      Haptics.selectionAsync();
      setViewMonth((m) => subMonths(m, 1));
    }
  }, [canGoPrev]);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      Haptics.selectionAsync();
      setViewMonth((m) => addMonths(m, 1));
    }
  }, [canGoNext]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [viewMonth]);

  const today = useMemo(() => startOfDay(new Date()), []);

  const isDisabled = useCallback((day: Date) => {
    if (minimumDate && isBefore(startOfDay(day), startOfDay(minimumDate))) return true;
    if (maximumDate && isAfter(startOfDay(day), startOfDay(maximumDate))) return true;
    return false;
  }, [minimumDate, maximumDate]);

  const handleSelect = useCallback((day: Date) => {
    if (isDisabled(day) || !isSameMonth(day, viewMonth)) return;
    Haptics.selectionAsync();
    onChange(day);
  }, [isDisabled, viewMonth, onChange]);

  return (
    <View style={{ width: '100%' }}>
      {/* Month header with nav arrows */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 4 }}>
        <TouchableOpacity
          onPress={goToPrev}
          style={{ padding: 8, opacity: canGoPrev ? 1 : 0.3 }}
          disabled={!canGoPrev}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>
          {format(viewMonth, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity
          onPress={goToNext}
          style={{ padding: 8, opacity: canGoNext ? 1 : 0.3 }}
          disabled={!canGoNext}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {WEEKDAYS.map((day, i) => (
          <View key={`${day}-${i}`} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMuted }}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, viewMonth);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, value);
          const disabled = isDisabled(day) || !isCurrentMonth;

          return (
            <TouchableOpacity
              key={format(day, 'yyyy-MM-dd')}
              onPress={() => handleSelect(day)}
              disabled={disabled}
              activeOpacity={0.6}
              style={{
                width: '14.2857%',
                height: 44,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={[
                  {
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  isSelected && { backgroundColor: colors.primary },
                  !isSelected && isToday && {
                    borderWidth: 2,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    { fontSize: 15 },
                    isCurrentMonth
                      ? { color: colors.text }
                      : { color: colors.textDisabled },
                    disabled && isCurrentMonth && { color: colors.textDisabled },
                    isToday && !isSelected && { color: colors.primary, fontWeight: '700' },
                    isSelected && { color: colors.onPrimary, fontWeight: '700' },
                  ]}
                >
                  {format(day, 'd')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
