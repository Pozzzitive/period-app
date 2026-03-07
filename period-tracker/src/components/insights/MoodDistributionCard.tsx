import React from 'react';
import { View, Text } from 'react-native';
import type { MoodDistributionItem } from '@/src/engine/analytics-engine';
import { useTheme } from '@/src/theme';

interface MoodDistributionCardProps {
  moods: MoodDistributionItem[];
}

export function MoodDistributionCard({ moods }: MoodDistributionCardProps) {
  const { colors } = useTheme();

  if (moods.length === 0) return null;

  return (
    <View
      className="p-5 rounded-[14px] mb-3"
      style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
    >
      <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>Mood Distribution</Text>
      <View className="flex-row flex-wrap gap-3">
        {moods.map((mood) => (
          <View key={mood.moodId} className="items-center" style={{ minWidth: 60 }}>
            <Text className="text-2xl">{mood.icon}</Text>
            <Text className="text-sm font-bold mt-1" style={{ color: colors.primary }}>{mood.count}</Text>
            <Text className="text-[11px]" style={{ color: colors.textTertiary }}>{mood.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
