import type { ThemeDefinition, ThemeColors } from './types';

// ============================================================
// Shared semantic colors
// ============================================================
const lightSemantics = {
  destructive: '#DC2626',
  destructiveLight: '#FEE2E2',
  success: '#059669',
  successLight: '#D1FAE5',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  warningBorder: '#FCD34D',
  info: '#2563EB',
  infoLight: '#DBEAFE',
  confidenceLearning: '#FEF3C7',
  confidenceLow: '#FFEBEE',
  confidenceMedium: '#E3F2FD',
  confidenceHigh: '#E8F5E9',
  shadow: '#000000',
};

const darkSemantics = {
  destructive: '#EF4444',
  destructiveLight: '#3D1F1F',
  success: '#10B981',
  successLight: '#1E3A28',
  warning: '#F5A623',
  warningLight: '#3A2E14',
  warningBorder: '#5A4420',
  info: '#60A5FA',
  infoLight: '#1A2A3A',
  confidenceLearning: '#3A2E14',
  confidenceLow: '#3D1F1F',
  confidenceMedium: '#1A2A3A',
  confidenceHigh: '#1E3A28',
  shadow: '#000000',
};

// ============================================================
// 1. Rose Garden (default — classic feminine warmth)
// ============================================================
export const roseGarden: ThemeDefinition = {
  id: 'roseGarden',
  name: 'Rose Garden',
  isPremium: false,
  preview: ['#D4587A', '#FFF7F8', '#FAE0E8'],
  light: {
    background: '#FFF7F8',
    surface: '#FFFFFF',
    surfaceSecondary: '#FFFAFB',
    surfaceTertiary: '#F2E6E8',

    primary: '#D4587A',
    primaryLight: '#FAE0E8',
    primaryMuted: '#FFF0F4',
    onPrimary: '#FFFFFF',

    text: '#2D1F24',
    textSecondary: '#5C4A52',
    textTertiary: '#8A7880',
    textMuted: '#A8969E',
    textDisabled: '#CBBFC4',

    border: '#E8D8DC',
    borderLight: '#F2EAEC',
    borderSubtle: '#EEDEE2',

    tabBarBackground: '#FFFAFB',
    tabBarBorder: '#EEDEE2',
    tabBarActive: '#D4587A',
    tabBarInactive: '#A8969E',

    switchActive: '#D4587A',
    selectedBorder: '#D4587A',
    selectedBackground: '#FAE0E8',

    ...lightSemantics,

    backdrop: 'rgba(0,0,0,0.3)',
    sheetBackground: '#FFFAFB',
    handleColor: '#CBBFC4',

    phases: {
      menstruation: { color: '#D4738C', lightColor: '#F5E0E6' },
      follicular: { color: '#6BAF9A', lightColor: '#DFF0EA' },
      ovulation: { color: '#A888C4', lightColor: '#EDE0F4' },
      luteal: { color: '#D4A06E', lightColor: '#F6E8D8' },
      premenstrual: { color: '#7E9BC4', lightColor: '#DEE8F4' },
    },
  },
  dark: {
    background: '#1A1517',
    surface: '#241F21',
    surfaceSecondary: '#1F1B1C',
    surfaceTertiary: '#302B2D',

    primary: '#E8758F',
    primaryLight: '#2E1D22',
    primaryMuted: '#261920',
    onPrimary: '#FFFFFF',

    text: '#EDE9EB',
    textSecondary: '#B5AEB1',
    textTertiary: '#847C7F',
    textMuted: '#706870',
    textDisabled: '#3D3839',

    border: '#302B2D',
    borderLight: '#262122',
    borderSubtle: '#2B2526',

    tabBarBackground: '#181315',
    tabBarBorder: '#262122',
    tabBarActive: '#E8758F',
    tabBarInactive: '#5E5658',

    switchActive: '#E8758F',
    selectedBorder: '#E8758F',
    selectedBackground: '#2E1D22',

    ...darkSemantics,

    backdrop: 'rgba(0,0,0,0.5)',
    sheetBackground: '#241F21',
    handleColor: '#3D3839',

    phases: {
      menstruation: { color: '#D4738C', lightColor: '#322028' },
      follicular: { color: '#6BAF9A', lightColor: '#1E302A' },
      ovulation: { color: '#A888C4', lightColor: '#2A2040' },
      luteal: { color: '#D4A06E', lightColor: '#302618' },
      premenstrual: { color: '#7E9BC4', lightColor: '#1E2838' },
    },
  },
};

