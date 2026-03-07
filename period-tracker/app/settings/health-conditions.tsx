import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/src/stores';
import { HEALTH_CONDITIONS } from '@/src/constants/conditions';
import { useTheme } from '@/src/theme';

export default function HealthConditionsSettingsScreen() {
  const profile = useUserStore((s) => s.profile);
  const addCondition = useUserStore((s) => s.addHealthCondition);
  const removeCondition = useUserStore((s) => s.removeHealthCondition);
  const { colors } = useTheme();

  const toggleCondition = (id: string) => {
    if (profile.healthConditions.includes(id)) {
      removeCondition(id);
    } else {
      addCondition(id);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={{ color: colors.textSecondary, backgroundColor: colors.infoLight }} className="text-sm p-3.5 rounded-[10px] mb-4 leading-5">
        Tag diagnosed conditions that affect your cycle. This helps show relevant
        symptoms and insights. This data stays on your device.
      </Text>

      {HEALTH_CONDITIONS.map((condition) => {
        const selected = profile.healthConditions.includes(condition.id);
        return (
          <TouchableOpacity
            key={condition.id}
            style={{
              backgroundColor: selected ? colors.primaryMuted : colors.surface,
              borderWidth: 2,
              borderColor: selected ? colors.primary : colors.border,
            }}
            className="p-4 rounded-xl mb-2"
            onPress={() => toggleCondition(condition.id)}
          >
            <View className="flex-row justify-between items-center mb-1">
              <Text style={{ color: selected ? colors.primary : colors.text }} className={`text-[15px] font-semibold flex-1`}>
                {condition.label}
              </Text>
              <View style={{
                backgroundColor: selected ? colors.primary : undefined,
                borderWidth: 2,
                borderColor: selected ? colors.primary : colors.textDisabled,
              }} className="w-6 h-6 rounded-full justify-center items-center ml-3">
                {selected && <Ionicons name="checkmark" size={16} color={colors.onPrimary} />}
              </View>
            </View>
            <Text style={{ color: colors.textTertiary }} className="text-[13px]">{condition.description}</Text>
            {selected && (
              <Text style={{ color: colors.success }} className="text-[13px] mt-2 italic">{condition.insight}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
