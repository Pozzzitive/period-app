import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useCycleStore } from '../../stores';
import { todayString } from '../../utils/dates';
import type { MissingPeriodResponse } from '../../models';
import { useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
import { s, fs } from '../../utils/scale';

interface MissingPeriodPromptProps {
  onDismiss: () => void;
}

export function MissingPeriodPrompt({ onDismiss }: MissingPeriodPromptProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const addPeriod = useCycleStore((s) => s.addPeriod);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleResponse = (response: MissingPeriodResponse) => {
    switch (response) {
      case 'log_period':
        addPeriod(todayString());
        router.push(`/day/${todayString()}`);
        break;
      case 'late_waiting':
      case 'forgot_to_log':
      case 'skip_cycle':
        break;
    }
    onDismiss();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Haven't logged your period yet</Text>
      <Text style={styles.description}>
        It looks like you haven't logged your period yet. Would you like to log
        it now?
      </Text>

      <View style={styles.options}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => handleResponse('log_period')}
        >
          <Text style={styles.optionPrimary}>Log period</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButtonSecondary}
          onPress={() => handleResponse('late_waiting')}
        >
          <Text style={styles.optionSecondary}>Late — still waiting</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButtonSecondary}
          onPress={() => handleResponse('forgot_to_log')}
        >
          <Text style={styles.optionSecondary}>I forgot to log</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButtonSecondary}
          onPress={() => handleResponse('skip_cycle')}
        >
          <Text style={styles.optionSecondary}>Skip this cycle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.warningLight,
      padding: s(20),
      borderRadius: s(16),
      marginBottom: s(16),
      borderWidth: 1,
      borderColor: colors.warningBorder,
    },
    title: {
      fontSize: fs(17),
      fontWeight: '600',
      color: colors.warning,
      marginBottom: s(8),
    },
    description: {
      fontSize: fs(14),
      color: colors.textSecondary,
      lineHeight: fs(20),
      marginBottom: s(16),
    },
    options: {
      gap: s(8),
    },
    optionButton: {
      backgroundColor: colors.primary,
      paddingVertical: s(12),
      borderRadius: s(10),
      alignItems: 'center',
    },
    optionPrimary: {
      color: colors.onPrimary,
      fontSize: fs(16),
      fontWeight: '600',
    },
    optionButtonSecondary: {
      backgroundColor: colors.surface,
      paddingVertical: s(12),
      borderRadius: s(10),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionSecondary: {
      color: colors.text,
      fontSize: fs(15),
    },
  });
