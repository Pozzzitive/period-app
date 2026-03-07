import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore, useSettingsStore } from '@/src/stores';
import { useTheme } from '@/src/theme';

export default function AgeSettingsScreen() {
  const { colors } = useTheme();
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [birthYear, setBirthYear] = useState(profile.birthYear?.toString() ?? '');

  const currentYear = new Date().getFullYear();
  const age = birthYear ? currentYear - parseInt(birthYear, 10) : null;
  const isValidAge = age !== null && age >= 9 && age <= 100;
  const isTeenager = age !== null && age >= 9 && age < 18;
  const isUnder16 = age !== null && age < 16;
  const hasChanged = birthYear !== (profile.birthYear?.toString() ?? '');

  const handleSave = () => {
    if (birthYear && isValidAge) {
      updateProfile({
        birthYear: parseInt(birthYear, 10),
        isTeenager,
      });
      if (isTeenager) {
        updateSettings({ fertilityTrackingEnabled: false, partnerSharingEnabled: false });
      }
    } else if (!birthYear) {
      updateProfile({ birthYear: undefined });
    }
  };

  const handleClear = () => {
    setBirthYear('');
    updateProfile({ birthYear: undefined, isTeenager: false });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 32,
      }}
    >
      <Text style={{ color: colors.text }} className="text-2xl font-bold mb-2">Age</Text>
      <Text style={{ color: colors.textSecondary }} className="text-[15px] mb-6">
        Your birth year helps us provide age-appropriate content.
      </Text>

      <View className="mb-5">
        <Text style={{ color: colors.text }} className="text-[15px] font-semibold mb-2">Birth year</Text>
        <TextInput
          style={{
            backgroundColor: colors.surface,
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            fontSize: 18,
            textAlign: 'center',
            color: colors.text,
          }}
          keyboardType="number-pad"
          placeholder="e.g. 2005"
          placeholderTextColor={colors.textMuted}
          value={birthYear}
          onChangeText={(text) => setBirthYear(text.replace(/[^0-9]/g, '').slice(0, 4))}
          maxLength={4}
        />
      </View>

      {age !== null && isValidAge && (
        <View style={{ backgroundColor: colors.surface }} className="p-4 rounded-xl mb-4">
          <Text style={{ color: colors.text }} className="text-base">
            Age: <Text className="font-semibold">{age} years old</Text>
          </Text>
        </View>
      )}

      {isUnder16 && (
        <View style={{ backgroundColor: colors.warningLight }} className="p-4 rounded-xl flex-row items-start gap-3 mb-4">
          <Ionicons name="shield-checkmark-outline" size={24} color={colors.warning} />
          <Text style={{ color: colors.warning }} className="flex-1 text-sm leading-5">
            Users under 16 have teenager mode enforced. Intimacy logging and fertility
            tracking are not available.
          </Text>
        </View>
      )}

      {isTeenager && !isUnder16 && (
        <View style={{ backgroundColor: colors.successLight }} className="p-4 rounded-xl flex-row items-start gap-3 mb-4">
          <Ionicons name="leaf-outline" size={24} color={colors.success} />
          <Text style={{ color: colors.success }} className="flex-1 text-sm leading-5">
            Teenager mode will be enabled with age-appropriate content. You can
            turn it off in teenager mode settings.
          </Text>
        </View>
      )}

      {birthYear.length === 4 && !isValidAge && (
        <Text style={{ color: colors.destructive }} className="text-sm mb-4">
          Please enter a valid birth year.
        </Text>
      )}

      <View className="flex-row gap-3 mt-2">
        {profile.birthYear && (
          <TouchableOpacity
            style={{ borderWidth: 1, borderColor: colors.primary }}
            className="flex-1 py-3.5 rounded-xl items-center"
            onPress={handleClear}
          >
            <Text style={{ color: colors.primary }} className="text-base font-semibold">Clear</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{ backgroundColor: colors.primary }}
          className={`flex-[2] py-3.5 rounded-xl items-center ${
            (!hasChanged || (birthYear.length > 0 && !isValidAge)) ? 'opacity-50' : ''
          }`}
          onPress={handleSave}
          disabled={!hasChanged || (birthYear.length > 0 && !isValidAge)}
        >
          <Text style={{ color: colors.onPrimary }} className="text-base font-semibold">Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
