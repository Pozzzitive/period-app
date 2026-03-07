import React, { createContext, useContext, useMemo } from 'react';
import { View, useColorScheme } from 'react-native';
import { vars } from 'nativewind';
import { useSettingsStore } from '../stores/settings-store';
import { THEMES } from './themes';

import type { ThemeId, ThemeColors, ThemeContextValue } from './types';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function themeToVars(colors: ThemeColors) {
  return vars({
    '--color-background': colors.background,
    '--color-surface': colors.surface,
    '--color-surface-secondary': colors.surfaceSecondary,
    '--color-surface-tertiary': colors.surfaceTertiary,

    '--color-primary': colors.primary,
    '--color-primary-light': colors.primaryLight,
    '--color-primary-muted': colors.primaryMuted,
    '--color-on-primary': colors.onPrimary,

    '--color-foreground': colors.text,
    '--color-foreground-secondary': colors.textSecondary,
    '--color-foreground-tertiary': colors.textTertiary,
    '--color-foreground-muted': colors.textMuted,
    '--color-foreground-disabled': colors.textDisabled,

    '--color-border': colors.border,
    '--color-border-light': colors.borderLight,
    '--color-border-subtle': colors.borderSubtle,

    '--color-tab-bar-bg': colors.tabBarBackground,
    '--color-tab-bar-border': colors.tabBarBorder,
    '--color-tab-bar-active': colors.tabBarActive,
    '--color-tab-bar-inactive': colors.tabBarInactive,

    '--color-switch-active': colors.switchActive,
    '--color-selected-border': colors.selectedBorder,
    '--color-selected-bg': colors.selectedBackground,

    '--color-destructive': colors.destructive,
    '--color-destructive-light': colors.destructiveLight,
    '--color-success': colors.success,
    '--color-success-light': colors.successLight,
    '--color-warning': colors.warning,
    '--color-warning-light': colors.warningLight,
    '--color-warning-border': colors.warningBorder,
    '--color-info': colors.info,
    '--color-info-light': colors.infoLight,

    '--color-confidence-learning': colors.confidenceLearning,
    '--color-confidence-low': colors.confidenceLow,
    '--color-confidence-medium': colors.confidenceMedium,
    '--color-confidence-high': colors.confidenceHigh,

    '--color-shadow': colors.shadow,
    '--color-backdrop': colors.backdrop,
    '--color-sheet-bg': colors.sheetBackground,
    '--color-handle': colors.handleColor,

    '--color-phase-menstruation': colors.phases.menstruation.color,
    '--color-phase-menstruation-light': colors.phases.menstruation.lightColor,
    '--color-phase-follicular': colors.phases.follicular.color,
    '--color-phase-follicular-light': colors.phases.follicular.lightColor,
    '--color-phase-ovulation': colors.phases.ovulation.color,
    '--color-phase-ovulation-light': colors.phases.ovulation.lightColor,
    '--color-phase-luteal': colors.phases.luteal.color,
    '--color-phase-luteal-light': colors.phases.luteal.lightColor,
    '--color-phase-premenstrual': colors.phases.premenstrual.color,
    '--color-phase-premenstrual-light': colors.phases.premenstrual.lightColor,
  });
}

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const colorTheme = useSettingsStore((s) => s.settings.colorTheme);
  const themeMode = useSettingsStore((s) => s.settings.theme);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const themeId: ThemeId = colorTheme && THEMES[colorTheme] ? colorTheme : 'roseGarden';
  const themeDef = THEMES[themeId] ?? THEMES.roseGarden;

  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    // system
    return systemColorScheme === 'dark';
  }, [themeMode, systemColorScheme]);

  const colors: ThemeColors = isDark ? themeDef.dark : themeDef.light;

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeId,
      isDark,
      colors,
      setThemeId: (id: ThemeId) => updateSettings({ colorTheme: id }),
    }),
    [themeId, isDark, colors, updateSettings]
  );

  return (
    <View style={[{ flex: 1 }, themeToVars(colors)]}>
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    </View>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback for Expo Router race condition where child layouts
    // render before the root AppThemeProvider has mounted.
    const fallback = THEMES.roseGarden;
    return {
      themeId: 'roseGarden',
      isDark: false,
      colors: fallback.light,
      setThemeId: () => {},
    };
  }
  return ctx;
}