// ============================================================
// 2. Ocean Breeze (fresh, spa-like — cool teal)
// ============================================================
export const oceanBreeze: ThemeDefinition = {
  id: 'oceanBreeze',
  name: 'Ocean Breeze',
  isPremium: true,
  preview: ['#0D9488', '#F0FDFA', '#CCFBF1'],
  light: {
    background: '#F0FDFA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5FEFB',
    surfaceTertiary: '#E0F2EE',

    primary: '#0D9488',
    primaryLight: '#CCFBF1',
    primaryMuted: '#E6FBF6',
    onPrimary: '#FFFFFF',

    text: '#132E2A',
    textSecondary: '#3A5854',
    textTertiary: '#5E7E7A',
    textMuted: '#88A8A4',
    textDisabled: '#B4CECC',

    border: '#C6E8E4',
    borderLight: '#DDF0EE',
    borderSubtle: '#D2ECE8',

    tabBarBackground: '#F5FEFB',
    tabBarBorder: '#D2ECE8',
    tabBarActive: '#0D9488',
    tabBarInactive: '#88A8A4',

    switchActive: '#0D9488',
    selectedBorder: '#0D9488',
    selectedBackground: '#CCFBF1',

    ...lightSemantics,

    backdrop: 'rgba(0,0,0,0.3)',
    sheetBackground: '#F5FEFB',
    handleColor: '#B4CECC',

    phases: {
      menstruation: { color: '#D4738C', lightColor: '#F5E0E6' },
      follicular: { color: '#0D9488', lightColor: '#CCFBF1' },
      ovulation: { color: '#7C6FB0', lightColor: '#E8E0F4' },
      luteal: { color: '#C8944E', lightColor: '#F6E8D2' },
      premenstrual: { color: '#5B8DB8', lightColor: '#D8E8F4' },
    },
  },
  dark: {
    background: '#121819',
    surface: '#1C2324',
    surfaceSecondary: '#161D1E',
    surfaceTertiary: '#262E30',

    primary: '#2DD4BF',
    primaryLight: '#162824',
    primaryMuted: '#121F1C',
    onPrimary: '#042F2E',

    text: '#E8EDEC',
    textSecondary: '#A6BAB7',
    textTertiary: '#6E8482',
    textMuted: '#6A8280',
    textDisabled: '#324644',

    border: '#262E30',
    borderLight: '#1E2628',
    borderSubtle: '#222A2C',

    tabBarBackground: '#101617',
    tabBarBorder: '#1E2628',
    tabBarActive: '#2DD4BF',
    tabBarInactive: '#4E6462',

    switchActive: '#2DD4BF',
    selectedBorder: '#2DD4BF',
    selectedBackground: '#162824',

    ...darkSemantics,

    backdrop: 'rgba(0,0,0,0.5)',
    sheetBackground: '#1C2324',
    handleColor: '#324644',

    phases: {
      menstruation: { color: '#D4738C', lightColor: '#302028' },
      follicular: { color: '#0D9488', lightColor: '#162824' },
      ovulation: { color: '#7C6FB0', lightColor: '#262040' },
      luteal: { color: '#C8944E', lightColor: '#2E2618' },
      premenstrual: { color: '#5B8DB8', lightColor: '#1E2838' },
    },
  },
};

