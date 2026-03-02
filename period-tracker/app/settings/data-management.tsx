import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCycleStore, useLogStore, useUserStore, useSettingsStore, useSubscriptionStore, useAuthStore } from '@/src/stores';
import { exportAsJSON, shareExport } from '@/src/services/data-export';
import { useTheme } from '@/src/theme';
import type { ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

export default function DataManagementScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
        <Ionicons name="share-outline" size={s(28)} color={colors.primary} style={styles.cardIcon} />
        <Text style={styles.cardTitle}>Export as JSON</Text>
        <Text style={styles.cardDesc}>
          Download all your data as a JSON file. You can share this with your
          healthcare provider or keep it as a backup.
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Delete</Text>
      <TouchableOpacity style={[styles.card, styles.dangerCard]} onPress={handleDeleteAll}>
        <Ionicons name="trash-outline" size={s(28)} color={colors.destructive} style={styles.cardIcon} />
        <Text style={[styles.cardTitle, styles.dangerText]}>Delete all data</Text>
        <Text style={styles.cardDesc}>
          Permanently remove all your data from this device. This includes all
          cycle data, symptoms, moods, settings, and preferences.
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
  sectionTitle: {
    fontSize: fs(13),
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: fs(1),
    marginTop: s(8),
    marginBottom: s(8),
  },
  card: {
    backgroundColor: colors.surface,
    padding: s(20),
    borderRadius: s(14),
    marginBottom: s(12),
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: colors.destructiveLight,
  },
  cardIcon: {
    marginBottom: s(8),
  },
  cardTitle: {
    fontSize: fs(17),
    fontWeight: '600',
    color: colors.text,
    marginBottom: s(4),
  },
  dangerText: {
    color: colors.destructive,
  },
  cardDesc: {
    fontSize: fs(14),
    color: colors.textTertiary,
    lineHeight: fs(20),
  },
});
