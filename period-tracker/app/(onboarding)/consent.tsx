import React, { useState } from 'react';
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
import { useSettingsStore, useUserStore } from '@/src/stores';

export default function ConsentScreen() {
  const router = useRouter();
  const setGdprConsent = useSettingsStore((s) => s.setGdprConsent);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

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
            trackColor={{ true: '#E74C3C' }}
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
            trackColor={{ true: '#E74C3C' }}
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
            trackColor={{ true: '#E74C3C' }}
          />
        </View>

        <TouchableOpacity
          style={styles.consentRow}
          onPress={() => setUnderstood(!understood)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, understood && styles.checkboxChecked]}>
            {understood && <Text style={styles.checkmark}>✓</Text>}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
    padding: 24,
  },
  content: {
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  rowDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