// ============================================================
// 4. Lavender Dreams (cool-toned wellness — modern, Gen Z)
// ============================================================
export const lavenderDreams: ThemeDefinition = {
  id: 'lavenderDreams',
  name: 'Lavender Dreams',
  isPremium: true,
  preview: ['#8B5FBF', '#F8F5FC', '#E8DAFA'],
  light: {
    background: '#F8F5FC',
    surface: '#FFFFFF',
    surfaceSecondary: '#FBF9FD',
    surfaceTertiary: '#EDE6F4',

    primary: '#8B5FBF',
    primaryLight: '#E8DAFA',
    primaryMuted: '#F3EEFA',
    onPrimary: '#FFFFFF',

    text: '#1E1430',
    textSecondary: '#4A3D5C',
    textTertiary: '#7A6E8C',
    textMuted: '#9E94AE',
    textDisabled: '#C4BED0',

    border: '#DDD4EA',
    borderLight: '#EDE8F4',
    borderSubtle: '#E6DEF0',

    tabBarBackground: '#FBF9FD',
    tabBarBorder: '#E6DEF0',
    tabBarActive: '#8B5FBF',
    tabBarInactive: '#9E94AE',

    switchActive: '#8B5FBF',
    selectedBorder: '#8B5FBF',
    selectedBackground: '#E8DAFA',

    ...lightSemantics,

    backdrop: 'rgba(0,0,0,0.3)',
    sheetBackground: '#FBF9FD',
    handleColor: '#C4BED0',

    phases: {
      menstruation: { color: '#D0788E', lightColor: '#F4E2E8' },
      follicular: { color: '#6EB4A0', lightColor: '#E0F2EC' },
      ovulation: { color: '#A480C8', lightColor: '#E8DCF6' },
      luteal: { color: '#D0A474', lightColor: '#F6EAD8' },
      premenstrual: { color: '#7C9CC8', lightColor: '#DCE8F6' },
    },
  },
  dark: {
    background: '#151419',
    surface: '#211F25',
    surfaceSecondary: '#1B191E',
    surfaceTertiary: '#2C2A32',

    primary: '#B08AE6',
    primaryLight: '#252038',
    primaryMuted: '#1E1A2C',
    onPrimary: '#FFFFFF',

    text: '#ECEAF0',
    textSecondary: '#B0AAC0',
    textTertiary: '#7E7894',
    textMuted: '#726C88',
    textDisabled: '#3C3850',

    border: '#2C2A32',
    borderLight: '#232130',
    borderSubtle: '#282630',

    tabBarBackground: '#131218',
    tabBarBorder: '#232130',
    tabBarActive: '#B08AE6',
    tabBarInactive: '#5C567A',

    switchActive: '#B08AE6',
    selectedBorder: '#B08AE6',
    selectedBackground: '#252038',

    ...darkSemantics,

    backdrop: 'rgba(0,0,0,0.5)',
    sheetBackground: '#211F25',
    handleColor: '#3C3850',

    phases: {
      menstruation: { color: '#D0788E', lightColor: '#302028' },
      follicular: { color: '#6EB4A0', lightColor: '#1E302A' },
      ovulation: { color: '#A480C8', lightColor: '#2A2040' },
      luteal: { color: '#D0A474', lightColor: '#2E2618' },
      premenstrual: { color: '#7C9CC8', lightColor: '#1E2838' },
    },
  },
};

