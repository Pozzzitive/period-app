import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useLogStore, useUserStore, useSettingsStore } from '@/src/stores';
import { SYMPTOMS, SYMPTOMS_BY_CATEGORY, SYMPTOM_CATEGORIES } from '@/src/constants/symptoms';
import type { SymptomCategory } from '@/src/constants/symptoms';
import { MOODS } from '@/src/constants/moods';
import { CONDITIONS_BY_ID } from '@/src/constants/conditions';
import { TeenagerGate } from '@/src/components/common/TeenagerGate';
import { PremiumGate } from '@/src/components/common/PremiumGate';
import { IntercourseDetailSheet } from '@/src/components/log/IntercourseDetailSheet';
import { IntercourseAddSheet } from '@/src/components/log/IntercourseAddSheet';
import { formatDate } from '@/src/utils/dates';
import type { FlowIntensity, SymptomEntry } from '@/src/models';
import { useTheme } from '@/src/theme';
import { useCustomSymptomStore } from '@/src/stores/custom-symptom-store';

const FLOW_OPTIONS: { value: FlowIntensity; label: string; icon: string }[] = [
  { value: 'spotting', label: 'Spotting', icon: '💧' },
  { value: 'light', label: 'Light', icon: '🩸' },
  { value: 'medium', label: 'Medium', icon: '🩸🩸' },
  { value: 'heavy', label: 'Heavy', icon: '🩸🩸🩸' },
];

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const log = useLogStore((s) => s.logs[date]);
  const setFlow = useLogStore((s) => s.setFlow);
  const setSymptoms = useLogStore((s) => s.setSymptoms);
  const setMoods = useLogStore((s) => s.setMoods);
  const setNotes = useLogStore((s) => s.setNotes);
  const profile = useUserStore((s) => s.profile);
  const dataCategories = useSettingsStore((s) => s.settings.dataCategories);

  const [selectedFlow, setSelectedFlow] = useState<FlowIntensity | undefined>(log?.flow);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomEntry[]>(log?.symptoms ?? []);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(log?.moods ?? []);
  const [notes, setNotesText] = useState(log?.notes ?? '');
  const [detailVisible, setDetailVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);

  const intercourseEntries = log?.intercourse;
  const entryCount = intercourseEntries?.length ?? 0;

  const customSymptoms = useCustomSymptomStore((s) => s.customSymptoms);

  const conditionSymptomIds = profile.healthConditions.flatMap((condId) => {
    const cond = CONDITIONS_BY_ID[condId];
    return cond?.commonSymptoms ?? [];
  });

  // Track whether initial render has completed to avoid writing on mount
  const isInitialMount = useRef(true);

  // Persist flow/symptoms/moods when they change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) return;
    setFlow(date, selectedFlow);
  }, [date, selectedFlow, setFlow]);

  useEffect(() => {
    if (isInitialMount.current) return;
    setSymptoms(date, selectedSymptoms);
  }, [date, selectedSymptoms, setSymptoms]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setMoods(date, selectedMoods);
  }, [date, selectedMoods, setMoods]);

  // Save notes on unmount (handles iOS swipe-back where onBlur may not fire)
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const originalNotes = useRef(log?.notes ?? '');
  useEffect(() => {
    return () => {
      if (notesRef.current !== originalNotes.current) {
        setNotes(date, notesRef.current);
      }
    };
  }, [date, setNotes]);

  const toggleSymptom = (symptomId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSymptoms((prev) => {
      const existing = prev.find((s) => s.symptomId === symptomId);
      if (existing) {
        if (existing.severity < 3) {
          return prev.map((s) =>
            s.symptomId === symptomId ? { ...s, severity: (s.severity + 1) as 1 | 2 | 3 } : s
          );
        }
        return prev.filter((s) => s.symptomId !== symptomId);
      }
      return [...prev, { symptomId, severity: 1 }];
    });
  };

  const toggleMood = (moodId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMoods((prev) =>
      prev.includes(moodId) ? prev.filter((m) => m !== moodId) : [...prev, moodId]
    );
  };

  const renderChip = (id: string, icon: string, label: string, isSelected: boolean, entry: SymptomEntry | undefined, onPress: () => void) => (
    <TouchableOpacity
      key={id}
      className="flex-row items-center py-2 px-3 rounded-[20px] gap-1"
      style={{
        backgroundColor: isSelected ? colors.primaryMuted : colors.surface,
        borderWidth: 1,
        borderColor: isSelected ? colors.primary : colors.border,
      }}
      onPress={onPress}
    >
      <Text className="text-sm">{icon}</Text>
      <Text className="text-[13px]" style={{ color: isSelected ? colors.primary : colors.text, fontWeight: isSelected ? '500' : '400' }}>{label}</Text>
      {entry && (
        <View className="w-4 h-4 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary }}>
          <Text className="text-[10px] font-bold" style={{ color: colors.onPrimary }}>{entry.severity}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <Stack.Screen options={{
        title: formatDate(date, 'EEEE, MMM d'),
        headerRight: () => (
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ color: colors.primary, fontSize: 17, fontWeight: '600' }}>Done</Text>
          </TouchableOpacity>
        ),
      }} />
      <ScrollView className="flex-1" style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }} keyboardDismissMode="interactive">
        {/* Flow Intensity */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)}>
        <Text className="text-lg font-semibold mt-5 mb-2" style={{ color: colors.text }}>Flow</Text>
        <View className="flex-row gap-2 flex-wrap">
          {FLOW_OPTIONS.map((option) => {
            const isSelected = selectedFlow === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                className="py-3 px-4 rounded-xl items-center min-w-[75px]"
                style={{
                  backgroundColor: isSelected ? colors.primaryMuted : colors.surface,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.primary : colors.border,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedFlow(isSelected ? undefined : option.value);
                }}
              >
                <Text className="text-lg mb-1">{option.icon}</Text>
                <Text className="text-[13px] font-medium" style={{ color: isSelected ? colors.primary : colors.text }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        </Animated.View>

        {/* Symptoms — only show if user consented to symptom tracking */}
        {dataCategories.symptoms && (
        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
        <Text className="text-lg font-semibold mt-5 mb-2" style={{ color: colors.text }}>Symptoms</Text>
        <Text className="text-[13px] mb-2" style={{ color: colors.textTertiary }}>Tap to add, tap again to increase severity (1-3)</Text>

        {conditionSymptomIds.length > 0 && (
          <>
            <Text className="text-sm font-medium mt-3 mb-1.5" style={{ color: colors.textTertiary }}>Suggested for your conditions</Text>
            <View className="flex-row flex-wrap gap-2">
              {SYMPTOMS.filter((s) => conditionSymptomIds.includes(s.id)).map((symptom) => {
                const entry = selectedSymptoms.find((s) => s.symptomId === symptom.id);
                return renderChip(symptom.id, symptom.icon, symptom.label, !!entry, entry, () => toggleSymptom(symptom.id));
              })}
            </View>
          </>
        )}

        {(Object.entries(SYMPTOM_CATEGORIES) as [SymptomCategory, string][])
          .filter(([cat]) => !(cat === 'sexual' && profile.isTeenager))
          .filter(([cat]) => cat !== 'custom')
          .map(([category, categoryLabel]) => (
            <View key={category}>
              <Text className="text-sm font-medium mt-3 mb-1.5" style={{ color: colors.textTertiary }}>{categoryLabel}</Text>
              <View className="flex-row flex-wrap gap-2">
                {(SYMPTOMS_BY_CATEGORY[category] ?? []).map((symptom) => {
                  const entry = selectedSymptoms.find((s) => s.symptomId === symptom.id);
                  return renderChip(symptom.id, symptom.icon, symptom.label, !!entry, entry, () => toggleSymptom(symptom.id));
                })}
              </View>
            </View>
          ))}

        {/* Custom symptoms (Premium Plus) */}
        <PremiumGate>
          {customSymptoms.length > 0 && (
            <View>
              <Text className="text-sm font-medium mt-3 mb-1.5" style={{ color: colors.textTertiary }}>Custom</Text>
              <View className="flex-row flex-wrap gap-2">
                {customSymptoms.map((symptom) => {
                  const entry = selectedSymptoms.find((s) => s.symptomId === symptom.id);
                  return renderChip(symptom.id, symptom.icon, symptom.label, !!entry, entry, () => toggleSymptom(symptom.id));
                })}
              </View>
            </View>
          )}
        </PremiumGate>

        </Animated.View>
        )}

        {/* Mood — gated by symptoms consent (moods are part of symptom/mood data category) */}
        {dataCategories.symptoms && (
        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
        <Text className="text-lg font-semibold mt-5 mb-2" style={{ color: colors.text }}>Mood</Text>
        <View className="flex-row flex-wrap gap-2">
          {MOODS.map((mood) => {
            const selected = selectedMoods.includes(mood.id);
            return (
              <TouchableOpacity
                key={mood.id}
                className="flex-row items-center py-2 px-3 rounded-[20px] gap-1"
                style={{
                  backgroundColor: selected ? colors.primaryMuted : colors.surface,
                  borderWidth: 1,
                  borderColor: selected ? colors.primary : colors.border,
                }}
                onPress={() => toggleMood(mood.id)}
              >
                <Text className="text-sm">{mood.icon}</Text>
                <Text className="text-[13px]" style={{ color: selected ? colors.primary : colors.text, fontWeight: selected ? '500' : '400' }}>{mood.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        </Animated.View>
        )}

        {/* Intercourse */}
        <TeenagerGate>
          <Text className="text-lg font-semibold mt-5 mb-2" style={{ color: colors.text }}>Intimacy</Text>
          <View className="flex-row gap-2 flex-wrap">
            {entryCount > 0 && (
              <TouchableOpacity
                className="py-3 px-4 rounded-xl items-center min-w-[75px]"
                style={{ backgroundColor: colors.primaryMuted, borderWidth: 1, borderColor: colors.primary }}
                onPress={() => setDetailVisible(true)}
              >
                <Text className="text-[13px] font-medium" style={{ color: colors.primary }}>
                  ♥ {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="py-3 px-4 rounded-xl items-center min-w-[75px]"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              onPress={() => setAddVisible(true)}
            >
              <Text className="text-[13px] font-medium" style={{ color: colors.text }}>+ Add entry</Text>
            </TouchableOpacity>
          </View>
        </TeenagerGate>

        {/* Notes */}
        <Animated.View entering={FadeInDown.duration(400).delay(350)}>
        <Text className="text-lg font-semibold mt-5 mb-2" style={{ color: colors.text }}>Notes</Text>
        <TextInput
          style={{
            backgroundColor: colors.surface,
            padding: 16,
            borderRadius: 12,
            minHeight: 100,
            fontSize: 15,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
            textAlignVertical: 'top',
          }}
          placeholder="Add notes for this day..."
          placeholderTextColor={colors.textMuted}
          multiline
          value={notes}
          onChangeText={setNotesText}
          onBlur={() => setNotes(date, notes)}
        />
        </Animated.View>
      </ScrollView>
      <IntercourseDetailSheet visible={detailVisible} date={date} onClose={() => setDetailVisible(false)} />
      <IntercourseAddSheet visible={addVisible} date={date} onClose={() => setAddVisible(false)} />
    </KeyboardAvoidingView>
  );
}
