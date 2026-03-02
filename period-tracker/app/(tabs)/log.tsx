import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addMonths, subMonths } from 'date-fns';
import { todayString } from '@/src/utils/dates';
import { useLogStore } from '@/src/stores';
import { TeenagerGate } from '@/src/components/common/TeenagerGate';
import { IntercourseCalendarGrid } from '@/src/components/log/IntercourseCalendarGrid';
import { IntercourseYearInPixels } from '@/src/components/log/IntercourseYearInPixels';
import { IntercourseDetailSheet } from '@/src/components/log/IntercourseDetailSheet';
import { IntercourseAddSheet } from '@/src/components/log/IntercourseAddSheet';
import { useTheme } from '@/src/theme';
import type { ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

type ViewMode = 'monthly' | 'yearly';

export default function LogScreen() {
  const { colors } = useTheme();
  const today = todayString();
  const log = useLogStore((s) => s.logs[today]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');

  // Detail sheet (edit existing entries)
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailDate, setDetailDate] = useState(today);

  // Add sheet (compose new entry)
  const [addVisible, setAddVisible] = useState(false);
  const [addDate, setAddDate] = useState(today);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const entries = log?.intercourse;
  const hasEntries = entries && entries.length > 0;

  const handleAddEntry = useCallback(() => {
    setAddDate(today);
    setAddVisible(true);
  }, [today]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((m) => subMonths(m, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((m) => addMonths(m, 1));
  }, []);

  const handlePrevYear = useCallback(() => {
    setCurrentYear((y) => y - 1);
  }, []);

  const handleNextYear = useCallback(() => {
    setCurrentYear((y) => y + 1);
  }, []);

  const handleSelectDay = useCallback((date: string) => {
    setDetailDate(date);
    setDetailVisible(true);
  }, []);

  const handleSelectMonth = useCallback((month: Date) => {
    setCurrentMonth(month);
    setViewMode('monthly');
  }, []);

  return (
    <TeenagerGate
      fallback={
        <View style={styles.container}>
          <View style={styles.teenPlaceholder}>
            <Ionicons name="lock-closed-outline" size={s(48)} color={colors.textMuted} />
            <Text style={styles.teenTitle}>Not available</Text>
            <Text style={styles.teenDesc}>This section is not available in teenager mode.</Text>
          </View>
        </View>
      }
    >
      <View style={styles.container}>
        {/* Quick log card */}
        <View style={styles.quickCard}>
          <View style={styles.quickCardHeader}>
            <Text style={styles.quickCardTitle}>Today</Text>
            {hasEntries && (
              <TouchableOpacity
                style={styles.summaryButton}
                onPress={() => { setDetailDate(today); setDetailVisible(true); }}
                activeOpacity={0.7}
              >
                <Text style={styles.summaryText}>
                  ♥ {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                </Text>
                <Ionicons name="chevron-forward" size={s(14)} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.quickLogButton}
            onPress={handleAddEntry}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={s(18)} color={colors.primary} />
            <Text style={styles.quickLogText}>Add entry</Text>
          </TouchableOpacity>
        </View>

        {/* View mode pill toggle */}
        <View style={styles.pillContainer}>
          <TouchableOpacity
            style={[styles.pill, viewMode === 'monthly' && styles.pillActive]}
            onPress={() => setViewMode('monthly')}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, viewMode === 'monthly' && styles.pillTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, viewMode === 'yearly' && styles.pillActive]}
            onPress={() => setViewMode('yearly')}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, viewMode === 'yearly' && styles.pillTextActive]}>
              Yearly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        {viewMode === 'monthly' ? (
          <View style={styles.nav}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
              <Text style={styles.navText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.navTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
              <Text style={styles.navText}>›</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.nav}>
            <TouchableOpacity onPress={handlePrevYear} style={styles.navButton}>
              <Text style={styles.navText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.navTitle}>{currentYear}</Text>
            <TouchableOpacity onPress={handleNextYear} style={styles.navButton}>
              <Text style={styles.navText}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        {viewMode === 'monthly' ? (
          <IntercourseCalendarGrid month={currentMonth} onSelectDay={handleSelectDay} />
        ) : (
          <IntercourseYearInPixels year={currentYear} onSelectMonth={handleSelectMonth} />
        )}

        {/* Edit existing entries sheet */}
        <IntercourseDetailSheet
          visible={detailVisible}
          date={detailDate}
          onClose={() => setDetailVisible(false)}
        />

        {/* Add new entry sheet */}
        <IntercourseAddSheet
          visible={addVisible}
          date={addDate}
          onClose={() => setAddVisible(false)}
        />
      </View>
    </TeenagerGate>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: s(16),
    },
    quickCard: {
      backgroundColor: colors.surface,
      padding: s(20),
      borderRadius: s(16),
      marginBottom: s(20),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(2) },
      shadowOpacity: 0.08,
      shadowRadius: s(8),
      elevation: 2,
    },
    quickCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    quickCardTitle: {
      fontSize: fs(17),
      fontWeight: '600',
      color: colors.text,
    },
    summaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4),
    },
    summaryText: {
      fontSize: fs(14),
      fontWeight: '600',
      color: colors.primary,
    },
    quickLogButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(6),
      marginTop: s(12),
      paddingVertical: s(11),
      borderRadius: s(12),
      backgroundColor: colors.primaryMuted,
      borderWidth: 1,
      borderColor: colors.primaryLight,
    },
    quickLogText: {
      fontSize: fs(14),
      fontWeight: '700',
      color: colors.primary,
    },
    pillContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceTertiary,
      borderRadius: s(22),
      padding: s(3),
      marginBottom: s(20),
    },
    pill: {
      flex: 1,
      paddingVertical: s(9),
      alignItems: 'center',
      borderRadius: s(20),
    },
    pillActive: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: s(2) },
      shadowOpacity: 0.25,
      shadowRadius: s(4),
      elevation: 2,
    },
    pillText: {
      fontSize: fs(14),
      fontWeight: '600',
      color: colors.textTertiary,
    },
    pillTextActive: {
      color: colors.onPrimary,
      fontWeight: '700',
    },
    nav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: s(12),
    },
    navButton: {
      padding: s(12),
      minWidth: s(44),
      minHeight: s(44),
      justifyContent: 'center',
      alignItems: 'center',
    },
    navText: {
      fontSize: fs(28),
      color: colors.primary,
      fontWeight: '300',
      lineHeight: fs(32),
    },
    navTitle: {
      fontSize: fs(18),
      fontWeight: '700',
      color: colors.text,
      letterSpacing: fs(0.3),
    },
    teenPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: s(32),
    },
    teenTitle: {
      marginTop: s(16),
      fontSize: fs(20),
      fontWeight: '600',
      color: colors.text,
      marginBottom: s(8),
    },
    teenDesc: {
      fontSize: fs(15),
      color: colors.textTertiary,
      textAlign: 'center',
    },
  });
