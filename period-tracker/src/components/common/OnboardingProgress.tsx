import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';

interface OnboardingProgressProps {
  step: number; // 0-indexed current step
  total?: number; // total steps (default 5)
}

export function OnboardingProgress({ step, total = 5 }: OnboardingProgressProps) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: i === step ? 20 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === step ? colors.primary : i < step ? colors.primary + '66' : colors.surfaceTertiary,
          }}
        />
      ))}
    </View>
  );
}
