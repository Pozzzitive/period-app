import React from 'react';
import { View, Text } from 'react-native';
import { PremiumGate } from '@/src/components/common/PremiumGate';
import { SymptomPatternCard } from './SymptomPatternCard';
import type { SymptomPattern } from '@/src/engine/pattern-analyzer';
import { useTheme } from '@/src/theme';

interface SymptomPatternsSectionProps {
  patterns: SymptomPattern[];
}

export function SymptomPatternsSection({ patterns }: SymptomPatternsSectionProps) {
  const { colors } = useTheme();

  return (
    <PremiumGate>
      <View
        className="p-5 rounded-[14px] mb-3"
        style={{ backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
      >
        <Text className="text-base font-semibold mb-1" style={{ color: colors.text }}>Symptom Patterns</Text>
        {patterns.length > 0 ? (
          <>
            <Text className="text-[13px] mb-2" style={{ color: colors.textTertiary }}>
              Based on your last {patterns[0].totalCycles} cycles
            </Text>
            {patterns.slice(0, 5).map((pattern) => (
              <SymptomPatternCard key={pattern.symptomId} pattern={pattern} />
            ))}
          </>
        ) : (
          <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>
            Log symptoms across at least 3 complete cycles to see patterns here.
          </Text>
        )}
      </View>
    </PremiumGate>
  );
}
