import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore, useUserStore } from '@/src/stores';
import { TeenagerGate } from '@/src/components/common/TeenagerGate';
import { ThemePicker } from '@/src/components/settings/ThemePicker';
import { ScreenWithFlowers } from '@/src/components/decorations/ScreenWithFlowers';
import { CornerFlowers } from '@/src/components/decorations/CornerFlowers';
import { useBarInsets } from '@/src/hooks/useBarInsets';
import { useTheme } from '@/src/theme';
import type { ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

const DARK_MODE_DESC: Record<string, string> = {
  system: 'Follow system setting',
  light: 'Always light',
  dark: 'Always dark',
};

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const barInsets = useBarInsets();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const profile = useUserStore((s) => s.profile);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const toggleDarkMode = () => {
    if (settings.theme === 'dark') {
      updateSettings({ theme: 'light' });
    } else {
      updateSettings({ theme: 'dark' });
    }
  };

  return (
    <ScreenWithFlowers backgroundColor={colors.background}>
    <ScrollView style={styles.scrollView} contentContainerStyle={[styles.content, { paddingTop: barInsets.top + s(16), paddingBottom: barInsets.bottom + s(32) }]}>
      <CornerFlowers />
      <Text style={styles.title}>Settings</Text>

      {/* Appearance */}
      <Text style={styles.sectionTitle}>Appearance</Text>

      <SettingRow
        label="Dark mode"
        description={DARK_MODE_DESC[settings.theme] ?? 'Follow system setting'}
        colors={colors}
        right={
          <Switch
            value={settings.theme === 'dark'}
            onValueChange={toggleDarkMode}
            trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
          />
        }
      />

      <SettingRow
        label="Flower decorations"
        description={settings.showFlowerDecorations ? 'Themed flowers on every screen' : 'Off'}
        colors={colors}
        right={
          <Switch
            value={settings.showFlowerDecorations}
            onValueChange={(val) => updateSettings({ showFlowerDecorations: val })}
            trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
          />
        }
      />

      {/* Themes */}
      <Text style={styles.sectionTitle}>Themes</Text>

      <View style={styles.themePickerContainer}>
        <ThemePicker />
      </View>

      {/* Cycle & Tracking */}
      <Text style={styles.sectionTitle}>Cycle & Tracking</Text>

      <TeenagerGate>
        <SettingRow
          label="Fertility tracking"
          description="Show fertility window on calendar"
          colors={colors}
          right={
            <Switch
              value={settings.fertilityTrackingEnabled}
              onValueChange={(val) => updateSettings({ fertilityTrackingEnabled: val })}
              trackColor={{ true: colors.switchActive }}
            />
          }
        />
      </TeenagerGate>

      <SettingRow
        label="Health conditions"
        description={
          profile.healthConditions.length > 0
            ? `${profile.healthConditions.length} condition(s) tagged`
            : 'Tag conditions that affect your cycle'
        }
        onPress={() => router.push('/settings/health-conditions')}
        showArrow
        colors={colors}
      />

      {profile.isTeenager && (
        <SettingRow
          label="Teenager mode"
          description="Active — age-appropriate content enabled"
          onPress={() => router.push('/settings/teenager-mode')}
          showArrow
          colors={colors}
        />
      )}

      {!profile.isTeenager && (
        <SettingRow
          label="Teenager mode"
          description="Off — show all features"
          onPress={() => router.push('/settings/teenager-mode')}
          showArrow
          colors={colors}
        />
      )}

      {/* Notifications */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      <SettingRow
        label="Notification preferences"
        description="Manage your notification settings"
        onPress={() => router.push('/settings/notifications')}
        showArrow
        colors={colors}
      />

      {/* Security */}
      <Text style={styles.sectionTitle}>Security</Text>
      <SettingRow
        label="App lock"
        description={settings.appLock.enabled ? 'Enabled' : 'Off'}
        onPress={() => router.push('/settings/app-lock')}
        showArrow
        colors={colors}
      />

      {/* Partner Sharing */}
      <TeenagerGate>
        <Text style={styles.sectionTitle}>Sharing</Text>
        <SettingRow
          label="Partner sharing"
          description="Share cycle summary with a partner"
          colors={colors}
          right={
            <Switch
              value={settings.partnerSharingEnabled}
              onValueChange={(val) => updateSettings({ partnerSharingEnabled: val })}
              trackColor={{ true: colors.switchActive }}
            />
          }
        />
      </TeenagerGate>

      {/* Premium */}
      <Text style={styles.sectionTitle}>Premium</Text>
      <SettingRow
        label="Premium Plus"
        description="Unlock advanced insights and features"
        onPress={() => router.push('/subscription/paywall')}
        showArrow
        colors={colors}
      />

      {/* Data & Privacy */}
      <Text style={styles.sectionTitle}>Data & Privacy</Text>
      <SettingRow
        label="Data management"
        description="Export or delete your data"
        onPress={() => router.push('/settings/data-management')}
        showArrow
        colors={colors}
      />
      <SettingRow
        label="Privacy policy"
        description="How your data is handled"
        onPress={() => router.push('/settings/privacy')}
        showArrow
        colors={colors}
      />
    </ScrollView>
    </ScreenWithFlowers>
  );
}

interface SettingRowProps {
  label: string;
  description: string;
  right?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
  colors: ThemeColors;
}

function SettingRow({ label, description, right, onPress, showArrow, colors }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={[settingRowStyles.row, { backgroundColor: colors.surface }]}
      onPress={onPress}
      disabled={!onPress && !right}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={settingRowStyles.rowText}>
        <Text style={[settingRowStyles.rowLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[settingRowStyles.rowDesc, { color: colors.textTertiary }]}>{description}</Text>
      </View>
      {right}
      {showArrow && <Text style={[settingRowStyles.arrow, { color: colors.textDisabled }]}>›</Text>}
    </TouchableOpacity>
  );
}

const settingRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(16),
    borderRadius: s(12),
    marginBottom: s(6),
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: fs(16),
    fontWeight: '500',
  },
  rowDesc: {
    fontSize: fs(13),
    marginTop: s(2),
  },
  arrow: {
    fontSize: fs(22),
    marginLeft: s(8),
  },
});

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: s(16),
    },
    title: {
      fontSize: fs(24),
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: s(20),
    },
    sectionTitle: {
      fontSize: fs(13),
      fontWeight: '600',
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: fs(1),
      marginTop: s(20),
      marginBottom: s(8),
      paddingLeft: s(4),
    },
    themePickerContainer: {
      backgroundColor: colors.surface,
      borderRadius: s(12),
      padding: s(12),
      marginBottom: s(6),
    },
  });