// ============================================================
// 5. Coral Sunset (warm, energetic — Flo-inspired)
// ============================================================
export const coralSunset: ThemeDefinition = {
  id: 'coralSunset',
  name: 'Coral Sunset',
  isPremium: true,
  preview: ['#E8685A', '#FFFAF8', '#FDE2DD'],
  light: {
    background: '#FFFAF8',
    surface: '#FFFFFF',
    surfaceSecondary: '#FFFCFA',
    surfaceTertiary: '#F4EAE6',

    primary: '#E8685A',
    primaryLight: '#FDE2DD',
    primaryMuted: '#FFF2EF',
    onPrimary: '#FFFFFF',

    text: '#2C1E1A',
    textSecondary: '#5C4840',
    textTertiary: '#8A786E',
    textMuted: '#A89890',
    textDisabled: '#CCBEB8',

    border: '#E8DCD6',
    borderLight: '#F2EAE6',
    borderSubtle: '#EEE4DE',

    tabBarBackground: '#FFFCFA',
    tabBarBorder: '#EEE4DE',
    tabBarActive: '#E8685A',
    tabBarInactive: '#A89890',

    switchActive: '#E8685A',
    selectedBorder: '#E8685A',
    selectedBackground: '#FDE2DD',

    ...lightSemantics,

    backdrop: 'rgba(0,0,0,0.3)',
    sheetBackground: '#FFFCFA',
    handleColor: '#CCBEB8',

    phases: {
      menstruation: { color: '#D86E88', lightColor: '#F6DCE2' },
      follicular: { color: '#66AE96', lightColor: '#DCEEE6' },
      ovulation: { color: '#AC88C0', lightColor: '#EEE0F2' },
      luteal: { color: '#D8A068', lightColor: '#F6E6D4' },
      premenstrual: { color: '#7E98C0', lightColor: '#DEE6F0' },
    },
  },
  dark: {
    background: '#191615',
    surface: '#242120',
    surfaceSecondary: '#1E1B1A',
    surfaceTertiary: '#302D2C',

    primary: '#F0806E',
    primaryLight: '#2E1E1A',
    primaryMuted: '#261816',
    onPrimary: '#FFFFFF',

    text: '#EDEAE8',
    textSecondary: '#B8AEA8',
    textTertiary: '#847C76',
    textMuted: '#706860',
    textDisabled: '#3E3A38',

    border: '#302D2C',
    borderLight: '#262322',
    borderSubtle: '#2C2928',

    tabBarBackground: '#171413',
    tabBarBorder: '#262322',
    tabBarActive: '#F0806E',
    tabBarInactive: '#5E5650',

    switchActive: '#F0806E',
    selectedBorder: '#F0806E',
    selectedBackground: '#2E1E1A',

    ...darkSemantics,

    backdrop: 'rgba(0,0,0,0.5)',
    sheetBackground: '#242120',
    handleColor: '#3E3A38',

    phases: {
      menstruation: { color: '#D86E88', lightColor: '#302028' },
      follicular: { color: '#66AE96', lightColor: '#1E302A' },
      ovulation: { color: '#AC88C0', lightColor: '#2A2040' },
      luteal: { color: '#D8A068', lightColor: '#2E2618' },
      premenstrual: { color: '#7E98C0', lightColor: '#1E2838' },
    },
  },
};

// ============================================================
// 6. Forest Glow (natural, earthy — emerald green)
// ============================================================
export const forestGlow: ThemeDefinition = {
  id: 'forestGlow',
  name: 'Forest Glow',
  isPremium: true,
  preview: ['#059669', '#F0FDF4', '#D1FAE5'],
  light: {
    background: '#F0FDF4',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5FEF8',
    surfaceTertiary: '#DCEFDF',

    primary: '#059669',
    primaryLight: '#D1FAE5',
    primaryMuted: '#E6F9EE',
    onPrimary: '#FFFFFF',

    text: '#14291A',
    textSecondary: '#365040',
    textTertiary: '#5A7C66',
    textMuted: '#84A890',
    textDisabled: '#B0CEB8',

    border: '#C2E4CC',
    borderLight: '#D8F0DE',
    borderSubtle: '#CEE8D6',

    tabBarBackground: '#F5FEF8',
    tabBarBorder: '#CEE8D6',
    tabBarActive: '#059669',
    tabBarInactive: '#84A890',

    switchActive: '#059669',
    selectedBorder: '#059669',
    selectedBackground: '#D1FAE5',

    ...lightSemantics,

    backdrop: 'rgba(0,0,0,0.3)',
    sheetBackground: '#F5FEF8',
    handleColor: '#B0CEB8',

    phases: {
      menstruation: { color: '#D4738C', lightColor: '#F5E0E6' },
      follicular: { color: '#059669', lightColor: '#D1FAE5' },
      ovulation: { color: '#8878B4', lightColor: '#E8E0F4' },
      luteal: { color: '#C8944E', lightColor: '#F6E8D2' },
      premenstrual: { color: '#5B8DB8', lightColor: '#D8E8F4' },
    },
  },
  dark: {
    background: '#141816',
    surface: '#1D2220',
    surfaceSecondary: '#181C1A',
    surfaceTertiary: '#272C2A',

    primary: '#34D399',
    primaryLight: '#182A22',
    primaryMuted: '#152018',
    onPrimary: '#052E18',

    text: '#E8ECEB',
    textSecondary: '#A8B2AE',
    textTertiary: '#6E7E78',
    textMuted: '#687870',
    textDisabled: '#343C38',

    border: '#272C2A',
    borderLight: '#212624',
    borderSubtle: '#242A28',

    tabBarBackground: '#121614',
    tabBarBorder: '#212624',
    tabBarActive: '#34D399',
    tabBarInactive: '#4E5C56',

    switchActive: '#34D399',
    selectedBorder: '#34D399',
    selectedBackground: '#182A22',

    ...darkSemantics,

    backdrop: 'rgba(0,0,0,0.5)',
    sheetBackground: '#1D2220',
    handleColor: '#343C38',

    phases: {
      menstruation: { color: '#D4738C', lightColor: '#302028' },
      follicular: { color: '#059669', lightColor: '#182A22' },
      ovulation: { color: '#8878B4', lightColor: '#262040' },
      luteal: { color: '#C8944E', lightColor: '#2E2618' },
      premenstrual: { color: '#5B8DB8', lightColor: '#1E2838' },
    },
  },
};

