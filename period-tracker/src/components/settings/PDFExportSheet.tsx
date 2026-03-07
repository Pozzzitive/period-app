import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Modal, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generatePDF, sharePDF } from '@/src/services/pdf-export';
import type { PDFOptions } from '@/src/services/pdf-template';
import { useTheme } from '@/src/theme';

interface PDFExportSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function PDFExportSheet({ visible, onClose }: PDFExportSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [options, setOptions] = useState<PDFOptions>({
    includeCycleHistory: true,
    includeStatistics: true,
    includeSymptomPatterns: true,
    includeMoodData: true,
  });
  const [loading, setLoading] = useState(false);

  const toggleOption = (key: keyof PDFOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const uri = await generatePDF(options);
      await sharePDF(uri);
      onClose();
    } catch (error) {
      Alert.alert('Export failed', 'Something went wrong while generating the PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end" style={{ backgroundColor: colors.backdrop }}>
        <View className="rounded-t-3xl p-5" style={{ backgroundColor: colors.sheetBackground, paddingBottom: Math.max(insets.bottom, 10) + 14 }}>
          <View className="w-10 h-1 rounded-full self-center mb-4" style={{ backgroundColor: colors.handleColor }} />
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>Export as PDF</Text>

          <Text className="text-sm mb-3" style={{ color: colors.textTertiary }}>Choose what to include in your report:</Text>

          <OptionRow
            label="Cycle history"
            description="Period dates and lengths"
            value={options.includeCycleHistory}
            onToggle={() => toggleOption('includeCycleHistory')}
          />
          <OptionRow
            label="Statistics"
            description="Averages, trends, variability"
            value={options.includeStatistics}
            onToggle={() => toggleOption('includeStatistics')}
          />
          <OptionRow
            label="Symptom patterns"
            description="Recurring symptom insights"
            value={options.includeSymptomPatterns}
            onToggle={() => toggleOption('includeSymptomPatterns')}
          />
          <OptionRow
            label="Mood data"
            description="Mood frequency overview"
            value={options.includeMoodData}
            onToggle={() => toggleOption('includeMoodData')}
          />

          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              className="flex-1 py-3.5 rounded-xl items-center"
              style={{ borderWidth: 1, borderColor: colors.border }}
              onPress={onClose}
              disabled={loading}
            >
              <Text className="text-base font-medium" style={{ color: colors.text }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3.5 rounded-xl items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-base font-medium" style={{ color: colors.onPrimary }}>Generate PDF</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function OptionRow({ label, description, value, onToggle }: {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}) {
  const { colors, isDark } = useTheme();
  return (
    <View className="flex-row items-center py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
      <View className="flex-1">
        <Text className="text-[15px] font-medium" style={{ color: colors.text }}>{label}</Text>
        <Text className="text-[13px]" style={{ color: colors.textTertiary }}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.surfaceTertiary, true: colors.switchActive }}
        thumbColor={value ? '#FFFFFF' : isDark ? '#9E9E9E' : '#F5F5F5'}
      />
    </View>
  );
}
