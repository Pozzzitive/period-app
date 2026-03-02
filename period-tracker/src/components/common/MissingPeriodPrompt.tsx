import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useCycleStore } from '../../stores';
import { todayString } from '../../utils/dates';
import type { MissingPeriodResponse } from '../../models';

interface MissingPeriodPromptProps {
  onDismiss: () => void;
}

export function MissingPeriodPrompt({ onDismiss }: MissingPeriodPromptProps) {
  const router = useRouter();
  const addPeriod = useCycleStore((s) => s.addPeriod);

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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF8E1',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#F57F17',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  options: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  optionPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  optionButtonSecondary: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionSecondary: {
    color: '#333',
    fontSize: 15,
  },
});
