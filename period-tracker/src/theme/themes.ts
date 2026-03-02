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
    background: '#1A1114',
    surface: '#2A1E22',
    surfaceSecondary: '#221618',
    surfaceTertiary: '#3A2C2E',

    primary: '#F06B8A',
    primaryLight: '#3D1F28',
    primaryMuted: '#2E1820',
    onPrimary: '#FFFFFF',

    text: '#F2E6EA',
    textSecondary: '#C4AAB4',
    textTertiary: '#8A7E7E',
    textMuted: '#6A5E5E',
    textDisabled: '#4A4040',

    border: '#3A2C2E',
    borderLight: '#2E2224',
    borderSubtle: '#332628',

    tabBarBackground: '#1A1114',
    tabBarBorder: '#2E2224',
    tabBarActive: '#F06B8A',
    tabBarInactive: '#6A5E5E',

    switchActive: '#F06B8A',
    selectedBorder: '#F06B8A',
    selectedBackground: '#3D1F28',

    ...darkSemantics,

    backdrop: 'rgba(0,0,0,0.5)',
    sheetBackground: '#2A1E22',
    handleColor: '#4A4040',

    phases: {
      menstruation: { color: '#E8A0B4', lightColor: '#4C2030' },
      follicular: { color: '#8CC8B4', lightColor: '#1E3E34' },
      ovulation: { color: '#C4A0DA', lightColor: '#36224A' },
      luteal: { color: '#E8B88A', lightColor: '#44321C' },
      premenstrual: { color: '#9CB4DA', lightColor: '#22304A' },
    },
  },
};

// ============================================================
// 2. Midnight (always dark — moody)
// ============================================================
export const midnight: ThemeDefinition = {
  id: 'midnight',
  name: 'Midnight',
  isPremium: false,
  preview: ['#F06B8A', '#120C0E', '#221618'],
  light: {
    ...roseGarden.dark,
  },
  dark: {
    ...roseGarden.dark,
    background: '#120C0E',
    surface: '#221618',
    surfaceSecondary: '#1A1012',
    surfaceTertiary: '#2E2224',
    sheetBackground: '#221618',

    phases: {
      menstruation: { color: '#E09CB0', lightColor: '#4A2032' },
      follicular: { color: '#88C4B0', lightColor: '#1C3C32' },
      ovulation: { color: '#C09CD8', lightColor: '#342248' },
      luteal: { color: '#E4B488', lightColor: '#42301A' },
      premenstrual: { color: '#98B0D8', lightColor: '#203048' },
    },
  },
};

