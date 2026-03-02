import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/src/stores';
import { HEALTH_CONDITIONS } from '@/src/constants/conditions';
import { useTheme, type ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

export default function HealthConditionsScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Health Conditions</Text>
        <Text style={styles.subtitle}>
          Do you have any diagnosed conditions that affect your cycle? This helps
          us show relevant insights. You can change this anytime in settings.
        </Text>

        {HEALTH_CONDITIONS.map((condition) => {
          const selected = profile.healthConditions.includes(condition.id);
          return (
            <TouchableOpacity
              key={condition.id}
              style={[styles.conditionCard, selected && styles.conditionSelected]}
              onPress={() => toggleCondition(condition.id)}
            >
              <View style={styles.conditionHeader}>
                <Text style={[styles.conditionLabel, selected && styles.conditionLabelSelected]}>
                  {condition.label}
                </Text>
                <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                  {selected && <Ionicons name="checkmark" size={s(16)} color={colors.onPrimary} />}
                </View>
              </View>
              <Text style={styles.conditionDesc}>{condition.description}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.push('/(onboarding)/notifications-setup')}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(onboarding)/notifications-setup')}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: s(24),
  },
  content: {
    paddingTop: s(40),
    paddingBottom: s(24),
  },
  title: {
    fontSize: fs(28),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: s(8),
  },
  subtitle: {
    fontSize: fs(15),
    color: colors.textSecondary,
    marginBottom: s(24),
  },
  conditionCard: {
    backgroundColor: colors.surface,
    padding: s(16),
    borderRadius: s(12),
    marginBottom: s(12),
    borderWidth: 2,
    borderColor: colors.border,
  },
  conditionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: s(4),
  },
  conditionLabel: {
    fontSize: fs(15),
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  conditionLabelSelected: {
    color: colors.primary,
  },
  conditionDesc: {
    fontSize: fs(13),
    color: colors.textTertiary,
    lineHeight: fs(18),
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
  buttons: {
    flexDirection: 'row',
    gap: s(12),
    marginBottom: s(16),
  },
  skipButton: {
    flex: 1,
    paddingVertical: s(16),
    borderRadius: s(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  skipText: {
    color: colors.primary,
    fontSize: fs(18),
    fontWeight: '600',
  },
  button: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: s(16),
    borderRadius: s(12),
    alignItems: 'center',
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: fs(18),
    fontWeight: '600',
  },
});
