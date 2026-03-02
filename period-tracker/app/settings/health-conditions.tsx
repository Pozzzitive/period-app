import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/src/stores';
import { HEALTH_CONDITIONS } from '@/src/constants/conditions';
import { useTheme } from '@/src/theme';
import type { ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

export default function HealthConditionsSettingsScreen() {
  const profile = useUserStore((s) => s.profile);
  const addCondition = useUserStore((s) => s.addHealthCondition);
  const removeCondition = useUserStore((s) => s.removeHealthCondition);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const toggleCondition = (id: string) => {
    if (profile.healthConditions.includes(id)) {
      removeCondition(id);
    } else {
      addCondition(id);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.info}>
        Tag diagnosed conditions that affect your cycle. This helps show relevant
        symptoms and insights. This data stays on your device.
      </Text>

      {HEALTH_CONDITIONS.map((condition) => {
        const selected = profile.healthConditions.includes(condition.id);
        return (
          <TouchableOpacity
            key={condition.id}
            style={[styles.card, selected && styles.cardSelected]}
            onPress={() => toggleCondition(condition.id)}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
                {condition.label}
              </Text>
              <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                {selected && <Ionicons name="checkmark" size={s(16)} color={colors.onPrimary} />}
              </View>
            </View>
            <Text style={styles.cardDesc}>{condition.description}</Text>
            {selected && (
              <Text style={styles.insight}>{condition.insight}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: s(16),
    paddingBottom: s(32),
  },
  info: {
    fontSize: fs(14),
    color: colors.textSecondary,
    backgroundColor: colors.infoLight,
    padding: s(14),
    borderRadius: s(10),
    marginBottom: s(16),
    lineHeight: fs(20),
  },
  card: {
    backgroundColor: colors.surface,
    padding: s(16),
    borderRadius: s(12),
    marginBottom: s(8),
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: s(4),
  },
  cardLabel: {
    fontSize: fs(15),
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  cardLabelSelected: {
    color: colors.primary,
  },
  cardDesc: {
    fontSize: fs(13),
    color: colors.textTertiary,
  },
  insight: {
    fontSize: fs(13),
    color: colors.success,
    marginTop: s(8),
    fontStyle: 'italic',
  },
  checkbox: {
    width: s(24),
    height: s(24),
    borderRadius: s(12),
    borderWidth: 2,
    borderColor: colors.textDisabled,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: s(12),
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
