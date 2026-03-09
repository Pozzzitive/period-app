import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLogStore, useCycleStore, useUserStore, useSettingsStore } from '../../stores';
import { calculatePhase } from '../../engine';
import type { PredictedPeriod } from '../../engine';
import { PHASES } from '../../constants/phases';
import { SYMPTOMS_BY_ID } from '../../constants/symptoms';
import { MOODS_BY_ID } from '../../constants/moods';
import { formatDate } from '../../utils/dates';
import { TeenagerGate } from '../common/TeenagerGate';
import type { FlowIntensity } from '../../models';
import { useTheme } from '../../theme';
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
  const insets = useSafeAreaInsets();
  const log = useLogStore((s) => s.logs[date]);
  const cycles = useCycleStore((s) => s.cycles);
  const profile = useUserStore((s) => s.profile);
  const symptomsConsent = useSettingsStore((s) => s.settings.dataCategories.symptoms);

  const phaseInfo = useMemo(() => {
    if (!date) return null;

    for (const cycle of cycles) {
      const cycleLength = cycle.cycleLength ?? profile.typicalCycleLength;
      // For the ongoing cycle, dates at or past the predicted period start
      // belong to the predicted next cycle, not the current one
      if (!cycle.endDate && predictedPeriods && predictedPeriods.length > 0) {
        if (date >= predictedPeriods[0].startDate) continue;
      }
      const result = calculatePhase(date, cycle.startDate, cycleLength, cycle.periodLength);
      if (result) {
        return { phase: result.phase, predicted: false, dayInPhase: result.dayInPhase, totalPhaseDays: result.totalPhaseDays };
      }
    }

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
  const hasData = log && (log.flow || log.symptoms.length > 0 || log.moods.length > 0 || hasIntercourse || log.notes);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1" style={{ backgroundColor: colors.backdrop }} />
      </TouchableWithoutFeedback>

      <View className="rounded-t-3xl" style={{ backgroundColor: colors.sheetBackground, maxHeight: '65%', paddingBottom: Math.max(insets.bottom, 10) + 14 }}>
        {/* Drag handle */}
        <View className="w-9 h-1 rounded-sm self-center mt-2.5 mb-0.5" style={{ backgroundColor: colors.handleColor }} />

        {/* Header */}
        <View className="flex-row justify-between items-center px-5 pt-2 pb-3" style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle }}>
          <Text className="text-lg font-semibold" style={{ color: colors.text }}>{formatDate(date, 'EEEE, MMM d')}</Text>
          <TouchableOpacity className="p-2 min-w-[36px] min-h-[36px] items-center justify-center rounded-[18px]" style={{ backgroundColor: colors.surfaceTertiary }} onPress={onClose}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Phase badge */}
        {phaseInfo && (
          <View className="px-5 pt-3">
            <View className="flex-row items-center px-3 py-2 rounded-[10px] gap-2" style={{ backgroundColor: colors.phases[phaseInfo.phase].lightColor }}>
              <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.phases[phaseInfo.phase].color }} />
              <Text className="text-sm font-semibold flex-1" style={{ color: colors.phases[phaseInfo.phase].color }}>
                {PHASES[phaseInfo.phase].label}
                {phaseInfo.predicted ? ' (predicted)' : ''}
              </Text>
              <Text className="text-[12px] font-medium" style={{ color: colors.textMuted }}>
                Day {phaseInfo.dayInPhase}/{phaseInfo.totalPhaseDays}
              </Text>
            </View>
          </View>
        )}

        <ScrollView className="px-5 pt-3" showsVerticalScrollIndicator={false}>
          {hasData ? (
            <>
              {log.flow && (
                <View className="mb-5">
                  <Text className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textMuted }}>Flow</Text>
                  <Text className="text-base leading-6" style={{ color: colors.text }}>
                    {FLOW_DISPLAY[log.flow].icon} {FLOW_DISPLAY[log.flow].label}
                  </Text>
                </View>
              )}

              {symptomsConsent && log.symptoms.length > 0 && (
                <View className="mb-5">
                  <Text className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textMuted }}>Symptoms</Text>
                  <View className="flex-row flex-wrap gap-1.5">
                    {log.symptoms.map((s) => {
                      const def = SYMPTOMS_BY_ID[s.symptomId];
                      return (
                        <View key={s.symptomId} className="flex-row items-center px-3 py-1.5 rounded-[14px] gap-[5px]" style={{ backgroundColor: colors.primaryMuted }}>
                          <Text className="text-[13px] font-medium" style={{ color: colors.text }}>
                            {def?.icon} {def?.label ?? s.symptomId}
                          </Text>
                          <Text className="text-[11px] font-medium" style={{ color: colors.textMuted }}>
                            {SEVERITY_LABELS[s.severity]}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {symptomsConsent && log.moods.length > 0 && (
                <View className="mb-5">
                  <Text className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textMuted }}>Mood</Text>
                  <Text className="text-base leading-6" style={{ color: colors.text }}>
                    {log.moods
                      .map((m) => {
                        const def = MOODS_BY_ID[m];
                        return def ? `${def.icon} ${def.label}` : m;
                      })
                      .join(', ')}
                  </Text>
                </View>
              )}

              {hasIntercourse && (
                <TeenagerGate>
                  <View className="mb-5">
                    <Text className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textMuted }}>
                      Intimacy{log.intercourse!.length > 1 ? ` (${log.intercourse!.length} entries)` : ''}
                    </Text>
                    {log.intercourse!.map((entry) => (
                      <Text key={entry.id} className="text-base leading-6" style={{ color: colors.text }}>
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

              {log.notes && (
                <View className="mb-5">
                  <Text className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textMuted }}>Notes</Text>
                  <Text className="text-base leading-6" style={{ color: colors.text }}>{log.notes}</Text>
                </View>
              )}
            </>
          ) : (
            <View className="py-10 items-center">
              <Text className="text-[15px] italic" style={{ color: colors.textMuted }}>Nothing logged for this day</Text>
            </View>
          )}
        </ScrollView>

        {/* Edit button */}
        <TouchableOpacity
          className="mx-5 mt-3 py-[15px] rounded-[14px] items-center"
          style={{ backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 }}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <Text className="text-base font-bold tracking-tight" style={{ color: colors.onPrimary }}>Edit</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
