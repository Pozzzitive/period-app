import React, { useState, useEffect } from 'react';
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
import { formatDate } from '@/src/utils/dates';
import type { FlowIntensity, SymptomEntry, IntercourseEntry } from '@/src/models';

const FLOW_OPTIONS: { value: FlowIntensity; label: string; icon: string }[] = [
  { value: 'spotting', label: 'Spotting', icon: '💧' },
  { value: 'light', label: 'Light', icon: '🩸' },
  { value: 'medium', label: 'Medium', icon: '🩸🩸' },
  { value: 'heavy', label: 'Heavy', icon: '🩸🩸🩸' },
];

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const log = useLogStore((s) => s.logs[date]);
  const setFlow = useLogStore((s) => s.setFlow);
  const setSymptoms = useLogStore((s) => s.setSymptoms);
  const setMoods = useLogStore((s) => s.setMoods);
  const setIntercourse = useLogStore((s) => s.setIntercourse);
  const setNotes = useLogStore((s) => s.setNotes);
  const profile = useUserStore((s) => s.profile);

  const [selectedFlow, setSelectedFlow] = useState<FlowIntensity | undefined>(log?.flow);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomEntry[]>(log?.symptoms ?? []);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(log?.moods ?? []);
  const [intercourseData, setIntercourseData] = useState<IntercourseEntry | undefined>(log?.intercourse);
  const [notes, setNotesText] = useState(log?.notes ?? '');

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

  useEffect(() => {
    setIntercourse(date, intercourseData);
  }, [intercourseData]);

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
            // Hide sexual category in teenager mode
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
          <Text style={styles.sectionTitle}>Intercourse</Text>
          <View style={styles.flowRow}>
            <TouchableOpacity
              style={[
                styles.flowButton,
                intercourseData?.logged && styles.flowButtonActive,
              ]}
              onPress={() =>
                setIntercourseData(
                  intercourseData?.logged
                    ? undefined
                    : { logged: true, protected: undefined }
                )
              }
            >
              <Text style={styles.flowLabel}>
                {intercourseData?.logged ? 'Logged ✓' : 'Log activity'}
              </Text>
            </TouchableOpacity>

            {intercourseData?.logged && (
              <>
                <TouchableOpacity
                  style={[
                    styles.flowButton,
                    intercourseData.protected === true && styles.flowButtonActive,
                  ]}
                  onPress={() =>
                    setIntercourseData({ ...intercourseData, protected: true })
                  }
                >
                  <Text style={styles.flowLabel}>Protected</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.flowButton,
                    intercourseData.protected === false && styles.flowButtonActive,
                  ]}
                  onPress={() =>
                    setIntercourseData({ ...intercourseData, protected: false })
                  }
                >
                  <Text style={styles.flowLabel}>Unprotected</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TeenagerGate>

        {/* Notes */}
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add notes for this day..."
          placeholderTextColor="#999"
          multiline
          value={notes}
          onChangeText={setNotesText}
          onBlur={() => setNotes(date, notes)}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
    marginTop: 12,
    marginBottom: 6,
  },
  flowRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  flowButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    minWidth: 75,
  },
  flowButtonActive: {
    backgroundColor: '#FADBD8',
    borderColor: '#E74C3C',
  },
  flowIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  flowLabel: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  flowLabelActive: {
    color: '#C0392B',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 4,
  },
  chipActive: {
    backgroundColor: '#FADBD8',
    borderColor: '#E74C3C',
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 13,
    color: '#333',
  },
  chipTextActive: {
    color: '#C0392B',
    fontWeight: '500',
  },
  severityBadge: {
    backgroundColor: '#E74C3C',
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    width: 16,
    height: 16,
    borderRadius: 8,
    textAlign: 'center',
    lineHeight: 16,
    overflow: 'hidden',
  },
  notesInput: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    minHeight: 100,
    fontSize: 15,
    color: '#333',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});
