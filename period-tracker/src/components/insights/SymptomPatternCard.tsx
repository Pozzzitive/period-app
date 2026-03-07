import React from 'react';
import { View, Text } from 'react-native';
import type { SymptomPattern } from '@/src/engine/pattern-analyzer';
import { useTheme } from '@/src/theme';

interface SymptomPatternCardProps {
  pattern: SymptomPattern;
}

export function SymptomPatternCard({ pattern }: SymptomPatternCardProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
      <Text className="text-2xl mr-3">{pattern.icon}</Text>
      <View className="flex-1">
        <Text className="text-[15px] leading-5" style={{ color: colors.text }}>{pattern.description}</Text>
        <Text className="text-[13px] mt-0.5" style={{ color: colors.textTertiary }}>
          {pattern.occurrenceRate}% of cycles ({pattern.cyclesWithSymptom}/{pattern.totalCycles})
        </Text>
      </View>
    </View>
  );
}
