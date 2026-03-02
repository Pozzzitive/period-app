import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Text, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/src/stores';
import { useSettingsStore } from '@/src/stores';
import { useTheme } from '@/src/theme';
import type { ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

export default function TeenagerModeScreen() {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleToggle = (enabled: boolean) => {
    updateProfile({ isTeenager: enabled });
    if (enabled) {
      // Disable adult features
      updateSettings({ fertilityTrackingEnabled: false, partnerSharingEnabled: false });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.infoBox}>
        <Ionicons name="leaf-outline" size={s(24)} color={colors.success} />
        <Text style={styles.infoText}>
          Teenager mode provides an age-appropriate experience with educational
          content about your cycle.
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>Teenager mode</Text>
          <Text style={styles.rowDesc}>Enable age-appropriate content</Text>
        </View>
        <Switch
          value={profile.isTeenager}
          onValueChange={handleToggle}
          trackColor={{ true: colors.switchActive }}
        />
      </View>

      <Text style={styles.sectionTitle}>When enabled:</Text>
      <View style={styles.featureList}>
        <FeatureItem text="Intercourse logging is hidden" styles={styles} />
        <FeatureItem text="Fertility/ovulation tracking is hidden" styles={styles} />
        <FeatureItem text="Focus on period education" styles={styles} />
        <FeatureItem text="Age-appropriate language" styles={styles} />
        <FeatureItem text="Premium Plus photo features are disabled" styles={styles} />
      </View>
    </ScrollView>
  );
}

function FeatureItem({ text, styles }: { text: string; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureBullet}>•</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: s(16),
    paddingBottom: s(32),
  },
  infoBox: {
    backgroundColor: colors.successLight,
    padding: s(16),
    borderRadius: s(12),
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(12),
    marginBottom: s(20),
  },
  infoText: {
    flex: 1,
    fontSize: fs(14),
    color: colors.success,
    lineHeight: fs(20),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: s(16),
    borderRadius: s(12),
    marginBottom: s(20),
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: fs(16),
    fontWeight: '500',
    color: colors.text,
  },
  rowDesc: {
    fontSize: fs(13),
    color: colors.textTertiary,
    marginTop: s(2),
  },
  sectionTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: s(12),
  },
  featureList: {
    gap: s(8),
  },
  featureRow: {
    flexDirection: 'row',
    gap: s(8),
  },
  featureBullet: {
    fontSize: fs(14),
    color: colors.textTertiary,
  },
  featureText: {
    fontSize: fs(14),
    color: colors.textSecondary,
  },
});
