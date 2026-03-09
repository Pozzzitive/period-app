import React from 'react';
import { ScrollView, View, Text, Switch, Alert } from 'react-native';
import { useSettingsStore } from '@/src/stores';
import { useTheme } from '@/src/theme';

export default function ConsentScreen() {
  const { colors, isDark } = useTheme();
  const dataCategories = useSettingsStore((s) => s.settings.dataCategories);
  const gdprConsentGiven = useSettingsStore((s) => s.settings.gdprConsentGiven);
  const gdprConsentDate = useSettingsStore((s) => s.settings.gdprConsentDate);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const handleToggleSymptoms = (value: boolean) => {
    if (!value) {
      Alert.alert(
        'Withdraw symptom consent',
        'Symptom and mood logging will be hidden. Existing symptom data will remain until you delete it from Data Management.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Withdraw',
            style: 'destructive',
            onPress: () => updateSettings({ dataCategories: { ...dataCategories, symptoms: value } }),
          },
        ]
      );
    } else {
      updateSettings({ dataCategories: { ...dataCategories, symptoms: value } });
    }
  };

  const handleToggleIntercourse = (value: boolean) => {
    if (!value) {
      Alert.alert(
        'Withdraw intercourse consent',
        'Intercourse logging will be hidden. Existing data will remain until you delete it from Data Management.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Withdraw',
            style: 'destructive',
            onPress: () => updateSettings({ dataCategories: { ...dataCategories, intercourse: value } }),
          },
        ]
      );
    } else {
      updateSettings({ dataCategories: { ...dataCategories, intercourse: value } });
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View style={{ backgroundColor: colors.infoLight, padding: 16, borderRadius: 12, marginBottom: 20 }}>
        <Text style={{ fontSize: 14, color: colors.info, lineHeight: 20 }}>
          Under GDPR Article 7(3), you can withdraw consent for data processing at any time. Withdrawing consent does not affect data already processed. You can delete existing data from Settings {'>'} Data Management.
        </Text>
      </View>

      {gdprConsentGiven && gdprConsentDate && (
        <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 16, paddingLeft: 4 }}>
          Consent given on {new Date(gdprConsentDate).toLocaleDateString()}
        </Text>
      )}

      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>
        Data categories
      </Text>

      <View style={{ backgroundColor: colors.surface, borderRadius: 12, marginBottom: 8, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Cycle tracking data</Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>Period dates, predictions, flow</Text>
        </View>
        <Switch
          value={dataCategories.cycleData}
          disabled
          trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
          thumbColor={dataCategories.cycleData ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'}
        />
      </View>
      <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12, paddingLeft: 4 }}>
        Required for the app to function. Cannot be disabled.
      </Text>

      <View style={{ backgroundColor: colors.surface, borderRadius: 12, marginBottom: 8, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Symptoms & moods</Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>Physical symptoms, emotional state, notes</Text>
        </View>
        <Switch
          value={dataCategories.symptoms}
          onValueChange={handleToggleSymptoms}
          trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
          thumbColor={dataCategories.symptoms ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'}
        />
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: 12, marginBottom: 8, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Intercourse logs</Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>Intimate activity records</Text>
        </View>
        <Switch
          value={dataCategories.intercourse}
          onValueChange={handleToggleIntercourse}
          trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
          thumbColor={dataCategories.intercourse ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'}
        />
      </View>

      <View style={{ marginTop: 24, backgroundColor: colors.warningLight, padding: 16, borderRadius: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 }}>About your data</Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 19 }}>
          All data is stored locally on your device. We have zero access to it. Disabling a category hides the logging UI but does not delete existing entries. To delete data, go to Settings {'>'} Data Management.
        </Text>
      </View>
    </ScrollView>
  );
}