// ============================================================
// 7. Golden Hour (warm, cozy — amber sunset)
// ============================================================
export const goldenHour: ThemeDefinition = {
  id: 'goldenHour',
  name: 'Golden Hour',
  isPremium: true,
  preview: ['#D97706', '#FFFBEB', '#FDE68A'],
  light: {
    background: '#FFFBEB',
    surface: '#FFFFFF',
    surfaceSecondary: '#FFFDF0',
    surfaceTertiary: '#F0E6D0',

    primary: '#D97706',
    primaryLight: '#FDE68A',
    primaryMuted: '#FEF3C7',
    onPrimary: '#FFFFFF',

    text: '#2C1E08',
    textSecondary: '#5C4A2A',
    textTertiary: '#8A7450',
    textMuted: '#A89870',
    textDisabled: '#CCB898',

    border: '#E8DCC0',
    borderLight: '#F2EADA',
    borderSubtle: '#EEE4CE',

    tabBarBackground: '#FFFDF0',
    tabBarBorder: '#EEE4CE',
    tabBarActive: '#D97706',
    tabBarInactive: '#A89870',

    switchActive: '#D97706',
    selectedBorder: '#D97706',
    selectedBackground: '#FDE68A',

    ...lightSemantics,

    backdrop: 'rgba(0,0,0,0.3)',
    sheetBackground: '#FFFDF0',
    handleColor: '#CCB898',

    phases: {
      menstruation: { color: '#D4738C', lightColor: '#F5E0E6' },
      follicular: { color: '#6BAF9A', lightColor: '#DFF0EA' },
      ovulation: { color: '#8878B4', lightColor: '#E8E0F4' },
      luteal: { color: '#D97706', lightColor: '#FDE68A' },
      premenstrual: { color: '#5B8DB8', lightColor: '#D8E8F4' },
    },
  },
  dark: {
    background: '#191816',
    surface: '#242220',
    surfaceSecondary: '#1E1C1A',
    surfaceTertiary: '#302E2C',

    primary: '#FBBF24',
    primaryLight: '#2A2410',
    primaryMuted: '#221C0E',
    onPrimary: '#422006',

    text: '#EDE9E4',
    textSecondary: '#B8AE98',
    textTertiary: '#8A8068',
    textMuted: '#7A7060',
    textDisabled: '#464030',

    border: '#302E2C',
    borderLight: '#262420',
    borderSubtle: '#2C2A26',

    tabBarBackground: '#171615',
    tabBarBorder: '#262420',
    tabBarActive: '#FBBF24',
    tabBarInactive: '#685E48',

    switchActive: '#FBBF24',
    selectedBorder: '#FBBF24',
    selectedBackground: '#2A2410',

    ...darkSemantics,

    backdrop: 'rgba(0,0,0,0.5)',
    sheetBackground: '#242220',
    handleColor: '#464030',

    phases: {
      menstruation: { color: '#D4738C', lightColor: '#302028' },
      follicular: { color: '#6BAF9A', lightColor: '#1E302A' },
      ovulation: { color: '#8878B4', lightColor: '#262040' },
      luteal: { color: '#D97706', lightColor: '#2A2410' },
      premenstrual: { color: '#5B8DB8', lightColor: '#1E2838' },
    },
  },
};

