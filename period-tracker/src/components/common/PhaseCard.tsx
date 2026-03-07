import React from 'react';
import { View, Text } from 'react-native';
import { PHASES } from '../../constants/phases';
import type { PhaseInfo } from '../../models';
import { useTheme } from '../../theme';

interface PhaseCardProps {
  phase: PhaseInfo | null;
}

export function PhaseCard({ phase }: PhaseCardProps) {
  const { colors } = useTheme();

  if (!phase) {
    return (
      <View className="p-5 rounded-2xl mb-4" style={{ backgroundColor: colors.surfaceTertiary }}>
        <Text className="text-xl font-bold mb-2" style={{ color: colors.text }}>Welcome!</Text>
        <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
          Start logging your periods to see your cycle phases here.
        </Text>
      </View>
    );
  }

  const phaseInfo = PHASES[phase.phase];
  const themePhase = colors.phases[phase.phase];

  return (
    <View className="p-5 rounded-2xl mb-4" style={{ backgroundColor: themePhase.lightColor }}>
      <View className="flex-row justify-between items-center mb-3">
        <View className="px-3 py-1.5 rounded-[20px]" style={{ backgroundColor: themePhase.color }}>
          <Text className="text-[13px] font-semibold" style={{ color: colors.onPrimary }}>{phaseInfo.label}</Text>
        </View>
        <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
          Day {phase.dayInCycle} of {phase.cycleLength}
        </Text>
      </View>
      <Text className="text-sm leading-5 mb-2" style={{ color: colors.textSecondary }}>{phaseInfo.description}</Text>
      <Text className="text-[13px] italic" style={{ color: colors.textTertiary }}>{phaseInfo.tips}</Text>
    </View>
  );
}
