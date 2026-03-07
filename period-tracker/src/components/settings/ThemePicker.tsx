import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, THEME_LIST } from '../../theme';
import type { ThemeDefinition } from '../../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function ThemePicker() {
  const { colors, themeId, setThemeId } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const currentTheme = THEME_LIST.find((t) => t.id === themeId) ?? THEME_LIST[0];

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((e) => !e);
  };

  const handleSelect = (theme: ThemeDefinition) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setThemeId(theme.id);
    setExpanded(false);
  };

  return (
    <View>
      {/* Current theme header — tap to expand */}
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={handleToggle} activeOpacity={0.6}>
        <View className="flex-row w-12 h-7 rounded-lg overflow-hidden">
          {currentTheme.preview.map((color, i) => (
            <View key={i} className="flex-1" style={{ backgroundColor: color }} />
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{currentTheme.name}</Text>
          <Text style={{ fontSize: 12, marginTop: 1, color: colors.textMuted }}>Tap to {expanded ? 'close' : 'change'}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {/* Expanded list */}
      {expanded && (
        <View className="mt-3 gap-1">
          {THEME_LIST.map((theme) => {
            const isActive = themeId === theme.id;
            return (
              <TouchableOpacity
                key={theme.id}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, gap: 12, backgroundColor: isActive ? colors.primaryMuted : undefined }}
                onPress={() => handleSelect(theme)}
                activeOpacity={0.6}
              >
                <View className="flex-row w-9 h-[22px] rounded-[6px] overflow-hidden">
                  {theme.preview.map((color, i) => (
                    <View key={i} className="flex-1" style={{ backgroundColor: color }} />
                  ))}
                </View>
                <Text style={{ flex: 1, fontSize: 14, color: isActive ? colors.primary : colors.textSecondary, fontWeight: isActive ? '700' : '500' }}>
                  {theme.name}
                </Text>
                {theme.isPremium && !isActive && (
                  <Ionicons name="lock-closed" size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                )}
                {isActive && (
                  <View className="w-[22px] h-[22px] rounded-full items-center justify-center" style={{ backgroundColor: colors.primary }}>
                    <Ionicons name="checkmark" size={14} color={colors.onPrimary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
