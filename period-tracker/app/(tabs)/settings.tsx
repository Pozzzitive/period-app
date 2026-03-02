import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore, useUserStore } from '@/src/stores';
import { TeenagerGate } from '@/src/components/common/TeenagerGate';

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const profile = useUserStore((s) => s.profile);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {/* Cycle & Tracking */}
      <Text style={styles.sectionTitle}>Cycle & Tracking</Text>

      <TeenagerGate>
        <SettingRow
          label="Fertility tracking"
          description="Show fertility window on calendar"
          right={
            <Switch
              value={settings.fertilityTrackingEnabled}
              onValueChange={(val) => updateSettings({ fertilityTrackingEnabled: val })}
              trackColor={{ true: '#E74C3C' }}
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
      />

      {profile.isTeenager && (
        <SettingRow
          label="Teenager mode"
          description="Active — age-appropriate content enabled"
          onPress={() => router.push('/settings/teenager-mode')}
          showArrow
        />
      )}

      {!profile.isTeenager && (
        <SettingRow
          label="Teenager mode"
          description="Off — show all features"
          onPress={() => router.push('/settings/teenager-mode')}
          showArrow
        />
      )}

      {/* Notifications */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      <SettingRow
        label="Notification preferences"
        description="Manage your notification settings"
        onPress={() => router.push('/settings/notifications')}
        showArrow
      />

      {/* Security */}
      <Text style={styles.sectionTitle}>Security</Text>
      <SettingRow
        label="App lock"
        description={settings.appLock.enabled ? 'Enabled' : 'Off'}
        onPress={() => router.push('/settings/app-lock')}
        showArrow
      />

      {/* Partner Sharing */}
      <TeenagerGate>
        <Text style={styles.sectionTitle}>Sharing</Text>
        <SettingRow
          label="Partner sharing"
          description="Share cycle summary with a partner"
          right={
            <Switch
              value={settings.partnerSharingEnabled}
              onValueChange={(val) => updateSettings({ partnerSharingEnabled: val })}
              trackColor={{ true: '#E74C3C' }}
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
      />

      {/* Data & Privacy */}
      <Text style={styles.sectionTitle}>Data & Privacy</Text>
      <SettingRow
        label="Data management"
        description="Export or delete your data"
        onPress={() => router.push('/settings/data-management')}
        showArrow
      />
      <SettingRow
        label="Privacy policy"
        description="How your data is handled"
        onPress={() => router.push('/settings/privacy')}
        showArrow
      />
    </ScrollView>
  );
}

interface SettingRowProps {
  label: string;
  description: string;
  right?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
}

function SettingRow({ label, description, right, onPress, showArrow }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress && !right}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDesc}>{description}</Text>
      </View>
      {right}
      {showArrow && <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    paddingLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 6,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  rowDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  arrow: {
    fontSize: 22,
    color: '#CCC',
    marginLeft: 8,
  },
});
