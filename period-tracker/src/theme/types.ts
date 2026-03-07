import type { CyclePhase } from '../constants/phases';

export type ThemeId =
  | 'roseGarden'
  | 'oceanBreeze'
  | 'lavenderDreams'
  | 'coralSunset'
  | 'forestGlow'
  | 'goldenHour'
  | 'noir';

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;

  // Primary
  primary: string;
  primaryLight: string;
  primaryMuted: string;
  onPrimary: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  textDisabled: string;

  // Borders
  border: string;
  borderLight: string;
  borderSubtle: string;

  // Tab bar
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Interactive
  switchActive: string;
  selectedBorder: string;
  selectedBackground: string;

  // Semantic
  destructive: string;
  destructiveLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  warningBorder: string;
  info: string;
  infoLight: string;

  // Confidence
  confidenceLearning: string;
  confidenceLow: string;
  confidenceMedium: string;
  confidenceHigh: string;

  // Misc
  shadow: string;
  backdrop: string;
  sheetBackground: string;
  handleColor: string;

  // Phase colors
  phases: Record<CyclePhase, { color: string; lightColor: string }>;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  isPremium: boolean;
  preview: [string, string, string]; // 3 colors for the swatch preview
  light: ThemeColors;
  dark: ThemeColors;
}

export interface ThemeContextValue {
  themeId: ThemeId;
  isDark: boolean;
  colors: ThemeColors;
  setThemeId: (id: ThemeId) => void;
}
