import React from 'react';
import { View, Text } from 'react-native';
import type { TopSymptom } from '@/src/engine/analytics-engine';
import { useTheme } from '@/src/theme';

interface SymptomRankingCardProps {
  symptoms: TopSymptom[];
}

export function SymptomRankingCard({ symptoms }: SymptomRankingCardProps) {
  const { colors } = useTheme();

  const validSymptoms = symptoms.filter((s) => s.count > 0);
  if (validSymptoms.length === 0) return null;

  const maxCount = validSymptoms[0].count;

  return (
    <View
      className="p-5 rounded-[14px] mb-3"
      style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
    >
      <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>Top Symptoms</Text>
      {validSymptoms.slice(0, 8).map((symptom, index) => (
        <View key={symptom.symptomId} className="flex-row items-center mb-2.5">
          <Text className="text-lg mr-2">{symptom.icon}</Text>
          <View className="flex-1">
            <View className="flex-row justify-between mb-1">
              <Text className="text-[13px]" style={{ color: colors.text }}>{symptom.label}</Text>
              <Text className="text-[13px]" style={{ color: colors.textTertiary }}>{symptom.percentage}%</Text>
            </View>
            <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.surfaceTertiary }}>
              <View
                className="h-full rounded-full"
                style={{
                  width: `${(symptom.count / maxCount) * 100}%`,
                  backgroundColor: colors.primary,
                  opacity: 1 - index * 0.08,
                }}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
