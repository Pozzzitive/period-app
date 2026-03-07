import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { exportAsJSON, shareExport, deleteAllData } from '@/src/services/data-export';
import { PremiumGate } from '@/src/components/common/PremiumGate';
import { PDFExportSheet } from '@/src/components/settings/PDFExportSheet';
import { useTheme } from '@/src/theme';

export default function DataManagementScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [pdfSheetVisible, setPdfSheetVisible] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const uri = await exportAsJSON();
      await shareExport(uri);
    } catch (error) {
      Alert.alert('Export failed', 'Something went wrong while exporting your data.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAll = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete all data',
      'This will permanently delete all your data from this device. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Are you absolutely sure?',
              'All cycle data, symptoms, moods, settings, and preferences will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, delete all',
                  style: 'destructive',
                  onPress: () => {
                    deleteAllData();
                    router.replace('/(onboarding)/welcome');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={{ color: colors.textTertiary }} className="text-[13px] font-semibold uppercase tracking-widest mt-2 mb-2">Export</Text>
      <TouchableOpacity
        style={{ backgroundColor: colors.surface, opacity: exporting ? 0.6 : 1 }}
        className="p-5 rounded-[14px] mb-3"
        onPress={handleExport}
        disabled={exporting}
      >
        {exporting ? (
          <ActivityIndicator color={colors.primary} style={{ marginBottom: 8, alignSelf: 'flex-start' }} />
        ) : (
          <Ionicons name="share-outline" size={28} color={colors.primary} style={{ marginBottom: 8 }} />
        )}
        <Text style={{ color: colors.text }} className="text-[17px] font-semibold mb-1">Export as JSON</Text>
        <Text style={{ color: colors.textTertiary }} className="text-sm leading-5">
          Download all your data as a JSON file. You can share this with your
          healthcare provider or keep it as a backup.
        </Text>
      </TouchableOpacity>

      <PremiumGate>
        <TouchableOpacity style={{ backgroundColor: colors.surface }} className="p-5 rounded-[14px] mb-3" onPress={() => setPdfSheetVisible(true)}>
          <Ionicons name="document-text-outline" size={28} color={colors.primary} style={{ marginBottom: 8 }} />
          <Text style={{ color: colors.text }} className="text-[17px] font-semibold mb-1">Export as PDF</Text>
          <Text style={{ color: colors.textTertiary }} className="text-sm leading-5">
            Generate a formatted PDF report with cycle history, statistics, and
            patterns. Perfect for sharing with your healthcare provider.
          </Text>
        </TouchableOpacity>
      </PremiumGate>

      <Text style={{ color: colors.textTertiary }} className="text-[13px] font-semibold uppercase tracking-widest mt-2 mb-2">Delete</Text>
      <TouchableOpacity style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.destructiveLight }} className="p-5 rounded-[14px] mb-3" onPress={handleDeleteAll}>
        <Ionicons name="trash-outline" size={28} color={colors.destructive} style={{ marginBottom: 8 }} />
        <Text style={{ color: colors.destructive }} className="text-[17px] font-semibold mb-1">Delete all data</Text>
        <Text style={{ color: colors.textTertiary }} className="text-sm leading-5">
          Permanently remove all your data from this device. This includes all
          cycle data, symptoms, moods, settings, and preferences.
        </Text>
      </TouchableOpacity>

      <PDFExportSheet visible={pdfSheetVisible} onClose={() => setPdfSheetVisible(false)} />
    </ScrollView>
  );
}
