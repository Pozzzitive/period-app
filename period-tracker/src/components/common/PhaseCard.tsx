import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PHASES } from '../../constants/phases';
import type { PhaseInfo } from '../../models';
import { useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
import { s, fs } from '../../utils/scale';

interface PhaseCardProps {
  phase: PhaseInfo | null;
}

export function PhaseCard({ phase }: PhaseCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!phase) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surfaceTertiary }]}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.description}>
          Start logging your periods to see your cycle phases here.
        </Text>
      </View>
    );
  }

  const phaseInfo = PHASES[phase.phase];
  const themePhase = colors.phases[phase.phase];

  return (
    <View style={[styles.card, { backgroundColor: themePhase.lightColor }]}>
      <View style={styles.header}>
        <View style={[styles.phaseBadge, { backgroundColor: themePhase.color }]}>
          <Text style={styles.badgeText}>{phaseInfo.label}</Text>
        </View>
        <Text style={styles.dayCount}>
          Day {phase.dayInCycle} of {phase.cycleLength}
        </Text>
      </View>
      <Text style={styles.description}>{phaseInfo.description}</Text>
      <Text style={styles.tip}>{phaseInfo.tips}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      padding: s(20),
      borderRadius: s(16),
      marginBottom: s(16),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: s(12),
    },
    phaseBadge: {
      paddingHorizontal: s(12),
      paddingVertical: s(6),
      borderRadius: s(20),
    },
    badgeText: {
      color: colors.onPrimary,
      fontSize: fs(13),
      fontWeight: '600',
    },
    dayCount: {
      fontSize: fs(14),
      color: colors.textSecondary,
      fontWeight: '500',
    },
    title: {
      fontSize: fs(20),
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: s(8),
    },
    description: {
      fontSize: fs(14),
      color: colors.textSecondary,
      lineHeight: fs(20),
      marginBottom: s(8),
    },
    tip: {
      fontSize: fs(13),
      color: colors.textTertiary,
      fontStyle: 'italic',
    },
  });