// ============================================================
// 3. Cherry Blossom (sakura-inspired — elegant, romantic)
// ============================================================
export const cherryBlossom: ThemeDefinition = {
  id: 'cherryBlossom',
  name: 'Cherry Blossom',
  isPremium: true,
  preview: ['#C75B7A', '#FDF8F9', '#F8DDE4'],
  light: {
    background: '#FDF8F9',
    surface: '#FFFFFF',
    surfaceSecondary: '#FEFBFC',
    surfaceTertiary: '#F4E8EC',

    primary: '#C75B7A',
    primaryLight: '#F8DDE4',
    primaryMuted: '#FFF0F3',
    onPrimary: '#FFFFFF',

    text: '#2A1820',
    textSecondary: '#584350',
    textTertiary: '#886E7C',
    textMuted: '#A69098',
    textDisabled: '#C8B8C0',

    border: '#E8D4DC',
    borderLight: '#F2E8EC',
    borderSubtle: '#EEE0E6',

    tabBarBackground: '#FEFBFC',
    tabBarBorder: '#EEE0E6',
    tabBarActive: '#C75B7A',
    tabBarInactive: '#A69098',

    switchActive: '#C75B7A',
    selectedBorder: '#C75B7A',
    selectedBackground: '#F8DDE4',

    ...lightSemantics,

    backdrop: 'rgba(0,0,0,0.3)',
    sheetBackground: '#FEFBFC',
    handleColor: '#C8B8C0',

    phases: {
      menstruation: { color: '#D87090', lightColor: '#F6DDE6' },
      follicular: { color: '#68B098', lightColor: '#DDEEE8' },
      ovulation: { color: '#AA86C8', lightColor: '#ECE0F6' },
      luteal: { color: '#D89E6C', lightColor: '#F4E6D6' },
      premenstrual: { color: '#7C98C0', lightColor: '#DCE6F2' },
    },
  },
  dark: {
    background: '#180E12',
    surface: '#281C22',
    surfaceSecondary: '#201418',
    surfaceTertiary: '#382830',

    primary: '#E88BA0',
    primaryLight: '#3A1E28',
    primaryMuted: '#2C1620',
    onPrimary: '#FFFFFF',

    text: '#F4E8EC',
    textSecondary: '#C8A8B4',
    textTertiary: '#8A7080',
    textMuted: '#6A5060',
    textDisabled: '#4A3840',

    border: '#382830',
    borderLight: '#2C2028',
    borderSubtle: '#322428',

    tabBarBackground: '#180E12',
    tabBarBorder: '#2C2028',
    tabBarActive: '#E88BA0',
    tabBarInactive: '#6A5060',

    switchActive: '#E88BA0',
    selectedBorder: '#E88BA0',
    selectedBackground: '#3A1E28',

    ...darkSemantics,

    backdrop: 'rgba(0,0,0,0.5)',
    sheetBackground: '#281C22',
    handleColor: '#4A3840',

    phases: {
      menstruation: { color: '#E8A0B4', lightColor: '#4C2030' },
      follicular: { color: '#8CC8B4', lightColor: '#1E3E34' },
      ovulation: { color: '#C4A0DA', lightColor: '#36224A' },
      luteal: { color: '#E8B88A', lightColor: '#44321C' },
      premenstrual: { color: '#9CB4DA', lightColor: '#22304A' },
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
    background: '#14101C',
    surface: '#221C2E',
    surfaceSecondary: '#1A1424',
    surfaceTertiary: '#302840',

    primary: '#B08AE6',
    primaryLight: '#2A1E3C',
    primaryMuted: '#201830',
    onPrimary: '#FFFFFF',

    text: '#ECE6F4',
    textSecondary: '#B4A8CA',
    textTertiary: '#8478A0',
    textMuted: '#645880',
    textDisabled: '#443C5A',

    border: '#302840',
    borderLight: '#262038',
    borderSubtle: '#2C2438',

    tabBarBackground: '#14101C',
    tabBarBorder: '#262038',
    tabBarActive: '#B08AE6',
    tabBarInactive: '#645880',

    switchActive: '#B08AE6',
    selectedBorder: '#B08AE6',
    selectedBackground: '#2A1E3C',

    ...darkSemantics,

    backdrop: 'rgba(0,0,0,0.5)',
    sheetBackground: '#221C2E',
    handleColor: '#443C5A',

    phases: {
      menstruation: { color: '#E4A4B8', lightColor: '#4A2234' },
      follicular: { color: '#8ECAB8', lightColor: '#1E4036' },
      ovulation: { color: '#C6A4DC', lightColor: '#38244C' },
      luteal: { color: '#E6BA8E', lightColor: '#46341E' },
      premenstrual: { color: '#9EB6DC', lightColor: '#24324C' },
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
    background: '#1A120E',
    surface: '#2C201C',
    surfaceSecondary: '#221814',
    surfaceTertiary: '#3C2E2A',

    primary: '#F0806E',
    primaryLight: '#3C201A',
    primaryMuted: '#2E1812',
    onPrimary: '#FFFFFF',

    text: '#F2E8E4',
    textSecondary: '#C4AEA6',
    textTertiary: '#8A7870',
    textMuted: '#6A5850',
    textDisabled: '#4A3E38',

    border: '#3C2E2A',
    borderLight: '#302420',
    borderSubtle: '#382824',

    tabBarBackground: '#1A120E',
    tabBarBorder: '#302420',
    tabBarActive: '#F0806E',
    tabBarInactive: '#6A5850',

    switchActive: '#F0806E',
    selectedBorder: '#F0806E',
    selectedBackground: '#3C201A',

    ...darkSemantics,

    backdrop: 'rgba(0,0,0,0.5)',
    sheetBackground: '#2C201C',
    handleColor: '#4A3E38',

    phases: {
      menstruation: { color: '#E89EB0', lightColor: '#4C2030' },
      follicular: { color: '#8AC6B0', lightColor: '#1C3C32' },
      ovulation: { color: '#C29CDA', lightColor: '#34224A' },
      luteal: { color: '#E8B686', lightColor: '#44301A' },
      premenstrual: { color: '#9AB2D8', lightColor: '#20304A' },
    },
  },
};

// ============================================================
// 6. Velvet Mauve (moody, luxe — editorial feel)
// ============================================================
export const velvetMauve: ThemeDefinition = {
  id: 'velvetMauve',
  name: 'Velvet Mauve',
  isPremium: true,
  preview: ['#9C5A8A', '#FAF6F9', '#EDDAE8'],
  light: {
    background: '#FAF6F9',
    surface: '#FFFFFF',
    surfaceSecondary: '#FDFAFC',
    surfaceTertiary: '#F0E4EC',

    primary: '#9C5A8A',
    primaryLight: '#EDDAE8',
    primaryMuted: '#F8F0F6',
    onPrimary: '#FFFFFF',

    text: '#241620',
    textSecondary: '#52404C',
    textTertiary: '#806E7A',
    textMuted: '#A09098',
    textDisabled: '#C4B8C0',

    border: '#E2D4DE',
    borderLight: '#EEE6EC',
    borderSubtle: '#E8DDE4',

    tabBarBackground: '#FDFAFC',
    tabBarBorder: '#E8DDE4',
    tabBarActive: '#9C5A8A',
    tabBarInactive: '#A09098',

    switchActive: '#9C5A8A',
    selectedBorder: '#9C5A8A',
    selectedBackground: '#EDDAE8',

    ...lightSemantics,

    backdrop: 'rgba(0,0,0,0.3)',
    sheetBackground: '#FDFAFC',
    handleColor: '#C4B8C0',

    phases: {
      menstruation: { color: '#CC7690', lightColor: '#F2E0E6' },
      follicular: { color: '#6AAC9C', lightColor: '#DEEEEA' },
      ovulation: { color: '#A684C8', lightColor: '#EADCF6' },
      luteal: { color: '#D09E72', lightColor: '#F4E8DA' },
      premenstrual: { color: '#7A98C4', lightColor: '#DCE6F4' },
    },
  },
  dark: {
    background: '#16101A',
    surface: '#261C28',
    surfaceSecondary: '#1E1420',
    surfaceTertiary: '#362A38',

    primary: '#C88AB8',
    primaryLight: '#321E2C',
    primaryMuted: '#281624',
    onPrimary: '#FFFFFF',

    text: '#F0E4EC',
    textSecondary: '#BCA6B4',
    textTertiary: '#887480',
    textMuted: '#685860',
    textDisabled: '#483C44',

    border: '#362A38',
    borderLight: '#2C2230',
    borderSubtle: '#302630',

    tabBarBackground: '#16101A',
    tabBarBorder: '#2C2230',
    tabBarActive: '#C88AB8',
    tabBarInactive: '#685860',

    switchActive: '#C88AB8',
    selectedBorder: '#C88AB8',
    selectedBackground: '#321E2C',

    ...darkSemantics,

    backdrop: 'rgba(0,0,0,0.5)',
    sheetBackground: '#261C28',
    handleColor: '#483C44',

    phases: {
      menstruation: { color: '#E6A0B4', lightColor: '#4A2030' },
      follicular: { color: '#8AC6B4', lightColor: '#1C3E34' },
      ovulation: { color: '#C4A0D8', lightColor: '#362248' },
      luteal: { color: '#E6B88C', lightColor: '#42321C' },
      premenstrual: { color: '#9AB4D8', lightColor: '#22304A' },
    },
  },
};

// ============================================================
// 7. Peony Blush (airy, Instagram aesthetic — warm blush)
// ============================================================
export const peonyBlush: ThemeDefinition = {
  id: 'peonyBlush',
  name: 'Peony Blush',
  isPremium: true,
  preview: ['#E07090', '#FFF9FA', '#FAE0E8'],
  light: {
    background: '#FFF9FA',
    surface: '#FFFFFF',
    surfaceSecondary: '#FFFCFD',
    surfaceTertiary: '#F4EAEC',

    primary: '#E07090',
    primaryLight: '#FAE0E8',
    primaryMuted: '#FFF2F5',
    onPrimary: '#FFFFFF',

    text: '#2E1E22',
    textSecondary: '#5A4A50',
    textTertiary: '#887880',
    textMuted: '#A89498',
    textDisabled: '#C8BCC0',

    border: '#E8D8DE',
    borderLight: '#F2EAEE',
    borderSubtle: '#EEE2E6',

    tabBarBackground: '#FFFCFD',
    tabBarBorder: '#EEE2E6',
    tabBarActive: '#E07090',
    tabBarInactive: '#A89498',

    switchActive: '#E07090',
    selectedBorder: '#E07090',
    selectedBackground: '#FAE0E8',

    ...lightSemantics,

    backdrop: 'rgba(0,0,0,0.3)',
    sheetBackground: '#FFFCFD',
    handleColor: '#C8BCC0',

    phases: {
      menstruation: { color: '#D67090', lightColor: '#F6DDE6' },
      follicular: { color: '#68AE9A', lightColor: '#DDEEE8' },
      ovulation: { color: '#A886C4', lightColor: '#ECE0F4' },
      luteal: { color: '#D6A06C', lightColor: '#F6E8D6' },
      premenstrual: { color: '#7C9AC2', lightColor: '#DCE8F2' },
    },
  },
  dark: {
    background: '#1A1014',
    surface: '#2A1E24',
    surfaceSecondary: '#22161A',
    surfaceTertiary: '#3A2C32',

    primary: '#F098B0',
    primaryLight: '#3C1E26',
    primaryMuted: '#2E161E',
    onPrimary: '#FFFFFF',

    text: '#F4E8EC',
    textSecondary: '#C8AEB8',
    textTertiary: '#8A7880',
    textMuted: '#6A5860',
    textDisabled: '#4A3E42',

    border: '#3A2C32',
    borderLight: '#2E2228',
    borderSubtle: '#34282C',

    tabBarBackground: '#1A1014',
    tabBarBorder: '#2E2228',
    tabBarActive: '#F098B0',
    tabBarInactive: '#6A5860',

    switchActive: '#F098B0',
    selectedBorder: '#F098B0',
    selectedBackground: '#3C1E26',

    ...darkSemantics,

    backdrop: 'rgba(0,0,0,0.5)',
    sheetBackground: '#2A1E24',
    handleColor: '#4A3E42',

    phases: {
      menstruation: { color: '#EAA2B6', lightColor: '#4E2032' },
      follicular: { color: '#8ECAB4', lightColor: '#1E3E34' },
      ovulation: { color: '#C6A2DC', lightColor: '#382450' },
      luteal: { color: '#EABA8C', lightColor: '#46321C' },
      premenstrual: { color: '#9EB6DA', lightColor: '#24304C' },
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
      menstruation: { color: '#E0A0B4', lightColor: '#401C2C' },
      follicular: { color: '#88C8B4', lightColor: '#1A3C32' },
      ovulation: { color: '#C0A0D8', lightColor: '#322048' },
      luteal: { color: '#E0B88C', lightColor: '#403018' },
      premenstrual: { color: '#98B4D8', lightColor: '#1E2E48' },
    },
  },
};

// ============================================================
// Theme registry
// ============================================================
export const THEMES: Record<string, ThemeDefinition> = {
  roseGarden,
  midnight,
  cherryBlossom,
  lavenderDreams,
  coralSunset,
  velvetMauve,
  peonyBlush,
  noir,
};

export const THEME_LIST: ThemeDefinition[] = [
  roseGarden,
  midnight,
  cherryBlossom,
  lavenderDreams,
  coralSunset,
  velvetMauve,
  peonyBlush,
  noir,
];
