import React from 'react';
import { ScrollView, StyleSheet, View, Text, Switch } from 'react-native';
import { useUserStore } from '@/src/stores';
import { useSettingsStore } from '@/src/stores';

export default function TeenagerModeScreen() {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

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
        <Text style={styles.infoEmoji}>🌱</Text>
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
          trackColor={{ true: '#E74C3C' }}
        />
      </View>

      <Text style={styles.sectionTitle}>When enabled:</Text>
      <View style={styles.featureList}>
        <FeatureItem text="Intercourse logging is hidden" />
        <FeatureItem text="Fertility/ovulation tracking is hidden" />
        <FeatureItem text="Focus on period education" />
        <FeatureItem text="Age-appropriate language" />
        <FeatureItem text="Premium Plus photo features are disabled" />
      </View>
    </ScrollView>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureBullet}>•</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
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
  infoBox: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  infoEmoji: {
    fontSize: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  featureList: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 8,
  },
  featureBullet: {
    fontSize: 14,
    color: '#888',
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
});
