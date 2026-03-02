import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../stores/settings-store';
import { THEMES } from './themes';
import { s, vs, fs } from '../utils/scale';
import type { ThemeId, ThemeColors, ThemeContextValue } from './types';

const ThemeContext = createContext<ThemeContextValue | null>(null);

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
    // Midnight is always dark
    if (themeId === 'midnight') return true;
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    // system
    return systemColorScheme === 'dark';
  }, [themeId, themeMode, systemColorScheme]);

  const colors: ThemeColors = isDark ? themeDef.dark : themeDef.light;

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeId,
      isDark,
      colors,
      setThemeId: (id: ThemeId) => updateSettings({ colorTheme: id }),
      s,
      vs,
      fs,
    }),
    [themeId, isDark, colors, updateSettings]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within AppThemeProvider');
  }
  return ctx;
}
