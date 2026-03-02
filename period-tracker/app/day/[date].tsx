import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useLogStore, useCycleStore, useUserStore } from '@/src/stores';
import { SYMPTOMS, SYMPTOMS_BY_CATEGORY, SYMPTOM_CATEGORIES } from '@/src/constants/symptoms';
import type { SymptomCategory } from '@/src/constants/symptoms';
import { MOODS } from '@/src/constants/moods';
import { CONDITIONS_BY_ID } from '@/src/constants/conditions';
import { TeenagerGate } from '@/src/components/common/TeenagerGate';
import { IntercourseDetailSheet } from '@/src/components/log/IntercourseDetailSheet';
import { IntercourseAddSheet } from '@/src/components/log/IntercourseAddSheet';
import { formatDate } from '@/src/utils/dates';
import type { FlowIntensity, SymptomEntry } from '@/src/models';
import { useTheme } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';
import type { ThemeColors } from '@/src/theme';

const FLOW_OPTIONS: { value: FlowIntensity; label: string; icon: string }[] = [
  { value: 'spotting', label: 'Spotting', icon: '💧' },
  { value: 'light', label: 'Light', icon: '🩸' },
  { value: 'medium', label: 'Medium', icon: '🩸🩸' },
  { value: 'heavy', label: 'Heavy', icon: '🩸🩸🩸' },
];

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { colors } = useTheme();
  const log = useLogStore((s) => s.logs[date]);
  const setFlow = useLogStore((s) => s.setFlow);
  const setSymptoms = useLogStore((s) => s.setSymptoms);
  const setMoods = useLogStore((s) => s.setMoods);
  const setNotes = useLogStore((s) => s.setNotes);
  const profile = useUserStore((s) => s.profile);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const [selectedFlow, setSelectedFlow] = useState<FlowIntensity | undefined>(log?.flow);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomEntry[]>(log?.symptoms ?? []);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(log?.moods ?? []);
  const [notes, setNotesText] = useState(log?.notes ?? '');
  const [detailVisible, setDetailVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);

  const intercourseEntries = log?.intercourse;
  const entryCount = intercourseEntries?.length ?? 0;

  // Get condition-relevant symptoms to show first
  const conditionSymptomIds = profile.healthConditions.flatMap((condId) => {
    const cond = CONDITIONS_BY_ID[condId];
    return cond?.commonSymptoms ?? [];
  });

  // Save changes
  useEffect(() => {
    setFlow(date, selectedFlow);
  }, [selectedFlow]);

  useEffect(() => {
    setSymptoms(date, selectedSymptoms);
  }, [selectedSymptoms]);

  useEffect(() => {
    setMoods(date, selectedMoods);
  }, [selectedMoods]);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) => {
      const existing = prev.find((s) => s.symptomId === symptomId);
      if (existing) {
        if (existing.severity < 3) {
          return prev.map((s) =>
            s.symptomId === symptomId
              ? { ...s, severity: (s.severity + 1) as 1 | 2 | 3 }
              : s
          );
        }
        return prev.filter((s) => s.symptomId !== symptomId);
      }
      return [...prev, { symptomId, severity: 1 }];
    });
  };

  const toggleMood = (moodId: string) => {
    setSelectedMoods((prev) =>
      prev.includes(moodId) ? prev.filter((m) => m !== moodId) : [...prev, moodId]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: formatDate(date, 'EEEE, MMM d') }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Flow Intensity */}
        <Text style={styles.sectionTitle}>Flow</Text>
        <View style={styles.flowRow}>
          {FLOW_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.flowButton,
                selectedFlow === option.value && styles.flowButtonActive,
              ]}
              onPress={() =>
                setSelectedFlow(selectedFlow === option.value ? undefined : option.value)
              }
            >
              <Text style={styles.flowIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.flowLabel,
                  selectedFlow === option.value && styles.flowLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Symptoms */}
        <Text style={styles.sectionTitle}>Symptoms</Text>
        <Text style={styles.sectionHint}>Tap to add, tap again to increase severity (1-3)</Text>

        {/* Show condition-relevant symptoms first */}
        {conditionSymptomIds.length > 0 && (
          <>
            <Text style={styles.subSectionTitle}>Suggested for your conditions</Text>
            <View style={styles.chipGrid}>
              {SYMPTOMS.filter((s) => conditionSymptomIds.includes(s.id)).map((symptom) => {
                const entry = selectedSymptoms.find((s) => s.symptomId === symptom.id);
                return (
                  <TouchableOpacity
                    key={symptom.id}
                    style={[styles.chip, entry && styles.chipActive]}
                    onPress={() => toggleSymptom(symptom.id)}
                  >
                    <Text style={styles.chipIcon}>{symptom.icon}</Text>
                    <Text style={[styles.chipText, entry && styles.chipTextActive]}>
                      {symptom.label}
                    </Text>
                    {entry && (
                      <Text style={styles.severityBadge}>{entry.severity}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* All symptoms by category */}
        {(Object.entries(SYMPTOM_CATEGORIES) as [SymptomCategory, string][])
          .filter(([cat]) => {
            if (cat === 'sexual' && profile.isTeenager) return false;
            return true;
          })
          .map(([category, categoryLabel]) => (
            <View key={category}>
              <Text style={styles.subSectionTitle}>{categoryLabel}</Text>
              <View style={styles.chipGrid}>
                {(SYMPTOMS_BY_CATEGORY[category] ?? []).map((symptom) => {
                  const entry = selectedSymptoms.find((s) => s.symptomId === symptom.id);
                  return (
                    <TouchableOpacity
                      key={symptom.id}
                      style={[styles.chip, entry && styles.chipActive]}
                      onPress={() => toggleSymptom(symptom.id)}
                    >
                      <Text style={styles.chipIcon}>{symptom.icon}</Text>
                      <Text style={[styles.chipText, entry && styles.chipTextActive]}>
                        {symptom.label}
                      </Text>
                      {entry && (
                        <Text style={styles.severityBadge}>{entry.severity}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

        {/* Mood */}
        <Text style={styles.sectionTitle}>Mood</Text>
        <View style={styles.chipGrid}>
          {MOODS.map((mood) => {
            const selected = selectedMoods.includes(mood.id);
            return (
              <TouchableOpacity
                key={mood.id}
                style={[styles.chip, selected && styles.chipActive]}
                onPress={() => toggleMood(mood.id)}
              >
                <Text style={styles.chipIcon}>{mood.icon}</Text>
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Intercourse - hidden in teenager mode */}
        <TeenagerGate>
          <Text style={styles.sectionTitle}>Intimacy</Text>
          <View style={styles.flowRow}>
            {entryCount > 0 && (
              <TouchableOpacity
                style={[styles.flowButton, styles.flowButtonActive]}
                onPress={() => setDetailVisible(true)}
              >
                <Text style={[styles.flowLabel, styles.flowLabelActive]}>
                  ♥ {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.flowButton}
              onPress={() => setAddVisible(true)}
            >
              <Text style={styles.flowLabel}>+ Add entry</Text>
            </TouchableOpacity>
          </View>
        </TeenagerGate>

        {/* Notes */}
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add notes for this day..."
          placeholderTextColor={colors.textMuted}
          multiline
          value={notes}
          onChangeText={setNotesText}
          onBlur={() => setNotes(date, notes)}
        />
      </ScrollView>
      <IntercourseDetailSheet
        visible={detailVisible}
        date={date}
        onClose={() => setDetailVisible(false)}
      />
      <IntercourseAddSheet
        visible={addVisible}
        date={date}
        onClose={() => setAddVisible(false)}
      />
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: s(16),
      paddingBottom: s(40),
    },
    sectionTitle: {
      fontSize: fs(18),
      fontWeight: '600',
      color: colors.text,
      marginTop: s(20),
      marginBottom: s(8),
    },
    sectionHint: {
      fontSize: fs(13),
      color: colors.textTertiary,
      marginBottom: s(8),
    },
    subSectionTitle: {
      fontSize: fs(14),
      fontWeight: '500',
      color: colors.textTertiary,
      marginTop: s(12),
      marginBottom: s(6),
    },
    flowRow: {
      flexDirection: 'row',
      gap: s(8),
      flexWrap: 'wrap',
    },
    flowButton: {
      paddingVertical: s(12),
      paddingHorizontal: s(16),
      borderRadius: s(12),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      minWidth: s(75),
    },
    flowButtonActive: {
      backgroundColor: colors.selectedBackground,
      borderColor: colors.selectedBorder,
    },
    flowIcon: {
      fontSize: fs(18),
      marginBottom: s(4),
    },
    flowLabel: {
      fontSize: fs(13),
      color: colors.text,
      fontWeight: '500',
    },
    flowLabelActive: {
      color: colors.primary,
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: s(8),
      paddingHorizontal: s(12),
      borderRadius: s(20),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: s(4),
    },
    chipActive: {
      backgroundColor: colors.selectedBackground,
      borderColor: colors.selectedBorder,
    },
    chipIcon: {
      fontSize: fs(14),
    },
    chipText: {
      fontSize: fs(13),
      color: colors.text,
    },
    chipTextActive: {
      color: colors.primary,
      fontWeight: '500',
    },
    severityBadge: {
      backgroundColor: colors.primary,
      color: colors.onPrimary,
      fontSize: fs(10),
      fontWeight: 'bold',
      width: s(16),
      height: s(16),
      borderRadius: s(8),
      textAlign: 'center',
      lineHeight: fs(16),
      overflow: 'hidden',
    },
    notesInput: {
      backgroundColor: colors.surface,
      padding: s(16),
      borderRadius: s(12),
      minHeight: s(100),
      fontSize: fs(15),
      color: colors.text,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
