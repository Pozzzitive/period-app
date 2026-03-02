import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, THEME_LIST } from '../../theme';
import type { ThemeColors, ThemeDefinition } from '../../theme';
import { s, fs } from '@/src/utils/scale';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function ThemePicker() {
  const { colors, themeId, setThemeId } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const styles = useMemo(() => createStyles(colors), [colors]);

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
      <TouchableOpacity style={styles.header} onPress={handleToggle} activeOpacity={0.6}>
        <View style={styles.previewBar}>
          {currentTheme.preview.map((color, i) => (
            <View key={i} style={[styles.previewSegment, { backgroundColor: color }]} />
          ))}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerName}>{currentTheme.name}</Text>
          <Text style={styles.headerHint}>Tap to {expanded ? 'close' : 'change'}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={s(18)}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {/* Expanded list */}
      {expanded && (
        <View style={styles.list}>
          {THEME_LIST.map((theme) => {
            const isActive = themeId === theme.id;
            return (
              <TouchableOpacity
                key={theme.id}
                style={[styles.row, isActive && styles.rowActive]}
                onPress={() => handleSelect(theme)}
                activeOpacity={0.6}
              >
                <View style={styles.rowPreviewBar}>
                  {theme.preview.map((color, i) => (
                    <View key={i} style={[styles.rowPreviewSegment, { backgroundColor: color }]} />
                  ))}
                </View>
                <Text style={[styles.rowName, isActive && styles.rowNameActive]}>
                  {theme.name}
                </Text>
                {theme.isPremium && !isActive && (
                  <Ionicons name="lock-closed" size={s(12)} color={colors.textMuted} style={styles.lockIcon} />
                )}
                {isActive && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={s(14)} color={colors.onPrimary} />
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
    },
    previewBar: {
      flexDirection: 'row',
      width: s(48),
      height: s(28),
      borderRadius: s(8),
      overflow: 'hidden',
    },
    previewSegment: {
      flex: 1,
    },
    headerText: {
      flex: 1,
    },
    headerName: {
      fontSize: fs(15),
      fontWeight: '600',
      color: colors.text,
    },
    headerHint: {
      fontSize: fs(12),
      color: colors.textMuted,
      marginTop: s(1),
    },
    list: {
      marginTop: s(12),
      gap: s(4),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: s(10),
      paddingHorizontal: s(10),
      borderRadius: s(10),
      gap: s(12),
    },
    rowActive: {
      backgroundColor: colors.primaryMuted,
    },
    rowPreviewBar: {
      flexDirection: 'row',
      width: s(36),
      height: s(22),
      borderRadius: s(6),
      overflow: 'hidden',
    },
    rowPreviewSegment: {
      flex: 1,
    },
    rowName: {
      flex: 1,
      fontSize: fs(14),
      fontWeight: '500',
      color: colors.textSecondary,
    },
    rowNameActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    lockIcon: {
      marginRight: s(4),
    },
    checkmark: {
      width: s(22),
      height: s(22),
      borderRadius: s(11),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
