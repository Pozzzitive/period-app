import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/src/theme';

const EMOJI_OPTIONS = [
  '💊', '💉', '🩺', '🩹', '🌡️', '🧘', '🏃', '💤',
  '🍎', '🥤', '💧', '🌸', '🌺', '🌻', '🍃', '🌿',
  '✨', '🔥', '❄️', '🌙', '☀️', '🌈', '⭐', '💫',
  '❤️', '💛', '💚', '💙', '💜', '🤍', '🖤', '💗',
  '😊', '😴', '🤢', '🤕', '😵', '🥴', '🤧', '🥵',
];

interface EmojiPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  const { colors } = useTheme();

  return (
    <ScrollView style={{ maxHeight: 200 }}>
      <View className="flex-row flex-wrap gap-2 p-1">
        {EMOJI_OPTIONS.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            className="w-11 h-11 rounded-xl items-center justify-center"
            style={{
              backgroundColor: selected === emoji ? colors.primaryMuted : colors.surface,
              borderWidth: 1,
              borderColor: selected === emoji ? colors.primary : colors.border,
            }}
            onPress={() => onSelect(emoji)}
          >
            <Text className="text-xl">{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