// ============================================================
// 8. Noir (minimal, true-black — vivid accents)
// ============================================================
export const noir: ThemeDefinition = {
  id: 'noir',
  name: 'Noir',
  isPremium: true,
  preview: ['#60A5FA', '#F9FAFB', '#E5E7EB'],
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceSecondary: '#FCFCFD',
    surfaceTertiary: '#F0F1F3',

    primary: '#60A5FA',
    primaryLight: '#DBEAFE',
    primaryMuted: '#EFF6FF',
    onPrimary: '#FFFFFF',

    text: '#111827',
    textSecondary: '#4B5563',
    textTertiary: '#6B7280',
    textMuted: '#9CA3AF',
    textDisabled: '#D1D5DB',

    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    borderSubtle: '#ECEDF0',

    tabBarBackground: '#FCFCFD',
    tabBarBorder: '#ECEDF0',
    tabBarActive: '#60A5FA',
    tabBarInactive: '#9CA3AF',

    switchActive: '#60A5FA',
    selectedBorder: '#60A5FA',
    selectedBackground: '#DBEAFE',

    ...lightSemantics,

    backdrop: 'rgba(0,0,0,0.3)',
    sheetBackground: '#FCFCFD',
    handleColor: '#D1D5DB',

    phases: {
      menstruation: { color: '#D27890', lightColor: '#F4E2E8' },
      follicular: { color: '#6CB2A0', lightColor: '#E0F0EC' },
      ovulation: { color: '#A68AC6', lightColor: '#ECE2F4' },
      luteal: { color: '#D2A470', lightColor: '#F4E8DA' },
      premenstrual: { color: '#8098C4', lightColor: '#E0E8F4' },
    },
  },
  dark: {
    background: '#000000',
    surface: '#111111',
    surfaceSecondary: '#0A0A0A',
    surfaceTertiary: '#1A1A1A',

    primary: '#60A5FA',
    primaryLight: '#152030',
    primaryMuted: '#0E1824',
    onPrimary: '#000000',

    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    textMuted: '#6B7280',
    textDisabled: '#374151',

    border: '#1F1F1F',
    borderLight: '#171717',
    borderSubtle: '#1A1A1A',

    tabBarBackground: '#000000',
    tabBarBorder: '#171717',
    tabBarActive: '#60A5FA',
    tabBarInactive: '#6B7280',

    switchActive: '#60A5FA',
    selectedBorder: '#60A5FA',
    selectedBackground: '#152030',

    ...darkSemantics,

    backdrop: 'rgba(0,0,0,0.6)',
    sheetBackground: '#111111',
    handleColor: '#374151',

    phases: {
      menstruation: { color: '#D27890', lightColor: '#401C2C' },
      follicular: { color: '#6CB2A0', lightColor: '#1A3C32' },
      ovulation: { color: '#A68AC6', lightColor: '#322048' },
      luteal: { color: '#D2A470', lightColor: '#403018' },
      premenstrual: { color: '#8098C4', lightColor: '#1E2E48' },
    },
  },
};

// ============================================================
// Theme registry
// ============================================================
export const THEMES: Record<string, ThemeDefinition> = {
  roseGarden,
  oceanBreeze,
  lavenderDreams,
  coralSunset,
  forestGlow,
  goldenHour,
  noir,
};

export const THEME_LIST: ThemeDefinition[] = [
  roseGarden,
  oceanBreeze,
  lavenderDreams,
  coralSunset,
  forestGlow,
  goldenHour,
  noir,
];
