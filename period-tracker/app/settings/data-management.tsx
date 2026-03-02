import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCycleStore, useLogStore, useUserStore, useSettingsStore, useSubscriptionStore, useAuthStore } from '@/src/stores';
import { exportAsJSON, shareExport } from '@/src/services/data-export';

export default function DataManagementScreen() {
  const router = useRouter();

  const handleExport = async () => {
    try {
      const uri = exportAsJSON();
      await shareExport(uri);
    } catch (error) {
      Alert.alert('Export failed', 'Something went wrong while exporting your data.');
    }
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete all data',
      'This will permanently delete all your data from this device. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () => {
            useCycleStore.getState().clearAll();
            useLogStore.getState().clearAll();
            useUserStore.getState().clearAll();
            useSettingsStore.getState().clearAll();
            useSubscriptionStore.getState().clearAll();
            useAuthStore.getState().clearAll();
            router.replace('/(onboarding)/welcome');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Export</Text>
      <TouchableOpacity style={styles.card} onPress={handleExport}>
        <Text style={styles.cardEmoji}>📤</Text>
        <Text style={styles.cardTitle}>Export as JSON</Text>
        <Text style={styles.cardDesc}>
          Download all your data as a JSON file. You can share this with your
          healthcare provider or keep it as a backup.
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Delete</Text>
      <TouchableOpacity style={[styles.card, styles.dangerCard]} onPress={handleDeleteAll}>
        <Text style={styles.cardEmoji}>🗑️</Text>
        <Text style={[styles.cardTitle, styles.dangerText]}>Delete all data</Text>
        <Text style={styles.cardDesc}>
          Permanently remove all your data from this device. This includes all
          cycle data, symptoms, moods, settings, and preferences.
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 14,
    marginBottom: 12,
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dangerText: {
    color: '#C0392B',
  },
  cardDesc: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
});
