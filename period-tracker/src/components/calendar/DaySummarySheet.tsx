import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s, fs } from '@/src/utils/scale';
import { useLogStore, useCycleStore, useUserStore } from '../../stores';
import { calculatePhase } from '../../engine';
import type { PredictedPeriod } from '../../engine';
import { PHASES } from '../../constants/phases';
import { SYMPTOMS_BY_ID } from '../../constants/symptoms';
import { MOODS_BY_ID } from '../../constants/moods';
import { formatDate } from '../../utils/dates';
import { TeenagerGate } from '../common/TeenagerGate';
import type { FlowIntensity } from '../../models';
import { useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
import { parseISO, differenceInDays } from 'date-fns';

interface DaySummarySheetProps {
  visible: boolean;
  date: string;
  onClose: () => void;
  onEdit: () => void;
  predictedPeriods?: PredictedPeriod[];
  showPredictedPhases?: boolean;
}

const FLOW_DISPLAY: Record<FlowIntensity, { icon: string; label: string }> = {
  spotting: { icon: '🩸', label: 'Spotting' },
  light: { icon: '🩸', label: 'Light' },
  medium: { icon: '🩸🩸', label: 'Medium' },
  heavy: { icon: '🩸🩸🩸', label: 'Heavy' },
};

const SEVERITY_LABELS: Record<number, string> = {
  1: 'Mild',
  2: 'Moderate',
  3: 'Severe',
};

export function DaySummarySheet({ visible, date, onClose, onEdit, predictedPeriods, showPredictedPhases }: DaySummarySheetProps) {
  const { colors } = useTheme();
  const log = useLogStore((s) => s.logs[date]);
  const cycles = useCycleStore((s) => s.cycles);
  const profile = useUserStore((s) => s.profile);
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Compute phase for this date (actual or predicted)
  const phaseInfo = useMemo(() => {
    if (!date) return null;

    // Try actual phase from logged cycles
    for (const cycle of cycles) {
      const cycleLength = cycle.cycleLength ?? profile.typicalCycleLength;
      const result = calculatePhase(date, cycle.startDate, cycleLength, cycle.periodLength);
      if (result) {
        return { phase: result.phase, predicted: false, dayInPhase: result.dayInPhase, totalPhaseDays: result.totalPhaseDays };
      }
    }

    // Try predicted phase
    if (showPredictedPhases && predictedPeriods && predictedPeriods.length > 0) {
      const dateObj = parseISO(date);
      for (const pp of predictedPeriods) {
        const cycleStart = parseISO(pp.startDate);
        const dayInCycle = differenceInDays(dateObj, cycleStart) + 1;
        if (dayInCycle >= 1 && dayInCycle <= pp.cycleLength) {
          const result = calculatePhase(date, pp.startDate, pp.cycleLength, pp.periodLength);
          if (result) {
            return { phase: result.phase, predicted: true, dayInPhase: result.dayInPhase, totalPhaseDays: result.totalPhaseDays };
          }
        }
      }
    }

    return null;
  }, [date, cycles, profile.typicalCycleLength, predictedPeriods, showPredictedPhases]);

  const hasIntercourse = log?.intercourse && log.intercourse.length > 0;
  const hasData =
    log &&
    (log.flow ||
      log.symptoms.length > 0 ||
      log.moods.length > 0 ||
      hasIntercourse ||
      log.notes);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerDate}>{formatDate(date, 'EEEE, MMM d')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={s(18)} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Phase badge */}
        {phaseInfo && (
          <View style={styles.phaseBadgeContainer}>
            <View style={[styles.phaseBadge, { backgroundColor: colors.phases[phaseInfo.phase].lightColor }]}>
              <View style={[styles.phaseDot, { backgroundColor: colors.phases[phaseInfo.phase].color }]} />
              <Text style={[styles.phaseBadgeText, { color: colors.phases[phaseInfo.phase].color }]}>
                {PHASES[phaseInfo.phase].label}
                {phaseInfo.predicted ? ' (predicted)' : ''}
              </Text>
              <Text style={styles.phaseDayText}>
                Day {phaseInfo.dayInPhase}/{phaseInfo.totalPhaseDays}
              </Text>
            </View>
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {hasData ? (
            <>
              {/* Flow */}
              {log.flow && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Flow</Text>
                  <Text style={styles.sectionValue}>
                    {FLOW_DISPLAY[log.flow].icon} {FLOW_DISPLAY[log.flow].label}
                  </Text>
                </View>
              )}

              {/* Symptoms */}
              {log.symptoms.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Symptoms</Text>
                  <View style={styles.tagRow}>
                    {log.symptoms.map((s) => {
                      const def = SYMPTOMS_BY_ID[s.symptomId];
                      return (
                        <View key={s.symptomId} style={styles.tag}>
                          <Text style={styles.tagText}>
                            {def?.icon} {def?.label ?? s.symptomId}
                          </Text>
                          <Text style={styles.tagSeverity}>
                            {SEVERITY_LABELS[s.severity]}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Moods */}
              {log.moods.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Mood</Text>
                  <Text style={styles.sectionValue}>
                    {log.moods
                      .map((m) => {
                        const def = MOODS_BY_ID[m];
                        return def ? `${def.icon} ${def.label}` : m;
                      })
                      .join(', ')}
                  </Text>
                </View>
              )}

              {/* Intercourse */}
              {hasIntercourse && (
                <TeenagerGate>
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>
                      Intimacy{log.intercourse!.length > 1 ? ` (${log.intercourse!.length} entries)` : ''}
                    </Text>
                    {log.intercourse!.map((entry) => (
                      <Text key={entry.id} style={styles.sectionValue}>
                        {entry.protected === true
                          ? '♥ Protected'
                          : entry.protected === false
                            ? '♥ Unprotected'
                            : '♥ Logged'}
                        {entry.notes ? ` — ${entry.notes}` : ''}
                      </Text>
                    ))}
                  </View>
                </TeenagerGate>
              )}

              {/* Notes */}
              {log.notes && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Notes</Text>
                  <Text style={styles.sectionValue}>{log.notes}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nothing logged for this day</Text>
            </View>
          )}
        </ScrollView>

        {/* Edit button */}
        <TouchableOpacity style={styles.editButton} onPress={onEdit} activeOpacity={0.7}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.backdrop,
    },
    sheet: {
      backgroundColor: colors.sheetBackground,
      borderTopLeftRadius: s(24),
      borderTopRightRadius: s(24),
      paddingBottom: s(34),
      maxHeight: '65%',
    },
    handle: {
      width: s(36),
      height: s(4),
      borderRadius: 2,
      backgroundColor: colors.handleColor,
      alignSelf: 'center',
      marginTop: s(10),
      marginBottom: s(2),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: s(20),
      paddingTop: s(8),
      paddingBottom: s(12),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSubtle,
    },
    headerDate: {
      fontSize: fs(18),
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      padding: s(8),
      minWidth: s(36),
      minHeight: s(36),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: s(18),
      backgroundColor: colors.surfaceTertiary,
    },
    phaseBadgeContainer: {
      paddingHorizontal: s(20),
      paddingTop: s(12),
    },
    phaseBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(12),
      paddingVertical: s(8),
      borderRadius: s(10),
      gap: s(8),
    },
    phaseDot: {
      width: s(8),
      height: s(8),
      borderRadius: s(4),
    },
    phaseBadgeText: {
      fontSize: fs(14),
      fontWeight: '600',
      flex: 1,
    },
    phaseDayText: {
      fontSize: fs(12),
      fontWeight: '500',
      color: colors.textMuted,
    },
    content: {
      paddingHorizontal: s(20),
      paddingTop: s(12),
    },
    section: {
      marginBottom: s(20),
    },
    sectionLabel: {
      fontSize: fs(11),
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: fs(0.8),
      marginBottom: s(6),
    },
    sectionValue: {
      fontSize: fs(16),
      color: colors.text,
      lineHeight: fs(24),
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6),
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryMuted,
      paddingHorizontal: s(12),
      paddingVertical: s(6),
      borderRadius: s(14),
      gap: s(5),
    },
    tagText: {
      fontSize: fs(13),
      color: colors.text,
      fontWeight: '500',
    },
    tagSeverity: {
      fontSize: fs(11),
      color: colors.textMuted,
      fontWeight: '500',
    },
    emptyState: {
      paddingVertical: s(40),
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fs(15),
      color: colors.textMuted,
      fontStyle: 'italic',
    },
    editButton: {
      marginHorizontal: s(20),
      marginTop: s(12),
      backgroundColor: colors.primary,
      paddingVertical: s(15),
      borderRadius: s(14),
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: s(3) },
      shadowOpacity: 0.2,
      shadowRadius: s(6),
      elevation: 3,
    },
    editButtonText: {
      fontSize: fs(16),
      fontWeight: '700',
      color: colors.onPrimary,
      letterSpacing: fs(0.3),
    },
  });
