import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCycleStore } from '../../stores';
import { todayString } from '../../utils/dates';
import { useTheme } from '../../theme';
import type { MissingPeriodResponse } from '../../models';

interface MissingPeriodPromptProps {
  onDismiss: () => void;
}

export function MissingPeriodPrompt({ onDismiss }: MissingPeriodPromptProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const addPeriod = useCycleStore((s) => s.addPeriod);

  const handleResponse = (response: MissingPeriodResponse) => {
    switch (response) {
      case 'log_period':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        addPeriod(todayString());
        router.push(`/day/${todayString()}`);
        break;
      case 'late_waiting':
        break;
      case 'forgot_to_log':
        // Navigate to day detail with yesterday's date so the user can log a past period
        Alert.alert(
          'Log a past period',
          'Would you like to pick the date your period actually started?',
          [
            { text: 'Not now', style: 'cancel' },
            {
              text: 'Pick date',
              onPress: () => {
                // Dismissing first, then the home screen's "Log period" modal
                // can be used with a date picker already showing
                onDismiss();
                // Small delay so the prompt animates out before navigation
                setTimeout(() => router.push(`/day/${todayString()}`), 300);
                return;
              },
            },
          ]
        );
        return; // Don't dismiss yet — wait for Alert response
      case 'skip_cycle':
        break;
    }
    onDismiss();
  };

  return (
    <View className="p-5 rounded-2xl mb-4" style={{ backgroundColor: colors.warningLight, borderWidth: 1, borderColor: colors.warningBorder }}>
      <Text className="text-[17px] font-semibold mb-2" style={{ color: colors.warning }}>Haven't logged your period yet</Text>
      <Text className="text-sm leading-5 mb-4" style={{ color: colors.textSecondary }}>
        It looks like you haven't logged your period yet. Would you like to log
        it now?
      </Text>

      <View className="gap-2">
        <TouchableOpacity
          className="py-3 rounded-[10px] items-center"
          style={{ backgroundColor: colors.primary }}
          onPress={() => handleResponse('log_period')}
          accessibilityLabel="Log period starting today"
          accessibilityRole="button"
        >
          <Text className="text-base font-semibold" style={{ color: colors.onPrimary }}>Log period</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3 rounded-[10px] items-center"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          onPress={() => handleResponse('late_waiting')}
          accessibilityLabel="Late, still waiting"
          accessibilityRole="button"
        >
          <Text className="text-[15px]" style={{ color: colors.text }}>Late — still waiting</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3 rounded-[10px] items-center"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          onPress={() => handleResponse('forgot_to_log')}
          accessibilityLabel="I forgot to log my period"
          accessibilityRole="button"
        >
          <Text className="text-[15px]" style={{ color: colors.text }}>I forgot to log</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3 rounded-[10px] items-center"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          onPress={() => handleResponse('skip_cycle')}
          accessibilityLabel="Skip this cycle"
          accessibilityRole="button"
        >
          <Text className="text-[15px]" style={{ color: colors.text }}>Skip this cycle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
