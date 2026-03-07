import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useCustomSymptomStore } from '@/src/stores/custom-symptom-store';
import { EmojiPicker } from '@/src/components/settings/EmojiPicker';
import { useTheme } from '@/src/theme';

export default function CustomSymptomsScreen() {
  const { colors } = useTheme();
  const customSymptoms = useCustomSymptomStore((s) => s.customSymptoms);
  const addCustomSymptom = useCustomSymptomStore((s) => s.addCustomSymptom);
  const updateCustomSymptom = useCustomSymptomStore((s) => s.updateCustomSymptom);
  const deleteCustomSymptom = useCustomSymptomStore((s) => s.deleteCustomSymptom);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✨');

  const resetForm = () => {
    setName('');
    setEmoji('✨');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter a name for your symptom.');
      return;
    }

    if (editingId) {
      updateCustomSymptom(editingId, { label: trimmed, icon: emoji });
    } else {
      const result = addCustomSymptom(trimmed, emoji);
      if (!result) {
        Alert.alert('Limit reached', 'You can have up to 50 custom symptoms.');
        return;
      }
    }
    resetForm();
  };

  const handleEdit = (id: string) => {
    const symptom = customSymptoms.find((s) => s.id === id);
    if (!symptom) return;
    setEditingId(id);
    setName(symptom.label);
    setEmoji(symptom.icon);
    setIsAdding(true);
  };

  const handleDelete = (id: string, label: string) => {
    Alert.alert('Delete symptom', `Remove "${label}"? Existing logs will keep the data.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCustomSymptom(id) },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={{ color: colors.textTertiary }} className="text-sm mb-4">
        Create custom symptoms to track alongside built-in ones. They appear in your day log under a "Custom" category.
      </Text>

      {/* Existing custom symptoms */}
      {customSymptoms.map((symptom) => (
        <View key={symptom.id} style={{ backgroundColor: colors.surface }} className="flex-row items-center p-4 rounded-xl mb-1.5">
          <Text className="text-xl mr-3">{symptom.icon}</Text>
          <Text style={{ color: colors.text }} className="flex-1 text-base font-medium">{symptom.label}</Text>
          <TouchableOpacity onPress={() => handleEdit(symptom.id)} className="px-3 py-1">
            <Text style={{ color: colors.primary }} className="text-sm">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(symptom.id, symptom.label)} className="px-3 py-1">
            <Text style={{ color: colors.destructive }} className="text-sm">Delete</Text>
          </TouchableOpacity>
        </View>
      ))}

      {customSymptoms.length === 0 && !isAdding && (
        <View style={{ backgroundColor: colors.surface }} className="p-5 rounded-[14px] mb-3 items-center">
          <Text style={{ color: colors.textMuted }} className="text-sm">No custom symptoms yet</Text>
        </View>
      )}

      {/* Add/Edit form */}
      {isAdding ? (
        <View style={{ backgroundColor: colors.surface }} className="p-4 rounded-xl mt-3">
          <Text style={{ color: colors.text }} className="text-base font-semibold mb-3">
            {editingId ? 'Edit symptom' : 'New symptom'}
          </Text>

          <Text style={{ color: colors.textTertiary }} className="text-sm font-medium mb-1">Name</Text>
          <TextInput
            style={{
              backgroundColor: colors.background,
              padding: 12,
              borderRadius: 8,
              fontSize: 15,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 12,
            }}
            placeholder="e.g., Brain fog"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={30}
            autoFocus
          />

          <Text style={{ color: colors.textTertiary }} className="text-sm font-medium mb-1">Icon</Text>
          <EmojiPicker selected={emoji} onSelect={setEmoji} />

          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              style={{ borderWidth: 1, borderColor: colors.border }}
              className="flex-1 py-3 rounded-xl items-center"
              onPress={resetForm}
            >
              <Text style={{ color: colors.text }} className="text-base font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: colors.primary }}
              className="flex-1 py-3 rounded-xl items-center"
              onPress={handleSave}
            >
              <Text style={{ color: colors.onPrimary }} className="text-base font-medium">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={{ borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed' }}
          className="mt-3 py-3 rounded-xl items-center"
          onPress={() => setIsAdding(true)}
        >
          <Text style={{ color: colors.primary }} className="text-base font-medium">+ Add custom symptom</Text>
        </TouchableOpacity>
      )}

      <Text style={{ color: colors.textDisabled }} className="text-xs mt-4 text-center">
        {customSymptoms.length} / 50 custom symptoms
      </Text>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
