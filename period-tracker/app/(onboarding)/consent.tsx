import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore, useUserStore } from '@/src/stores';
import { useTheme, type ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

export default function ConsentScreen() {
  const router = useRouter();
  const setGdprConsent = useSettingsStore((s) => s.setGdprConsent);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [cycleData, setCycleData] = useState(true);
  const [symptoms, setSymptoms] = useState(true);
  const [intercourse, setIntercourse] = useState(true);
  const [understood, setUnderstood] = useState(false);

  const canContinue = understood && cycleData;

  const handleComplete = () => {
    updateSettings({
      dataCategories: {
        cycleData,
        symptoms,
        intercourse,
      },
    });
    setGdprConsent(true);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your Privacy</Text>
        <Text style={styles.subtitle}>
          We take your privacy seriously. Please review how your data is handled.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How your data is stored</Text>
          <Text style={styles.infoText}>
            All your data stays on your device. Nothing is uploaded to any server
            unless you explicitly enable cloud backup later. We never sell your
            data, and we never will.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Data categories</Text>
        <Text style={styles.sectionDesc}>
          Choose which types of data you'd like to track. You can change this
          anytime in settings.
        </Text>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Cycle tracking data</Text>
            <Text style={styles.rowDesc}>Period dates, cycle predictions, flow intensity</Text>
          </View>
          <Switch
            value={cycleData}
            onValueChange={setCycleData}
            trackColor={{ true: colors.switchActive }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Symptoms & moods</Text>
            <Text style={styles.rowDesc}>Physical symptoms, emotional state, notes</Text>
          </View>
          <Switch
            value={symptoms}
            onValueChange={setSymptoms}
            trackColor={{ true: colors.switchActive }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Intercourse logs</Text>
            <Text style={styles.rowDesc}>Intimate activity records</Text>
          </View>
          <Switch
            value={intercourse}
            onValueChange={setIntercourse}
            trackColor={{ true: colors.switchActive }}
          />
        </View>

        <TouchableOpacity
          style={styles.consentRow}
          onPress={() => setUnderstood(!understood)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, understood && styles.checkboxChecked]}>
            {understood && <Ionicons name="checkmark" size={s(16)} color={colors.onPrimary} />}
          </View>
          <Text style={styles.consentText}>
            I understand that my health data is stored locally on my device and
            I consent to the app processing this data to provide cycle tracking
            and predictions.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        onPress={handleComplete}
        disabled={!canContinue}
      >
        <Text style={styles.buttonText}>Start Tracking</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: s(24),
  },
  content: {
    paddingTop: s(40),
    paddingBottom: s(24),
  },
  title: {
    fontSize: fs(28),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: s(8),
  },
  subtitle: {
    fontSize: fs(15),
    color: colors.textSecondary,
    marginBottom: s(24),
  },
  infoBox: {
    backgroundColor: colors.infoLight,
    padding: s(16),
    borderRadius: s(12),
    marginBottom: s(24),
  },
  infoTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: colors.info,
    marginBottom: s(8),
  },
  infoText: {
    fontSize: fs(14),
    color: colors.info,
    lineHeight: fs(20),
  },
  sectionTitle: {
    fontSize: fs(18),
    fontWeight: '600',
    color: colors.text,
    marginBottom: s(4),
  },
  sectionDesc: {
    fontSize: fs(13),
    color: colors.textTertiary,
    marginBottom: s(16),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: s(16),
    borderRadius: s(12),
    marginBottom: s(8),
  },
  rowText: {
    flex: 1,
    marginRight: s(12),
  },
  rowLabel: {
    fontSize: fs(16),
    fontWeight: '600',
    color: colors.text,
  },
  rowDesc: {
    fontSize: fs(13),
    color: colors.textTertiary,
    marginTop: s(2),
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(12),
    marginTop: s(20),
    padding: s(16),
    backgroundColor: colors.warningLight,
    borderRadius: s(12),
  },
  checkbox: {
    width: s(24),
    height: s(24),
    borderRadius: s(6),
    borderWidth: 2,
    borderColor: colors.textDisabled,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  consentText: {
    flex: 1,
    fontSize: fs(14),
    color: colors.text,
    lineHeight: fs(20),
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: s(16),
    borderRadius: s(12),
    alignItems: 'center',
    marginBottom: s(16),
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: fs(18),
    fontWeight: '600',
  },
});
